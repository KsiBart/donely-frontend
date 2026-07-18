import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BRICO } from '../lib/format';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';

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

/** Post-login location ask ("Gdzie jesteś?") — shown until the profile has a location. */
export function LocationScreen() {
  const { t } = useTranslation();
  const { updateMe } = useAuth();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const shareLocation = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await updateMe({ locationLabel: 'Mokotów, Warszawa', lat: 52.1935, lng: 21.0355 });
      showToast(t('auth.location.setToast', { place: 'Mokotów' }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('auth.location.saveFailed'));
    } finally {
      setBusy(false);
    }
  };

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
        <div style={{ fontFamily: BRICO, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{t('auth.location.title')}</div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 18 }}>
          {t('auth.location.subtitle')}
        </div>
        <div
          onClick={() => void shareLocation()}
          style={{
            textAlign: 'center',
            background: 'var(--accent)',
            color: 'var(--onaccent)',
            borderRadius: 18,
            padding: 14,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--glow)',
          }}
        >
          {t('auth.location.share')}
        </div>
        <div
          onClick={() => void shareLocation()}
          style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginTop: 12, cursor: 'pointer' }}
        >
          {t('auth.location.manual')}
        </div>
      </div>
    </div>
  );
}
