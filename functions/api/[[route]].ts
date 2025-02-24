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
  code: z.string().min(1)
})

const UserIDSchema = z.object({
  userId: z.string().min(1)
})

// Vanity URL check endpoint
app.get('/api/vanity/:code', async (c) => {
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
      guild: data.guild
    })
  }
  
  // Handle other error cases
  return c.json({ 
    available: false,
    error: data.message || 'An error occurred while checking the vanity URL'
  }, response.status === 429 ? 429 : 500)
})

// User lookup endpoint
app.get('/api/users/:userId', async (c) => {
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
  return c.json(data)
})

export const onRequest = handle(app) 