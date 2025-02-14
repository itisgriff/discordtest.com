import type { VanityUrlResponse } from '@/types/discord';

// API configuration
export const API_CONFIG = {
  BASE_URL: '/api',
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// CDN URLs
export const DISCORD_CDN = {
  AVATAR: (userId: string, hash: string) => 
    `https://cdn.discordapp.com/avatars/${userId}/${hash}.${hash.startsWith('a_') ? 'gif' : 'png'}?size=128`,
  BANNER: (userId: string, hash: string) =>
    `https://cdn.discordapp.com/banners/${userId}/${hash}.png?size=600`,
} as const;

export async function checkVanityUrl(code: string): Promise<VanityUrlResponse> {
  const response = await fetch(`${API_CONFIG.BASE_URL}/vanity/${code}`, {
    method: 'POST',
    headers: API_CONFIG.HEADERS,
  });

  if (!response.ok) {
    throw new Error('Failed to check vanity URL');
  }

  return response.json();
} 