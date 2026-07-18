import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

interface ToastValue {
  toast: string | null;
  showToast: (message: string) => void;
}

const ToastCtx = createContext<ToastValue>({ toast: null, showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const value = useMemo(() => ({ toast, showToast }), [toast, showToast]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {/* WCAG 4.1.3 Status Messages: a single visually-hidden live region announces EVERY toast to
          assistive tech, regardless of which visual toast renderer (MobileApp/AdminApp/landing) is
          on screen. polite = doesn't interrupt; text change triggers the announcement. */}
      <div className="sr-only" role="status" aria-live="polite">
        {toast}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastValue {
  return useContext(ToastCtx);
}
