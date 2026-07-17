import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo, stripes } from '../components/ui';
import { useAuth } from '../state/AuthContext';
import { useInstallAction } from '../mobile/AppPromo';
import { BRICO, initials } from '../lib/format';
import { useBrand } from '../brand';

const LINKS: { key: string; path: string }[] = [
  { key: 'nav.search', path: '/' },
  { key: 'nav.bookings', path: '/bookings' },
  { key: 'nav.favorites', path: '/favorites' },
];

/** Desktop top nav — replaces the bottom tab bar at >=1024px (PLAN.md "Phase 2.5"). */
export default function TopNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { me } = useAuth();
  const install = useInstallAction();
  const brand = useBrand();

  return (
    <div style={{ flex: 'none', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 26, padding: '14px 28px' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 'none', cursor: 'pointer' }}>
          <Logo size={30} />
          <span style={{ fontFamily: BRICO, fontSize: 19, fontWeight: 700 }}>
            {brand.appName.slice(0, -2)}
            <span style={{ color: 'var(--accent)' }}>{brand.appName.slice(-2)}</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {LINKS.map((link) => {
            const active = pathname === link.path;
            return (
              <span
                key={link.path}
                onClick={() => navigate(link.path)}
                className="dw-nav-pill"
                style={{
                  padding: '8px 14px',
                  borderRadius: 12,
                  background: active ? '#f1ebf7' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--muted2)',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t(link.key)}
              </span>
            );
          })}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>◉ {me?.locationLabel || t('profile.defaultLocation')}</span>
          <span
            onClick={install}
            className="dw-install-btn"
            style={{
              border: '1.5px solid var(--accent)',
              color: 'var(--accent)',
              borderRadius: 13,
              padding: '7px 14px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t('promo.installAppCta')}
          </span>
          <div
            onClick={() => navigate('/profile')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 14,
              background: stripes(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#fff',
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: pathname === '/profile' ? '0 0 0 2.5px var(--accent)' : 'none',
            }}
          >
            {initials(me?.name)}
          </div>
        </div>
      </div>
    </div>
  );
}
