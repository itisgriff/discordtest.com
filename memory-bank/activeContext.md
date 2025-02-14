# Active Context

## Current Focus
Migration from Cloudflare Workers to Cloudflare Pages with Functions

## Security Alert
⚠️ IMPORTANT: The Discord bot token was previously exposed in wrangler.toml. This token should be invalidated and replaced with a new one. Never commit tokens to version control.

## Current Progress
1. Initial setup completed:
   - Created `functions` directory for Pages Functions
   - Added health check endpoint
   - Updated wrangler.toml for Pages configuration:
     - Set compatibility_date to "2025-02-14"
     - Configured build and site settings
     - Set functions directory
     - Removed exposed environment variables
   - Simplified npm scripts

2. Core implementation completed:
   - Created shared types and utilities
   - Implemented Discord service with proper env handling
   - Created response utilities with CORS support
   - Implemented all endpoints with env support:
     - Health check endpoint (✓)
     - Vanity URL checker endpoint (✓)
     - User lookup endpoint (✓)

3. Frontend updates completed:
   - Simplified API configuration
   - Removed environment-specific logic
   - Updated vanity URL client
   - Updated user lookup client
   - Centralized Discord CDN URL handling

4. Development setup simplified:
   - Single development command: `pnpm dlx wrangler pages dev`
   - Proper environment variable handling in Functions
   - Simplified .env to only require DISCORD_BOT_TOKEN
   - Removed unnecessary scripts and configurations

## Environment Variable Handling
1. Development:
   - Create .env file (not committed to git):
     ```
     DISCORD_BOT_TOKEN=your_discord_bot_token_here
     ```
   - Run with `pnpm dlx wrangler pages dev`

2. Production:
   - Set environment variables in Cloudflare Pages dashboard:
     1. Go to Pages project settings
     2. Navigate to Environment variables
     3. Add DISCORD_BOT_TOKEN as a production variable
     4. Keep token secret and secure

3. ⚠️ Security Best Practices:
   - Never commit tokens to wrangler.toml or any version control
   - Use .env for local development
   - Use Cloudflare Pages dashboard for production
   - Rotate tokens if they've been exposed
   - Add sensitive files to .gitignore

## Development Instructions
1. Create .env file (do not commit to git):
   ```
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   ```
2. Run `pnpm install` to install dependencies
3. Run `pnpm dlx wrangler pages dev` to start development server
4. Access the application at http://localhost:8788

## Configuration Files
1. wrangler.toml:
   ```toml
   # Pages configuration
   name = "discord-tools"
   compatibility_date = "2025-02-14"

   [build]
   command = "pnpm run build"

   [site]
   bucket = "./dist"

   [functions]
   directory = "functions"
   ```

2. package.json scripts:
   ```json
   {
     "scripts": {
       "dev": "wrangler pages dev --proxy 5173 -- pnpm vite",
       "build": "pnpm typecheck && vite build",
       "typecheck": "pnpm exec tsc -p tsconfig.json --noEmit && pnpm exec tsc -p tsconfig.node.json --noEmit",
       "lint": "eslint .",
       "preview": "vite preview",
       "deploy": "pnpm build && wrangler pages deploy dist"
     }
   }
   ```

## Next Steps
1. Test all endpoints with environment variables:
   - Health check
   - Vanity URL checker
   - User lookup
2. Set up environment variables in Cloudflare Pages
3. Deploy and validate

## Active Decisions
- Using TypeScript for Functions
- Maintaining same API structure as Workers
- Progressive migration approach
- Removed rate limiting requirement for initial migration
- Focus on core functionality first, can add rate limiting later if needed
- Using Zod for request validation
- Consistent error handling across endpoints
- Simplified development setup
- Single command for development
- Latest Cloudflare compatibility features (2025-02-14)
- Proper environment variable handling through context

## Open Questions
- How to handle caching most effectively in the new setup?
- Are there any Worker-specific features that need alternative solutions?

## Current Challenges
- Ensuring zero downtime during migration
- Maintaining performance parity with Workers
- Implementing equivalent caching mechanisms

## Required Environment Variables
- DISCORD_BOT_TOKEN: Discord bot token for API authentication
  - Development: Set in .env file (do not commit)
  - Production: Set in Cloudflare Pages dashboard
  - Current token needs to be rotated due to exposure
  - Accessed in Functions via `env.DISCORD_BOT_TOKEN`

## Immediate Actions Needed
1. Invalidate and replace the exposed Discord bot token
2. Remove token from wrangler.toml (✓)
3. Set up new token in Cloudflare Pages dashboard
4. Update local .env with new token
5. Verify functionality with new token 