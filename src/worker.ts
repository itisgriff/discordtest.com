import { Hono } from 'hono'
import { z } from 'zod'

// In-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Cache utilities
function getCachedResponse(key: string): any | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data
  }
  // Clean up expired entries
  if (cached) {
    cache.delete(key)
  }
  return null
}

function setCachedResponse(key: string, data: any, ttlMs: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs })
  
  // Cleanup old entries periodically (simple LRU-like behavior)
  if (cache.size > 1000) {
    const entries = Array.from(cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    // Remove oldest 100 entries
    for (let i = 0; i < 100; i++) {
      cache.delete(entries[i][0])
    }
  }
}

// Cache TTL constants (in milliseconds)
const VANITY_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const USER_CACHE_TTL = 30 * 60 * 1000 // 30 minutes

// Define env type for Hono
type Bindings = {
  DISCORD_BOT_TOKEN: string
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
  USER_LOOKUP_RATE_LIMITER: {
    limit(params: { key: string }): Promise<{ success: boolean }>
  }
  VANITY_CHECK_RATE_LIMITER: {
    limit(params: { key: string }): Promise<{ success: boolean }>
  }
  GENERAL_API_RATE_LIMITER: {
    limit(params: { key: string }): Promise<{ success: boolean }>
  }
}

const app = new Hono<{ Bindings: Bindings }>()

// Helper function to get client identifier for rate limiting
function getClientKey(request: Request): string {
  // Try to get a unique identifier from headers
  const cfConnectingIp = request.headers.get('CF-Connecting-IP')
  const userAgent = request.headers.get('User-Agent') || 'unknown'
  
  // Use IP if available, otherwise fallback to a combination of headers
  return cfConnectingIp || `${userAgent.slice(0, 50)}-${request.headers.get('CF-Ray') || 'unknown'}`
}

// Validation schemas
const VanityURLSchema = z.object({
  code: z.string().min(1)
})

const UserIDSchema = z.object({
  userId: z.string().min(1)
})

// General rate limiting middleware for all API routes (before route definitions)
app.use('/api/*', async (c, next) => {
  const clientKey = getClientKey(c.req.raw)
  const { success } = await c.env.GENERAL_API_RATE_LIMITER.limit({ 
    key: `general:${clientKey}` 
  })
  
  if (!success) {
    return c.json({ 
      error: 'Too many requests. Please slow down.',
      retryAfter: 60 
    }, 429)
  }
  
  await next()
  
  // Add cache headers to responses
  if (c.res.headers.get('content-type')?.includes('application/json')) {
    const path = new URL(c.req.url).pathname
    if (path.includes('/vanity/')) {
      c.res.headers.set('Cache-Control', 'public, max-age=300') // 5 minutes
      c.res.headers.set('X-Cache-TTL', '300')
    } else if (path.includes('/users/')) {
      c.res.headers.set('Cache-Control', 'public, max-age=1800') // 30 minutes
      c.res.headers.set('X-Cache-TTL', '1800')
    }
  }
})

// API Routes
app.get('/api/vanity/:code', async (c) => {
  const result = VanityURLSchema.safeParse({ code: c.req.param('code') })
  if (!result.success) {
    return c.json({ error: 'Invalid vanity code' }, 400)
  }

  // Check cache first
  const cacheKey = `vanity:${result.data.code}`
  const cachedResponse = getCachedResponse(cacheKey)
  if (cachedResponse) {
    return c.json(cachedResponse)
  }

  // Rate limiting
  const clientKey = getClientKey(c.req.raw)
  const { success } = await c.env.VANITY_CHECK_RATE_LIMITER.limit({ 
    key: `vanity:${clientKey}` 
  })
  
  if (!success) {
    return c.json({ 
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: 60 
    }, 429)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

  try {
    const response = await fetch(`https://discord.com/api/v10/invites/${result.data.code}`, {
      headers: {
        'Authorization': `Bot ${c.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DiscordBot (https://github.com/discord/discord-api-docs, 1.0)',
        'Connection': 'keep-alive'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    // If status is 404, the vanity URL is available
    if (response.status === 404) {
      const responseData = { 
        available: true,
        guild: null
      }
      setCachedResponse(cacheKey, responseData, VANITY_CACHE_TTL)
      return c.json(responseData)
    }

    const data = await response.json()
    
    // Handle successful response, which means the vanity URL is taken
    if (response.ok) {
      // Sanitize the response to prevent React rendering errors
      const sanitizedData = {
        ...data,
        // Ensure traits are strings, not objects
        traits: Array.isArray(data.traits) 
          ? data.traits.map((trait: any) => typeof trait === 'string' ? trait : trait.label || trait.name || String(trait))
          : data.traits,
        // Remove complex objects that can't be rendered
        game_activity: undefined,
        emojis: undefined
      };
      
      const responseData = {
        ...sanitizedData,
        available: false,  // Our additions override Discord's data
        error: null
      }
      
      setCachedResponse(cacheKey, responseData, VANITY_CACHE_TTL)
      return c.json(responseData)
    }
    
    // Handle other error cases (don't cache errors)
    return c.json({ 
      available: false,
      error: data.message || 'An error occurred while checking the vanity URL'
    }, response.status === 429 ? 429 : 500)
    
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      return c.json({ 
        available: false,
        error: 'Request timeout' 
      }, 408)
    }
    return c.json({ 
      available: false,
      error: 'Network error occurred' 
    }, 500)
  }
})

app.get('/api/users/:userId', async (c) => {
  const result = UserIDSchema.safeParse({ userId: c.req.param('userId') })
  if (!result.success) {
    return c.json({ error: 'Invalid user ID' }, 400)
  }

  // Check cache first
  const cacheKey = `user:${result.data.userId}`
  const cachedResponse = getCachedResponse(cacheKey)
  if (cachedResponse) {
    return c.json(cachedResponse)
  }

  // Rate limiting
  const clientKey = getClientKey(c.req.raw)
  const { success } = await c.env.USER_LOOKUP_RATE_LIMITER.limit({ 
    key: `user:${clientKey}` 
  })
  
  if (!success) {
    return c.json({ 
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: 60 
    }, 429)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

  try {
    const response = await fetch(`https://discord.com/api/v10/users/${result.data.userId}`, {
      headers: {
        'Authorization': `Bot ${c.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DiscordBot (https://github.com/discord/discord-api-docs, 1.0)',
        'Connection': 'keep-alive'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const data = await response.json()
    
    // Cache successful responses only
    if (response.ok) {
      setCachedResponse(cacheKey, data, USER_CACHE_TTL)
    }
    
    return c.json(data, response.ok ? 200 : (response.status as any))
    
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      return c.json({ 
        error: 'Request timeout' 
      }, 408)
    }
    return c.json({ 
      error: 'Network error occurred' 
    }, 500)
  }
})


// Static Assets Handler
app.all('*', async (c) => {
  const url = new URL(c.req.url)
  
  // Handle SPA routing - serve index.html for non-API routes
  if (!url.pathname.startsWith('/api/') && !url.pathname.includes('.')) {
    return c.env.ASSETS.fetch(new Request(new URL('/index.html', url.origin)))
  }
  
  // Serve static assets
  return c.env.ASSETS.fetch(c.req.raw)
})

export default app 