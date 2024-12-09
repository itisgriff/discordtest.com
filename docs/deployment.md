# Deployment Guide for DiscordTest.com

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Add your Discord Bot Token
   - Update any other variables if needed

3. Start the development servers:
   
   Terminal 1 (Frontend):
   ```bash
   npm run dev
   ```
   This will start the frontend at http://localhost:5173

   Terminal 2 (Backend):
   ```bash
   npm run dev:server
   ```
   This will start the backend at http://localhost:3000

4. Your development environment is now ready:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API endpoints will be available at http://localhost:3000/api/*

## Production Deployment

### Step 1: Deploy Frontend to Cloudflare Pages

1. Log in to your Cloudflare dashboard
2. Navigate to "Pages"
3. Click "Create a project"
4. Choose "Connect to Git"
5. Select your GitHub repository
6. Configure your build settings:
   ```
   Framework preset: Custom
   Build command: npm install typescript && npm run build
   Build output directory: dist
   Root directory: /
   Configuration file: wrangler.pages.toml
   ```
7. Add the following environment variables:
   ```
   NODE_VERSION: 20.9.0
   NPM_VERSION: 10.2.5
   ```
8. Click "Save and Deploy"

### Step 2: Deploy Backend to Cloudflare Workers

1. Login to Wrangler CLI:
   ```bash
   wrangler login
   ```

2. Configure environment variables in Cloudflare:
   ```bash
   wrangler secret put DISCORD_BOT_TOKEN
   ```

3. Deploy the worker:
   ```bash
   npm run build:worker
   ```

### Step 3: Configure Domain

1. In Cloudflare Pages, go to your project settings
2. Navigate to "Custom domains"
3. Add your domain: `discordtest.com`
4. Cloudflare will automatically configure DNS records

### Step 4: Configure Environment Variables

1. In your Cloudflare Pages settings, add:
   ```
   VITE_API_URL: https://discordtest.com/api
   ```

2. In your Worker settings (Workers & Pages > your-worker > Settings > Variables), add:
   ```
   DISCORD_BOT_TOKEN: your-bot-token
   ENVIRONMENT: production
   ```

## Configuration Files

The project uses two configuration files for deployment:

1. `wrangler.pages.toml` - Frontend Pages configuration
2. `wrangler.toml` - Backend Workers configuration

This separation ensures proper deployment of both frontend and backend components.
