import React from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => {
  if (!open) return null;
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange?.(false);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {children}
    </div>
  );
};

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "bg-background rounded-lg shadow-lg w-full flex flex-col",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  children,
  className,
  ...props
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col space-y-1.5 p-4 text-center sm:text-left",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ 
  children,
  className,
  ...props
}) => {
  return (
    <h2 
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}; 