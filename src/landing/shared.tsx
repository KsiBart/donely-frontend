import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS, type Lang } from '../i18n';
import { useSiteTheme } from '../state/SiteThemeContext';
import { clickable } from '../lib/a11y';

/**
 * PL/EN pill toggle for the marketing Landing page + split-panel auth (donely-landing.dc.html
 * header / auth form-panel). Uses the SAME i18next instance + `changeLanguage` call as
 * `ProfileTab`/`AdminApp` — language persists to localStorage via i18n/index.ts's
 * `languageChanged` listener, so toggling here carries into the authenticated app and back.
 * Uses the `.dt` marketing-theme tokens (--surface2/--surface/--acc/--muted2) so it reads
 * correctly in both light and dark mode.
 */
export function LangToggle() {
  const { i18n } = useTranslation();
  const lang = (i18n.language as Lang) ?? 'pl';

  const wrap = 'flex bg-surface2 rounded-xl p-[3px]';
  const pill = (active: boolean) =>
    clsx(
      'p-[6px_11px] rounded-[9px] text-[12.5px] font-extrabold cursor-pointer',
      active ? 'bg-surface text-[var(--acc)] shadow-[0_2px_6px_rgba(74,52,102,.15)]' : 'bg-transparent text-muted2 shadow-none',
    );

  return (
    <div className={wrap}>
      {SUPPORTED_LANGS.map((l) => (
        <span key={l} {...clickable(() => void i18n.changeLanguage(l), { pressed: lang === l })} className={pill(lang === l)}>
          {l.toUpperCase()}
        </span>
      ))}
    </div>
  );
}

/** Dark-mode (☀/☾) toggle — donely-landing.dc.html header/auth `toggleDk`. Marketing site only.
 * Renders nothing when the theme is pinned via `VITE_FORCE_DARK=true` (see SiteThemeContext) —
 * there's nothing to toggle, so the control is hidden rather than shown disabled. */
export function DarkModeToggle() {
  const { dark, toggle, forced } = useSiteTheme();
  const { t } = useTranslation();
  if (forced) return null;
  return (
    <span
      {...clickable(toggle, { label: t('landing.darkModeToggle') })}
      className="w-[34px] h-[34px] rounded-[11px] bg-surface2 text-[var(--ink)] flex items-center justify-center cursor-pointer text-base leading-none flex-none"
    >
      {dark ? '☀' : '☾'}
    </span>
  );
}

/** Floating toast bubble — same look as MobileApp's, reused here since Landing/AuthPage render
 * full-bleed outside the .mobile-shell/.desktop-shell chrome that normally hosts it. */
export function ToastBubble({ toast }: { toast: string | null }) {
  if (!toast) return null;
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-7 bg-[#221d2b] text-white rounded-2xl p-[12px_22px] text-[13px] font-semibold text-center whitespace-nowrap animate-[dwfade_0.25s_ease] z-[1000] shadow-[0_12px_30px_rgba(0,0,0,.22)]">
      {toast}
    </div>
  );
}
