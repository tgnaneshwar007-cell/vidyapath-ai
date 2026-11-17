import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'info';
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  success: (title: string, message?: string, action?: ToastAction) => string;
  error: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toastData: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const duration = toastData.duration || 4500;
    const newToast: ToastItem = { ...toastData, id };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    const timer = setTimeout(() => {
      dismissToast(id);
    }, duration);
    timersRef.current.set(id, timer);

    return id;
  }, [dismissToast]);

  const success = useCallback((title: string, message?: string, action?: ToastAction) => {
    return showToast({ title, message, type: 'success', action });
  }, [showToast]);

  const error = useCallback((title: string, message?: string) => {
    return showToast({ title, message, type: 'error' });
  }, [showToast]);

  const info = useCallback((title: string, message?: string) => {
    return showToast({ title, message, type: 'info' });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, success, error, info }}>
      {children}
      {/* Toast Notification Container */}
      <div 
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border border-brand-border/90 bg-white/95 backdrop-blur-md shadow-elevated text-brand-black transition-all animate-in slide-in-from-bottom-3 duration-200"
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-brand-danger" />
              ) : toast.type === 'info' ? (
                <Info className="h-4 w-4 text-brand-storm" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-tight font-display">{toast.title}</p>
              {toast.message && (
                <p className="text-[11px] text-brand-mutedText mt-0.5 leading-snug">{toast.message}</p>
              )}

              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    dismissToast(toast.id);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-mono font-bold bg-brand-storm-subtle text-brand-black hover:bg-brand-black hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{toast.action.label}</span>
                </button>
              )}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-brand-mutedText hover:text-brand-black p-0.5 rounded-md shrink-0 hit-slop"
              aria-label="Dismiss Notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
