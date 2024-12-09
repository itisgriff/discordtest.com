# Cloudflare Deployment Guide

## Backend (Workers)

### Initial Setup

1. Install Wrangler CLI globally:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
npx wrangler login
```

3. Set up environment secrets:
```bash
npx wrangler secret put DISCORD_BOT_TOKEN
```

### Local Development

1. Start the development server:
```bash
# From project root
npx wrangler dev --config server/wrangler.toml
```

This will:
- Start a local server (usually on port 8787)
- Enable live reloading
- Give you access to dev tools and logging
- Use the `.dev.vars` file for environment variables

2. Test environment variables locally by creating a `.dev.vars` file in the server directory:
```env
DISCORD_BOT_TOKEN=your_token_here
```

### Worker Deployment

1. Deploy to production:
```bash
npx wrangler deploy --config server/wrangler.toml
```

2. View deployment logs:
```bash
npx wrangler tail discord-tools-api
```

3. Disable preview URLs in dashboard:
   - Go to Workers & Pages > discord-tools-api > Settings
   - Under "Domains & Routes", find the `workers.dev` entry
   - Click "Disable" next to both the workers.dev domain and Preview URLs
   - This ensures access only through your custom domain

## Frontend (Pages)

### Initial Setup

1. Create a new project in Cloudflare Pages dashboard:
   - Go to Workers & Pages > Create application > Pages
   - Connect your GitHub repository
   - Select the repository and branch

2. Configure build settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (or your frontend directory)

3. Set up environment variables (if needed):
   - Go to project settings > Environment variables
   - Add variables for different environments (production/preview)

### Local Development

1. Run the development server:
```bash
npm run dev
```

2. Build for production:
```bash
npm run build
```

3. Preview production build:
```bash
npm run preview
```

### Pages Deployment

Pages automatically deploys when you push to your configured branch. However, you can also:

1. Trigger manual deployment:
   - Go to your Pages project
   - Click "Create new deployment"
   - Select branch and options

2. Deploy from CLI:
```bash
npx wrangler pages deploy dist
```

### Custom Domain Setup

1. Add custom domain in Pages:
   - Go to project > Custom domains
   - Click "Set up custom domain"
   - Enter your domain (e.g., discordtest.com)
   - Follow DNS configuration steps

2. Configure DNS:
   - Add CNAME record pointing to your Pages domain
   - Wait for DNS propagation (usually 5-10 minutes)

## Configuration

### Worker Configuration
- Run on custom domain: `discordtest.com/api/*`
- Disable `.workers.dev` URL in production
- Enable `.workers.dev` URL in development
- Use Cloudflare's Cache API for caching
- Use KV storage for rate limiting in production

### Pages Configuration
- Automatic builds on push
- Preview deployments for pull requests
- Asset optimization and caching
- Automatic HTTPS
- Global CDN distribution

## Troubleshooting

### Worker Issues
1. If you get rate limit errors:
   - Check the Discord bot token is set correctly
   - Verify rate limit settings in the code

2. If routes aren't working:
   - Verify custom domain is set up in Cloudflare
   - Check the route patterns in `wrangler.toml`
   - Ensure DNS records are properly configured

3. For local development issues:
   - Make sure `.dev.vars` file exists with required variables
   - Check if ports are available (default: 8787)
   - Run `wrangler dev` with `--verbose` flag for more details

### Pages Issues
1. Build failures:
   - Check build logs in Pages dashboard
   - Verify build command and output directory
   - Ensure all dependencies are installed

2. Preview deployments not working:
   - Check branch settings
   - Verify GitHub permissions
   - Review build settings

3. Custom domain issues:
   - Verify DNS records are correct
   - Check SSL/TLS settings
   - Wait for DNS propagation

## Example Configurations

### Worker Configuration (server/wrangler.toml)
```toml
# Basic worker configuration
name = "discord-tools-api"        # Name of your worker
main = "index.ts"                 # Entry point file
compatibility_date = "2024-01-01" # Compatibility version

# Node.js compatibility for npm packages
compatibility_flags = ["nodejs_compat"]

# Disable preview URL in production
workers_dev = false               # Disable *.workers.dev URL

# Custom domain configuration
routes = [
  { pattern = "example.com/api/*", zone_name = "example.com" }  # Route pattern and domain
]

# Production environment
[env.production]
vars = { ENVIRONMENT = "production" }  # Environment variables

# Development environment
[env.development]
vars = { ENVIRONMENT = "development" }
workers_dev = true                     # Enable preview URL in development

# Logging configuration
[observability.logs]
enabled = true                    # Enable worker logs
```

### Pages Configuration (wrangler.toml)
```toml
# Basic Pages configuration
name = "my-frontend"
compatibility_date = "2024-01-01"

# Build configuration
[build]
command = "npm run build"         # Build command
output_directory = "dist"         # Output directory
root_directory = "/"              # Root directory

# Environment variables
[env.production]
VITE_API_URL = "https://example.com/api"

[env.preview]
VITE_API_URL = "https://preview.example.com/api"
```

## Project Structure Example
```
my-project/
├── README.md
├── package.json
├── docs/
│   └── cloudflare-deployment.md
│
├── server/                       # Worker (Backend)
│   ├── wrangler.toml            # Worker configuration
│   ├── package.json
│   ├── index.ts                 # Worker entry point
│   ├── .dev.vars                # Local environment variables
│   ├── config/
│   │   └── environment.ts
│   ├── controllers/
│   │   └── users.ts
│   ├── services/
│   │   └── discord.ts
│   └── utils/
│       └── helpers.ts
│
└── src/                         # Pages (Frontend)
    ├── wrangler.toml            # Pages configuration
    ├── package.json
    ├── index.html
    ├── vite.config.ts
    ├── .env                     # Frontend environment variables
    ├── components/
    │   └── App.tsx
    ├── pages/
    │   └── Home.tsx
    └── utils/
        └── api.ts
```

## Environment Variables

### Worker (.dev.vars)
```bash
# Development environment variables for Worker
DISCORD_BOT_TOKEN=your_token_here
ENVIRONMENT=development
```

### Frontend (.env)
```bash
# Frontend environment variables
VITE_API_URL=http://localhost:8787/api
VITE_APP_ENV=development
```

This structure separates the frontend and backend while keeping them in the same repository, making it easier to:
1. Deploy independently
2. Maintain separate dependencies
3. Use different environment variables
4. Have separate development workflows
5. Share types and utilities when needed