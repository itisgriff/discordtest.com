import { DiscordUser, VanityUrlResponse } from '@/types/discord';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 403) {
    throw new Error('Access forbidden. Please check bot permissions.');
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  return data;
}

// Helper function to make unauthenticated requests
async function makePublicRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
    mode: 'cors',
    headers: {
      'Accept': 'application/json'
    }
  });
  return handleResponse<T>(response);
}

// Helper function to make authenticated requests
async function makeAuthenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bot ${import.meta.env.DISCORD_BOT_TOKEN}`);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
    ...options,
    mode: 'cors',
    headers,
    credentials: 'include'
  });

  return handleResponse<T>(response);
}

interface InviteResponse {
  guild: {
    id: string;
    name: string;
    icon: string | null;
    features: string[];
    approximate_member_count: number;
  };
}

// Check vanity URL availability
export async function checkVanityUrl(code: string): Promise<VanityUrlResponse> {
  try {
    // Try to fetch the invite without authentication
    const inviteResponse = await makePublicRequest<InviteResponse>(`/invites/${code}`);

    return {
      available: false,
      error: null,
      guildInfo: {
        name: inviteResponse.guild.name,
        memberCount: inviteResponse.guild.approximate_member_count,
        icon: inviteResponse.guild.icon 
          ? `https://cdn.discordapp.com/icons/${inviteResponse.guild.id}/${inviteResponse.guild.icon}.png`
          : null
      }
    };
  } catch (error) {
    // If we get a 404, the URL is available
    if (error instanceof Error && error.message.includes('404')) {
      return {
        available: true,
        error: null,
        guildInfo: null
      };
    }
    return {
      available: false,
      error: error instanceof Error ? error.message : 'An error occurred',
      guildInfo: null
    };
  }
}

// Lookup user by ID (authenticated request)
export async function lookupUser(userId: string): Promise<DiscordUser | null> {
  try {
    const user = await makeAuthenticatedRequest<any>(`/users/${userId}`, {
      method: 'GET',
    });

    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : null,
      banner: user.banner
        ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.png`
        : null,
      badges: [], // You'll need to implement badge logic based on user flags
      createdAt: new Date(Number(BigInt(user.id) >> 22n) + 1420070400000),
      accentColor: user.accent_color || undefined,
    };
  } catch (error) {
    console.error('Error looking up user:', error);
    return null;
  }
}