import { Context } from 'hono';
import { DiscordService } from '../services/discord';
import { z } from 'zod';

const userIdSchema = z.object({
  id: z.string()
    .min(17, 'Invalid Discord user ID')
    .max(20, 'Invalid Discord user ID')
    .regex(/^\d+$/, 'Discord user ID must be numeric')
});

const createErrorResponse = (error: string) => ({
  error,
  user: null
});

export async function lookupUser(c: Context) {
  try {
    const id = c.req.param('id');

    // Validate input
    const result = userIdSchema.safeParse({ id });
    if (!result.success) {
      console.log('Validation failed:', result.error.errors[0].message);
      return c.json(
        createErrorResponse(result.error.errors[0].message),
        400
      );
    }

    try {
      const user = await DiscordService.lookupUser(id);
      return c.json({ error: null, user });
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error in lookup:', error.message);
        // Handle rate limit errors specifically
        if (error.message.includes('Rate limited')) {
          return c.json(
            createErrorResponse(error.message),
            429
          );
        }
        // Handle user not found
        if (error.message.includes('404')) {
          return c.json(
            createErrorResponse('User not found'),
            404
          );
        }
      }
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('User lookup error:', errorMessage);
    return c.json(
      createErrorResponse('Failed to lookup user'),
      500
    );
  }
} 