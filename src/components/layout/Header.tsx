import { Command } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <Command className="h-6 w-6 text-accent" />
            <span className="font-bold">DiscordTest</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/vanity"
              className={cn(
                'transition-colors hover:text-accent',
                'text-foreground'
              )}
            >
              Vanity URL
            </Link>
            <Link
              to="/lookup"
              className={cn(
                'transition-colors hover:text-accent',
                'text-foreground'
              )}
            >
              User Lookup
            </Link>
            <Link
              to="/stats"
              className={cn(
                'transition-colors hover:text-accent',
                'text-foreground'
              )}
            >
              Stats
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}