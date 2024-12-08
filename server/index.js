import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { Headers } from 'node-fetch';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import os from 'os';

const app = express();
const port = process.env.PORT || 3000;

// Trust proxy (Nginx)
app.set('trust proxy', 1);

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

// Rate limiting - 30 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
  trustProxy: true
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limit for API endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per minute for API endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many API requests, please try again later' },
  trustProxy: true
});

// Apply stricter rate limit to API endpoints
app.use('/api/', apiLimiter);

// Discord rate limit tracking
const discordRateLimit = {
  lastRequest: 0,
  minTimeBetweenRequests: 2000, // 2 seconds between requests
};

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

// Helper function to enforce minimum time between Discord API requests
const enforceDiscordRateLimit = async () => {
  const now = Date.now();
  const timeToWait = discordRateLimit.lastRequest + discordRateLimit.minTimeBetweenRequests - now;
  
  if (timeToWait > 0) {
    await new Promise(resolve => setTimeout(resolve, timeToWait));
  }
  
  discordRateLimit.lastRequest = Date.now();
};

// Vanity URL check endpoint
app.post('/api/vanity/:code', async (req, res) => {
  try {
    const { code } = req.params;

    if (!code.match(/^[a-zA-Z0-9-]+$/)) {
      return res.status(400).json({ error: 'Invalid vanity URL format' });
    }

    // Enforce rate limit
    await enforceDiscordRateLimit();

    const url = `https://discord.com/api/v10/invites/${code}?with_counts=true&with_expiration=true`;
    console.log('Making request to Discord API:', url);
    
    const headers = getDiscordHeaders();
    const response = await fetch(url, { headers });
    
    // Handle Discord rate limiting
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('retry-after') || '5', 10);
      console.log(`Discord rate limit hit. Retry after ${retryAfter} seconds`);
      return res.status(429).json({ 
        error: 'Rate limited by Discord API',
        retryAfter: retryAfter
      });
    }

    // Handle 404 (invite not found = available)
    if (response.status === 404) {
      return res.json({ 
        available: true,
        error: null,
        guildInfo: null
      });
    }

    const data = await response.json();

    // Handle other errors
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.message || 'Failed to check vanity URL',
        available: false,
        guildInfo: null
      });
    }

    // Handle invalid response
    if (!data.guild) {
      return res.status(500).json({ 
        error: 'Invalid response from Discord API',
        available: false,
        guildInfo: null
      });
    }

    // Success response
    return res.json({
      available: false,
      error: null,
      guild: {
        ...data.guild,
        approximate_member_count: data.approximate_member_count,
        approximate_presence_count: data.approximate_presence_count,
        channel: data.channel
      }
    });
  } catch (error) {
    console.error('Vanity check error:', error);
    res.status(500).json({ 
      error: 'Failed to check vanity URL',
      available: false,
      guildInfo: null
    });
  }
});

// Health check endpoint with detailed status
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    systemInfo: {
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpu: os.loadavg(),
      platform: os.platform(),
      version: process.version
    },
    services: {
      discord: {
        status: 'unknown',
        lastCheck: discordRateLimit.lastRequest
      }
    }
  };

  // Check Discord API status
  fetch('https://discord.com/api/v10/gateway', { 
    headers: getDiscordHeaders() 
  })
    .then(() => {
      healthCheck.services.discord.status = 'ok';
    })
    .catch(() => {
      healthCheck.services.discord.status = 'error';
    })
    .finally(() => {
      const isHealthy = healthCheck.services.discord.status === 'ok';
      res.status(isHealthy ? 200 : 503).json(healthCheck);
    });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
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