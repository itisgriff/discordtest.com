import { DiscordUser } from '@/types/discord';
import { toast } from '@/components/ui/toast';

const API_BASE = 'http://localhost:3000/api';

// Lookup user by ID
export async function lookupUser(userId: string): Promise<DiscordUser | null> {
  try {
    const response = await fetch(`${API_BASE}/users/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        toast.error('Unauthorized: Check bot permissions');
      } else if (response.status === 404) {
        toast.error('User not found');
      } else {
        toast.error(`Failed to fetch user: ${data.error || response.status}`);
      }
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      discriminator: data.discriminator,
      public_flags: data.public_flags,
      flags: data.flags,
      avatar: data.avatar 
        ? `https://cdn.discordapp.com/avatars/${userId}/${data.avatar}.png`
        : null,
      banner: data.banner
        ? `https://cdn.discordapp.com/banners/${userId}/${data.banner}.png`
        : null,
      accent_color: data.accent_color,
      global_name: data.global_name,
      avatar_decoration_data: data.avatar_decoration_data,
      banner_color: data.banner_color,
      clan: data.clan,
      primary_guild: data.primary_guild,
      createdAt: new Date(Number(BigInt(userId) >> 22n) + 1420070400000),
    };
  } catch (error) {
    toast.error('Failed to connect to API');
    return null;
  }
} 