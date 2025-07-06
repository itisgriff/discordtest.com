// Discord ID validation
export function validateDiscordId(id: string): { isValid: boolean; error?: string } {
  if (!id.trim()) {
    return { isValid: false, error: 'User ID is required' };
  }

  // Discord IDs are 17-20 digit numbers
  if (!/^\d{17,20}$/.test(id)) {
    return { isValid: false, error: 'Discord ID must be 17-20 digits' };
  }

  // Check if it's a valid snowflake (created after Discord's epoch)
  const timestamp = Number(BigInt(id) >> 22n) + 1420070400000;
  const discordEpoch = 1420070400000; // January 1, 2015
  const now = Date.now();
  
  if (timestamp < discordEpoch || timestamp > now) {
    return { isValid: false, error: 'Invalid Discord ID format' };
  }

  return { isValid: true };
}

// Vanity URL validation
export function validateVanityUrl(code: string): { isValid: boolean; error?: string } {
  if (!code.trim()) {
    return { isValid: false, error: 'Vanity URL is required' };
  }

  // Vanity URLs are 2-32 characters, alphanumeric with hyphens and underscores
  if (code.length < 2 || code.length > 32) {
    return { isValid: false, error: 'Vanity URL must be 2-32 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    return { isValid: false, error: 'Vanity URL can only contain letters, numbers, hyphens, and underscores' };
  }

  // Can't start or end with hyphen/underscore
  if (code.startsWith('-') || code.startsWith('_') || code.endsWith('-') || code.endsWith('_')) {
    return { isValid: false, error: 'Vanity URL cannot start or end with hyphen or underscore' };
  }

  return { isValid: true };
}

// Format validation error messages
export function getValidationHint(type: 'discord-id' | 'vanity-url'): string {
  switch (type) {
    case 'discord-id':
      return 'Discord IDs are 17-20 digits (e.g., 123456789012345678)';
    case 'vanity-url':
      return '2-32 characters, letters/numbers/hyphens/underscores only';
    default:
      return '';
  }
}