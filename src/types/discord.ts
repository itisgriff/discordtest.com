export type { VanityUrlResponse } from '../../shared/types/discord';

export interface GuildInfo {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  features: string[];
  memberCount?: number;
  onlineCount?: number;
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
  banner: string | null;
  accentColor: number | null;
  flags: number;
  bot?: boolean;
  verified?: boolean;
}

export interface ApiError {
  message: string;
  code: number;
}