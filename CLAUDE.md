# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server (frontend on :5173, Cloudflare Worker on :8788)
- `pnpm build` - Build for production
- `pnpm preview` - Build and preview production build locally
- `pnpm deploy` - Build and deploy to Cloudflare
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run ESLint

### Package Management
- Uses `pnpm` as the package manager
- Lock file: `pnpm-lock.yaml`

## Architecture Overview

This is a modern full-stack Discord utility application with the following architecture:

### Frontend (React 19 + Vite)
- **Framework**: React 19 with concurrent features
- **Build Tool**: Vite 6 for fast development and building
- **Routing**: React Router 7 for client-side routing
- **Styling**: TailwindCSS 4 with custom design system
- **UI Components**: Radix UI primitives for accessibility
- **Type Safety**: Full TypeScript coverage with Zod validation

### Backend (Cloudflare Worker + Hono)
- **Runtime**: Cloudflare Workers (V8 isolates)
- **Framework**: Hono for lightweight API handling
- **Location**: `src/worker.ts` - handles all API routes
- **Rate Limiting**: Cloudflare rate limiting bindings for production
- **Environment Variables**: `DISCORD_BOT_TOKEN` required for Discord API access

### Key Application Features
1. **Vanity URL Checker**: Check Discord vanity URL availability (`/api/vanity/:code`)
2. **User Lookup**: Fetch Discord user information (`/api/users/:userId`)
3. **Rate Limiting**: Multiple rate limiters for different endpoints
4. **SPA Routing**: Static assets served with fallback to index.html

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (shadcn/ui style)
│   └── layout/       # Layout components (Header, Footer, etc.)
├── lib/
│   ├── api/          # API client functions
│   └── utils/        # Utility functions
├── pages/            # Route components
├── types/            # TypeScript type definitions
├── worker.ts         # Cloudflare Worker (backend)
├── App.tsx           # Main application component
└── main.tsx          # Application entry point

shared/
├── config/           # Environment configuration
└── types/            # Shared type definitions
```

## Environment & Configuration

### Development Environment
- Create `.env` file with `VITE_API_URL=http://localhost:8788/api`
- Discord Bot Token configured in Cloudflare dashboard (not in code)
- Uses Cloudflare Workers for backend API

### Deployment
- **Platform**: Cloudflare Pages + Workers
- **Build Command**: `pnpm build`
- **Build Output**: `dist/`
- **Configuration**: `wrangler.toml` for Cloudflare Workers settings

## Important Implementation Details

### Rate Limiting
- Uses Cloudflare rate limiting bindings in production
- Three separate rate limiters: `USER_LOOKUP_RATE_LIMITER`, `VANITY_CHECK_RATE_LIMITER`, `GENERAL_API_RATE_LIMITER`
- Client identification via `CF-Connecting-IP` or fallback to User-Agent + CF-Ray

### Discord API Integration
- All Discord API calls in `src/worker.ts`
- Uses Discord Bot Token for authentication
- Endpoints: `/invites/:code` for vanity checks, `/users/:userId` for user lookup
- Error handling for 404 (available) vs 200 (taken) for vanity URLs

### Type Safety
- Zod schemas for API validation (`VanityURLSchema`, `UserIDSchema`)
- Shared types in `shared/types/discord.ts` and `src/types/discord.ts`
- Full TypeScript coverage with strict configuration

### UI Components
- Built with Radix UI primitives for accessibility
- Custom design system using class-variance-authority
- TailwindCSS 4 with custom configuration
- Components follow shadcn/ui patterns

## Development Notes

- Frontend and backend run together with `pnpm dev`
- API routes are proxied through Vite dev server
- Worker handles both API routes and static asset serving
- SPA routing handled by serving index.html for non-API routes
- All API routes prefixed with `/api/`