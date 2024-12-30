import { Context } from 'hono';
import { StatusCode } from 'hono/utils/http-status';
import { DiscordService } from '../services/discord';
import type { VanityUrlResponse, DiscordInviteResponse, UnknownInviteResponse } from '../../shared/types/discord';
import { z } from 'zod';

const vanityCodeSchema = z.object({
  code: z.string()
    .min(2, 'Vanity URL must be at least 2 characters')
    .max(32, 'Vanity URL cannot exceed 32 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Vanity URL can only contain letters, numbers, and hyphens')
});

const createErrorResponse = (error: string): VanityUrlResponse => ({
  error,
  available: false,
  guild: null
});

// Type guard function to check if response is UnknownInviteResponse
function isUnknownInviteResponse(data: DiscordInviteResponse | UnknownInviteResponse): data is UnknownInviteResponse {
  return 'message' in data && data.message === "Unknown Invite";
}

// Type guard function to check if response is DiscordInviteResponse
function isDiscordInviteResponse(data: DiscordInviteResponse | UnknownInviteResponse): data is DiscordInviteResponse {
  return 'guild' in data;
}

export async function checkVanityUrl(c: Context) {
  try {
    const code = c.req.param('code');

    // Validate input
    const result = vanityCodeSchema.safeParse({ code });
    if (!result.success) {
      return c.json<VanityUrlResponse>(
        createErrorResponse(result.error.errors[0].message),
        400 as StatusCode
      );
    }

    try {
      const data = await DiscordService.checkInvite(code);
      
      if (isUnknownInviteResponse(data)) {
        return c.json<VanityUrlResponse>({
          available: true,
          error: null,
          guild: null
        });
      }

      if (!isDiscordInviteResponse(data) || !data.guild) {
        return c.json<VanityUrlResponse>(
          createErrorResponse('Invalid response from Discord API'),
          500 as StatusCode
        );
      }

      return c.json<VanityUrlResponse>({
        available: false,
        error: null,
        guild: {
          ...data.guild,
          approximate_member_count: data.approximate_member_count,
          approximate_presence_count: data.approximate_presence_count,
          channel: data.channel
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        // Handle rate limit errors specifically
        if (error.message.includes('Rate limited')) {
          return c.json<VanityUrlResponse>(
            createErrorResponse(error.message),
            429 as StatusCode
          );
        }
        // For vanity URL checks, a 404 means the URL is available
        if (error.message.includes('404') || error.message.includes('Unknown Invite')) {
          return c.json<VanityUrlResponse>({
            available: true,
            error: null,
            guild: null
          });
        }
      }
      // Log the error for debugging
      console.error('Vanity check error:', error instanceof Error ? error.message : 'Unknown error');
      return c.json<VanityUrlResponse>(
        createErrorResponse('Failed to check vanity URL'),
        500 as StatusCode
      );
    }
  } catch (error) {
    console.error('Vanity check error:', error instanceof Error ? error.message : 'Unknown error');
    return c.json<VanityUrlResponse>(
      createErrorResponse('Failed to check vanity URL'),
      500 as StatusCode
    );
  }
} 