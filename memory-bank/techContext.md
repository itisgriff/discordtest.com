# Technical Context

## Technologies Used
- Cloudflare Pages (Hosting/Deployment)
- Hono (Backend Framework)
- Zod (Schema Validation)
- Discord API v10

## Development Setup
- Cloudflare Pages Functions for backend API
- Existing frontend (not to be modified)
- Discord Bot Token required for API requests

## Technical Constraints
- Must use Cloudflare Pages Functions
- Must maintain existing frontend integration
- Required Discord API headers:
  - Authorization: Bot {Discord Bot Token}
  - Content-Type: application/json

## Dependencies
To be determined based on package.json 