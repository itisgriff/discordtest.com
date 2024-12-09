import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export function Popover({ children, content, className }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </div>
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 w-64 px-4 py-3 bg-popover text-popover-foreground rounded-md shadow-md border animate-in fade-in-0 zoom-in-95",
            "top-full mt-1",
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
} 