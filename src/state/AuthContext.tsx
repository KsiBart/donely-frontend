import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UNAUTHORIZED_EVENT, api, clearToken, getToken, setToken } from '../api/client';
import type { Me, RequestCodeResponse } from '../api/types';

interface AuthValue {
  me: Me | null;
  loading: boolean;
  requestCode: (email: string) => Promise<RequestCodeResponse>;
  verify: (email: string, code: string) => Promise<Me>;
  updateMe: (patch: Partial<Pick<Me, 'name' | 'locationLabel' | 'lat' | 'lng'>>) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!getToken());

  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    api
      .me()
      .then((m) => {
        if (alive) setMe(m);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Phase 2 cleanup: any 401 from the API client clears the session and drops
  // the user back to the login screen (AuthFlow / AdminLogin render when me===null).
  useEffect(() => {
    const onUnauthorized = () => setMe(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const requestCode = useCallback((email: string) => api.requestCode(email), []);

  const verify = useCallback(async (email: string, code: string) => {
    const res = await api.verify(email, code);
    setToken(res.accessToken);
    setMe(res.user);
    return res.user;
  }, []);

  const updateMe = useCallback(
    async (patch: Partial<Pick<Me, 'name' | 'locationLabel' | 'lat' | 'lng'>>) => {
      const res = await api.updateMe(patch);
      setMe((prev) => {
        if (!prev) return prev;
        const merged: Me = { ...prev, ...patch } as Me;
        if (res && typeof res === 'object' && 'email' in res) return { ...merged, ...res };
        return merged;
      });
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    setMe(null);
  }, []);

  const value = useMemo(
    () => ({ me, loading, requestCode, verify, updateMe, logout }),
    [me, loading, requestCode, verify, updateMe, logout],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
