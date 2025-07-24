export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  splash: string | null;
  banner: string | null;
  features: string[];
  verification_level: number;
  vanity_url_code: string | null;
  nsfw_level: number;
  nsfw: boolean;
  premium_subscription_count?: number;
  premium_tier?: number;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

export interface DiscordGuildProfile {
  id: string;
  name: string;
  icon_hash: string | null;
  member_count?: number;
  online_count?: number;
  description: string | null;
  banner_hash: string | null;
  game_application_ids: string[];
  game_activity: Record<string, any>;
  tag: string | null;
  badge: number;
  badge_color_primary: string | null;
  badge_color_secondary: string | null;
  badge_hash: string | null;
  traits: string[];
  features: string[];
  visibility: number;
  custom_banner_hash: string | null;
  premium_subscription_count?: number;
  premium_tier: number;
}

export interface DiscordInviteResponse {
  type: number;
  code: string;
  expires_at: string | null;
  flags: number;
  guild: DiscordGuild;
  guild_id?: string;
  channel?: DiscordChannel;
  profile?: DiscordGuildProfile;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  message?: string;
}

export interface UnknownInviteResponse {
  message: string;
  code: string;
}

export interface VanityUrlResponse {
  error: string | null;
  available: boolean;
  guild: {
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
    features: string[];
    channel?: DiscordChannel;
    verification_level: number;
    nsfw_level: number;
    nsfw: boolean;
    premium_subscription_count?: number;
    premium_tier?: number;
    splash: string | null;
    banner: string | null;
  } | null;
  profile?: DiscordGuildProfile;
  channel?: DiscordChannel;
  retryAfter?: number;
  type?: number;
  code?: string;
  expires_at?: string | null;
  flags?: number;
  guild_id?: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  accentColor: number | null;
  flags?: number;
  bot?: boolean;
  verified?: boolean;
}

export interface ErrorResponse {
  error: string;
} 