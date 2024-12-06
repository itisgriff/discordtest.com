export interface GuildInfo {
  name: string;
  memberCount?: number;
  icon: string | null;
  inviteCode?: string;
}

export interface VanityUrlResponse {
  available: boolean;
  error: string | null;
  guildInfo: GuildInfo | null;
}

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  badges: string[];
  createdAt: Date;
  accentColor?: number;
}

export interface ApiError {
  message: string;
  code: number;
}