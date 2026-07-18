import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminApp from './admin/AdminApp';
import MobileApp from './mobile/MobileApp';
import AuthPage from './landing/AuthPage';
import Subpage from './landing/Subpage';
import { SUBPAGES } from './landing/pages';

/** WCAG 2.4.2 Page Titled: keep <title> in sync with the route so each screen is distinguishable
 * (index.html ships one static title). Falls back to the brand name for unmapped paths. */
function RouteTitle() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  useEffect(() => {
    const base = 'DoneLy AI'; // matches index.html <title> + the wordmark (brand is not just appName)
    const exact: Record<string, string> = {
      '/': t('title.home'),
      '/login': t('title.login'),
      '/bookings': t('title.bookings'),
      '/favorites': t('title.favorites'),
      '/profile': t('title.profile'),
    };
    let section = exact[pathname];
    if (!section) {
      if (pathname.startsWith('/admin')) section = t('title.admin');
      else if (pathname.startsWith('/provider')) section = t('title.provider');
      else if (pathname.startsWith('/book')) section = t('title.book');
    }
    document.title = section ? `${section} · ${base}` : base;
  }, [pathname, t]);
  return null;
}

export default function App() {
  return (
    <>
      <RouteTitle />
      <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      {/* Unified passwordless auth (split-panel + 8-box OTP) — replaces the old in-app AuthFlow. */}
      <Route path="/login" element={<AuthPage />} />
      {/* 9 marketing subpages — public, viewable logged-in or out, shared header/footer chrome. */}
      {SUBPAGES.map(({ path, key }) => (
        <Route key={path} path={path} element={<Subpage pageKey={key} />} />
      ))}
      {/* `/` (landing when logged out) + the rest of the authenticated app — untouched routing,
          see mobile/MobileApp.tsx for the logged-out/logged-in branch logic. */}
      <Route path="/*" element={<MobileApp />} />
      </Routes>
    </>
  );
}
