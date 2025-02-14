import type { DiscordInviteResponse, DiscordUser, UnknownInviteResponse } from '../types/discord';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

interface Env {
  DISCORD_BOT_TOKEN: string;
}

export class DiscordService {
  private static async fetchWithAuth(endpoint: string, env: Env) {
    console.log('Environment:', env); // Debug environment object
    const token = env.DISCORD_BOT_TOKEN;
    if (!token) {
      console.error('Missing DISCORD_BOT_TOKEN in environment:', env); // Debug missing token
      throw new Error('Discord bot token not configured');
    }

    console.log('Using authorization:', `Bot ${token.substring(0, 10)}...`); // Debug token format (safely)

    const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Discord API error:', {
        status: response.status,
        statusText: response.statusText,
        url: endpoint
      }); // Debug API errors
      
      if (response.status === 404) {
        throw new Error('404 Not Found');
      }
      if (response.status === 429) {
        throw new Error('Rate limited by Discord API');
      }
      if (response.status === 401) {
        throw new Error('Unauthorized - Check bot token');
      }
      throw new Error(`Discord API error: ${response.status}`);
    }

    return response.json();
  }

  static async checkInvite(code: string, env: Env): Promise<DiscordInviteResponse | UnknownInviteResponse> {
    try {
      return await this.fetchWithAuth(`/invites/${code}?with_counts=true&with_expiration=true`, env);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return {
          message: 'Unknown Invite',
          code
        };
      }
      throw error;
    }
  }

  static async lookupUser(id: string, env: Env): Promise<DiscordUser> {
    return await this.fetchWithAuth(`/users/${id}`, env);
  }
} 