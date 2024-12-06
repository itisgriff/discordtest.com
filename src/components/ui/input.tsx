import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, disabled, ...props }, ref) => {
    // Memoize the wrapper class computation
    const wrapperClassName = React.useMemo(() => {
      return cn(
        'relative flex items-center',
        error && 'text-destructive',
        className
      );
    }, [className, error]);

    // Memoize the input class computation
    const inputClassName = React.useMemo(() => {
      return cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive focus-visible:ring-destructive',
        icon && 'pl-9',
        className
      );
    }, [className, error, icon]);

    return (
      <div className={wrapperClassName}>
        {icon && (
          <div className="absolute left-3 flex h-full items-center text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={inputClassName}
          ref={ref}
          disabled={disabled}
          aria-invalid={error}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
