// Unified API client for Discord API requests
export const API_CONFIG = {
  BASE_URL: '/api',
  HEADERS: {
    'Content-Type': 'application/json',
  },
  TIMEOUT: 10000, // 10 seconds
} as const;

// CDN URL builders
export const DISCORD_CDN = {
  AVATAR: (userId: string, hash: string) => 
    `https://cdn.discordapp.com/avatars/${userId}/${hash}.${hash.startsWith('a_') ? 'gif' : 'png'}?size=128`,
  BANNER: (userId: string, hash: string) =>
    `https://cdn.discordapp.com/banners/${userId}/${hash}.png?size=600`,
  GUILD_ICON: (guildId: string, hash: string) =>
    `https://cdn.discordapp.com/icons/${guildId}/${hash}.png?size=128`,
  GUILD_BANNER: (guildId: string, hash: string) =>
    `https://cdn.discordapp.com/banners/${guildId}/${hash}.png?size=1024`,
  GUILD_SPLASH: (guildId: string, hash: string) =>
    `https://cdn.discordapp.com/splashes/${guildId}/${hash}.png?size=1024`,
} as const;

// Enhanced error class for API errors
export class APIError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

// Request deduplication cache
const requestCache = new Map<string, Promise<any>>();

// Unified fetch function with timeout, error handling, and deduplication
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const cacheKey = `${options.method || 'GET'}:${url}`;

  // Check for duplicate concurrent requests
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  const requestPromise = (async () => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...API_CONFIG.HEADERS,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.error || errorData.message || 'Request failed',
          response.status,
          errorData.code
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError('Request timeout', 408);
      }
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw new APIError('Network error occurred', 500);
    } finally {
      // Clean up cache after request completes
      requestCache.delete(cacheKey);
    }
  })();

  requestCache.set(cacheKey, requestPromise);
  return requestPromise;
}

// Helper function to build CDN URLs
export function buildAvatarUrl(userId: string, hash: string | null): string | null {
  return hash ? DISCORD_CDN.AVATAR(userId, hash) : null;
}

export function buildBannerUrl(userId: string, hash: string | null): string | null {
  return hash ? DISCORD_CDN.BANNER(userId, hash) : null;
}

export function buildGuildIconUrl(guildId: string, hash: string | null): string | null {
  return hash ? DISCORD_CDN.GUILD_ICON(guildId, hash) : null;
}

export function buildGuildBannerUrl(guildId: string, hash: string | null): string | null {
  return hash ? DISCORD_CDN.GUILD_BANNER(guildId, hash) : null;
}

export function buildGuildSplashUrl(guildId: string, hash: string | null): string | null {
  return hash ? DISCORD_CDN.GUILD_SPLASH(guildId, hash) : null;
}