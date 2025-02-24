import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';

interface ErrorDisplayProps {
  error: string;
  retryAfter?: number;
  onRetry: () => void;
}

export function ErrorDisplay({ error, retryAfter, onRetry }: ErrorDisplayProps) {
  const [countdown, setCountdown] = useState<number>(retryAfter || 0);
  
  useEffect(() => {
    if (!retryAfter || retryAfter <= 0) return;
    
    setCountdown(retryAfter);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [retryAfter]);

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="bg-red-100 dark:bg-red-800 rounded-full p-2">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-red-800 dark:text-red-400">
            Error Checking Vanity URL
          </h3>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{error}</p>
          
          {countdown > 0 ? (
            <Button 
              variant="outline" 
              className="mt-4 text-red-600 border-red-200 dark:border-red-800"
              disabled={true}
            >
              Retry in {countdown}s
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="mt-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={onRetry}
            >
              Try Again
            </Button>
          )}
          
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>If this problem persists, try:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Checking your internet connection</li>
              <li>Refreshing the page</li>
              <li>Trying again later</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 