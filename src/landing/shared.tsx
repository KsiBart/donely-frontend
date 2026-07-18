import type { CSSProperties } from 'react';
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

  const wrap: CSSProperties = { display: 'flex', background: 'var(--surface2)', borderRadius: 12, padding: 3 };
  const pill = (active: boolean): CSSProperties => ({
    padding: '6px 11px',
    borderRadius: 9,
    fontSize: 12.5,
    fontWeight: 800,
    cursor: 'pointer',
    background: active ? 'var(--surface)' : 'transparent',
    color: active ? 'var(--acc)' : 'var(--muted2)',
    boxShadow: active ? '0 2px 6px rgba(74,52,102,.15)' : 'none',
  });

  return (
    <div style={wrap}>
      {SUPPORTED_LANGS.map((l) => (
        <span key={l} {...clickable(() => void i18n.changeLanguage(l), { pressed: lang === l })} style={pill(lang === l)}>
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
      style={{
        width: 34,
        height: 34,
        borderRadius: 11,
        background: 'var(--surface2)',
        color: 'var(--ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: 16,
        lineHeight: 1,
        flex: 'none',
      }}
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
    <div
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 28,
        background: '#221d2b',
        color: '#fff',
        borderRadius: 16,
        padding: '12px 22px',
        fontSize: 13,
        fontWeight: 600,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        animation: 'dwfade .25s ease',
        zIndex: 1000,
        boxShadow: '0 12px 30px rgba(0,0,0,.22)',
      }}
    >
      {toast}
    </div>
  );
}
