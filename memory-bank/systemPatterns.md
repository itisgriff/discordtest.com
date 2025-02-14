# System Patterns

## Architecture
- Frontend: React SPA with optimized state management
- Backend: Cloudflare Pages Functions with Hono
- External API: Discord API v10

## Key Technical Decisions
- Use of Hono for API routing and handling
- Zod for request/response validation
- Cloudflare Pages Functions for serverless backend
- Immediate data fetching with URL synchronization

## Component Relationships
- Frontend ↔ Cloudflare Functions
- Cloudflare Functions ↔ Discord API
- URL State ↔ Component State
- Two main endpoints:
  1. Vanity URL checker
  2. User lookup

## Design Patterns
- API Gateway pattern for Discord API communication
- URL parameter routing for direct links
- Optimized URL-driven state management:
  - Immediate data fetching on user action
  - URL updates alongside API calls
  - useEffect for external URL changes
  - Single source of truth maintained
- Component Patterns:
  - Consistent input handling
  - Unified loading states
  - Error boundary protection
  - Responsive UI updates 