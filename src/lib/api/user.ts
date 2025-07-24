import type { DiscordUser } from '@/types/discord';
import { apiRequest, buildAvatarUrl, buildBannerUrl } from './client';

// Lookup user by ID
export async function lookupUser(userId: string): Promise<DiscordUser | null> {
  const userData = await apiRequest<DiscordUser>(`/users/${userId}`);
  
  // Transform avatar and banner URLs using helper functions
  const avatarHash = userData.avatar;
  const bannerHash = userData.banner;
  
  return {
    ...userData,
    avatar: buildAvatarUrl(userData.id, avatarHash),
    banner: buildBannerUrl(userData.id, bannerHash),
  };
} 