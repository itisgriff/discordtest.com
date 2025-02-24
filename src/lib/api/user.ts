import { DiscordUser } from '@/types/discord';
import { API_CONFIG } from './discord';

interface ErrorResponse {
  message: string;
  code: number;
}

interface ApiResponse {
  user: DiscordUser | null;
  error: string | null;
  retryAfter?: number;
}

export async function lookupUser(userId: string): Promise<DiscordUser | ApiResponse> {
  try {
    // Validate the userId format - Discord user IDs are typically 18-19 digits
    if (!/^\d{17,20}$/.test(userId)) {
      return {
        user: null,
        error: 'Invalid user ID format. Discord user IDs are typically 17-20 digits.'
      };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: API_CONFIG.HEADERS,
    });

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        return {
          user: null,
          error: 'Too many requests. Please wait a moment.',
          retryAfter: retryAfter ? parseInt(retryAfter) : undefined
        };
      }

      // Handle not found
      if (response.status === 404) {
        return {
          user: null,
          error: `No user found with ID ${userId}.`
        };
      }

      // Handle other errors
      try {
        const errorData = await response.json() as ErrorResponse;
        return {
          user: null,
          error: errorData.message || `API Error: ${response.status}`
        };
      } catch (parseError) {
        return {
          user: null,
          error: `Failed to lookup user. Status code: ${response.status}`
        };
      }
    }

    // Process successful response
    const userData = await response.json();
    
    // Format the user data
    const user: DiscordUser = {
      id: userData.id,
      username: userData.username,
      global_name: userData.global_name,
      discriminator: userData.discriminator || '0',
      avatar: userData.avatar 
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.${userData.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
        : null,
      banner: userData.banner 
        ? `https://cdn.discordapp.com/banners/${userData.id}/${userData.banner}.${userData.banner.startsWith('a_') ? 'gif' : 'png'}?size=600`
        : null,
      accent_color: userData.accent_color,
      banner_color: userData.accent_color ? `#${userData.accent_color.toString(16).padStart(6, '0')}` : null,
      bot: userData.bot || false,
      flags: userData.flags || 0,
      public_flags: userData.public_flags || 0,
      avatar_decoration_data: userData.avatar_decoration_data,
      verified: userData.verified || false,
      // Provide default values for clan info 
      clan: {
        identity_guild_id: null,
        identity_enabled: false,
        tag: null,
        badge: null
      },
      primary_guild: {
        identity_guild_id: null,
        identity_enabled: false,
        tag: null,
        badge: null
      }
    };

    return user;
  } catch (error) {
    console.error('API Error:', error);
    return {
      user: null,
      error: 'Failed to connect to Discord API'
    };
  }
} 