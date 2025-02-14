import { DiscordService } from '../../services/discord';
import { createErrorResponse, createJsonResponse, handleOptions } from '../../utils/responses';
import { z } from 'zod';

const userIdSchema = z.object({
  id: z.string()
    .min(17, 'Invalid Discord user ID')
    .max(20, 'Invalid Discord user ID')
    .regex(/^\d+$/, 'Discord user ID must be numeric')
});

export const onRequestGet = async ({ params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    // Validate input
    const result = userIdSchema.safeParse({ id });
    if (!result.success) {
      return createErrorResponse(result.error.errors[0].message, 400);
    }

    try {
      const user = await DiscordService.lookupUser(id);
      return createJsonResponse({ error: null, user });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          return createErrorResponse('User not found', 404);
        }
        if (error.message.includes('Rate limited')) {
          return createErrorResponse(error.message, 429);
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('User lookup error:', error instanceof Error ? error.message : 'Unknown error');
    return createErrorResponse('Failed to lookup user', 500);
  }
};

export const onRequestOptions = handleOptions; 