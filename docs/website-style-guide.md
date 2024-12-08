# Website Style Guide: Discord to Twitch Adaptation

## AI Assistant Guide

This document serves as a comprehensive guide for AI assistants helping to develop a Twitch-focused website based on an existing Discord tools platform. Here's what you need to know:

### Project Overview
- **Original Purpose**: A Discord utility website providing vanity URL checking and user lookup tools
- **New Goal**: Transform the platform into a Twitch streaming utility website while maintaining the same design system and code quality
- **Target Audience**: Twitch streamers, moderators, and community managers

### Development Approach
1. **Code Structure**:
   - Frontend: React + TypeScript + Vite application with component-based architecture
   - Backend: Express.js REST API with security middleware and rate limiting
   - Styling: Tailwind CSS with custom animations and dark theme optimization

2. **Key Considerations**:
   - Maintain the existing responsive and accessible design system
   - Replace Discord-specific features with Twitch equivalents
   - Add real-time functionality for stream data
   - Implement Twitch's authentication and API requirements
   - Keep the same high standards for security and performance

3. **Priority Areas**:
   - User authentication with Twitch OAuth
   - Stream status monitoring and management
   - Chat integration and moderation tools
   - Analytics and viewer tracking
   - Clip management and creation

4. **Development Guidelines**:
   - Follow TypeScript best practices for type safety
   - Maintain component reusability and separation of concerns
   - Implement proper error handling and loading states
   - Ensure all new features follow the existing design system
   - Add comprehensive documentation for new components

### How to Use This Guide
- Use the style specifications for consistent UI development
- Reference the technical architecture for system integration
- Follow the component patterns for new feature development
- Adapt the security measures for Twitch's requirements
- Utilize the responsive design patterns for new layouts

## Core Layout Structure

### Page Layout
- Responsive layout with sticky header and footer
- Main content area with max-width constraints
- Dark theme optimized for readability
- Consistent padding and spacing throughout

### Header
- Sticky positioning with blur effect backdrop
- Logo + site name on left
- Main navigation links on right
- Subtle border bottom for separation
- Height: 56px (h-14)

### Footer
- Centered content with max-width
- Copyright information
- Disclaimer text
- Subtle border top for separation

## Color Scheme

### Base Colors
```css
--background: 222 47% 11%;     /* Dark background */
--foreground: 0 0% 95%;        /* Light text */
--card: 217 33% 17%;          /* Slightly lighter than background */
--accent: 226 58% 65%;        /* Primary accent color */
--muted-foreground: 215 20% 65%; /* Secondary text */
--border: 217 33% 17%;        /* Subtle borders */
```

### Semantic Colors
- Primary: Dark background for main surfaces
- Secondary: Slightly lighter for cards and elevated elements
- Accent: Bright highlight color for CTAs and important elements
- Destructive: Red tones for errors/warnings
- Muted: Subdued text and elements

## Typography

### Font Hierarchy
- Headings: Bold weight, gradient text effects for emphasis
- Body: Regular weight, high contrast for readability
- Muted text: Lower contrast for secondary information

### Text Sizes
- Hero/H1: text-5xl (3rem)
- Section Headers: text-4xl (2.25rem)
- Card Headers: text-2xl (1.5rem)
- Body: text-sm (0.875rem)
- Small/Meta: text-xs (0.75rem)

## Components

### Cards
- Rounded corners (rounded-xl)
- Subtle border
- Slight shadow for elevation
- Padding: 1.5rem (p-6)
- Hover effects with scale transform

### Buttons
- Multiple variants (default, outline, ghost, link)
- Loading states with spinner
- Consistent height (h-9)
- Rounded corners (rounded-md)
- Clear hover states

### Inputs
- Consistent height with buttons
- Clear focus states
- Support for error states
- Optional icon support
- Placeholder styling

### Badges
- Compact (px-2.5 py-0.5)
- Multiple variants for different states
- Used for tags and status indicators

## Animations

### Transitions
```css
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

.animate-success {
  animation: success 0.5s ease-out;
}
```

### Interactive Elements
- Scale transforms on hover
- Opacity changes for disabled states
- Smooth color transitions

## Layout Patterns

### Container Widths
- Main container: max-w-7xl
- Content sections: max-w-4xl
- Form sections: max-w-2xl

### Grid System
- Responsive grid for feature cards
- Single column on mobile
- Two columns on tablet and up
- Consistent gap spacing

### Spacing
- Consistent use of spacing scale
- Vertical rhythm maintained through margin/padding
- Gap utility for flex/grid children

## Responsive Design

### Breakpoints
- Mobile: Default
- Tablet: md (768px)
- Desktop: lg (1024px)
- Wide: xl (1280px)

### Mobile Considerations
- Stack layouts vertically
- Adjust text sizes
- Maintain touch-friendly tap targets
- Preserve readability

## Twitch Adaptation Notes

### Color Adjustments
- Consider using Twitch purple (#9146FF) as primary accent
- Maintain dark theme for streaming context
- Use Twitch's success green for live indicators

### Feature Adaptations
- Replace Discord-specific features with Twitch equivalents
- Stream status instead of server status
- Follower/subscriber counts instead of member counts
- Emote and badge displays instead of server features

### New Components Needed
- Live indicator badges
- Stream preview cards
- Viewer count displays
- Chat integration elements
- Subscription tier badges

### Additional Considerations
- Integration with Twitch API
- Stream latency indicators
- Chat moderation tools
- Stream quality selectors
- Clip creation interface

## Best Practices

1. Maintain consistent spacing and alignment
2. Use semantic HTML elements
3. Ensure high contrast for readability
4. Implement proper loading states
5. Provide clear feedback for user actions
6. Keep animations subtle and purposeful
7. Maintain responsive behavior across devices
8. Use proper ARIA labels for accessibility

## Implementation Tips

1. Use Tailwind CSS for consistent styling
2. Leverage CSS variables for theming
3. Component composition for reusability
4. Proper error handling and loading states
5. Progressive enhancement approach
6. Mobile-first responsive design
7. Optimize for performance
8. Maintain accessibility standards

## Technical Architecture

### Frontend Stack
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Custom components with Radix UI primitives
- **Toast Notifications**: Sonner
- **Icons**: Lucide React

### Key Frontend Dependencies
```json
{
  "@radix-ui/react-toast": "^1.2.2",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "date-fns": "^4.1.0",
  "lucide-react": "^0.468.0",
  "react": "^19.0.0",
  "react-router-dom": "^7.0.2",
  "sonner": "^1.7.0",
  "tailwind-merge": "^2.5.5",
  "tailwindcss-animate": "^1.0.7"
}
```

### Backend Stack
- **Runtime**: Node.js with Express
- **API Style**: RESTful
- **Security**: Helmet middleware
- **CORS**: Configured for production and development
- **Rate Limiting**: Express Rate Limit
- **HTTP Client**: Node Fetch

### Key Backend Dependencies
```json
{
  "express": "^4.18.2",
  "express-rate-limit": "^7.1.5",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "node-fetch": "^3.3.2",
  "helmet": "^7.1.0"
}
```

### API Endpoints

#### User Lookup
```
POST /api/users/:userId
- Rate limited to 10 requests/minute
- Validates user ID format
- Returns Discord user data
```

#### Vanity URL Check
```
POST /api/vanity/:code
- Rate limited to 10 requests/minute
- Validates vanity URL format
- Returns availability and guild info
```

### Security Features
1. Helmet.js for HTTP headers
2. CORS configuration
3. Rate limiting (30 req/min general, 10 req/min for API)
4. JSON body parsing
5. Error handling middleware
6. Trust proxy settings for production

### Environment Configuration
Required environment variables:
```
DISCORD_BOT_TOKEN=your_bot_token
NODE_ENV=development|production
PORT=3000 (default)
```

### Development Setup
1. Frontend Development:
   ```bash
   npm run dev        # Start Vite dev server
   npm run build     # Build for production
   npm run preview   # Preview production build
   npm run lint      # Run ESLint
   ```

2. Backend Development:
   ```bash
   cd server
   npm install
   node index.js    # Start Express server
   ```

### Production Considerations
1. CORS origin restriction to production domain
2. Rate limiting configuration
3. Error message sanitization
4. Graceful shutdown handling
5. Health check endpoints
6. Proxy trust configuration

### Twitch Adaptation Requirements

#### Backend Changes Needed
1. Replace Discord API calls with Twitch API endpoints
2. Update rate limiting for Twitch API requirements
3. Add WebSocket support for live updates
4. Implement Twitch OAuth flow
5. Add endpoints for:
   - Stream status
   - Channel information
   - Chat integration
   - Clip management

#### Frontend Changes Needed
1. Update API client for Twitch endpoints
2. Add real-time updates via WebSocket
3. Implement Twitch embed components
4. Add chat overlay components
5. Create stream management interface
``` 