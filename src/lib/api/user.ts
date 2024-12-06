import { DiscordUser } from '@/types/discord';
import { toast } from '@/components/ui/toast';

const API_BASE = '/api/discord';

// Lookup user by ID
export async function lookupUser(userId: string): Promise<DiscordUser | null> {
  const token = import.meta.env.VITE_DISCORD_BOT_TOKEN;
  if (!token) {
    toast.error('Discord bot token is not configured');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    if (response.status === 200) {
      const data = await response.json();
      return {
        id: data.id,
        username: data.username,
        avatar: data.avatar 
          ? `https://cdn.discordapp.com/avatars/${userId}/${data.avatar}.png`
          : null,
        banner: data.banner
          ? `https://cdn.discordapp.com/banners/${userId}/${data.banner}.png`
          : null,
        badges: [], // You'll need to implement badge logic based on user flags
        createdAt: new Date(Number(BigInt(userId) >> 22n) + 1420070400000),
        accentColor: data.accent_color || undefined,
      };
    } else if (response.status === 401) {
      toast.error('Unauthorized: Check your bot token and permissions');
      return null;
    } else if (response.status === 404) {
      toast.error('User not found');
      return null;
    } else {
      toast.error(`Failed to fetch user: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('Error looking up user:', error);
    toast.error('Failed to connect to Discord API');
    return null;
  }
} 