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
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

export interface DiscordInviteResponse {
  guild: DiscordGuild;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  channel?: DiscordChannel;
  message?: string;
  code?: string;
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
    approximate_member_count?: number;
    approximate_presence_count?: number;
    channel?: DiscordChannel;
    verification_level: number;
    nsfw_level: number;
    nsfw: boolean;
    premium_subscription_count?: number;
    splash: string | null;
    banner: string | null;
  } | null;
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