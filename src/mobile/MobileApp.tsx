import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { useIsDesktop } from '../lib/useIsDesktop';
import { Logo } from '../components/ui';
import Landing from '../landing/Landing';
import TopNav from '../desktop/TopNav';
import { LocationScreen } from './AuthFlow';
import BottomNav from './BottomNav';
import { DesktopPromoBanner, InstallBanner } from '../components/AppPromo';
import Home from './screens/Home';
import AiResults from './screens/AiResults';
import ProviderProfile from './screens/ProviderProfile';
import BookingWizard from './screens/BookingWizard';
import PaymentReturn from './screens/PaymentReturn';
import Success from './screens/Success';
import BookingsTab from './screens/Bookings';
import Favorites from './screens/Favorites';
import ProfileTab from './screens/Profile';
import ProApp from './pro/ProApp';
import ProNav from './pro/ProNav';

const NAV_PATHS = ['/', '/bookings', '/favorites', '/profile'];
// Bug-fix Stage B — pro app shell: the 5 sections ProNav renders, kept here (not in ProNav.tsx)
// so this file's showNav/showProNav split stays the single source of truth for "which bottom bar
// (if any) shows on this path", mirroring NAV_PATHS above.
const PRO_NAV_PATHS = ['/pro', '/pro/requests', '/pro/calendar', '/pro/payouts', '/pro/profile'];

const TOAST_BASE = 'bg-[var(--text)] text-[var(--bg)] rounded-2xl text-[13px] font-semibold text-center whitespace-nowrap animate-[dwfade_.25s_ease] z-10';

export default function MobileApp() {
  const { t } = useTranslation();
  const { me, loading, isPro, mode } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  // Pro mode: an isPro user who chose (login-choice screen or Profile's mode switch) to browse
  // the provider/wykonawca area instead of the customer app. Purely a client-side view flag —
  // `isPro` itself only flips server-side via `POST /me/become-pro`, so a non-pro user can never
  // land here no matter what `mode` says (see modeState.ts + AuthContext.becomePro).
  const proMode = !!me && isPro && mode === 'pro';
  const showNav = !proMode && !!me && !!me.locationLabel && NAV_PATHS.includes(location.pathname);
  const showProNav = proMode && PRO_NAV_PATHS.includes(location.pathname);
  // Phase 2.5 — Web Desktop: only the authenticated + located customer flow gets desktop
  // chrome (top nav). Loading / auth / location-ask screens have no desktop design and stay
  // in the mobile card at any width.
  // Pro (wykonawca) mode is "authed" without a customer delivery location — the provider area
  // (dashboard/requests/calendar/payouts) does not need `locationLabel`, so it must not be blocked
  // by the customer "Gdzie jesteś?" location gate. Standard/customer mode still requires it.
  const authed = !!me && (proMode || !!me.locationLabel);

  const customerRoutes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/ai" element={<AiResults />} />
      <Route path="/provider/:id" element={<ProviderProfile />} />
      <Route path="/book/:providerId/:serviceId" element={<BookingWizard />} />
      <Route path="/success" element={<Success />} />
      <Route path="/payments/return" element={<PaymentReturn />} />
      <Route path="/payments/cancel" element={<PaymentReturn />} />
      <Route path="/bookings" element={<BookingsTab />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/profile" element={<ProfileTab />} />
      {/* A pro-eligible user whose mode is 'standard' (or anyone else) hitting a bare /pro* URL
          falls through to this catch-all and bounces home — matches the "redirect" half of the
          non-pro-guard requirement; the terms/become-pro CTA lives on /profile one tap away. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
  // `ProApp` owns its own `/pro/*` <Routes> tree (dashboard/requests/calendar/payouts/profile) —
  // only mounted once `proMode` is true, i.e. only for a user the server already confirmed isPro.
  const routes = proMode ? <ProApp /> : customerRoutes;

  if (authed && isDesktop && !proMode) {
    return (
      <div className="desktop-page">
        <div className="desktop-shell">
          <a href="#main" className="skip-link">
            {t('common.skipToContent')}
          </a>
          <DesktopPromoBanner />
          <TopNav />
          <main id="main" className="desktop-content">
            {routes}
          </main>
          {toast && <div className={clsx(TOAST_BASE, 'absolute left-1/2 -translate-x-1/2 bottom-7 px-[22px] py-3')}>{toast}</div>}
        </div>
      </div>
    );
  }

  // Logged-out visitor: `/` shows the full marketing Landing page (own header/footer, no
  // .mobile-shell/.desktop-shell phone-card chrome); any other route (a direct deep link to a
  // protected app screen while logged out) bounces to the unified `/login` auth flow. Guarded by
  // `!loading` so a returning user with a stored token still sees the pulsing-logo loader below
  // while `AuthProvider` verifies the session (see state/AuthContext.tsx).
  if (!loading && !me && location.pathname === '/') {
    return <Landing />;
  }
  if (!loading && !me) {
    return <Navigate to="/login" replace />;
  }

  // Not authenticated yet (session still resolving) → loader; authenticated but no
  // `locationLabel` yet → post-login "share your location" gate. The same inner components
  // render on mobile and desktop; only the surrounding chrome differs.
  const authContent = loading ? (
    <div className="flex-1 flex items-center justify-center">
      <span className="animate-[ptpulse_1.6s_infinite]">
        <Logo size={54} />
      </span>
    </div>
  ) : !me ? null : !me.locationLabel ? (
    <LocationScreen />
  ) : null;

  // authed === false here means authContent is non-null (loader/auth/location).
  if (!authed && isDesktop) {
    // Logged in but no saved location yet: desktop gets a full-screen onboarding (map backdrop +
    // floating card, rendered by LocationScreen's own useIsDesktop() branch), not the small
    // phone-style auth card — that stays reserved for the (brief) session-loading state.
    const desktopLocationGate = !!me && !me.locationLabel;
    return (
      <>
        {desktopLocationGate ? (
          <LocationScreen />
        ) : (
          <div className="auth-desktop-page">
            <div className="auth-desktop-card">{authContent}</div>
          </div>
        )}
        {toast && <div className={clsx(TOAST_BASE, 'fixed left-1/2 -translate-x-1/2 bottom-7 px-[22px] py-3')}>{toast}</div>}
      </>
    );
  }

  return (
    <div className="mobile-page">
      <div className="mobile-shell">
        {authed ? (
          <>
            <a href="#main" className="skip-link">
              {t('common.skipToContent')}
            </a>
            <InstallBanner />
            <main id="main" className="flex-1 min-h-0 flex flex-col">
              {routes}
            </main>
            {showNav && <BottomNav />}
            {showProNav && <ProNav />}
          </>
        ) : (
          authContent
        )}
        {toast && <div className={clsx(TOAST_BASE, 'absolute left-5 right-5 bottom-[110px] px-4 py-3')}>{toast}</div>}
      </div>
    </div>
  );
}
