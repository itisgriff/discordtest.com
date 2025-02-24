import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-center"
      toastOptions={{
        duration: 5000,
        className: 'notification-toast border border-border bg-card text-foreground shadow-lg backdrop-blur-none text-center',
        style: {
          background: 'hsl(var(--card) / 1)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          padding: '1rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
          backdropFilter: 'none',
          opacity: '1',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }}
    />
  );
}

// Re-export sonner's toast function
export { toast } from 'sonner';
