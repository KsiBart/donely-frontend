import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Logo } from '../components/ui';
import { useToast } from '../state/ToastContext';

const BANNER_KEY = 'donely_install_banner_dismissed';
const DESKTOP_BANNER_KEY = 'donely_install_banner_dismissed_desktop';

export function useInstallAction() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  return () => showToast(t('promo.installToast'));
}

/** Dismissible install suggestion banner shown at the top of the mobile web app. */
export function InstallBanner() {
  const { t } = useTranslation();
  const install = useInstallAction();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BANNER_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(BANNER_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#f1ebf7',
        borderBottom: '1px solid #e4d9f2',
        padding: '9px 14px',
        animation: 'dwfade .3s ease',
      }}
    >
      <Logo size={26} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 11.5, lineHeight: 1.35, color: '#544963' }}>
        <Trans i18nKey="promo.bannerText">
          Pobierz aplikację, aby dostawać <b>powiadomienia push</b> o rezerwacjach i wycenach
        </Trans>
      </span>
      <span onClick={install} style={{ flex: 'none', color: 'var(--accent)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
        {t('promo.download')}
      </span>
      <span
        onClick={dismiss}
        style={{ flex: 'none', color: 'var(--navmuted)', fontSize: 14, cursor: 'pointer', padding: '2px 2px 2px 6px' }}
      >
        ✕
      </span>
    </div>
  );
}

/** Desktop equivalent of InstallBanner — dismissible banner ABOVE the top nav (design copy). */
export function DesktopPromoBanner() {
  const { t } = useTranslation();
  const install = useInstallAction();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DESKTOP_BANNER_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DESKTOP_BANNER_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        background: '#f1ebf7',
        borderBottom: '1px solid #e4d9f2',
        padding: '8px 24px',
        animation: 'dwfade .3s ease',
      }}
    >
      <Logo size={22} />
      <span style={{ fontSize: 12.5, color: '#544963' }}>
        <Trans i18nKey="promo.desktopBannerText">
          Masz telefon pod ręką? Pobierz aplikację, aby dostawać <b>powiadomienia push</b> o rezerwacjach i wycenach
        </Trans>
      </span>
      <span onClick={install} style={{ flex: 'none', color: 'var(--accent)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
        {t('promo.download')}
      </span>
      <span
        onClick={dismiss}
        style={{ flex: 'none', color: 'var(--navmuted)', fontSize: 14, cursor: 'pointer', padding: '2px 2px 2px 10px' }}
      >
        ✕
      </span>
    </div>
  );
}

/** Soft "Wolisz aplikację?" card with store badges, shown after the provider list. */
export function StoreCard() {
  const { t } = useTranslation();
  const install = useInstallAction();
  return (
    <div
      style={{
        marginTop: 18,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logo size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t('promo.storeCardTitle')}</div>
          <div style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.45, marginTop: 2 }}>
            <Trans i18nKey="promo.storeCardBody">
              Wersja web ma pełną funkcjonalność. Aplikacja dodaje <b>powiadomienia push</b> w czasie rzeczywistym —
              o potwierdzeniach, wycenach i przypomnieniach.
            </Trans>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <div onClick={install} style={{ flex: 1, background: '#17141c', color: '#fff', borderRadius: 12, padding: '7px 11px', cursor: 'pointer' }}>
          <div style={{ fontSize: 9, color: '#a89fb8' }}>{t('promo.appStoreLine1')}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{t('promo.appStoreLine2')}</div>
        </div>
        <div onClick={install} style={{ flex: 1, background: '#17141c', color: '#fff', borderRadius: 12, padding: '7px 11px', cursor: 'pointer' }}>
          <div style={{ fontSize: 9, color: '#a89fb8' }}>{t('promo.googlePlayLine1')}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{t('promo.googlePlayLine2')}</div>
        </div>
      </div>
    </div>
  );
}
