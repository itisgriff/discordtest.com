# DiscordTest - Discord Management Tools

A modern, feature-rich web application providing essential Discord server management utilities.

## Project Overview

### Core Purpose
DiscordTest offers a suite of tools designed to simplify Discord server management and user verification tasks. Built with modern web technologies, it provides a seamless interface for common Discord administrative functions.

### Key Features
- **Vanity URL Checker**: Verify availability of custom Discord server URLs
- **User Lookup Tool**: Comprehensive Discord user profile information
- **Modern UI/UX**: Responsive design with dark mode and smooth animations

### Target Audience
- Discord Server Administrators
- Community Managers
- Moderation Teams
- Server Owners

## Technical Architecture

### Technology Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form
- **Date Formatting**: date-fns
- **Type Validation**: Zod

### System Requirements
- Node.js 18+
- npm 7+
- Modern web browser with JavaScript enabled

### Project Structure
```
src/
├── components/         # Reusable UI components
│   ├── layout/        # Layout components
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks
├── lib/              # Utility functions and API
├── pages/            # Page components
└── types/            # TypeScript type definitions
```

## Implementation Details

### Key Components

#### Vanity URL Checker
```typescript
// src/lib/api.ts
async function checkVanityUrl(code: string): Promise<VanityUrlResponse>
```
- Validates vanity URL availability
- Implements rate limiting and error handling
- Returns availability status and error messages

#### User Lookup
```typescript
// src/lib/api.ts
async function lookupUser(username: string): Promise<DiscordUser | null>
```
- Fetches comprehensive user profile data
- Handles non-existent users and API errors
- Returns formatted user information

### Data Models

```typescript
interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  accentColor: number | null;
  createdAt: Date;
  badges: string[];
}

interface VanityUrlResponse {
  code: string;
  available: boolean;
  error?: string;
}
```

## Setup and Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/discord-test.git
cd discord-test
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Usage Guidelines

### Vanity URL Checker
1. Navigate to the Vanity URL page
2. Enter desired vanity URL
3. System will check availability and display status
4. Handle any error messages or validation requirements

### User Lookup
1. Access the User Lookup page
2. Enter Discord username
3. View comprehensive user profile information
4. Note any rate limiting or API restrictions

## Production Deployment

### API Integration
Replace the mock API calls in `src/lib/api.ts` with actual Discord API endpoints:

```typescript
// Current development implementation
export async function checkVanityUrl(code: string) {
  // Replace with actual Discord API call
  const response = await fetch(`${DISCORD_API_URL}/guilds/${GUILD_ID}/vanity-url`, {
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
  });
  return response.json();
}

// Current development implementation
export async function lookupUser(username: string) {
  // Replace with actual Discord API call
  const response = await fetch(`${DISCORD_API_URL}/users/${username}`, {
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
  });
  return response.json();
}
```

### Environment Variables
Create a `.env` file with required Discord API credentials:
```
VITE_DISCORD_API_URL=https://discord.com/api/v10
VITE_DISCORD_BOT_TOKEN=your_bot_token
VITE_GUILD_ID=your_guild_id
```

### Rate Limiting
Implement proper rate limiting according to Discord's API guidelines:
- Global rate limit: 50 requests per second
- User lookup: 120 requests per minute
- Vanity URL checks: 5 requests per 5 seconds

### Error Handling
Enhance error handling for production:
```typescript
interface ApiError {
  message: string;
  code: number;
}

function handleApiError(error: ApiError) {
  switch (error.code) {
    case 429: // Rate limit
      return 'Too many requests. Please try again later.';
    case 404:
      return 'Resource not found.';
    default:
      return 'An unexpected error occurred.';
  }
}
```

## Security Considerations

1. Never expose API tokens in client-side code
2. Implement proper CORS headers
3. Use rate limiting on both client and server
4. Sanitize user inputs
5. Implement proper error boundaries
6. Use HTTPS for all API calls