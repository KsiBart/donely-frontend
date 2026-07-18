import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { useIsDesktop } from '../lib/useIsDesktop';
import { Logo } from '../components/ui';
import Landing from '../landing/Landing';
import TopNav from '../desktop/TopNav';
import { LocationScreen } from './AuthFlow';
import BottomNav from './BottomNav';
import { DesktopPromoBanner, InstallBanner } from './AppPromo';
import Home from './screens/Home';
import AiResults from './screens/AiResults';
import ProviderProfile from './screens/ProviderProfile';
import BookingWizard from './screens/BookingWizard';
import PaymentReturn from './screens/PaymentReturn';
import Success from './screens/Success';
import BookingsTab from './screens/Bookings';
import Favorites from './screens/Favorites';
import ProfileTab from './screens/Profile';

const NAV_PATHS = ['/', '/bookings', '/favorites', '/profile'];

export default function MobileApp() {
  const { me, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const showNav = !!me && !!me.locationLabel && NAV_PATHS.includes(location.pathname);
  // Phase 2.5 — Web Desktop: only the authenticated + located customer flow gets desktop
  // chrome (top nav). Loading / auth / location-ask screens have no desktop design and stay
  // in the mobile card at any width.
  const authed = !!me && !!me.locationLabel;

  const routes = (
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  if (authed && isDesktop) {
    return (
      <div className="desktop-page">
        <div className="desktop-shell">
          <DesktopPromoBanner />
          <TopNav />
          <div className="desktop-content">{routes}</div>
          {toast && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: 28,
                background: 'var(--text)',
                color: 'var(--bg)',
                borderRadius: 16,
                padding: '12px 22px',
                fontSize: 13,
                fontWeight: 600,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                animation: 'dwfade .25s ease',
                zIndex: 10,
              }}
            >
              {toast}
            </div>
          )}
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
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ animation: 'ptpulse 1.6s infinite' }}>
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
        {toast && (
          <div
            style={{
              position: 'fixed',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 28,
              background: 'var(--text)',
              color: 'var(--bg)',
              borderRadius: 16,
              padding: '12px 22px',
              fontSize: 13,
              fontWeight: 600,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              animation: 'dwfade .25s ease',
              zIndex: 10,
            }}
          >
            {toast}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="mobile-page">
      <div className="mobile-shell">
        {authed ? (
          <>
            <InstallBanner />
            {routes}
            {showNav && <BottomNav />}
          </>
        ) : (
          authContent
        )}
        {toast && (
          <div
            style={{
              position: 'absolute',
              left: 20,
              right: 20,
              bottom: 110,
              background: 'var(--text)',
              color: 'var(--bg)',
              borderRadius: 16,
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 600,
              textAlign: 'center',
              animation: 'dwfade .25s ease',
              zIndex: 10,
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
