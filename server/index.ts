import 'dotenv/config';
import { Hono } from 'hono';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

let app = new Hono();
export { app };

console.log('Starting server initialization...');

try {
  const { serve } = await import('@hono/node-server');
  const { cors } = await import('hono/cors');
  const { logger } = await import('hono/logger');
  const { prettyJSON } = await import('hono/pretty-json');
  const { secureHeaders } = await import('hono/secure-headers');
  const vanityRoutes = await import('./routes/vanity').then(m => m.default);
  const healthRoutes = await import('./routes/health').then(m => m.default);
  const userRoutes = await import('./routes/users').then(m => m.default);
  
  console.log('Core dependencies loaded successfully');

  // Initialize rate limiter
  const rateLimiter = new RateLimiterMemory({
    points: 5, // Number of requests
    duration: 5, // Per 5 seconds
  });

  // Rate limiting middleware
  const rateLimiterMiddleware = async (c: any, next: any) => {
    try {
      const ip = c.req.header('x-forwarded-for') || 'unknown';
      await rateLimiter.consume(ip);
      return next();
    } catch (error) {
      const rateLimiterError = error as RateLimiterRes;
      return c.json({
        error: 'Too many requests. Please try again later.',
        available: false,
        guild: null,
        retryAfter: rateLimiterError.msBeforeNext / 1000
      }, 429);
    }
  };

  app = new Hono();
  console.log('Hono app instance created');

  // Basic health check route
  app.get('/', (c) => c.json({ status: 'ok' }));
  console.log('Health check route configured');

  // Middleware
  app.use('*', logger());
  app.use('*', prettyJSON());
  app.use('*', secureHeaders());
  app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  }));
  console.log('Middleware configured');

  // Apply rate limiting to vanity routes
  app.use('/api/vanity/*', rateLimiterMiddleware);
  app.use('/api/users/*', rateLimiterMiddleware);

  // Routes
  app.route('/api/vanity', vanityRoutes);
  app.route('/api/users', userRoutes);
  app.route('/api/health', healthRoutes);
  console.log('Routes configured');

  // Not found handler
  app.notFound((c) => c.json({ error: 'Not found' }, 404));

  let server: ReturnType<typeof serve>;

  const startServer = async () => {
    try {
      const port = Number(process.env.PORT) || 3000;
      const hostname = process.env.HOST || '127.0.0.1';
      
      console.log('\nStarting server with configuration:');
      console.log('- Environment:', process.env.NODE_ENV);
      console.log('- Port:', port);
      console.log('- Host:', hostname);
      
      server = await serve({
        fetch: app.fetch,
        port,
        hostname,
      });

      console.log(`\nServer is running at:`);
      console.log(`- http://${hostname}:${port}`);
      console.log(`- http://localhost:${port}`);
      console.log(`- http://127.0.0.1:${port}`);

      // Graceful shutdown
      const signals = ['SIGTERM', 'SIGINT'] as const;
      signals.forEach((signal) => {
        process.on(signal, () => {
          console.log(`\nReceived ${signal}, shutting down gracefully...`);
          server.close(() => {
            console.log('Server closed');
            process.exit(0);
          });
        });
      });

    } catch (error) {
      console.error('Failed to start server:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
      }
      process.exit(1);
    }
  };

  // Start server immediately
  startServer().catch((error) => {
    console.error('Unhandled server startup error:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('Failed to initialize server:', error);
  if (error instanceof Error) {
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  }
  process.exit(1);
} 