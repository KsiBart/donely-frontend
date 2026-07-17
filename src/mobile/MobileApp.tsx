import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { useIsDesktop } from '../lib/useIsDesktop';
import { Logo } from '../components/ui';
import TopNav from '../desktop/TopNav';
import AuthFlow, { LocationScreen } from './AuthFlow';
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

  // Not authenticated yet: loader → auth (email/code) → location ask. The same inner
  // components render on mobile and desktop; only the surrounding chrome differs.
  const authContent = loading ? (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ animation: 'ptpulse 1.6s infinite' }}>
        <Logo size={54} />
      </span>
    </div>
  ) : !me ? (
    <AuthFlow />
  ) : !me.locationLabel ? (
    <LocationScreen />
  ) : null;

  // authed === false here means authContent is non-null (loader/auth/location).
  if (!authed && isDesktop) {
    return (
      <div className="auth-desktop-page">
        <div className="auth-desktop-card">
          {authContent}
          {toast && (
            <div
              style={{
                position: 'absolute',
                left: 20,
                right: 20,
                bottom: 24,
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
