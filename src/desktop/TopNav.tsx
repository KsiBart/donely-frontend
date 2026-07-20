import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Logo, stripes, Wordmark } from '../components/ui';
import { useAuth } from '../state/AuthContext';
import { useInstallAction } from '../components/AppPromo';
import { initials } from '../lib/format';
import { clickable } from '../lib/a11y';

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

  return (
    <div className="flex-none bg-surface border-b border-border">
      <div className="max-w-[1120px] mx-auto flex items-center gap-[26px] px-[28px] py-[14px]">
        <div {...clickable(() => navigate('/'))} className="flex items-center gap-[9px] flex-none cursor-pointer">
          <Logo size={30} />
          <Wordmark size={19} />
        </div>
        <nav aria-label={t('a11y.primaryNav', 'Nawigacja')} className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.path;
            return (
              <span
                key={link.path}
                {...clickable(() => navigate(link.path))}
                className={clsx(
                  'dw-nav-pill py-2 px-3.5 rounded-xl text-[13.5px] font-bold cursor-pointer',
                  active ? 'bg-[var(--app-tint)] text-accent' : 'bg-transparent text-muted2',
                )}
              >
                {t(link.key)}
              </span>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-[12.5px] text-muted">
            <span aria-hidden="true">◉</span> {me?.locationLabel || t('profile.defaultLocation')}
          </span>
          <span
            {...clickable(install)}
            className="dw-install-btn border-[1.5px] border-accent text-accent rounded-[13px] py-[7px] px-3.5 text-[12.5px] font-bold cursor-pointer"
          >
            {t('promo.installAppCta')}
          </span>
          <div
            {...clickable(() => navigate('/profile'), { label: t('title.profile') })}
            className={clsx(
              'w-9 h-9 rounded-[14px] flex items-center justify-center font-bold text-white text-[13px] cursor-pointer',
              pathname === '/profile' ? 'shadow-[0_0_0_2.5px_var(--accent)]' : 'shadow-none',
            )}
            // eslint-disable-next-line react/no-inline-styles -- dynamic: stripes() generates a randomized-looking repeating-gradient string at call time
            style={{ background: stripes() }}
          >
            {initials(me?.name)}
          </div>
        </div>
      </div>
    </div>
  );
}
