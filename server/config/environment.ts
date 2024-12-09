import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('localhost'),
  DISCORD_BOT_TOKEN: z.string().min(1, 'Discord bot token is required'),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('30'),
});

export const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue: z.ZodIssue) => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join('\n');
      throw new Error(`Environment validation failed:\n${issues}`);
    }
    throw error;
  }
};

export const ENV = validateEnv();

export const DISCORD_CONFIG = {
  baseUrl: 'https://discord.com/api',
  apiVersion: 'v10',
  rateLimitMs: 2000, // 2 seconds between requests
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'DiscordBot (https://discordtest.com, 1.0.0)'
  }
} as const;

export const SERVER_CONFIG = {
  port: ENV.PORT,
  host: ENV.HOST,
  isDevelopment: ENV.NODE_ENV === 'development',
  isProduction: ENV.NODE_ENV === 'production',
  isTest: ENV.NODE_ENV === 'test',
  corsOrigin: ENV.CORS_ORIGIN,
  rateLimit: {
    windowMs: ENV.RATE_LIMIT_WINDOW_MS,
    maxRequests: ENV.RATE_LIMIT_MAX_REQUESTS,
  }
} as const; 