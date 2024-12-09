import type { VanityUrlResponse } from '@/types/discord';

export async function checkVanityUrl(code: string): Promise<VanityUrlResponse> {
  const response = await fetch(`/api/vanity/${code}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to check vanity URL');
  }

  return response.json();
} 