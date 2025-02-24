import { VanityUrlResponse } from '@/types/discord';
import { API_CONFIG } from './discord';

// Minimal required fields for guild data
interface MinimalGuildResponse {
  id: string;
  name: string;
}

// Extended response interface to include new Discord API fields
interface DiscordAPIResponse {
  guild: MinimalGuildResponse;
  type?: number;
  code?: string;
  expires_at?: string | null;
  flags?: number;
  guild_id?: string;
  channel?: {
    id: string;
    name: string;
    type: number;
  };
}

function isValidGuildData(data: any): data is DiscordAPIResponse {
  return (
    data &&
    typeof data === 'object' &&
    'guild' in data &&
    typeof data.guild === 'object' &&
    'id' in data.guild &&
    typeof data.guild.id === 'string' &&
    'name' in data.guild &&
    typeof data.guild.name === 'string'
  );
}

// Check vanity URL availability
export async function checkVanityUrl(code: string): Promise<VanityUrlResponse> {
  try {
    // Input validation
    if (!code.match(/^[a-zA-Z0-9-]+$/)) {
      return {
        available: false,
        error: 'Invalid vanity URL format',
        guild: null
      };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/vanity/${code}`, {
      method: 'GET',
      headers: API_CONFIG.HEADERS,
    });

    const data = await response.json();

    // Handle the case where Discord API returns Error 10006 (Unknown Invite)
    // This means the vanity URL is available
    if (data.code === 10006 || data.available === true) {
      return {
        available: true,
        error: null,
        guild: null
      };
    }

    if (!response.ok) {
      switch (response.status) {
        case 429:
          return {
            available: false,
            error: 'Too many requests. Please wait a moment.',
            guild: null,
            retryAfter: response.headers.get('Retry-After') ? parseInt(response.headers.get('Retry-After')!) : undefined
          };
        default:
          return {
            available: false,
            error: data.error || data.message || `Failed to check vanity URL: ${response.status}`,
            guild: null
          };
      }
    }
    
    // Handle taken vanity URLs
    if (!isValidGuildData(data)) {
      console.error('Unexpected API response format:', data);
      return {
        available: false,
        error: 'Invalid response format from server',
        guild: null
      };
    }

    // Now data is typed as DiscordAPIResponse
    const guildData = data.guild as Record<string, any>;
    
    return {
      available: false,
      error: null,
      type: data.type,
      code: data.code || code,
      expires_at: data.expires_at || null,
      flags: data.flags,
      guild_id: data.guild_id || guildData.id,
      guild: {
        id: guildData.id,
        name: guildData.name,
        icon: guildData.icon 
          ? `https://cdn.discordapp.com/icons/${guildData.id}/${guildData.icon}.png?size=128`
          : null,
        splash: guildData.splash
          ? `https://cdn.discordapp.com/splashes/${guildData.id}/${guildData.splash}.png?size=1024`
          : null,
        banner: guildData.banner
          ? `https://cdn.discordapp.com/banners/${guildData.id}/${guildData.banner}.png?size=1024`
          : null,
        description: guildData.description ?? null,
        features: guildData.features ?? [],
        verification_level: guildData.verification_level ?? 0,
        nsfw_level: guildData.nsfw_level ?? 0,
        nsfw: guildData.nsfw ?? false,
        premium_subscription_count: guildData.premium_subscription_count ?? 0,
        channel: (data as any).channel ? {
          id: (data as any).channel.id,
          name: (data as any).channel.name,
          type: (data as any).channel.type
        } : undefined
      }
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      available: false,
      error: 'Failed to connect to Discord API',
      guild: null
    };
  }
} 