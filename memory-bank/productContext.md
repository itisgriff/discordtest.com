# Product Context

## Purpose
Provide a tool for checking Discord vanity URLs and looking up Discord user information through a modern web interface

## Problem Space
- Need to check availability of Discord vanity URLs
- Need to lookup Discord user information
- Requirement for direct deep links to checks
- Need proper separation between frontend and API routes

## User Experience Goals
- Quick vanity URL availability checking
- Easy Discord user information lookup
- Support for direct links to specific checks
- Seamless integration between frontend and backend

## Expected Behavior
- API endpoints should handle requests independently of frontend routes
- Vanity URL checks: /api/vanity/{code}
- User lookups: /api/users/{userId}
- Frontend routes should not interfere with API functionality 