import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Logo } from './ui';
import { useToast } from '../state/ToastContext';
import { clickable } from '../lib/a11y';

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
    <div className="flex-none flex items-center gap-2.5 bg-[var(--app-tint)] border-b border-[var(--app-tint-border)] py-[9px] px-3.5 animate-[dwfade_.3s_ease]">
      <Logo size={26} />
      <span className="flex-1 min-w-0 text-[11.5px] leading-[1.35] text-muted2">
        <Trans i18nKey="promo.bannerText">
          Pobierz aplikację, aby dostawać <b>powiadomienia push</b> o rezerwacjach i wycenach
        </Trans>
      </span>
      <span {...clickable(install)} className="flex-none text-accent text-xs font-bold cursor-pointer">
        {t('promo.download')}
      </span>
      <span {...clickable(dismiss, { label: t('a11y.dismiss', 'Zamknij') })} className="flex-none text-[var(--navmuted)] text-sm cursor-pointer pl-1.5 py-0.5 pr-0.5">
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
    <div className="flex-none flex items-center justify-center gap-2.5 bg-[var(--app-tint)] border-b border-[var(--app-tint-border)] py-2 px-6 animate-[dwfade_.3s_ease]">
      <Logo size={22} />
      <span className="text-[12.5px] text-muted2">
        <Trans i18nKey="promo.desktopBannerText">
          Masz telefon pod ręką? Pobierz aplikację, aby dostawać <b>powiadomienia push</b> o rezerwacjach i wycenach
        </Trans>
      </span>
      <span {...clickable(install)} className="flex-none text-accent text-[12.5px] font-bold cursor-pointer">
        {t('promo.download')}
      </span>
      <span {...clickable(dismiss, { label: t('a11y.dismiss', 'Zamknij') })} className="flex-none text-[var(--navmuted)] text-sm cursor-pointer py-0.5 pr-0.5 pl-2.5">
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
    <div className="mt-[18px] bg-surface border border-border rounded-[20px] p-4">
      <div className="flex items-center gap-2.5">
        <Logo size={34} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[13.5px]">{t('promo.storeCardTitle')}</div>
          <div className="text-xs text-muted2 leading-[1.45] mt-0.5">
            <Trans i18nKey="promo.storeCardBody">
              Wersja web ma pełną funkcjonalność. Aplikacja dodaje <b>powiadomienia push</b> w czasie rzeczywistym —
              o potwierdzeniach, wycenach i przypomnieniach.
            </Trans>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <div {...clickable(install)} className="flex-1 bg-[#17141c] text-white rounded-xl py-[7px] px-[11px] cursor-pointer">
          <div className="text-[9px] text-[#a89fb8]">{t('promo.appStoreLine1')}</div>
          <div className="text-[13px] font-bold">{t('promo.appStoreLine2')}</div>
        </div>
        <div {...clickable(install)} className="flex-1 bg-[#17141c] text-white rounded-xl py-[7px] px-[11px] cursor-pointer">
          <div className="text-[9px] text-[#a89fb8]">{t('promo.googlePlayLine1')}</div>
          <div className="text-[13px] font-bold">{t('promo.googlePlayLine2')}</div>
        </div>
      </div>
    </div>
  );
}
