"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: "success" | "error" | "info";
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border min-w-[300px] animate-in slide-in-from-right ${
              toast.variant === "success" ? "bg-emerald-50 border-emerald-200" :
              toast.variant === "error" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
            }`}
          >
            {toast.variant === "success" && <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />}
            {toast.variant === "error" && <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />}
            {toast.variant === "info" && <Info className="size-5 text-blue-600 shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{toast.title}</p>
              {toast.description && <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{toast.description}</p>}
            </div>
            <button onClick={() => removeToast(toast.id)} className="shrink-0">
              <X className="size-4 text-[var(--color-muted-foreground)]" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
