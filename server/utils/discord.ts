import { Headers } from 'node-fetch';
import { DISCORD_CONFIG } from '../config/environment';

interface DiscordRateLimit {
  lastRequest: number;
  minTimeBetweenRequests: number;
}

const discordRateLimit: DiscordRateLimit = {
  lastRequest: 0,
  minTimeBetweenRequests: DISCORD_CONFIG.rateLimitMs,
};

export const getDiscordHeaders = (): Headers => {
  const discordToken = process.env.DISCORD_BOT_TOKEN;
  if (!discordToken) {
    throw new Error('Bot token not configured');
  }

  return new Headers({
    'Authorization': `Bot ${discordToken}`,
    'Content-Type': 'application/json',
    'User-Agent': 'DiscordBot (https://discordtest.com, 1.0.0)'
  });
};

export const enforceDiscordRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeToWait = discordRateLimit.lastRequest + discordRateLimit.minTimeBetweenRequests - now;
  
  if (timeToWait > 0) {
    await new Promise(resolve => setTimeout(resolve, timeToWait));
  }
  
  discordRateLimit.lastRequest = Date.now();
}; 