import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import type { AdminProvider } from '../api/types';
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

  useEffect(() => {
    if (!isAdmin) return;
    api
      .adminProviders('PENDING')
      .then((list) => setPending(list))
      .catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const approve = useCallback(
    async (p: PendingItem) => {
      try {
        await api.adminVerifyProvider(p.id);
        setPending((list) => list.map((x) => (x.id === p.id ? { ...x, decided: 'ok' } : x)));
        showToast(t('admin.providers.verifiedToast', { name: p.name }));
      } catch (e) {
        showToast(e instanceof Error ? e.message : t('common.error'));
      }
    },
    [showToast, t],
  );

  const reject = useCallback(
    async (p: PendingItem) => {
      try {
        await api.adminRejectProvider(p.id);
        setPending((list) => list.map((x) => (x.id === p.id ? { ...x, decided: 'rej' } : x)));
      } catch (e) {
        showToast(e instanceof Error ? e.message : t('common.error'));
      }
    },
    [showToast, t],
  );

  const pendingCount = pending.filter((p) => !p.decided).length;
  const pendingValue = useMemo(
    () => ({ pending, pendingCount, approve, reject }),
    [pending, pendingCount, approve, reject],
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <span style={{ animation: 'ptpulse 1.6s infinite' }}>
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 20, boxShadow: 'var(--shadow)', padding: '32px 36px', maxWidth: 420, textAlign: 'center' }}>
          <Logo size={40} />
          <h1 style={{ fontFamily: BRICO, fontSize: 20, fontWeight: 700, margin: '14px 0 8px' }}>{t('admin.common.noAccessTitle')}</h1>
          <div style={{ fontSize: 13.5, color: 'var(--muted2)', lineHeight: 1.5, marginBottom: 18 }}>
            {t('admin.common.noAccessBody', { email: me.email })}
          </div>
          <div
            {...clickable(logout)}
            style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', borderRadius: 14, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
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
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        {/* Sidebar */}
        <nav
          aria-label={t('a11y.adminNav', 'Menu administratora')}
          style={{
            flex: 'none',
            width: 224,
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 10px 20px' }}>
            <Logo size={34} />
            <div>
              <div style={{ fontFamily: BRICO, fontSize: 15, fontWeight: 700 }}>{brand.appName}</div>
              <div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 600 }}>{t('admin.common.panelLabel')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SECTIONS.map((s) => {
              const active = activePath === s.path;
              const badge = s.path === 'providers' && pendingCount > 0;
              return (
                <div
                  key={s.path || 'dashboard'}
                  {...clickable(() => navigate(s.path ? `/admin/${s.path}` : '/admin'), { pressed: active })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    background: active ? 'var(--accent)' : 'transparent',
                    color: active ? '#fff' : 'var(--muted2)',
                  }}
                >
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: active ? 700 : 600 }}>{s.label}</span>
                  {badge && (
                    <span
                      style={{
                        minWidth: 18,
                        height: 18,
                        borderRadius: 9,
                        background: '#d64550',
                        color: '#fff',
                        fontSize: 10.5,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 5px',
                      }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div
              {...clickable(toggleLang)}
              title={t('admin.common.language') ?? ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 9,
                padding: '9px 12px',
                cursor: 'pointer',
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted2)' }}>{t('admin.common.language')}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent)', background: 'var(--surface2)', borderRadius: 9, padding: '3px 8px' }}>
                {lang.toUpperCase()}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '10px 12px',
                borderTop: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: stripes(45, 5),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fff',
                  flex: 'none',
                }}
              >
                AD
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>Admin</div>
                <div style={{ fontSize: 10.5, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.email}</div>
              </div>
              <span
                {...clickable(logout, { label: t('admin.common.logout') })}
                title={t('admin.common.logout') ?? ''}
                style={{ fontSize: 11, fontWeight: 700, color: '#d64550', cursor: 'pointer' }}
              >
                <span aria-hidden="true">⎋</span>
              </span>
            </div>
          </div>
        </nav>

        {/* Main column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 28px',
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h1 style={{ fontFamily: BRICO, fontSize: 19, fontWeight: 700, margin: 0 }}>{sectionTitle}</h1>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>{headerDate(toIntlLocale(i18n.language))}</span>
          </div>
          <main style={{ flex: 1, overflow: 'auto', padding: '24px 28px', position: 'relative' }}>
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
          <div
            style={{
              position: 'fixed',
              left: '50%',
              bottom: 28,
              transform: 'translateX(-50%)',
              background: '#2a2430',
              color: '#faf7f2',
              borderRadius: 14,
              padding: '12px 20px',
              fontSize: 13,
              fontWeight: 600,
              animation: 'crmfade .25s ease',
              zIndex: 20,
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </PendingCtx.Provider>
  );
}
