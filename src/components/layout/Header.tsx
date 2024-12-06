import { memo } from 'react';
import { Command } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Memoized navigation link component
const NavLink = memo(function NavLink({ 
  to, 
  children 
}: { 
  to: string; 
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'transition-colors hover:text-accent',
        'text-foreground'
      )}
    >
      {children}
    </Link>
  );
});

// Memoized logo component
const Logo = memo(function Logo() {
  return (
    <Link to="/" className="flex items-center space-x-2" aria-label="Home">
      <Command className="h-6 w-6 text-accent" aria-hidden="true" />
      <span className="font-bold">DiscordTest</span>
    </Link>
  );
});

// Memoized navigation component
const Navigation = memo(function Navigation() {
  return (
    <nav className="flex items-center space-x-6 text-sm font-medium" role="navigation">
      <NavLink to="/vanity">Vanity URL</NavLink>
      <NavLink to="/lookup">User Lookup</NavLink>
    </nav>
  );
});

// Main header component
export const Header = memo(function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg" role="banner">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Logo />
          <Navigation />
        </div>
      </div>
    </header>
  );
});