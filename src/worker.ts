import { Hono } from 'hono'
import { z } from 'zod'

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

// API Routes
app.get('/api/vanity/:code', async (c) => {
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

  const result = VanityURLSchema.safeParse({ code: c.req.param('code') })
  if (!result.success) {
    return c.json({ error: 'Invalid vanity code' }, 400)
  }

  const response = await fetch(`https://discord.com/api/v10/invites/${result.data.code}`, {
    headers: {
      'Authorization': `Bot ${c.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })

  // If status is 404, the vanity URL is available
  if (response.status === 404) {
    return c.json({ 
      available: true,
      guild: null
    })
  }

  const data = await response.json()
  
  // Handle successful response, which means the vanity URL is taken
  if (response.ok) {
    return c.json({
      available: false,
      type: data.type,
      code: data.code,
      expires_at: data.expires_at,
      flags: data.flags,
      guild_id: data.guild_id,
      guild: data.guild,
      channel: data.channel
    })
  }
  
  // Handle other error cases
  return c.json({ 
    available: false,
    error: data.message || 'An error occurred while checking the vanity URL'
  }, response.status === 429 ? 429 : 500)
})

app.get('/api/users/:userId', async (c) => {
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

  const result = UserIDSchema.safeParse({ userId: c.req.param('userId') })
  if (!result.success) {
    return c.json({ error: 'Invalid user ID' }, 400)
  }

  const response = await fetch(`https://discord.com/api/v10/users/${result.data.userId}`, {
    headers: {
      'Authorization': `Bot ${c.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })

  const data = await response.json()
  return c.json(data, response.ok ? 200 : (response.status as any))
})

// General rate limiting middleware for all API routes
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