import { useEffect, useRef } from 'react';

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement | string, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function Turnstile({ siteKey, onVerify }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>('');

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.turnstile) return;

    // Wait for turnstile to be fully loaded
    const renderWidget = () => {
      if (widgetId.current) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch (e) {
          console.log('No previous widget to remove');
        }
      }

      widgetId.current = window.turnstile.render(container, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token);
        },
        appearance: 'always',
        'refresh-expired': 'auto',
        action: 'discord_lookup',
        execution: 'render-when-needed'
      });
    };

    if (document.readyState === 'complete') {
      renderWidget();
    } else {
      window.addEventListener('load', renderWidget);
    }

    return () => {
      if (widgetId.current) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch (e) {
          console.log('Cleanup: No widget to remove');
        }
      }
      window.removeEventListener('load', renderWidget);
    };
  }, [siteKey, onVerify]);

  return <div ref={containerRef} className="mt-4" />;
} 