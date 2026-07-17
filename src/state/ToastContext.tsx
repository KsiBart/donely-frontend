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

  return <ToastCtx.Provider value={value}>{children}</ToastCtx.Provider>;
}

export function useToast(): ToastValue {
  return useContext(ToastCtx);
}
