// src/components/ui/ConfirmDialog.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive';
  isProcessing?: boolean;
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'default',
  isProcessing = false,
  icon
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  // Default icon is warning
  const dialogIcon = icon || <AlertTriangle className="h-6 w-6 text-amber-500" />;

  // Get button style based on variant
  const getConfirmButtonStyle = () => {
    switch (confirmVariant) {
      case 'destructive':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-md bg-card rounded-xl border shadow-lg overflow-hidden"
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                {dialogIcon}
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted transition-colors"
              disabled={isProcessing}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-muted-foreground mb-6">{description}</p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-input bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              disabled={isProcessing}
            >
              {cancelLabel}
            </button>
            
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md ${getConfirmButtonStyle()} transition-colors shadow-sm flex items-center gap-2`}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmLabel}</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}