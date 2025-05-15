'use client';

import * as React from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { AnimatePresence, motion } from 'framer-motion';
import { Portal } from '@/components/ui/Portal';

interface PopoverProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

export function Popover({
  children,
  trigger,
  open,
  onOpenChange,
  placement = 'bottom',
  align = 'center'
}: PopoverProps) {
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  useClickOutside([triggerRef, contentRef], () => {
    if (open) onOpenChange(false);
  });

  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (!triggerRef.current || !open) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const { top, left, height, width } = triggerRect;

      let x = left;
      let y = top;

      // Apply placement
      switch (placement) {
        case 'top':
          y = top;
          break;
        case 'bottom':
          y = top + height;
          break;
        case 'left':
          x = left;
          break;
        case 'right':
          x = left + width;
          break;
      }

      // Apply alignment
      switch (align) {
        case 'start':
          if (placement === 'top' || placement === 'bottom') {
            x = left;
          }
          break;
        case 'center':
          if (placement === 'top' || placement === 'bottom') {
            x = left + width / 2;
          }
          break;
        case 'end':
          if (placement === 'top' || placement === 'bottom') {
            x = left + width;
          }
          break;
      }

      setPosition({ x, y });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [open, placement, align]);

  // Calculate transform origin based on placement
  const getTransformOrigin = () => {
    switch (placement) {
      case 'top': return 'bottom';
      case 'bottom': return 'top';
      case 'left': return 'right';
      case 'right': return 'left';
      default: return 'top';
    }
  };

  return (
    <>
      <div ref={triggerRef} onClick={() => onOpenChange(!open)}>
        {trigger}
      </div>
      
      <Portal>
        <AnimatePresence>
          {open && (
            <motion.div
              ref={contentRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: position.y,
                left: position.x,
                zIndex: 1000,
                transformOrigin: getTransformOrigin(),
                willChange: 'transform, opacity'
              }}
              className="bg-background border border-border shadow-lg rounded-md overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}