import { DiscordUser } from '@/types/discord';
import { toast } from '@/components/ui/toast';

const API_BASE = import.meta.env.PROD 
  ? '/api'
  : 'http://localhost:8787/api';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

interface ErrorResponse {
  error: string;
}

interface UserResponse {
  user: DiscordUser;
}

function isErrorResponse(data: any): data is ErrorResponse {
  return 'error' in data;
}

function isUserResponse(data: any): data is UserResponse {
  return 'user' in data && data.user && 'id' in data.user;
}

// Lookup user by ID
export async function lookupUser(userId: string): Promise<DiscordUser | null> {
  try {
    // Input validation
    if (!userId.match(/^\d+$/)) {
      toast.error('Invalid user ID format');
      return null;
    }

    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
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
      console.error('Invalid API response format:', data);
      toast.error('Invalid response format from server');
      return null;
    }

    const user = data.user;
    const processedUser: DiscordUser = {
      id: user.id,
      username: user.username,
      avatar: user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=128`
        : null,
      banner: user.banner
        ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.png?size=600`
        : null,
      accentColor: user.accentColor ?? null,
      flags: user.flags ?? 0,
      bot: user.bot ?? false,
      verified: user.verified ?? false
    };
    return processedUser;
  } catch (error) {
    console.error('API request failed:', error);
    toast.error('Failed to connect to API');
    return null;
  }
} 