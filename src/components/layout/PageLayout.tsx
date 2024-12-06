import { Header } from './Header';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <main className="container py-6 md:py-10">{children}</main>
    </div>
  );
}