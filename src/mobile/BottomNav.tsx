import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clickable } from '../lib/a11y';

const ITEMS: { key: string; path: string; icon: 'search' | 'cal' | 'heart' | 'user' }[] = [
  { key: 'nav.search', path: '/', icon: 'search' },
  { key: 'nav.bookings', path: '/bookings', icon: 'cal' },
  { key: 'nav.favorites', path: '/favorites', icon: 'heart' },
  { key: 'nav.profile', path: '/profile', icon: 'user' },
];

function Icon({ type }: { type: 'search' | 'cal' | 'heart' | 'user' }) {
  if (type === 'search')
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="13.5" y1="13.5" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  if (type === 'cal')
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <rect x="2.5" y="4" width="15" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="2.5" y1="8.5" x2="17.5" y2="8.5" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  if (type === 'heart') return <span aria-hidden="true" style={{ fontSize: 18, lineHeight: '20px' }}>♡</span>;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="6.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3.5 17.5c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BottomNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      aria-label={t('a11y.primaryNav', 'Nawigacja')}
      style={{
        flex: 'none',
        display: 'flex',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '10px 8px 18px',
      }}
    >
      {ITEMS.map((item) => {
        const active = pathname === item.path;
        return (
          <div
            key={item.path}
            {...clickable(() => navigate(item.path))}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              color: active ? 'var(--accent)' : 'var(--navmuted)',
              cursor: 'pointer',
            }}
          >
            <Icon type={item.icon} />
            <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 600 }}>{t(item.key)}</span>
          </div>
        );
      })}
    </nav>
  );
}
