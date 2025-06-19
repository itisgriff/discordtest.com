# Discord Tools

A modern, fast Discord management toolkit built with React 19 and Cloudflare Workers. Streamline your Discord server administration with powerful utilities for vanity URL checking and user lookups.

## 🚀 Features

### Vanity URL Checker
- Real-time availability checking for Discord vanity URLs
- Instant server information preview for taken URLs
- Smart caching for optimal performance

### User Lookup Tool
- Quick Discord user verification by ID
- Comprehensive profile data including badges and avatars
- Efficient caching for faster subsequent lookups

## 🛠️ Tech Stack

**Frontend**
- **React 19** - Latest React with modern concurrent features
- **TypeScript** - Type-safe development
- **Vite 6** - Lightning-fast build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **React Router 7** - Modern client-side routing
- **Radix UI** - Accessible, unstyled UI primitives
- **Lucide React** - Beautiful SVG icons
- **Zod** - TypeScript-first schema validation

**Backend & Deployment**
- **Cloudflare Workers** - Serverless edge computing
- **Hono** - Fast, lightweight web framework
- **Cloudflare Pages** - Static site hosting with edge optimization
- **Cloudflare KV** - Edge key-value storage for caching

**Developer Experience**
- **ESLint** - Code linting with modern rules
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing and optimization
- **Wrangler** - Cloudflare development and deployment CLI

## 🏗️ Architecture

This is a modern full-stack application deployed on Cloudflare's edge network:

- **Frontend**: React SPA with server-side routing support
- **Backend**: Cloudflare Worker handling API requests and Discord integration
- **Edge Deployment**: Global CDN distribution for optimal performance
- **Type Safety**: End-to-end TypeScript for reliable development

## 📡 API Integration

The application integrates with Discord's API to provide:
- Vanity URL availability checking
- User profile and badge information
- Server metadata retrieval
- Rate limiting and caching for optimal API usage

## 🚦 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **pnpm** (recommended) or npm
- **Cloudflare Account** (for deployment)
- **Discord Bot Token** (for API access)

### Development Setup

1. **Clone and install**:
```bash
git clone <repository-url>
cd discord-tools
pnpm install
```

2. **Environment setup**:
Create `.env` in the root directory:
```bash
VITE_API_URL=http://localhost:8788/api
```

3. **Start development server**:
```bash
pnpm dev
```

This starts both the frontend (localhost:5173) and Cloudflare Worker (localhost:8788).

### Available Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm preview    # Preview production build locally
pnpm deploy     # Deploy to Cloudflare
pnpm typecheck  # Type checking
pnpm lint       # Code linting
```

## 🚀 Deployment

### Cloudflare Pages + Workers

1. **Connect your repository** to Cloudflare Pages
2. **Set build settings**:
   - Build command: `pnpm build`
   - Build output directory: `dist`
3. **Configure environment variables** in Cloudflare dashboard
4. **Deploy**: Push to main branch for automatic deployment

### Manual Deployment
```bash
pnpm build && pnpm deploy
```

## 🔧 Configuration

### Environment Variables
- `DISCORD_BOT_TOKEN` - Your Discord bot token (set in Cloudflare dashboard)
- `VITE_API_URL` - API endpoint URL (development only)

### Rate Limiting
- **Development**: In-memory rate limiting
- **Production**: Cloudflare KV-based rate limiting
- **Limits**: 5 requests per 5 seconds per IP

## 🎨 UI Components

Built with modern, accessible components:
- **Radix UI** primitives for accessibility
- **Custom design system** with consistent styling
- **Responsive design** for all device sizes
- **Dark/light mode** support built-in

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ using modern web technologies