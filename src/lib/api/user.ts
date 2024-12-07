import { DiscordUser } from '@/types/discord';
import { toast } from '@/components/ui/toast';

const API_BASE = import.meta.env.PROD 
  ? '/api'
  : 'http://localhost:3000/api';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

interface ErrorResponse {
  error: string;
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
      method: 'POST',
      headers: DEFAULT_HEADERS,
    });

    const data = await response.json() as DiscordUser | ErrorResponse;

    if (!response.ok) {
      if ('error' in data) {
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
        toast.error('An unexpected error occurred');
      }
      return null;
    }

    // Type guard to ensure we have a DiscordUser
    if (!('id' in data)) {
      toast.error('Invalid response format from server');
      return null;
    }

    return {
      ...data,
      avatar: data.avatar 
        ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.${data.avatar.startsWith('a_') ? 'gif' : 'png'}?size=128`
        : null,
      banner: data.banner
        ? `https://cdn.discordapp.com/banners/${data.id}/${data.banner}.png?size=600`
        : null,
      createdAt: new Date(Number(BigInt(data.id) >> 22n) + 1420070400000),
    };
  } catch (error) {
    console.error('API Error:', error);
    toast.error('Failed to connect to API');
    return null;
  }
} 