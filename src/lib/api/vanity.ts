import { VanityUrlResponse } from '@/types/discord';
import { toast } from '@/components/ui/toast';
import { apiRequest, APIError, buildGuildIconUrl, buildGuildBannerUrl, buildGuildSplashUrl } from './client';

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
  profile?: any;  // Profile data from Discord API
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
export async function checkVanityUrl(code: string): Promise<VanityUrlResponse | null> {
  try {
    // Input validation
    if (!code.match(/^[a-zA-Z0-9-]+$/)) {
      return {
        available: false,
        error: 'Invalid vanity URL format',
        guild: null
      };
    }

    const data = await apiRequest<any>(`/vanity/${code}`);

    // Handle the case where Discord API returns Error 10006 (Unknown Invite)
    // This means the vanity URL is available
    if (data.code === 10006 || data.available === true) {
      return {
        available: true,
        error: null,
        guild: null
      };
    }

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
      // Pass through the complete data from worker
      profile: data.profile,  // Include profile data
      channel: data.channel,
      guild: {
        id: guildData.id,
        name: guildData.name,
        icon: buildGuildIconUrl(guildData.id, guildData.icon),
        splash: buildGuildSplashUrl(guildData.id, guildData.splash),
        banner: buildGuildBannerUrl(guildData.id, guildData.banner),
        description: guildData.description ?? null,
        features: guildData.features ?? [],
        verification_level: guildData.verification_level ?? 0,
        nsfw_level: guildData.nsfw_level ?? 0,
        nsfw: guildData.nsfw ?? false,
        premium_subscription_count: guildData.premium_subscription_count ?? 0,
        premium_tier: guildData.premium_tier ?? 0,
        // Computed camelCase properties for UI compatibility
        verificationLevel: guildData.verification_level ?? 0,
        nsfwLevel: guildData.nsfw_level ?? 0,
        isNsfw: guildData.nsfw ?? false,
        boostCount: guildData.premium_subscription_count ?? 0,
        premiumTier: guildData.premium_tier ?? 0,
        inviteCode: data.code || code,
        inviteChannel: (data as any).channel ? {
          id: (data as any).channel.id,
          name: (data as any).channel.name,
          type: (data as any).channel.type
        } : undefined,
        channel: (data as any).channel ? {
          id: (data as any).channel.id,
          name: (data as any).channel.name,
          type: (data as any).channel.type
        } : undefined
      }
    };
  } catch (error) {
    console.error('Vanity URL check error:', error);
    
    if (error instanceof APIError) {
      if (error.status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else if (error.status === 401) {
        toast.error('Authentication failed');
      } else if (error.status === 408) {
        toast.error('Request timeout. Please try again.');
      } else {
        toast.error(error.message || 'Failed to check vanity URL');
      }
    } else {
      toast.error('Network error occurred while checking vanity URL');
    }
    
    return null;
  }
} 