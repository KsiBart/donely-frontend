import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UNAUTHORIZED_EVENT, clearToken, getToken, setToken } from '../api/client';
import { useBecomeProMutation, useMeQuery, useRequestCodeMutation, useUpdateMeMutation, useVerifyMutation } from '../api/hooks';
import { qk } from '../api/keys';
import { queryClient } from '../api/queryClient';
import type { Me, RequestCodeResponse, UpdateMePayload } from '../api/models';
import { type AppMode, clearStoredMode, getStoredMode, setStoredMode } from './modeState';

interface AuthValue {
  me: Me | null;
  loading: boolean;
  /** Convenience alias for `!!me?.isPro` — a user who has accepted the pro terms and has a
   * provider profile (see `becomePro`). */
  isPro: boolean;
  /** Which UI the client currently renders for this session ('standard' = customer app, 'pro' =
   * provider/wykonawca area). Persisted (`localStorage`) so a reload keeps the choice made on the
   * post-login screen or the Profile switch. Purely a client-side view flag — every provider-area
   * endpoint is still gated server-side on `me.isPro`. */
  mode: AppMode;
  enterMode: (mode: AppMode) => void;
  requestCode: (email: string) => Promise<RequestCodeResponse>;
  verify: (email: string, code: string) => Promise<Me>;
  updateMe: (
    patch: Partial<Pick<Me, 'name' | 'locationLabel' | 'lat' | 'lng' | 'emailNotifications' | 'savedAddresses'>>,
  ) => Promise<void>;
  /** `POST /me/become-pro` — accepts pro terms, sets `isPro`/`proTermsAcceptedAt`, creates the
   * PENDING provider profile. Does NOT change `mode` — callers enter pro mode explicitly. */
  becomePro: () => Promise<Me>;
  logout: () => void;
}

const AuthCtx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!getToken());
  const [mode, setMode] = useState<AppMode>(() => getStoredMode());
  const meQuery = useMeQuery({ retry: false });
  const requestCodeMutation = useRequestCodeMutation();
  const verifyMutation = useVerifyMutation();
  const updateMeMutation = useUpdateMeMutation();
  const becomeProMutation = useBecomeProMutation();

  useEffect(() => {
    // NOTE: do not guard on getToken() here — the api client's 401 middleware clears the
    // token *before* this effect runs, so an early `if (!getToken()) return` would skip the
    // error branch and leave `loading` stuck true (infinite spinner) on an expired/invalid
    // token. Resolve loading on either terminal state instead.
    if (meQuery.isSuccess) {
      setMe(meQuery.data);
      setLoading(false);
    } else if (meQuery.isError) {
      clearToken();
      setMe(null);
      setLoading(false);
    }
  }, [meQuery.isSuccess, meQuery.isError, meQuery.data]);

  // Phase 2 cleanup: any 401 from the API client clears the session and drops
  // the user back to the login screen (AuthFlow / AdminLogin render when me===null).
  useEffect(() => {
    const onUnauthorized = () => setMe(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const requestCode = useCallback(
    (email: string) => requestCodeMutation.mutateAsync(email),
    [requestCodeMutation],
  );

  const verify = useCallback(
    async (email: string, code: string) => {
      const res = await verifyMutation.mutateAsync({ email, code });
      setToken(res.accessToken);
      setMe(res.user);
      void queryClient.invalidateQueries({ queryKey: qk.me() });
      return res.user;
    },
    [verifyMutation],
  );

  const updateMe = useCallback(
    async (
      patch: Partial<Pick<Me, 'name' | 'locationLabel' | 'lat' | 'lng' | 'emailNotifications' | 'savedAddresses'>>,
    ) => {
      const res = await updateMeMutation.mutateAsync(patch as UpdateMePayload);
      setMe((prev) => {
        if (!prev) return prev;
        const merged: Me = { ...prev, ...patch } as Me;
        if (res && typeof res === 'object' && 'email' in res) return { ...merged, ...res };
        return merged;
      });
    },
    [updateMeMutation],
  );

  const becomePro = useCallback(async () => {
    const updated = await becomeProMutation.mutateAsync();
    setMe(updated);
    return updated;
  }, [becomeProMutation]);

  const enterMode = useCallback((next: AppMode) => {
    setStoredMode(next);
    setMode(next);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearStoredMode();
    setMe(null);
    setMode('standard');
    queryClient.clear();
  }, []);

  const isPro = !!me?.isPro;

  const value = useMemo(
    () => ({ me, loading, isPro, mode, enterMode, requestCode, verify, updateMe, becomePro, logout }),
    [me, loading, isPro, mode, enterMode, requestCode, verify, updateMe, becomePro, logout],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
