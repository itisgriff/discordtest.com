import { VanityUrlResponse } from '@/types/discord';

const API_BASE = import.meta.env.PROD 
  ? 'https://api.discordtest.com/api'
  : 'http://localhost:3000/api';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

interface ErrorResponse {
  error: string;
}

// Check vanity URL availability
export async function checkVanityUrl(code: string, turnstileToken: string): Promise<VanityUrlResponse> {
  try {
    // Input validation
    if (!code.match(/^[a-zA-Z0-9-]+$/)) {
      return {
        available: false,
        error: 'Invalid vanity URL format',
        guildInfo: null
      };
    }

    const response = await fetch(`${API_BASE}/vanity/${code}`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ token: turnstileToken }),
    });

    if (!response.ok) {
      const data = await response.json() as ErrorResponse;
      
      switch (response.status) {
        case 403:
          return {
            available: false,
            error: 'Verification failed. Please try again.',
            guildInfo: null
          };
        case 429:
          return {
            available: false,
            error: 'Too many requests. Please wait a moment.',
            guildInfo: null
          };
        default:
          return {
            available: false,
            error: data.error || `Failed to check vanity URL: ${response.status}`,
            guildInfo: null
          };
      }
    }

    const data = await response.json();
    
    if (data.available) {
      return {
        available: true,
        error: null,
        guildInfo: null
      };
    }

    if (!data.guild) {
      return {
        available: false,
        error: 'Invalid response format from server',
        guildInfo: null
      };
    }

    return {
      available: false,
      error: null,
      guildInfo: {
        name: data.guild.name,
        memberCount: data.guild.approximate_member_count,
        icon: data.guild.icon 
          ? `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png?size=128`
          : null,
        inviteCode: code
      }
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      available: false,
      error: 'Failed to connect to Discord API',
      guildInfo: null
    };
  }
} 