import { memo } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
}

// Memoize the layout wrapper to prevent unnecessary re-renders
const LayoutWrapper = memo(function LayoutWrapper({ children }: PageLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start w-full">
        <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl w-full">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
});

// Export a non-memoized version for flexibility
export function PageLayout({ children }: PageLayoutProps) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}