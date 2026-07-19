import clsx from 'clsx';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminProvidersQuery, useAdminRejectProviderMutation, useAdminVerifyProviderMutation } from '../api/hooks';
import type { AdminProvider } from '../api/models';
import { useBrand } from '../brand';
import { SUPPORTED_LANGS, toIntlLocale, type Lang } from '../i18n';
import { Logo, stripes } from '../components/ui';
import { BRICO, headerDate } from '../lib/format';
import { clickable } from '../lib/a11y';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import AdminLogin from './AdminLogin';
import Dashboard from './sections/Dashboard';
import Users from './sections/Users';
import Providers from './sections/Providers';
import Bookings from './sections/Bookings';
import Calendars from './sections/Calendars';
import Categories from './sections/Categories';
import Billing from './sections/Billing';

const SECTION_PATHS = ['', 'users', 'providers', 'bookings', 'calendars', 'categories', 'billing'] as const;

const BRICO_STYLE = { fontFamily: BRICO };

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

const PendingCtx = createContext<PendingCtxValue>({
  pending: [],
  pendingCount: 0,
  approve: async () => {},
  reject: async () => {},
});

export function usePending(): PendingCtxValue {
  return useContext(PendingCtx);
}

// ---------- Layout ----------

export default function AdminApp() {
  const { t, i18n } = useTranslation();
  const brand = useBrand();
  const { me, loading, logout } = useAuth();
  const { toast, showToast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [pending, setPending] = useState<PendingItem[]>([]);

  const isAdmin = !!me?.isAdmin;
  const lang = (i18n.language as Lang) ?? 'pl';
  const toggleLang = () => {
    const next = SUPPORTED_LANGS[(SUPPORTED_LANGS.indexOf(lang) + 1) % SUPPORTED_LANGS.length];
    void i18n.changeLanguage(next);
  };

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
  const pendingValue = useMemo(
    () => ({ pending, pendingCount, approve, reject }),
    [pending, pendingCount, approve, reject],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <span className="animate-[ptpulse_1.6s_infinite]">
          <Logo size={54} />
        </span>
        <span className="sr-only" role="status">
          {t('a11y.loading', 'Ładowanie…')}
        </span>
      </div>
    );
  }

  if (!me) return <AdminLogin />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="max-w-[420px] rounded-[20px] bg-surface px-9 py-8 text-center shadow-[var(--shadow)]">
          <Logo size={40} />
          {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO_STYLE is a shared font-family constant with no Tailwind token mapping */}
          <h1 className="mt-3.5 mb-2 text-[20px] font-bold" style={BRICO_STYLE}>
            {t('admin.common.noAccessTitle')}
          </h1>
          <div className="mb-[18px] text-[13.5px] leading-[1.5] text-muted2">
            {t('admin.common.noAccessBody', { email: me.email })}
          </div>
          <div
            {...clickable(logout)}
            className="inline-block cursor-pointer rounded-[14px] bg-accent px-[22px] py-2.5 text-[13px] font-bold text-white"
          >
            {t('admin.common.logout')}
          </div>
        </div>
      </div>
    );
  }

  const SECTIONS = SECTION_PATHS.map((path) => ({
    path,
    label: t(`admin.common.sections.${path || 'dashboard'}`),
  }));

  const activePath = pathname.replace(/^\/admin\/?/, '').split('/')[0];
  const sectionTitle = SECTIONS.find((s) => s.path === activePath)?.label ?? t('admin.common.sections.dashboard');

  return (
    <PendingCtx.Provider value={pendingValue}>
      <div className="flex min-h-screen bg-bg text-text">
        {/* Sidebar */}
        <nav
          aria-label={t('a11y.adminNav', 'Menu administratora')}
          className="flex flex-none w-[224px] flex-col border-r border-border bg-surface px-3 py-5"
        >
          <div className="flex items-center gap-[9px] px-2.5 pb-5">
            <Logo size={34} />
            <div>
              {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO_STYLE is a shared font-family constant with no Tailwind token mapping */}
              <div className="text-[15px] font-bold" style={BRICO_STYLE}>
                {brand.appName}
              </div>
              <div className="text-[10.5px] font-semibold text-muted">{t('admin.common.panelLabel')}</div>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            {SECTIONS.map((s) => {
              const active = activePath === s.path;
              const badge = s.path === 'providers' && pendingCount > 0;
              return (
                <div
                  key={s.path || 'dashboard'}
                  {...clickable(() => navigate(s.path ? `/admin/${s.path}` : '/admin'), { pressed: active })}
                  className={clsx(
                    'flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5',
                    active ? 'bg-accent text-white' : 'bg-transparent text-muted2',
                  )}
                >
                  <span className={clsx('flex-1 text-[13.5px]', active ? 'font-bold' : 'font-semibold')}>{s.label}</span>
                  {badge && (
                    <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] bg-[#d64550] px-[5px] text-[10.5px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-auto">
            <div
              {...clickable(toggleLang)}
              title={t('admin.common.language') ?? ''}
              className="flex cursor-pointer items-center justify-between gap-[9px] rounded-xl px-3 py-[9px]"
            >
              <span className="text-[12.5px] font-semibold text-muted2">{t('admin.common.language')}</span>
              <span className="rounded-[9px] bg-surface2 px-2 py-[3px] text-[11.5px] font-bold text-accent">{lang.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-[9px] border-t border-border px-3 py-2.5">
              <span
                className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full text-[11px] font-bold text-white"
                // eslint-disable-next-line react/no-inline-styles -- dynamic: stripes() generates a per-avatar gradient string at runtime
                style={{ background: stripes(45, 5) }}
              >
                AD
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-bold">Admin</div>
                <div className="overflow-hidden text-ellipsis text-[10.5px] text-muted">{me.email}</div>
              </div>
              <span
                {...clickable(logout, { label: t('admin.common.logout') })}
                title={t('admin.common.logout') ?? ''}
                className="cursor-pointer text-[11px] font-bold text-[#d64550]"
              >
                <span aria-hidden="true">⎋</span>
              </span>
            </div>
          </div>
        </nav>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-none items-center gap-3.5 border-b border-border bg-surface px-7 py-4">
            {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO_STYLE is a shared font-family constant with no Tailwind token mapping */}
            <h1 className="m-0 text-[19px] font-bold" style={BRICO_STYLE}>
              {sectionTitle}
            </h1>
            <span className="ml-auto text-[12px] text-muted">{headerDate(toIntlLocale(i18n.language))}</span>
          </div>
          <main className="relative flex-1 overflow-auto px-7 py-6">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="providers" element={<Providers />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="calendars" element={<Calendars />} />
              <Route path="categories" element={<Categories />} />
              <Route path="billing" element={<Billing />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>

        {toast && (
          <div className="fixed bottom-7 left-1/2 z-20 -translate-x-1/2 animate-[crmfade_.25s_ease] rounded-[14px] bg-[#2a2430] px-5 py-3 text-[13px] font-semibold text-[#faf7f2]">
            {toast}
          </div>
        )}
      </div>
    </PendingCtx.Provider>
  );
}
