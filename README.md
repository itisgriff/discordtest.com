# Discord Tools

A modern web application for Discord server management and vanity URL checking. Built with Cloudflare Workers and Pages.

## Features

### Vanity URL Checker
- Check availability of Discord vanity URLs in real-time
- View server information for taken vanity URLs
- Rate limiting to prevent API abuse
- Caching for improved performance

### User Lookup
- Look up Discord users by ID
- View user profiles, avatars, and badges
- Cached responses for faster lookups

## Tech Stack

### Frontend (Pages)
- React + TypeScript
- Vite for building
- TailwindCSS for styling
- React Query for data fetching
- Cloudflare Pages for hosting

### Backend (Workers)
- TypeScript
- Hono.js for routing and middleware
- Cloudflare Workers for serverless functions
- Cloudflare KV for rate limiting
- Cache API for response caching

## Architecture

The application is split into two main parts:

1. Frontend (`/src`)
   - Single Page Application (SPA)
   - Modern, responsive UI
   - Real-time validation and feedback
   - Error handling and loading states

2. Backend (`/server`)
   - RESTful API endpoints
   - Discord API integration
   - Rate limiting and caching
   - Error handling and validation

## API Endpoints

### Vanity URLs
- `POST /api/vanity/:code`
  - Check vanity URL availability
  - Returns server info if URL is taken

### User Lookup
- `GET /api/users/:id`
  - Look up Discord user by ID
  - Returns user profile information

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account
- Discord Bot Token

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/discord-tools.git
cd discord-tools
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

3. Set up environment variables:
```bash
# In /server/.dev.vars
DISCORD_BOT_TOKEN=your_token_here

# In /.env
VITE_API_URL=http://localhost:8787/api
```

4. Start development servers:
```bash
# Start backend (in /server)
npx wrangler dev

# Start frontend (in root)
npm run dev
```

## Deployment

See [Cloudflare Deployment Guide](docs/cloudflare-deployment.md) for detailed deployment instructions.

### Quick Deploy
1. Backend: `npx wrangler deploy --config server/wrangler.toml`
2. Frontend: Push to main branch (auto-deploys via Pages)

## Rate Limiting

- Development: In-memory rate limiting
- Production: Cloudflare KV-based rate limiting
- 5 requests per 5 seconds per IP
- Cached responses for 60 seconds

## Caching

- Discord API responses cached using Cloudflare's Cache API
- Cache TTL: 60 seconds
- Separate caches for vanity URLs and user lookups

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Cloudflare Workers](https://workers.cloudflare.com/)
- Powered by [Discord API](https://discord.com/developers/docs/)