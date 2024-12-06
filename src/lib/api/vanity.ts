import { VanityUrlResponse } from '@/types/discord';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

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
    const response = await fetch(`${DISCORD_API_BASE}/invites/${code}`);

    if (response.status === 200) {
      const inviteResponse = await response.json() as InviteResponse;
      return {
        available: false,
        error: null,
        guildInfo: {
          name: inviteResponse.guild.name,
          memberCount: inviteResponse.guild.approximate_member_count,
          icon: inviteResponse.guild.icon 
            ? `https://cdn.discordapp.com/icons/${inviteResponse.guild.id}/${inviteResponse.guild.icon}.png`
            : null,
          inviteCode: code
        }
      };
    } else if (response.status === 404) {
      return {
        available: true,
        error: null,
        guildInfo: null
      };
    } else {
      return {
        available: false,
        error: `Failed to check vanity URL: ${response.status}`,
        guildInfo: null
      };
    }
  } catch (error) {
    console.error('Error checking vanity URL:', error);
    return {
      available: false,
      error: 'Failed to connect to Discord API',
      guildInfo: null
    };
  }
} 