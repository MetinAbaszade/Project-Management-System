// Frontend/src/components/ui/ConfirmDialog.tsx

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
  isLoading = false
}: ConfirmDialogProps) {
  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <motion.div 
        className="bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl p-6 max-w-md w-full shadow-lg"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          {destructive && (
            <div className="bg-red-500/10 p-2 rounded-full">
              <AlertCircle className={cn(
                "w-5 h-5",
                destructive ? 'text-red-500' : 'text-primary'
              )} />
            </div>
          )}
          <h3 className={cn(
            "text-lg font-semibold",
            destructive ? 'text-red-500' : 'text-foreground'
          )}>
            {title}
          </h3>
        </div>
        
        <p className="text-muted-foreground mb-6 pl-4">
          {message}
        </p>
        
        <div className="flex justify-end gap-3">
          <motion.button
            onClick={onCancel}
            className="px-4 py-2.5 bg-muted/50 hover:bg-muted text-foreground rounded-full text-sm transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isLoading}
          >
            {cancelLabel}
          </motion.button>
          
          <motion.button
            onClick={onConfirm}
            className={cn(
              "px-4 py-2.5 rounded-full text-sm transition-colors flex items-center",
              destructive 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2"></div>
                Loading...
              </>
            ) : (
              confirmLabel
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}