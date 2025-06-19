import type { DiscordUser } from '@/types/discord';
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

// API configuration
export const USER_API_CONFIG = {
  BASE_URL: '/api',
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// Lookup user by ID
export async function lookupUser(userId: string): Promise<DiscordUser | null> {
  try {
    const response = await fetch(`${USER_API_CONFIG.BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: USER_API_CONFIG.HEADERS,
    });

    // Handle rate limiting
    if (response.status === 429) {
      const errorData = await response.json();
      toast.error(errorData.error || 'Too many requests. Please try again later.');
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle Discord API specific errors
      if (response.status === 404) {
        toast.error('User not found');
        return null;
      }
      
      if (response.status === 401) {
        toast.error('Authentication failed');
        return null;
      }
      
      toast.error(errorData.message || 'Failed to lookup user');
      return null;
    }

    const userData = await response.json();
    
    // Transform avatar and banner URLs if they exist
    if (userData.avatar) {
      userData.avatar = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.${userData.avatar.startsWith('a_') ? 'gif' : 'png'}?size=128`;
    }
    
    if (userData.banner) {
      userData.banner = `https://cdn.discordapp.com/banners/${userData.id}/${userData.banner}.png?size=600`;
    }

    return userData;
  } catch (error) {
    console.error('User lookup error:', error);
    toast.error('Network error occurred while looking up user');
    return null;
  }
} 