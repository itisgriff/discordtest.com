import { DiscordUser, VanityUrlResponse } from '@/types/discord';

const API_BASE = 'https://discord.com/api/v10';

export async function checkVanityUrl(code: string): Promise<VanityUrlResponse> {
  // Simulated API call - in production, this would hit Discord's API
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (code.length < 2) {
    return {
      code,
      available: false,
      error: 'URL must be at least 2 characters',
    };
  }

  // Simulate some URLs as taken
  const takenUrls = ['discord', 'gaming', 'chat'];
  return {
    code,
    available: !takenUrls.includes(code.toLowerCase()),
  };
}

export async function lookupUser(username: string): Promise<DiscordUser | null> {
  // Simulated API call - in production, this would hit Discord's API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (username === 'discord') {
    return {
      id: '123456789',
      username: 'Discord',
      avatar: 'https://images.unsplash.com/photo-1611162618758-2a29a995354b?w=128&h=128&fit=crop',
      banner: 'https://images.unsplash.com/photo-1617296956430-dd029301bf1d?w=1024',
      accentColor: 0x6366f1,
      createdAt: new Date('2015-05-13'),
      badges: ['VERIFIED', 'PARTNER'],
    };
  }

  return null;
}