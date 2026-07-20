import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
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
  if (type === 'heart')
    return (
      <span aria-hidden="true" className="text-[18px] leading-[20px]">
        ♡
      </span>
    );
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
    <nav aria-label={t('a11y.primaryNav', 'Nawigacja')} className="flex-none flex bg-surface border-t border-border px-2 pt-2.5 pb-4.5">
      {ITEMS.map((item) => {
        const active = pathname === item.path;
        return (
          <div
            key={item.path}
            {...clickable(() => navigate(item.path))}
            className={clsx('flex-1 flex flex-col items-center gap-0.75 cursor-pointer', active ? 'text-accent' : 'text-[var(--navmuted)]')}
          >
            <Icon type={item.icon} />
            <span className={clsx('text-[10.5px]', active ? 'font-bold' : 'font-semibold')}>{t(item.key)}</span>
          </div>
        );
      })}
    </nav>
  );
}
