import { DISCORD_CONFIG } from '../config/environment';
import type { DiscordInviteResponse, DiscordUser, UnknownInviteResponse } from '../../shared/types/discord';
import { RateLimiterMemory } from 'rate-limiter-flexible';

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  bucket: string;
  scope?: string;
}

interface CacheEntry {
  data: DiscordInviteResponse;
  timestamp: number;
}

interface RawDiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  accent_color: number | null;
  flags?: number;
  bot?: boolean;
  verified?: boolean;
}

// Separate rate limiters for different buckets
const rateLimiters = new Map<string, RateLimiterMemory>();

// Cache for invite responses
const inviteCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 1000; // 1 minute cache

export class DiscordService {
  private static getHeaders(): HeadersInit {
    const discordToken = process.env.DISCORD_BOT_TOKEN;
    if (!discordToken) {
      throw new Error('Bot token not configured');
    }

    return {
      'Authorization': `Bot ${discordToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'DiscordBot (https://discordtest.com, 1.0.0)'
    };
  }

  private static getRateLimitInfo(headers: Headers): RateLimitInfo | null {
    const limit = headers.get('X-RateLimit-Limit');
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');
    const resetAfter = headers.get('X-RateLimit-Reset-After');
    const bucket = headers.get('X-RateLimit-Bucket');
    const scope = headers.get('X-RateLimit-Scope');

    if (!limit || !remaining || !reset || !resetAfter || !bucket) {
      return null;
    }

    return {
      limit: parseInt(limit),
      remaining: parseInt(remaining),
      reset: parseInt(reset),
      resetAfter: parseFloat(resetAfter),
      bucket,
      scope: scope || undefined
    };
  }

  private static async enforceRateLimit(bucket: string, points: number): Promise<void> {
    let limiter = rateLimiters.get(bucket);
    if (!limiter) {
      limiter = new RateLimiterMemory({
        points,
        duration: 60 // Default to 60 seconds if we don't have reset info
      });
      rateLimiters.set(bucket, limiter);
    }

    await limiter.consume('default', 1);
  }

  private static getCachedInvite(code: string): DiscordInviteResponse | null {
    const cached = inviteCache.get(code);
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      inviteCache.delete(code);
      return null;
    }

    return cached.data;
  }

  private static setCachedInvite(code: string, data: DiscordInviteResponse): void {
    inviteCache.set(code, {
      data,
      timestamp: Date.now()
    });

    // Cleanup old cache entries periodically
    if (inviteCache.size > 1000) { // Prevent memory leaks
      const now = Date.now();
      for (const [key, value] of inviteCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          inviteCache.delete(key);
        }
      }
    }
  }

  static async checkInvite(code: string): Promise<DiscordInviteResponse | UnknownInviteResponse> {
    // Check cache first
    const cached = this.getCachedInvite(code);
    if (cached) {
      console.log(`Cache hit for invite code: ${code}`);
      return cached;
    }

    const url = `${DISCORD_CONFIG.baseUrl}/${DISCORD_CONFIG.apiVersion}/invites/${code}?with_counts=true&with_expiration=true`;
    const headers = this.getHeaders();
    
    // Enforce rate limit before making the request
    if (rateLimiters.size > 0) {
      const bucket = Array.from(rateLimiters.keys())[0];
      await this.enforceRateLimit(bucket, 1);
    }
    
    const response = await fetch(url, { headers });
    const rateLimit = this.getRateLimitInfo(response.headers);

    // Update rate limiter if we got rate limit info
    if (rateLimit) {
      const bucket = rateLimit.bucket;
      if (!rateLimiters.has(bucket)) {
        rateLimiters.set(bucket, new RateLimiterMemory({
          points: rateLimit.limit,
          duration: rateLimit.resetAfter
        }));
      }
    }

    // Handle rate limit response
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
    }

    // Handle 404 as available vanity URL
    if (response.status === 404) {
      return {
        message: "Unknown Invite",
        code: code
      };
    }

    const data = await response.json() as DiscordInviteResponse;
    
    if (!response.ok) {
      throw new Error(data.message || `Failed to fetch invite: ${response.status}`);
    }

    // Cache successful responses
    this.setCachedInvite(code, data);

    return data;
  }

  static async getRateLimitStats() {
    const total = rateLimiters.size;
    let active = 0;

    for (const limiter of rateLimiters.values()) {
      const points = await limiter.get('default');
      if (points && points.consumedPoints > 0) {
        active++;
      }
    }

    return { total, active };
  }

  static async lookupUser(id: string): Promise<DiscordUser> {
    const url = `${DISCORD_CONFIG.baseUrl}/${DISCORD_CONFIG.apiVersion}/users/${id}`;
    const headers = this.getHeaders();
    
    // Enforce rate limit before making the request
    if (rateLimiters.size > 0) {
      const bucket = Array.from(rateLimiters.keys())[0];
      await this.enforceRateLimit(bucket, 1);
    }
    
    const response = await fetch(url, { headers });
    const rateLimit = this.getRateLimitInfo(response.headers);

    // Update rate limiter if we got rate limit info
    if (rateLimit) {
      const bucket = rateLimit.bucket;
      if (!rateLimiters.has(bucket)) {
        rateLimiters.set(bucket, new RateLimiterMemory({
          points: rateLimit.limit,
          duration: rateLimit.resetAfter
        }));
      }
    }

    // Handle rate limit response
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('404: User not found');
      }
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const data = (await response.json()) as RawDiscordUser;

    // Transform the response to match our DiscordUser type
    return {
      id: data.id,
      username: data.username,
      avatar: data.avatar,
      banner: data.banner,
      accentColor: data.accent_color ?? null,
      flags: data.flags ?? 0,
      bot: Boolean(data.bot),
      verified: Boolean(data.verified)
    } as DiscordUser;
  }
} 