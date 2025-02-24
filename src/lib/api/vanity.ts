import { VanityUrlResponse } from '@/types/discord';
import { API_CONFIG } from './discord';

interface ErrorResponse {
  error: string;
  message?: string;
  code?: number;
}

// Minimal required fields for guild data
interface MinimalGuildResponse {
  id: string;
  name: string;
}

function isValidGuildData(data: any): boolean {
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

    // Handle error responses - a 404 or code 10006 means the URL is available
    if (!response.ok || data.code === 10006) {
      // If it's a 404 or specific "Unknown Invite" error, it means the vanity URL is available
      if (response.status === 404 || data.code === 10006) {
        return {
          available: true,
          error: null,
          guild: null
        };
      }

      // Handle rate limiting
      if (response.status === 429) {
        return {
          available: false,
          error: 'Too many requests. Please wait a moment.',
          guild: null,
          retryAfter: response.headers.get('Retry-After') ? parseInt(response.headers.get('Retry-After')!) : undefined
        };
      }

      // Other error cases
      return {
        available: false,
        error: data.error || data.message || `Failed to check vanity URL: ${response.status}`,
        guild: null
      };
    }
    
    // If we have a valid response but no guild data, the URL is available
    if (!isValidGuildData(data)) {
      // In case Discord API changes format but still returns a success response
      if (data.available === true) {
        return {
          available: true,
          error: null,
          guild: null
        };
      }

      console.error('Unexpected API response format:', data);
      return {
        available: false,
        error: 'Invalid response format from server',
        guild: null
      };
    }

    // At this point, we have confirmed the vanity URL is taken and we have guild data
    // Type assertion for flexible field access
    const guildData = data.guild as Record<string, any>;
    
    return {
      available: false,
      error: null,
      inviteCode: data.code, // Store the actual invite code from response
      guild: {
        id: guildData.id,
        name: guildData.name,
        approximate_member_count: data.approximate_member_count ?? undefined,
        approximate_presence_count: data.approximate_presence_count ?? undefined,
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
        vanity_url_code: guildData.vanity_url_code ?? code,
        channel: data.channel ? {
          id: data.channel.id,
          name: data.channel.name,
          type: data.channel.type
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