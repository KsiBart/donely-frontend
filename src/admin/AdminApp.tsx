import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBrand } from '../brand';
import { SUPPORTED_LANGS, toIntlLocale, type Lang } from '../i18n';
import { Logo } from '../components/ui';
import { BRICO, headerDate } from '../lib/format';
import { clickable } from '../lib/a11y';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import AdminLogin from './AdminLogin';
import AdminSidebar from './AdminSidebar';
import AdminRoutes from './AdminRoutes';
import { PendingCtx, usePendingProviders } from './PendingContext';

export type { PendingItem } from './PendingContext';
export { usePending } from './PendingContext';

const SECTION_PATHS = ['', 'users', 'providers', 'bookings', 'calendars', 'categories', 'billing'] as const;

const BRICO_STYLE = { fontFamily: BRICO };

// ---------- Layout ----------

export default function AdminApp() {
  const { t, i18n } = useTranslation();
  const brand = useBrand();
  const { me, loading, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isAdmin = !!me?.isAdmin;
  const lang = (i18n.language as Lang) ?? 'pl';
  const toggleLang = () => {
    const next = SUPPORTED_LANGS[(SUPPORTED_LANGS.indexOf(lang) + 1) % SUPPORTED_LANGS.length];
    void i18n.changeLanguage(next);
  };

  const pendingValue = usePendingProviders(isAdmin);

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
        <AdminSidebar
          brandAppName={brand.appName}
          sections={SECTIONS}
          activePath={activePath}
          pendingCount={pendingValue.pendingCount}
          onNavigate={(path) => navigate(path ? `/admin/${path}` : '/admin')}
          lang={lang}
          onToggleLang={toggleLang}
          email={me.email}
          onLogout={logout}
        />

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
            <AdminRoutes />
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
