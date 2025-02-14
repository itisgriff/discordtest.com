import { DiscordService } from '../../services/discord';
import { createErrorResponse, createJsonResponse, handleOptions } from '../../utils/responses';
import type { VanityUrlResponse } from '../../types/discord';
import { z } from 'zod';

const vanityCodeSchema = z.object({
  code: z.string()
    .min(2, 'Vanity URL must be at least 2 characters')
    .max(32, 'Vanity URL cannot exceed 32 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Vanity URL can only contain letters, numbers, and hyphens')
});

export const onRequestPost = async ({ params }: { params: { code: string } }) => {
  try {
    const { code } = params;

    // Validate input
    const result = vanityCodeSchema.safeParse({ code });
    if (!result.success) {
      return createErrorResponse(result.error.errors[0].message, 400);
    }

    const data = await DiscordService.checkInvite(code);
    
    if ('message' in data && data.message === 'Unknown Invite') {
      return createJsonResponse<VanityUrlResponse>({
        available: true,
        error: null,
        guild: null
      });
    }

    if (!('guild' in data)) {
      return createErrorResponse('Invalid response from Discord API', 500);
    }

    return createJsonResponse<VanityUrlResponse>({
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
    console.error('Vanity check error:', error instanceof Error ? error.message : 'Unknown error');
    return createErrorResponse('Failed to check vanity URL', 500);
  }
};

export const onRequestOptions = handleOptions; 