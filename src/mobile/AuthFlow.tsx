import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BRICO } from '../lib/format';
import { useIsDesktop } from '../lib/useIsDesktop';
import { useLocate } from '../lib/useLocate';

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
    <div style={{ position: 'absolute', inset: 0, background: 'var(--map)' }}>
      <div
        style={{
          position: 'absolute',
          left: '-20%',
          top: '26%',
          width: '140%',
          height: 26,
          background: 'var(--road)',
          transform: 'rotate(-8deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '55%',
          top: '-10%',
          width: 22,
          height: '120%',
          background: 'var(--road)',
          transform: 'rotate(12deg)',
        }}
      />
      {pinTop && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '48%',
            transform: 'translate(-50%,-100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              background: 'var(--accent)',
              color: 'var(--onaccent)',
              borderRadius: 14,
              padding: '6px 12px',
              fontSize: 12.5,
              fontWeight: 700,
              boxShadow: 'var(--glow)',
            }}
          >
            {t('auth.location.pin')}
          </span>
          <span style={{ width: 3, height: 14, background: 'var(--accent)' }} />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'var(--accent)',
              animation: 'ptpulse 1.6s infinite',
            }}
          />
        </div>
      )}
      {!pinTop && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 20%, var(--bg) 62%)',
          }}
        />
      )}
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
      <div style={{ fontFamily: BRICO, fontSize: compact ? 22 : 26, fontWeight: 700, marginBottom: compact ? 8 : 10 }}>
        {t('auth.location.title')}
      </div>
      <div style={{ fontSize: compact ? 13.5 : 14.5, color: 'var(--muted)', lineHeight: 1.55, marginBottom: compact ? 18 : 24 }}>
        {t('auth.location.subtitle')}
      </div>
      <div
        onClick={() => void useCurrent()}
        style={{
          textAlign: 'center',
          background: 'var(--accent)',
          color: 'var(--onaccent)',
          borderRadius: 18,
          padding: compact ? 14 : 15,
          fontSize: compact ? 15 : 15.5,
          fontWeight: 700,
          cursor: busy ? 'default' : 'pointer',
          opacity: busy ? 0.7 : 1,
          boxShadow: 'var(--glow)',
        }}
      >
        {busy ? t('auth.location.locating') : t('auth.location.share')}
      </div>

      {manualMode ? (
        <div style={{ marginTop: 14 }}>
          <input
            value={addr}
            autoFocus
            onChange={(e) => setAddr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitManual();
            }}
            placeholder={t('auth.location.manualPlaceholder')}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              border: '1.5px solid var(--border)',
              background: 'var(--surface2)',
              color: 'var(--text)',
              borderRadius: 14,
              padding: '13px 14px',
              fontSize: 14.5,
              outline: 'none',
            }}
          />
          <div
            onClick={submitManual}
            style={{
              textAlign: 'center',
              marginTop: 10,
              background: 'var(--surface2)',
              color: 'var(--accent)',
              border: '1.5px solid var(--accent)',
              borderRadius: 14,
              padding: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: busy ? 'default' : 'pointer',
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? t('auth.location.locating') : t('auth.location.manualConfirm')}
          </div>
        </div>
      ) : (
        <div
          onClick={() => setManualMode(true)}
          style={{ textAlign: 'center', fontSize: compact ? 13 : 13.5, fontWeight: 700, color: 'var(--accent)', marginTop: compact ? 12 : 14, cursor: 'pointer' }}
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
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', animation: 'dwfade .3s ease' }}>
        <MapBackdrop pinTop />
        <div
          style={{
            position: 'absolute',
            left: '8%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '100%',
            maxWidth: 440,
            background: 'var(--surface)',
            color: 'var(--text)',
            borderRadius: 26,
            padding: '32px 30px 34px',
            boxShadow: 'var(--shadow)',
            zIndex: 1,
          }}
        >
          <LocationCardBody compact={false} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', animation: 'dwfade .3s ease' }}>
      <div style={{ flex: 1, position: 'relative', background: 'var(--map)', overflow: 'hidden' }}>
        <MapBackdrop pinTop />
      </div>
      <div
        style={{
          flex: 'none',
          padding: '22px 28px 44px',
          background: 'var(--surface)',
          borderRadius: '26px 26px 0 0',
          marginTop: -24,
          position: 'relative',
          boxShadow: 'var(--shadow)',
        }}
      >
        <LocationCardBody compact />
      </div>
    </div>
  );
}
