export type { VanityUrlResponse } from '../../shared/types/discord';

export interface GuildInfo {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  features: string[];
  inviteChannel?: {
    id: string;
    name: string;
    type: number;
  };
  verificationLevel: number;
  nsfwLevel: number;
  isNsfw: boolean;
  boostCount?: number;
  inviteCode?: string;
  vanity_url_code?: string | null;
  splash: string | null;
  banner: string | null;
}

export interface ClanInfo {
  identity_guild_id: string | null;
  identity_enabled: boolean;
  tag: string | null;
  badge: string | null;
}

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string | null;
  accent_color: number | null;
  global_name: string | null;
  avatar_decoration_data: any | null;
  banner_color: string | null;
  bot?: boolean;
  verified?: boolean;
  clan: ClanInfo;
  primary_guild: ClanInfo;
}

export interface ApiError {
  message: string;
  code: number;
}