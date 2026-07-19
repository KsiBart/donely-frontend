import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { BRICO } from '../lib/format';
import { useIsDesktop } from '../lib/useIsDesktop';
import { useLocate } from '../lib/useLocate';
import { clickable } from '../lib/a11y';

/**
 * NOTE: the old passwordless email/OTP login UI that used to live in this file (default export
 * `AuthFlow`, steps 'welcome'/'email'/'code') was replaced by the split-panel flow at
 * `/login` (`src/landing/AuthPage.tsx`) — see CLAUDE.md/PLAN.md landing-page work. Only the
 * post-login "share your location" gate stays here, byte-identical, since MobileApp still
 * renders it (for a logged-in user without a `locationLabel`) inside the existing app chrome.
 */
function MapBackdrop({ pinTop }: { pinTop?: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="absolute inset-0 bg-[var(--map)]">
      <div className="absolute -left-[20%] top-[26%] w-[140%] h-[26px] bg-[var(--road)] rotate-[-8deg]" />
      <div className="absolute left-[55%] -top-[10%] w-[22px] h-[120%] bg-[var(--road)] rotate-[12deg]" />
      {pinTop && (
        <div className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-full flex flex-col items-center">
          <span className="bg-accent text-onaccent rounded-[14px] px-3 py-1.5 text-[12.5px] font-bold shadow-[var(--glow)]">
            {t('auth.location.pin')}
          </span>
          <span className="w-[3px] h-[14px] bg-accent" />
          <span className="w-3 h-3 rounded-full bg-accent animate-[ptpulse_1.6s_infinite]" />
        </div>
      )}
      {!pinTop && <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_20%,var(--bg)_62%)]" />}
    </div>
  );
}

/** Copy + actions shared by the desktop and mobile LocationScreen cards. GPS share (real browser
 * geolocation via useLocate) + a manual address field that forward-geocodes. `compact` = mobile. */
function LocationCardBody({ compact }: { compact: boolean }) {
  const { t } = useTranslation();
  const { busy, useCurrent, useManual } = useLocate();
  const [manualMode, setManualMode] = useState(false);
  const [addr, setAddr] = useState('');

  const submitManual = () => {
    void useManual(addr);
  };

  return (
    <>
      <h1
        style={{ fontFamily: BRICO }} // eslint-disable-line react/no-inline-styles -- dynamic: font-family constant from lib/format.ts, not a Tailwind token
        className={clsx('font-bold mt-0', compact ? 'text-[22px] mb-2' : 'text-[26px] mb-2.5')}
      >
        {t('auth.location.title')}
      </h1>
      <div className={clsx('text-[var(--muted)] leading-[1.55]', compact ? 'text-[13.5px] mb-[18px]' : 'text-[14.5px] mb-6')}>
        {t('auth.location.subtitle')}
      </div>
      <div
        {...clickable(() => void useCurrent())}
        className={clsx(
          'text-center bg-accent text-onaccent rounded-[18px] font-bold shadow-[var(--glow)]',
          compact ? 'p-3.5 text-[15px]' : 'p-[15px] text-[15.5px]',
          busy ? 'cursor-default opacity-70' : 'cursor-pointer',
        )}
      >
        {busy ? t('auth.location.locating') : t('auth.location.share')}
      </div>

      {manualMode ? (
        <div className="mt-3.5">
          <input
            value={addr}
            autoFocus
            onChange={(e) => setAddr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitManual();
            }}
            placeholder={t('auth.location.manualPlaceholder')}
            aria-label={t('auth.location.manualPlaceholder')}
            className="w-full box-border border-[1.5px] border-border bg-surface2 text-text rounded-[14px] py-[13px] px-3.5 text-[14.5px] outline-none"
          />
          <div
            {...clickable(submitManual)}
            className={clsx(
              'text-center mt-2.5 bg-surface2 text-accent border-[1.5px] border-accent rounded-[14px] p-3 text-sm font-bold',
              busy ? 'cursor-default opacity-70' : 'cursor-pointer',
            )}
          >
            {busy ? t('auth.location.locating') : t('auth.location.manualConfirm')}
          </div>
        </div>
      ) : (
        <div
          {...clickable(() => setManualMode(true))}
          className={clsx('text-center font-bold text-accent cursor-pointer', compact ? 'text-[13px] mt-3' : 'text-[13.5px] mt-3.5')}
        >
          {t('auth.location.manual')}
        </div>
      )}
    </>
  );
}

/** Post-login location ask ("Gdzie jesteś?") — shown until the profile has a location. */
export function LocationScreen() {
  const isDesktop = useIsDesktop();

  // Phase 2.5 — Web Desktop: no small phone-card here. Full-viewport map backdrop (same
  // MapBackdrop as mobile) with a single floating card holding the same copy/actions.
  if (isDesktop) {
    return (
      <div className="fixed inset-0 overflow-hidden animate-[dwfade_.3s_ease]">
        <MapBackdrop pinTop />
        <div className="absolute left-[8%] top-1/2 -translate-y-1/2 w-full max-w-[440px] bg-surface text-text rounded-[26px] pt-8 px-[30px] pb-[34px] shadow-[var(--shadow)] z-[1]">
          <LocationCardBody compact={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col animate-[dwfade_.3s_ease]">
      <div className="flex-1 relative bg-[var(--map)] overflow-hidden">
        <MapBackdrop pinTop />
      </div>
      <div className="flex-none pt-[22px] px-7 pb-11 bg-surface rounded-t-[26px] -mt-6 relative shadow-[var(--shadow)]">
        <LocationCardBody compact />
      </div>
    </div>
  );
}
