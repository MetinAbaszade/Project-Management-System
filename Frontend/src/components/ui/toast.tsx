// src/lib/toast.tsx
import { createRoot } from 'react-dom/client';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Toast types
type ToastType = 'success' | 'error' | 'info';

// Toast interface
interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  icon?: React.ReactNode;
}

// Toast container to hold all toasts
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-lg border ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-800 dark:text-green-200'
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-200'
                : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-800 dark:text-blue-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  toast.type === 'success'
                    ? 'bg-green-100 text-green-600 dark:bg-green-800/50 dark:text-green-300'
                    : toast.type === 'error'
                    ? 'bg-red-100 text-red-600 dark:bg-red-800/50 dark:text-red-300'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-800/50 dark:text-blue-300'
                }`}
              >
                {toast.icon || 
                  (toast.type === 'success' ? (
                    <Check className="h-5 w-5" />
                  ) : toast.type === 'error' ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <Info className="h-5 w-5" />
                  ))}
              </div>
              <p>{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Toast manager to handle toast state
class ToastManager {
  private container: HTMLDivElement | null = null;
  private root: any = null;
  private toasts: Toast[] = [];
  private removeTimeouts: Record<string, NodeJS.Timeout> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
      this.root = createRoot(this.container);
      this.render();
    }
  }

  private render() {
    if (this.root) {
      this.root.render(
        <ToastContainer
          toasts={this.toasts}
          removeToast={(id: string) => this.remove(id)}
        />
      );
    }
  }

  private add(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    this.toasts = [...this.toasts, newToast];
    this.render();

    // Auto-remove after duration
    this.removeTimeouts[id] = setTimeout(() => {
      this.remove(id);
    }, newToast.duration);

    return id;
  }

  private remove(id: string) {
    if (this.removeTimeouts[id]) {
      clearTimeout(this.removeTimeouts[id]);
      delete this.removeTimeouts[id];
    }

    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.render();
  }

  success(message: string, options: { duration?: number; icon?: React.ReactNode } = {}) {
    return this.add({
      type: 'success',
      message,
      duration: options.duration || 3000,
      icon: options.icon,
    });
  }

  error(message: string, options: { duration?: number; icon?: React.ReactNode } = {}) {
    return this.add({
      type: 'error',
      message,
      duration: options.duration || 4000,
      icon: options.icon,
    });
  }

  info(message: string, options: { duration?: number; icon?: React.ReactNode } = {}) {
    return this.add({
      type: 'info',
      message,
      duration: options.duration || 3000,
      icon: options.icon,
    });
  }

  dismiss(id: string) {
    this.remove(id);
  }

  dismissAll() {
    Object.keys(this.removeTimeouts).forEach((id) => {
      clearTimeout(this.removeTimeouts[id]);
      delete this.removeTimeouts[id];
    });

    this.toasts = [];
    this.render();
  }
}

export const toast = new ToastManager();