import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useProviderRequestsQuery } from '../../api/hooks';
import { clickable } from '../../lib/a11y';

const ITEMS: { key: string; path: string; icon: 'grid' | 'inbox' | 'cal' | 'wallet' | 'user' }[] = [
  { key: 'pro.nav.dashboard', path: '/pro', icon: 'grid' },
  { key: 'pro.nav.requests', path: '/pro/requests', icon: 'inbox' },
  { key: 'pro.nav.calendar', path: '/pro/calendar', icon: 'cal' },
  { key: 'pro.nav.payouts', path: '/pro/payouts', icon: 'wallet' },
  { key: 'pro.nav.profile', path: '/pro/profile', icon: 'user' },
];

function Icon({ type }: { type: 'grid' | 'inbox' | 'cal' | 'wallet' | 'user' }) {
  if (type === 'grid')
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  if (type === 'inbox')
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M2.5 11.5l2-6.7A1.5 1.5 0 0 1 5.94 3.7h8.12a1.5 1.5 0 0 1 1.44 1.1l2 6.7v3.5a1.3 1.3 0 0 1-1.3 1.3H3.8a1.3 1.3 0 0 1-1.3-1.3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M2.5 11.5h4.2c.3 0 .5.2.6.4l.5 1.3c.1.3.4.4.6.4h2.2c.3 0 .5-.2.6-.4l.5-1.3c.1-.3.4-.4.6-.4h4.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  if (type === 'cal')
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <rect x="2.5" y="4" width="15" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="2.5" y1="8.5" x2="17.5" y2="8.5" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  if (type === 'wallet')
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <rect x="2.5" y="5" width="15" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M2.5 8.5h15" stroke="currentColor" strokeWidth="2" />
        <circle cx="14" cy="12" r="1.4" fill="currentColor" />
      </svg>
    );
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="6.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3.5 17.5c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Bottom nav for pro mode — same visual language/structure as `mobile/BottomNav.tsx` (customer
 * app), just pro's 5 sections. "Zlecenia" carries a live badge (count of `status === 'new'`
 * requests) so a provider notices incoming work without opening the tab. */
export default function ProNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: requestsData } = useProviderRequestsQuery();
  const newCount = (requestsData ?? []).filter((r) => r.status === 'new').length;

  return (
    <nav aria-label={t('a11y.primaryNav', 'Nawigacja')} className="flex-none flex bg-surface border-t border-border px-2 pt-[10px] pb-[18px]">
      {ITEMS.map((item) => {
        const active = pathname === item.path;
        return (
          <div
            key={item.path}
            {...clickable(() => navigate(item.path))}
            className={clsx('relative flex-1 flex flex-col items-center gap-[3px] cursor-pointer', active ? 'text-accent' : 'text-[var(--navmuted)]')}
          >
            <span className="relative">
              <Icon type={item.icon} />
              {item.icon === 'inbox' && newCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-danger text-white text-[9.5px] font-bold flex items-center justify-center leading-none"
                >
                  {newCount > 9 ? '9+' : newCount}
                </span>
              )}
            </span>
            <span className={clsx('text-[10.5px]', active ? 'font-bold' : 'font-semibold')}>{t(item.key)}</span>
          </div>
        );
      })}
    </nav>
  );
}
