import type { DiscordInviteResponse, DiscordUser, UnknownInviteResponse } from '../types/discord';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

export class DiscordService {
  private static async fetchWithAuth(endpoint: string) {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      throw new Error('Discord bot token not configured');
    }

    const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('404 Not Found');
      }
      if (response.status === 429) {
        throw new Error('Rate limited by Discord API');
      }
      throw new Error(`Discord API error: ${response.status}`);
    }

    return response.json();
  }

  static async checkInvite(code: string): Promise<DiscordInviteResponse | UnknownInviteResponse> {
    try {
      return await this.fetchWithAuth(`/invites/${code}?with_counts=true&with_expiration=true`);
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

  static async lookupUser(id: string): Promise<DiscordUser> {
    return await this.fetchWithAuth(`/users/${id}`);
  }
} 