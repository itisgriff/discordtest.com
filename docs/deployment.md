# Deployment Guide for DiscordTest.com

This guide will walk you through deploying the application to discordtest.com using Cloudflare Pages for the frontend and Cloudflare Workers for the backend.

## Prerequisites

1. A Cloudflare account
2. A GitHub account with your project repository
3. Domain (discordtest.com) added to Cloudflare
4. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed (`npm install -g wrangler`)
5. Node.js version 18 or higher

## Step 1: Prepare Your Repository

1. Ensure your project is pushed to GitHub
2. Your repository should have the following structure:
   ```
   ├── src/           # Frontend code
   ├── server/        # Backend code
   ├── wrangler.toml  # Worker configuration
   └── package.json
   ```

## Step 2: Deploy Frontend to Cloudflare Pages

1. Log in to your Cloudflare dashboard
2. Navigate to "Pages"
3. Click "Create a project"
4. Choose "Connect to Git"
5. Select your GitHub repository
6. Configure your build settings:
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   ```
7. Add the following environment variables:
   ```
   NODE_VERSION: 18
   ```
8. Click "Save and Deploy"

## Step 3: Configure Custom Domain

1. In Cloudflare Pages, go to your project settings
2. Navigate to "Custom domains"
3. Add your domain: `discordtest.com`
4. Cloudflare will automatically configure DNS records

## Step 4: Deploy Backend to Cloudflare Workers

1. Login to Wrangler CLI:
   ```bash
   wrangler login
   ```

2. Configure KV namespace:
   ```bash
   # Create KV namespace for rate limiting
   wrangler kv:namespace create "RATE_LIMIT_STORE"
   ```
   - Copy the returned `id` and update it in `wrangler.toml`

3. Configure environment variables in Cloudflare:
   ```bash
   wrangler secret put DISCORD_CLIENT_ID
   wrangler secret put DISCORD_CLIENT_SECRET
   wrangler secret put DISCORD_BOT_TOKEN
   # Add any other required secrets
   ```

4. Deploy the worker:
   ```bash
   # Deploy to production
   npm run build:worker -- --env production
   ```

## Step 5: Connect Frontend to Backend

1. In your Cloudflare Pages settings, add these environment variables:
   ```
   VITE_API_URL: https://discordtest.com/api
   ```

2. Create a Worker Route in Cloudflare:
   - Go to Workers & Pages > Routes
   - Add a route: `discordtest.com/api/*` pointing to your worker

## Environment Variables

Ensure these variables are set in your Cloudflare dashboard:

```env
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_BOT_TOKEN=your_discord_bot_token
CORS_ORIGIN=https://discordtest.com
ENVIRONMENT=production  # For production deployment
```

### Frontend Environment Variables
Create a `.env.production` file in your project root:
```env
VITE_API_URL=https://discordtest.com/api
```

## Continuous Deployment

Your setup now supports:
- Automatic deployments when you push to main branch
- Preview deployments for pull requests
- Environment variable management through Cloudflare dashboard

## Monitoring and Logs

1. View Pages deployments:
   - Cloudflare Dashboard > Pages > Your Project > Deployments

2. View Worker logs:
   - Cloudflare Dashboard > Workers & Pages > Your Worker > Logs

## Troubleshooting

Common issues and solutions:

1. Build failures:
   - Check build logs in Pages dashboard
   - Verify Node version is correct
   - Ensure all dependencies are in package.json

2. API Connection Issues:
   - Verify Worker routes are correctly configured
   - Check CORS settings in backend code
   - Validate environment variables

3. Domain Issues:
   - Ensure DNS records are properly configured
   - Check SSL/TLS settings in Cloudflare

## Useful Commands

```bash
# Deploy worker manually
npm run build:worker

# Check worker status
wrangler whoami

# Tail worker logs
wrangler tail

# List environment variables
wrangler secret list
```

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/commands)
