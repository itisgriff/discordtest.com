import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-center"
      toastOptions={{
        duration: 3000,
        className: 'notification-toast border border-border bg-background text-foreground',
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        }
      }}
    />
  );
}

// Re-export sonner's toast function
export { toast } from 'sonner';
