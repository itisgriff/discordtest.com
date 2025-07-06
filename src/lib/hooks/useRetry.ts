import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoff: number;
}

export function useRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = { maxAttempts: 3, delay: 1000, backoff: 2 }
) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const executeWithRetry = useCallback(async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    let lastError: Error = new Error('Unknown error');
    
    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
      try {
        setAttemptCount(attempt);
        if (attempt > 1) {
          setIsRetrying(true);
        }
        
        const result = await fn(...args);
        
        // Reset state on success
        setIsRetrying(false);
        setAttemptCount(0);
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors (like 404, 401, etc.)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status === 404 || status === 401 || status === 403) {
            setIsRetrying(false);
            setAttemptCount(0);
            throw error;
          }
        }
        
        // Wait before next attempt (except for the last attempt)
        if (attempt < options.maxAttempts) {
          const delayTime = options.delay * Math.pow(options.backoff, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delayTime));
        }
      }
    }
    
    setIsRetrying(false);
    setAttemptCount(0);
    throw lastError;
  }, [fn, options]);

  return {
    executeWithRetry,
    isRetrying,
    attemptCount
  };
}