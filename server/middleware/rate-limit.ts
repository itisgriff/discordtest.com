import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  keyGenerator?: (ctx: Context) => string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitInfo>;
  private readonly options: Required<RateLimitOptions>;
  private cleanupInterval: NodeJS.Timeout;

  constructor(options: RateLimitOptions) {
    this.store = new Map();
    this.options = {
      windowMs: options.windowMs,
      max: options.max,
      message: options.message || 'Too many requests, please try again later',
      statusCode: options.statusCode || 429,
      keyGenerator: options.keyGenerator || ((ctx: Context) => ctx.req.header('x-forwarded-for') || 'default')
    };

    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, info] of this.store.entries()) {
      if (now >= info.resetTime) {
        this.store.delete(key);
      }
    }
  }

  public stop(): void {
    clearInterval(this.cleanupInterval);
  }

  public middleware() {
    return async (ctx: Context, next: Next) => {
      const key = this.options.keyGenerator(ctx);
      const now = Date.now();

      let info = this.store.get(key);
      if (!info || now >= info.resetTime) {
        info = {
          count: 0,
          resetTime: now + this.options.windowMs
        };
      }

      info.count++;
      this.store.set(key, info);

      // Set rate limit headers
      ctx.header('X-RateLimit-Limit', this.options.max.toString());
      ctx.header('X-RateLimit-Remaining', Math.max(0, this.options.max - info.count).toString());
      ctx.header('X-RateLimit-Reset', Math.ceil(info.resetTime / 1000).toString());

      if (info.count > this.options.max) {
        const retryAfter = Math.ceil((info.resetTime - now) / 1000);
        ctx.header('Retry-After', retryAfter.toString());
        throw new HTTPException(429, { message: this.options.message });
      }

      return next();
    };
  }
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const limiter = new RateLimiter(options);
  return limiter.middleware();
};

// Export the class for testing purposes
export { RateLimiter }; 