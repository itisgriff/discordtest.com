# System Patterns

## Architecture
- Frontend: Existing implementation (not to be modified)
- Backend: Cloudflare Pages Functions with Hono
- External API: Discord API v10

## Key Technical Decisions
- Use of Hono for API routing and handling
- Zod for request/response validation
- Cloudflare Pages Functions for serverless backend

## Component Relationships
- Frontend ↔ Cloudflare Functions
- Cloudflare Functions ↔ Discord API
- Two main endpoints:
  1. Vanity URL checker
  2. User lookup

## Design Patterns
- API Gateway pattern for Discord API communication
- URL parameter routing for direct links 