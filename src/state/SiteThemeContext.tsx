import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Dark-mode toggle for the MARKETING site only (landing `/`, the 9 subpages, `/login`) —
 * donely-landing.dc.html's `.dt[data-dk="1"]` token set. Deliberately independent from the
 * authenticated app's own theming (global.css `:root` vars) per CLAUDE.md build brief §4:
 * "this is the marketing-site theme; the in-app screens keep their own existing theming."
 * Persisted to localStorage so it survives a reload / navigation between marketing pages.
 *
 * `VITE_FORCE_DARK=true` overrides all of the above: the site is ALWAYS dark (localStorage is
 * ignored entirely — never read, never written) and `forced: true` is exposed on the context so
 * `DarkModeToggle` can hide itself (there's nothing to toggle). This is a reversible, env-only
 * knob — unset it (the default) and behavior is byte-identical to before this existed.
 */
const KEY = 'donely_site_dark';

const FORCE_DARK = import.meta.env.VITE_FORCE_DARK === 'true';

function readStored(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

interface SiteThemeValue {
  dark: boolean;
  toggle: () => void;
  /** True when `VITE_FORCE_DARK=true` pinned `dark` to `true` — consumers (e.g. the toggle
   * button) use this to hide themselves rather than offer a no-op control. */
  forced: boolean;
}

const SiteThemeCtx = createContext<SiteThemeValue>({ dark: false, toggle: () => {}, forced: false });

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState<boolean>(() => (FORCE_DARK ? true : readStored()));

  useEffect(() => {
    if (FORCE_DARK) return; // never touch localStorage while forced — keeps this fully reversible
    try {
      localStorage.setItem(KEY, dark ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
  }, [dark]);

  const toggle = useCallback(() => {
    if (FORCE_DARK) return;
    setDark((d) => !d);
  }, []);
  const value = useMemo(() => ({ dark: FORCE_DARK ? true : dark, toggle, forced: FORCE_DARK }), [dark, toggle]);

  return <SiteThemeCtx.Provider value={value}>{children}</SiteThemeCtx.Provider>;
}

export function useSiteTheme(): SiteThemeValue {
  return useContext(SiteThemeCtx);
}
