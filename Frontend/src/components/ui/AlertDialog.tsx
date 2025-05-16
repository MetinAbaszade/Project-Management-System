import React, { useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface AlertDialogContentProps {
  className?: string;
  children: ReactNode;
}

interface AlertDialogHeaderProps {
  className?: string;
  children: ReactNode;
}

interface AlertDialogFooterProps {
  className?: string;
  children: ReactNode;
}

interface AlertDialogTitleProps {
  className?: string;
  children: ReactNode;
}

interface AlertDialogDescriptionProps {
  className?: string;
  children: ReactNode;
}

interface AlertDialogActionProps {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  children: ReactNode;
}

interface AlertDialogCancelProps {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  children: ReactNode;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return <>{children}</>;
};

export const AlertDialogContent: React.FC<AlertDialogContentProps> = ({
  className,
  children,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in-0" 
        onClick={(e) => e.stopPropagation()}
      />
      <div
        className={cn(
          "relative z-50 grid w-full max-w-lg gap-4 p-6 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-center rounded-lg",
          "border border-[var(--theme-border)] bg-[var(--theme-card-bg)]",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({
  className,
  children,
}) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
    {children}
  </div>
);

export const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({
  className,
  children,
}) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
    {children}
  </div>
);

export const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({
  className,
  children,
}) => (
  <h2 className={cn("text-lg font-semibold text-[var(--theme-foreground)]", className)}>{children}</h2>
);

export const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({
  className,
  children,
}) => (
  <p className={cn("text-sm text-[var(--theme-foreground)]/70", className)}>{children}</p>
);

export const AlertDialogAction: React.FC<AlertDialogActionProps> = ({
  className,
  onClick,
  disabled,
  children,
}) => (
  <button
    type="button"
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
      "bg-[var(--theme-primary)] text-white",
      "hover:bg-[var(--theme-primary)]/90 focus:outline-none focus-visible:ring-2",
      "focus-visible:ring-[var(--theme-primary)]/50 disabled:pointer-events-none disabled:opacity-50",
      "transition-colors duration-200",
      className
    )}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

export const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({
  className,
  onClick,
  disabled,
  children,
}) => (
  <button
    type="button"
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
      "border border-[var(--theme-border)] bg-transparent",
      "text-[var(--theme-foreground)] hover:bg-[var(--theme-hover)]",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]/50",
      "disabled:pointer-events-none disabled:opacity-50 mt-2 sm:mt-0",
      "transition-colors duration-200",
      className
    )}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

export const AlertDialogTrigger: React.FC<{
  children: ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => {
  return <div onClick={onClick}>{children}</div>;
};