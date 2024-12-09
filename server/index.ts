/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import vanityRoutes from './routes/vanity';
import userRoutes from './routes/users';
import healthRoutes from './routes/health';
import { initializeEnv, ENV } from './config/environment';

// Define env interface for type safety
interface Bindings {
  DISCORD_BOT_TOKEN: string;
  RATE_LIMIT_STORE?: KVNamespace;
  ENVIRONMENT: string;
  NODE_ENV?: string;
  PORT?: string;
  HOST?: string;
  CORS_ORIGIN?: string;
  RATE_LIMIT_WINDOW_MS?: string;
  RATE_LIMIT_MAX_REQUESTS?: string;
  [key: string]: string | KVNamespace | undefined;
}

const app = new Hono<{ Bindings: Bindings }>();

// Initialize environment at startup
app.use('*', async (c, next) => {
  const stringEnv = Object.fromEntries(
    Object.entries(c.env).filter(([_, v]) => typeof v === 'string' || typeof v === 'undefined')
  ) as Record<string, string | undefined>;
  initializeEnv(stringEnv);
  await next();
});

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// In-memory store for development
const memoryStore = new Map<string, { count: number; timestamp: number }>();

// Rate limiting middleware that works in both environments
async function rateLimiter(c: any, next: any) {
  const ip = c.req.headers.get('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  const key = `ratelimit:${ip}`;
  const isDev = ENV.NODE_ENV === 'development';
  
  try {
    let currentRequests: { count: number; timestamp: number };

    if (isDev) {
      // Development: Use in-memory store
      currentRequests = memoryStore.get(key) || { count: 0, timestamp: Date.now() };
    } else {
      // Production: Use Cloudflare KV
      currentRequests = await c.env.RATE_LIMIT_STORE?.get(key, 'json') || { count: 0, timestamp: Date.now() };
    }
    
    // Reset if outside window
    if (Date.now() - currentRequests.timestamp > 5000) {
      currentRequests.count = 0;
      currentRequests.timestamp = Date.now();
    }
    
    if (currentRequests.count >= 5) {
      return c.json({
        error: 'Too many requests. Please try again later.',
        available: false,
        guild: null,
        retryAfter: (currentRequests.timestamp + 5000 - Date.now()) / 1000
      }, 429);
    }
    
    // Increment counter
    currentRequests.count++;

    if (isDev) {
      // Update memory store
      memoryStore.set(key, currentRequests);
    } else {
      // Update KV store
      await c.env.RATE_LIMIT_STORE?.put(key, JSON.stringify(currentRequests), { expirationTtl: 5 });
    }
    
    return next();
  } catch (error) {
    console.error('Rate limit error:', error);
    return next();
  }
}

// Basic health check
app.get('/', (c) => c.json({ status: 'ok' }));

// Apply rate limiting to API routes
app.use('/api/vanity/*', rateLimiter);
app.use('/api/users/*', rateLimiter);

// Routes
app.route('/api/vanity', vanityRoutes);
app.route('/api/users', userRoutes);
app.route('/api/health', healthRoutes);

// Not found handler
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({
    error: 'Internal server error',
    message: err.message
  }, 500);
});

// Development server
if (ENV.NODE_ENV === 'development') {
  const port = ENV.PORT;
  const hostname = ENV.HOST;

  console.log(`Starting development server on http://${hostname}:${port}`);
  import('@hono/node-server').then(({ serve }) => {
    serve({
      fetch: app.fetch,
      port,
      hostname,
    });
  });
}

// Export for Cloudflare Workers (used in production)
export default {
  fetch: app.fetch,
  scheduled: async (_: any, _env: Bindings, ctx: ExecutionContext) => {
    ctx.waitUntil(Promise.resolve());
  }
}; 