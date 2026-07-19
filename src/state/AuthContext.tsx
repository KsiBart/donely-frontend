import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UNAUTHORIZED_EVENT, clearToken, getToken, setToken } from '../api/client';
import { useMeQuery, useRequestCodeMutation, useUpdateMeMutation, useVerifyMutation } from '../api/hooks';
import { qk } from '../api/keys';
import { queryClient } from '../api/queryClient';
import type { Me, RequestCodeResponse, UpdateMePayload } from '../api/models';

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
  const meQuery = useMeQuery({ retry: false });
  const requestCodeMutation = useRequestCodeMutation();
  const verifyMutation = useVerifyMutation();
  const updateMeMutation = useUpdateMeMutation();

  useEffect(() => {
    if (!getToken()) return;
    if (meQuery.isSuccess) {
      setMe(meQuery.data);
      setLoading(false);
    } else if (meQuery.isError) {
      clearToken();
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
    async (patch: Partial<Pick<Me, 'name' | 'locationLabel' | 'lat' | 'lng'>>) => {
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

  const logout = useCallback(() => {
    clearToken();
    setMe(null);
    queryClient.clear();
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
