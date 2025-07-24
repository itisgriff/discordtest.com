export interface VanityUrlResponse {
  available: boolean;
  error: string | null;
  guild: GuildInfo | null;
  type?: number;
  code?: string;
  expires_at?: string | null;
  flags?: number;
  guild_id?: string;
  profile?: any;
  channel?: {
    id: string;
    name: string;
    type: number;
  };
}

export interface GuildInfo {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  features: string[];
  channel?: {
    id: string;
    name: string;
    type: number;
  };
  // Discord API uses snake_case
  verification_level: number;
  nsfw_level: number;
  nsfw: boolean;
  premium_subscription_count?: number;
  premium_tier?: number;
  // Computed/transformed properties (camelCase)
  verificationLevel: number;
  nsfwLevel: number;
  isNsfw: boolean;
  boostCount?: number;
  premiumTier?: number;
  inviteCode?: string;
  inviteChannel?: {
    id: string;
    name: string;
    type: number;
  };
  splash: string | null;
  banner: string | null;
  type?: number;
  code?: string;
  expires_at?: string | null;
  flags?: number;
  guild_id?: string;
  // Profile data
  memberCount?: number;
  onlineCount?: number;
  tag?: string | null;
  badge?: number;
  badgeColorPrimary?: string | null;
  badgeColorSecondary?: string | null;
  badgeHash?: string | null;
  traits?: string[];
  visibility?: number;
  customBannerHash?: string | null;
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