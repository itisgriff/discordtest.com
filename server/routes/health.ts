import { Hono } from 'hono';
import { DiscordService } from '../services/discord';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  discord: {
    status: 'up' | 'down' | 'unknown';
    latency: number | null;
  };
  rateLimits: {
    total: number;
    active: number;
  };
}

const routes = new Hono();

// Basic health check
routes.get('/', (c) => c.json({ status: 'healthy' }));

// Detailed health check
routes.get('/detailed', async (c) => {
  const startTime = Date.now();
  let discordStatus: HealthStatus['discord'] = {
    status: 'unknown',
    latency: null
  };

  // Check Discord API
  try {
    await DiscordService.checkInvite('discord-developers');
    discordStatus = {
      status: 'up',
      latency: Date.now() - startTime
    };
  } catch (error) {
    discordStatus = {
      status: 'down',
      latency: null
    };
  }

  // Get memory usage
  const memory = process.memoryUsage();

  // Get rate limiter stats
  const rateLimitStats = await DiscordService.getRateLimitStats();

  const health: HealthStatus = {
    status: discordStatus.status === 'up' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
      external: Math.round(memory.external / 1024 / 1024)
    },
    discord: discordStatus,
    rateLimits: rateLimitStats
  };

  return c.json(health);
});

export default routes; 