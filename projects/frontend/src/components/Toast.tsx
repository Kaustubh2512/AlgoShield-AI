import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const typeConfig = {
  error: { bg: 'bg-danger/15', border: 'border-danger/50', text: 'text-danger', icon: <AlertTriangle className="w-5 h-5" /> },
  success: { bg: 'bg-safe/15', border: 'border-safe/50', text: 'text-safe', icon: <CheckCircle className="w-5 h-5" /> },
  warning: { bg: 'bg-warning/15', border: 'border-warning/50', text: 'text-warning', icon: <AlertCircle className="w-5 h-5" /> },
  info: { bg: 'bg-secondary/15', border: 'border-secondary/50', text: 'text-secondary', icon: <Info className="w-5 h-5" /> },
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const config = typeConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md ${config.bg} ${config.border} shadow-2xl max-w-sm`}
    >
      <span className={`${config.text} shrink-0 mt-0.5`}>{config.icon}</span>
      <p className="text-sm text-gray-200 flex-1 font-mono">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-500 hover:text-white transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

let toastContainer: HTMLDivElement | null = null;
let toasts: Toast[] = [];
let setToastsFn: React.Dispatch<React.SetStateAction<Toast[]>> | null = null;

const ToastContainer: React.FC = () => {
  const [localToasts, setLocalToasts] = useState<Toast[]>([]);

  const dismiss = (id: string) => {
    setLocalToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (!toastContainer) {
    setToastsFn = setLocalToasts as any;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {localToasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export function initToast() {
  if (toastContainer) return;
  toastContainer = document.createElement('div');
  document.body.appendChild(toastContainer);
  const root = createRoot(toastContainer);
  root.render(<ToastContainer />);
}

export function showToast(message: string, type: ToastType = 'error') {
  if (!setToastsFn) {
    console.warn('Toast not initialized');
    return;
  }
  const id = `${Date.now()}-${Math.random()}`;
  setToastsFn((prev: Toast[]) => [...prev, { id, message, type }]);
}
