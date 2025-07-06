import type { DiscordUser } from '@/types/discord';

// API configuration
export const USER_API_CONFIG = {
  BASE_URL: '/api',
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// Lookup user by ID
export async function lookupUser(userId: string): Promise<DiscordUser | null> {
  const response = await fetch(`${USER_API_CONFIG.BASE_URL}/users/${userId}`, {
    method: 'GET',
    headers: USER_API_CONFIG.HEADERS,
  });

  // Handle rate limiting
  if (response.status === 429) {
    const errorData = await response.json();
    const error = new Error(errorData.error || 'Too many requests. Please try again later.');
    (error as any).status = response.status;
    throw error;
  }

  if (!response.ok) {
    const errorData = await response.json();
    
    // Handle Discord API specific errors
    if (response.status === 404) {
      const error = new Error('User not found');
      (error as any).status = response.status;
      throw error;
    }
    
    if (response.status === 401) {
      const error = new Error('Authentication failed');
      (error as any).status = response.status;
      throw error;
    }
    
    const error = new Error(errorData.message || 'Failed to lookup user');
    (error as any).status = response.status;
    throw error;
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
} 