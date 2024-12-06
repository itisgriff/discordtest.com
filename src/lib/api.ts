import { DiscordUser, VanityUrlResponse } from '@/types/discord';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  return data;
}

// Helper function to make unauthenticated requests
async function makePublicRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${DISCORD_API_BASE}${endpoint}`);
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

  const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

interface InviteResponse {
  guild: {
    id: string;
    name: string;
    features: string[];
  };
}

interface GuildResponse {
  id: string;
  name: string;
  icon: string | null;
  features: string[];
  approximate_member_count: number;
}

// Check vanity URL availability
export async function checkVanityUrl(code: string): Promise<VanityUrlResponse> {
  try {
    // First try to fetch the invite without authentication
    const inviteResponse = await makePublicRequest<InviteResponse>(`/invites/${code}`);

    // If we get here, the URL is taken. Let's get more guild info using authentication
    const guildInfo = await makeAuthenticatedRequest<GuildResponse>(
      `/guilds/${inviteResponse.guild.id}`,
      { method: 'GET' }
    );

    return {
      available: false,
      error: null,
      guildInfo: {
        name: guildInfo.name,
        memberCount: guildInfo.approximate_member_count,
        icon: guildInfo.icon 
          ? `https://cdn.discordapp.com/icons/${guildInfo.id}/${guildInfo.icon}.png`
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

// Lookup user by username (authenticated request)
export async function lookupUser(username: string): Promise<DiscordUser | null> {
  try {
    const response = await makeAuthenticatedRequest<any[]>(`/users/@me/relationships`, {
      method: 'GET',
    });

    // Find user by username
    const user = response.find((u) => u.user.username === username);
    if (!user) return null;

    // Format the response
    return {
      id: user.user.id,
      username: user.user.username,
      avatar: user.user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.user.id}/${user.user.avatar}.png`
        : null,
      banner: user.user.banner
        ? `https://cdn.discordapp.com/banners/${user.user.id}/${user.user.banner}.png`
        : null,
      badges: [], // You'll need to implement badge logic based on user flags
      createdAt: new Date(Number(BigInt(user.user.id) >> 22n) + 1420070400000),
      accentColor: user.user.accent_color || undefined,
    };
  } catch (error) {
    console.error('Error looking up user:', error);
    return null;
  }
}