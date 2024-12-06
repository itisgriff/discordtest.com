export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  accentColor: number | null;
  createdAt: Date;
  badges: string[];
}

export interface VanityUrlResponse {
  code: string;
  available: boolean;
  error?: string;
}

export interface ApiError {
  message: string;
  code: number;
}