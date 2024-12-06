import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { Headers } from 'node-fetch';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://discordtest.com' 
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Cached Discord headers
const getDiscordHeaders = () => {
  const discordToken = process.env.DISCORD_BOT_TOKEN;
  if (!discordToken) {
    throw new Error('Bot token not configured');
  }

  return new Headers({
    'Authorization': `Bot ${discordToken}`,
    'Content-Type': 'application/json',
    'User-Agent': 'DiscordBot (https://discordtest.com, 1.0.0)'
  });
};

// Verify Turnstile token with caching
const tokenCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function verifyTurnstileToken(token) {
  // Check cache first
  const cached = tokenCache.get(token);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.valid;
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });

    const data = await response.json();
    
    // Cache the result
    tokenCache.set(token, {
      valid: data.success,
      timestamp: Date.now()
    });

    // Cleanup old cache entries
    if (tokenCache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of tokenCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          tokenCache.delete(key);
        }
      }
    }

    return data.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// Discord API endpoint
app.post('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { token } = req.body;

    if (!userId.match(/^\d+$/)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Verify Turnstile token
    const isValid = await verifyTurnstileToken(token);
    if (!isValid) {
      return res.status(403).json({ error: 'Invalid Turnstile token' });
    }

    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: getDiscordHeaders()
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('User lookup error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Vanity URL check endpoint
app.post('/api/vanity/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { token } = req.body;

    if (!code.match(/^[a-zA-Z0-9-]+$/)) {
      return res.status(400).json({ error: 'Invalid vanity URL format' });
    }

    // Verify Turnstile token
    const isValid = await verifyTurnstileToken(token);
    if (!isValid) {
      return res.status(403).json({ error: 'Invalid Turnstile token' });
    }

    const response = await fetch(`https://discord.com/api/v10/invites/${code}`, {
      headers: getDiscordHeaders()
    });

    const data = await response.json();

    if (response.status === 404) {
      return res.json({ available: true });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Failed to check vanity URL' });
    }

    if (!data.guild) {
      return res.status(500).json({ error: 'Invalid response from Discord API' });
    }

    return res.json({
      available: false,
      guild: {
        id: data.guild.id,
        name: data.guild.name,
        icon: data.guild.icon,
        approximate_member_count: data.approximate_member_count
      }
    });
  } catch (error) {
    console.error('Vanity check error:', error);
    res.status(500).json({ error: 'Failed to check vanity URL' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  
  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }

  // Handle other known errors
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  // Default error response
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Health check endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API proxy is working' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}); 