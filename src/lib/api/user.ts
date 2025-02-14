import { DiscordUser } from '@/types/discord';
import { toast } from '@/components/ui/toast';
import { API_CONFIG, DISCORD_CDN } from './discord';

interface ErrorResponse {
  error: string;
}

function isErrorResponse(data: any): data is ErrorResponse {
  return 'error' in data;
}

function isUserResponse(data: any): boolean {
  // Check if data has minimal required fields
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    typeof data.id === 'string' &&
    'username' in data &&
    typeof data.username === 'string'
  );
}

// Lookup user by ID
export async function lookupUser(userId: string): Promise<DiscordUser | null> {
  try {
    // Input validation
    if (!userId.match(/^\d+$/)) {
      toast.error("Invalid user ID format");
      return null;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: API_CONFIG.HEADERS,
    });

    const data = await response.json();

    if (!response.ok) {
      if (isErrorResponse(data)) {
        const errorMsg = `User lookup failed: ${data.error} (Status: ${response.status})`;
        console.error(errorMsg);
        switch (response.status) {
          case 401:
            toast.error('Unauthorized: Check bot permissions');
            break;
          case 404:
            toast.error('User not found');
            break;
          case 429:
            toast.error('Too many requests. Please wait a moment.');
            break;
          default:
            toast.error(`Failed to fetch user: ${data.error}`);
        }
      } else {
        console.error('Unexpected API error response:', data);
        toast.error('An unexpected error occurred');
      }
      return null;
    }

    if (!isUserResponse(data)) {
      console.error('Missing required user data:', data);
      toast.error('Incomplete user data received');
      return null;
    }

    // Type assertion since we know the shape but want to be flexible about presence
    const fullUser = data as Record<string, any>;
    
    const processedUser: DiscordUser = {
      id: fullUser.id,
      username: fullUser.username,
      avatar: fullUser.avatar ? DISCORD_CDN.AVATAR(fullUser.id, fullUser.avatar) : null,
      discriminator: fullUser.discriminator ?? '0',
      public_flags: fullUser.public_flags ?? 0,
      flags: fullUser.flags ?? 0,
      banner: fullUser.banner ? DISCORD_CDN.BANNER(fullUser.id, fullUser.banner) : null,
      accent_color: fullUser.accent_color ?? null,
      global_name: fullUser.global_name ?? null,
      avatar_decoration_data: fullUser.avatar_decoration_data ?? null,
      banner_color: fullUser.banner_color ?? null,
      bot: fullUser.bot ?? false,
      verified: fullUser.verified ?? false,
      clan: {
        identity_guild_id: fullUser.clan?.identity_guild_id ?? null,
        identity_enabled: fullUser.clan?.identity_enabled ?? false,
        tag: fullUser.clan?.tag ?? null,
        badge: fullUser.clan?.badge ?? null
      },
      primary_guild: {
        identity_guild_id: fullUser.primary_guild?.identity_guild_id ?? null,
        identity_enabled: fullUser.primary_guild?.identity_enabled ?? false,
        tag: fullUser.primary_guild?.tag ?? null,
        badge: fullUser.primary_guild?.badge ?? null
      }
    };
    return processedUser;
  } catch (error) {
    console.error('API request failed:', error);
    toast.error('Failed to connect to API');
    return null;
  }
} 