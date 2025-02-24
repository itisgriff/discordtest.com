import { Hono } from 'hono'
import { z } from 'zod'
import { handle } from 'hono/cloudflare-pages'

// Define env type for Hono
type Bindings = {
  DISCORD_BOT_TOKEN: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Validation schemas
const VanityURLSchema = z.object({
  code: z.string().min(1).regex(/^[a-zA-Z0-9-]+$/, 'Vanity code must contain only letters, numbers, and hyphens')
})

const UserIDSchema = z.object({
  userId: z.string().min(1)
})

// Add CORS headers
app.use('*', async (c, next) => {
  await next()
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
})

// Vanity URL check endpoint
app.get('/api/vanity/:code', async (c) => {
  try {
    const result = VanityURLSchema.safeParse({ code: c.req.param('code') })
    if (!result.success) {
      return c.json({ 
        error: result.error.issues[0]?.message || 'Invalid vanity code',
        available: false
      }, 400)
    }

    const response = await fetch(`https://discord.com/api/v10/invites/${result.data.code}`, {
      headers: {
        'Authorization': `Bot ${c.env.DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    // If the vanity URL doesn't exist (404), it's available!
    if (response.status === 404) {
      return c.json({ 
        available: true,
        message: `The vanity URL "discord.gg/${result.data.code}" is available!`
      })
    }

    // Handle rate limiting specifically
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') 
        ? parseInt(response.headers.get('Retry-After') || '5') 
        : 5
      
      return c.json({ 
        error: 'Too many requests. Please try again later.',
        available: false,
        retryAfter
      }, 429)
    }

    // For non-success responses that aren't 404 or 429
    if (!response.ok) {
      const errorData = await response.json()
      return c.json({ 
        error: errorData.message || `Discord API error: ${response.status}`,
        available: false
      }, 500)
    }

    // Success - the vanity URL exists, so return the data
    const data = await response.json()
    return c.json({
      available: false,
      guild: data.guild,
      channel: data.channel
    })
  } catch (error) {
    console.error('Vanity URL check error:', error)
    return c.json({ 
      error: 'Internal server error when checking vanity URL',
      available: false 
    }, 500)
  }
})

// User lookup endpoint
app.get('/api/users/:userId', async (c) => {
  try {
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

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') 
        ? parseInt(response.headers.get('Retry-After') || '5') 
        : 5
      
      return c.json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter
      }, 429)
    }

    if (!response.ok) {
      const errorData = await response.json()
      return c.json({ 
        error: errorData.message || `Discord API error: ${response.status}`
      }, response.status)
    }

    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.error('User lookup error:', error)
    return c.json({ error: 'Internal server error when looking up user' }, 500)
  }
})

export const onRequest = handle(app) 