import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { Headers } from 'node-fetch';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

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
  max: 10, // limit each IP to 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many API requests, please try again later' },
  trustProxy: true
});

// Apply stricter rate limit to API endpoints
app.use('/api/', apiLimiter);

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

// Discord API endpoint
app.post('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId.match(/^\d+$/)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
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

    if (!code.match(/^[a-zA-Z0-9-]+$/)) {
      return res.status(400).json({ error: 'Invalid vanity URL format' });
    }

    const response = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true&with_expiration=true`, {
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

    console.log('Discord API response:', JSON.stringify(data, null, 2));

    return res.json({
      available: false,
      guild: {
        id: data.guild.id,
        name: data.guild.name,
        icon: data.guild.icon,
        splash: data.guild.splash,
        banner: data.guild.banner,
        description: data.guild.description,
        features: data.guild.features,
        verification_level: data.guild.verification_level,
        nsfw_level: data.guild.nsfw_level,
        nsfw: data.guild.nsfw,
        premium_subscription_count: data.guild.premium_subscription_count,
        approximate_member_count: data.approximate_member_count,
        approximate_presence_count: data.approximate_presence_count,
        channel: data.channel ? {
          id: data.channel.id,
          name: data.channel.name,
          type: data.channel.type
        } : null
      }
    });
  } catch (error) {
    console.error('Vanity check error:', error);
    res.status(500).json({ error: 'Failed to check vanity URL' });
  }
});

// Test endpoint for invite data
app.get('/api/test/invite/:code', async (req, res) => {
  try {
    const { code } = req.params;
    console.log(`Testing invite code: ${code}`);

    const response = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true&with_expiration=true`, {
      headers: getDiscordHeaders()
    });

    const data = await response.json();
    console.log('Raw Discord API response:', JSON.stringify(data, null, 2));

    res.json(data);
  } catch (error) {
    console.error('Test invite error:', error);
    res.status(500).json({ error: 'Failed to fetch invite data', details: error.message });
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