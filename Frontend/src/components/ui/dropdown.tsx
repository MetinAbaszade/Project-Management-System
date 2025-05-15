// src/components/ui/dropdown.tsx

'use client';

import { useState, useRef, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';

interface DropdownProps {
  trigger: ReactNode;
  items: {
    label: string;
    value?: string;
    icon?: ReactNode;
    onClick?: () => void;
  }[];
  value?: string;
  onChange?: (value: string) => void;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  value,
  onChange,
  align = 'start',
  className
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside([triggerRef, menuRef], () => {
    if (open) setOpen(false);
  });

  const handleItemClick = (item: typeof items[0]) => {
    if (item.onClick) {
      item.onClick();
    }
    
    if (onChange && item.value !== undefined) {
      onChange(item.value);
    }
    
    setOpen(false);
  };

  const alignmentClasses = {
    start: 'left-0 origin-top-left',
    center: 'left-1/2 -translate-x-1/2 origin-top',
    end: 'right-0 origin-top-right'
  };

  return (
    <div className={cn("relative", className)}>
      <div ref={triggerRef} onClick={() => setOpen(!open)}>
        {trigger}
      </div>
      
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              "absolute z-50 mt-2 min-w-[180px] overflow-hidden rounded-lg border border-white/10 bg-white/5 backdrop-blur-md shadow-lg",
              alignmentClasses[align]
            )}
          >
            <div className="py-1">
              {items.map((item, index) => (
                <button
                  key={index}
                  className={cn(
                    "flex w-full items-center px-4 py-2 text-sm hover:bg-white/10 transition-colors",
                    value === item.value ? "text-primary font-medium" : "text-foreground"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                  {value === item.value && (
                    <svg 
                      className="ml-auto h-4 w-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}