import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminProvidersQuery, useAdminRejectProviderMutation, useAdminVerifyProviderMutation } from '../api/hooks';
import type { AdminProvider } from '../api/models';
import { useToast } from '../state/ToastContext';

// ---------- Pending-verification queue shared between Pulpit and Wykonawcy ----------

export interface PendingItem extends AdminProvider {
  decided?: 'ok' | 'rej';
}

interface PendingCtxValue {
  pending: PendingItem[];
  pendingCount: number;
  approve: (p: PendingItem) => Promise<void>;
  reject: (p: PendingItem) => Promise<void>;
}

export const PendingCtx = createContext<PendingCtxValue>({
  pending: [],
  pendingCount: 0,
  approve: async () => {},
  reject: async () => {},
});

export function usePending(): PendingCtxValue {
  return useContext(PendingCtx);
}

/** Fetches + manages the pending-provider-verification queue (approve/reject), consumed via
 * `usePending()` by Pulpit (Dashboard) and Wykonawcy (Providers). Owned by AdminApp so the queue
 * survives navigating between sections. */
export function usePendingProviders(isAdmin: boolean): PendingCtxValue {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [pending, setPending] = useState<PendingItem[]>([]);

  const { data: pendingData, error: pendingError } = useAdminProvidersQuery('PENDING', isAdmin);
  const verifyProviderMutation = useAdminVerifyProviderMutation();
  const rejectProviderMutation = useAdminRejectProviderMutation();

  useEffect(() => {
    if (!isAdmin) return;
    if (pendingData) setPending(pendingData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, pendingData]);

  useEffect(() => {
    if (isAdmin && pendingError) showToast(pendingError instanceof Error ? pendingError.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, pendingError]);

  const approve = useCallback(
    async (p: PendingItem) => {
      try {
        await verifyProviderMutation.mutateAsync(p.id);
        setPending((list) => list.map((x) => (x.id === p.id ? { ...x, decided: 'ok' } : x)));
        showToast(t('admin.providers.verifiedToast', { name: p.name }));
      } catch (e) {
        showToast(e instanceof Error ? e.message : t('common.error'));
      }
    },
    [showToast, t, verifyProviderMutation],
  );

  const reject = useCallback(
    async (p: PendingItem) => {
      try {
        await rejectProviderMutation.mutateAsync(p.id);
        setPending((list) => list.map((x) => (x.id === p.id ? { ...x, decided: 'rej' } : x)));
      } catch (e) {
        showToast(e instanceof Error ? e.message : t('common.error'));
      }
    },
    [showToast, t, rejectProviderMutation],
  );

  const pendingCount = pending.filter((p) => !p.decided).length;

  return useMemo(() => ({ pending, pendingCount, approve, reject }), [pending, pendingCount, approve, reject]);
}
