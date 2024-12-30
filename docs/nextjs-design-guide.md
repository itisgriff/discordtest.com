# Next.js Design System Guide

This guide outlines the design system for reimplementing the website using Next.js, maintaining visual consistency while leveraging Next.js features.

## Color Palette

### Base Colors
- Background: `hsl(222, 47%, 11%)` - Dark navy blue
- Foreground: `hsl(0, 0%, 95%)` - Almost white text
- Accent: `hsl(226, 58%, 65%)` - Bright blue highlight color

### Component Colors
- Card Background: `hsl(217, 33%, 17%)` - Slightly lighter navy
- Muted Text: `hsl(215, 20%, 65%)` - Subdued gray text
- Border: `hsl(217, 33%, 17%)` - Subtle separation
- Destructive: `hsl(0, 84.2%, 60.2%)` - Error/warning red

## Typography

Maintain the existing typography system using Tailwind's default font stack with system fonts. Consider adding:
```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

## Components to Implement

1. Layout Components:
   - Responsive navigation bar
   - Footer with social links
   - Main content container with max-width of 1400px

2. UI Components:
   - Button variants (primary, secondary, destructive)
   - Card components with hover effects
   - Form inputs with consistent styling
   - Modal/Dialog components

## Animations

Implement the following animations using Framer Motion or CSS:

1. Page Transitions:
   ```css
   .fadeIn {
     animation: fadeIn 0.3s ease-out;
   }
   ```

2. Component Animations:
   - Slide-in effect: Transform Y(10px) to Y(0)
   - Success animation: Scale 0.8 -> 1.1 -> 1
   - Hover transitions: 0.2s ease-out

## Responsive Design

Breakpoints to maintain:
- Mobile: Default
- Tablet: 768px
- Desktop: 1024px
- Large Desktop: 1400px

## Next.js Specific Implementations

1. Use Next.js App Router for improved performance
2. Implement layout.tsx for consistent page layouts
3. Use Next.js Image component for optimized images
4. Leverage Server Components where possible
5. Implement dynamic routes for content pages

## Styling Implementation

1. Continue using Tailwind CSS with the following setup:
   ```js
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     darkMode: ['class'],
     content: [
       './app/**/*.{ts,tsx}',
       './components/**/*.{ts,tsx}',
       './pages/**/*.{ts,tsx}'
     ],
     theme: {
       extend: {
         colors: {
           background: 'hsl(222 47% 11%)',
           foreground: 'hsl(0 0% 95%)',
           accent: 'hsl(226 58% 65%)',
           card: 'hsl(217 33% 17%)',
           muted: 'hsl(215 20% 65%)'
         }
       }
     }
   }
   ```

2. Use CSS Modules or styled-components for component-specific styles

## Best Practices

1. Maintain component modularity
2. Use CSS variables for theme values
3. Implement responsive design using mobile-first approach
4. Ensure accessibility with ARIA labels and semantic HTML
5. Optimize performance with Next.js features

## Migration Notes

When converting from React + Hono to Next.js:
1. Move API routes to Next.js API routes or server components
2. Utilize Next.js built-in features instead of custom solutions
3. Maintain the same visual hierarchy and component structure
4. Take advantage of Next.js Image and Font optimization

## Development Tools

Recommended setup:
1. Next.js 14 or later
2. TypeScript
3. Tailwind CSS
4. ESLint with Next.js config
5. Prettier for consistent formatting 