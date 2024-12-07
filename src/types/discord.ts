export interface GuildInfo {
  name: string;
  memberCount?: number;
  icon: string | null;
  inviteCode?: string;
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
  clan: ClanInfo;
  primary_guild: ClanInfo;
  createdAt: Date;
  bot?: boolean;
  verified?: boolean;
}

export interface VanityUrlResponse {
  available: boolean;
  error: string | null;
  guildInfo: GuildInfo | null;
}

export interface ApiError {
  message: string;
  code: number;
}