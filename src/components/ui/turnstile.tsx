import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        execution?: 'render' | 'execute';
        'refresh-expired'?: 'auto' | 'manual';
      }) => string;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

export function Turnstile({ siteKey, onVerify }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const turnstile = window.turnstile;
    if (!turnstile) {
      console.error('Turnstile not loaded');
      return;
    }

    const widgetId = turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      execution: 'render',
      'refresh-expired': 'auto'
    });

    return () => {
      if (widgetId) {
        turnstile.remove(widgetId);
      }
    };
  }, [siteKey, onVerify]);

  return <div ref={containerRef} />;
} 