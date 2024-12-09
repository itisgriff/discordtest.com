import { DISCORD_CONFIG, ENV } from '../config/environment';
import type { DiscordInviteResponse, DiscordUser, UnknownInviteResponse } from '../../shared/types/discord';

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  bucket: string;
  scope?: string;
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

const CACHE_TTL = 60; // 60 seconds cache

export class DiscordService {
  private static getHeaders(): HeadersInit {
    const discordToken = ENV.DISCORD_BOT_TOKEN;
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

  private static async getCachedInvite(code: string): Promise<DiscordInviteResponse | null> {
    try {
      const cacheKey = `invite:${code}`;
      const cache = caches.default;
      const response = await cache.match(cacheKey);
      
      if (!response) return null;
      
      const data = await response.json() as DiscordInviteResponse;
      return data;
    } catch (error) {
      console.error('Cache error:', error);
      return null;
    }
  }

  private static async setCachedInvite(code: string, data: DiscordInviteResponse): Promise<void> {
    try {
      const cacheKey = `invite:${code}`;
      const cache = caches.default;
      const response = new Response(JSON.stringify(data), {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_TTL}`,
          'Content-Type': 'application/json'
        }
      });
      await cache.put(cacheKey, response);
    } catch (error) {
      console.error('Cache error:', error);
    }
  }

  static async checkInvite(code: string): Promise<DiscordInviteResponse | UnknownInviteResponse> {
    // Check cache first
    const cached = await this.getCachedInvite(code);
    if (cached) {
      console.log(`Cache hit for invite code: ${code}`);
      return cached;
    }

    const url = `${DISCORD_CONFIG.baseUrl}/${DISCORD_CONFIG.apiVersion}/invites/${code}?with_counts=true&with_expiration=true`;
    const headers = this.getHeaders();
    
    const response = await fetch(url, { headers });

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
    await this.setCachedInvite(code, data);

    return data;
  }

  static async getRateLimitStats() {
    // Since we're using Discord's rate limiting, just return basic info
    return {
      total: 0,
      active: 0,
      message: "Rate limiting handled by Discord API"
    };
  }

  static async lookupUser(id: string): Promise<DiscordUser> {
    const url = `${DISCORD_CONFIG.baseUrl}/${DISCORD_CONFIG.apiVersion}/users/${id}`;
    const headers = this.getHeaders();
    
    const response = await fetch(url, { headers });

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