/**
 * Theme accent — 100% frontend-owned, swappable by env, no code edit and no backend
 * involvement (mirrors the brand-name split in `src/brand.ts`).
 *
 * HOW TO ADD A PALETTE
 *   1. Add a `Palette` entry to `PALETTES` below: `accent` (the primary hue), `accentHover`/
 *      `accentInk` (darker shades for hover states / text-on-light-bg), `onAccent` (text color
 *      that sits ON a solid accent fill — usually white, or dark for light accents like amber),
 *      `tint`/`tintBorder` (a very light accent-tinted background + its border), `glow` (an rgba
 *      accent shadow, ~30% alpha), the `*Dk` dark-mode accent set (see below), and `bgDk`/
 *      `bgGradDk`/`gradDk` (the marketing site's dark page background + primary-CTA gradient —
 *      most palettes reuse the shared near-black default and derive `gradDk` from their own
 *      accentDk/accentHoverDk; a palette can override both for a fully bespoke dark look, e.g.
 *      `orange`).
 *   2. Add the new name to the `ThemeName` union.
 *   3. Document the new value in `.env.example`'s `VITE_THEME` comment.
 *
 * THE TWO ENVS
 *   - `VITE_THEME` — selects a palette by name. Default `'violet'` (the original Donely design).
 *   - `VITE_ACCENT` — optional hex. Overrides just the resolved palette's `accent` field, leaving
 *     every other derived value (hover/ink/tint/glow/...) alone. A convenience for a one-off
 *     accent tweak without hand-picking every derived shade.
 *
 * APPLICATION
 *   `applyTheme()` is called once at boot, in `main.tsx`, BEFORE the first render. It sets CSS
 *   custom properties on `document.documentElement` (`:root`): `--accent`, `--accent-hover`,
 *   `--accent-ink`, `--on-accent`, `--accent-tint`, `--accent-tint-border`, `--accent-glow`.
 *   Properties set inline on an element always win over a stylesheet rule targeting the same
 *   element/selector (regardless of stylesheet source order or specificity ties), so this
 *   repaints every consumer without touching a single component:
 *     - `src/styles/global.css`'s `:root` (`--accent`/`--onaccent`) — the authenticated app.
 *     - `src/landing/landing.css`'s `.dt` (light) tokens (`--acc`/`--accHover`/…) AND its
 *       `.dt[data-dk="1"]` (dark) tokens via the `--accent-*-dk` set — so a theme swap recolors
 *       the marketing site + subpages in BOTH light and dark mode. Each palette carries its own
 *       dark accent (lighter, contrast-tuned for near-black); violet's = the original design's.
 */

export interface Palette {
  accent: string;
  accentHover: string;
  accentInk: string;
  onAccent: string;
  tint: string;
  tintBorder: string;
  glow: string;
  // Dark-mode accent set (marketing site's `.dt[data-dk="1"]`). Dark backgrounds need a LIGHTER
  // accent for contrast, a light accent-tint text (`accentInkDk`), and dark text on the (now
  // lighter) accent fill (`onAccentDk`). tintDk/tintBorderDk are low-alpha accent washes.
  accentDk: string;
  accentHoverDk: string;
  accentInkDk: string;
  onAccentDk: string;
  tintDk: string;
  tintBorderDk: string;
  // Dark-mode page background + primary-CTA gradient (marketing site's `.dt[data-dk="1"]`).
  // `bgDk` is the solid dark background; `bgGradDk` may be a gradient (usually layered radial
  // glows over `bgDk`); `gradDk` is the background used on PRIMARY call-to-action buttons in dark
  // mode (a gradient built from this palette's own dark accent shades, or a bespoke one for themes
  // that want a specific two-tone CTA look, e.g. `orange`).
  bgDk: string;
  bgGradDk: string;
  gradDk: string;
}

export type ThemeName = 'violet' | 'teal' | 'blue' | 'rose' | 'emerald' | 'amber' | 'orange';

/** DEFAULT is `violet` — keep it exactly equal to today's design; every other palette is a suggestion. */
export const PALETTES: Record<ThemeName, Palette> = {
  violet: {
    accent: '#7a4fc0',
    accentHover: '#6a41ad',
    accentInk: '#6a41ad',
    onAccent: '#fff',
    tint: '#f1ebf7',
    tintBorder: '#e4d9f2',
    glow: 'rgba(122, 79, 192, .32)',
    // = today's hand-tuned dark shades (kept identical so the default dark mode is unchanged).
    accentDk: '#b58ae6',
    accentHoverDk: '#c9a6f0',
    accentInkDk: '#d9c9ef',
    onAccentDk: '#1a1420',
    tintDk: 'rgba(181, 138, 230, .15)',
    tintBorderDk: 'rgba(181, 138, 230, .28)',
    bgDk: '#141118',
    bgGradDk: 'linear-gradient(180deg, #231b31 0%, #191521 40%, #141118 70%)',
    gradDk: 'linear-gradient(160deg, #c9a6f0, #b58ae6)',
  },
  teal: {
    accent: '#2f9c8f',
    accentHover: '#268276',
    accentInk: '#1f6f65',
    onAccent: '#fff',
    tint: '#e3f4f1',
    tintBorder: '#c9e9e3',
    glow: 'rgba(47, 156, 143, .30)',
    accentDk: '#5cc8b8',
    accentHoverDk: '#7ad6c8',
    accentInkDk: '#b6e8e0',
    onAccentDk: '#0d1f1c',
    tintDk: 'rgba(92, 200, 184, .15)',
    tintBorderDk: 'rgba(92, 200, 184, .28)',
    bgDk: '#141118',
    bgGradDk: 'linear-gradient(180deg, #231b31 0%, #191521 40%, #141118 70%)',
    gradDk: 'linear-gradient(160deg, #7ad6c8, #5cc8b8)',
  },
  blue: {
    accent: '#4a6fd9',
    accentHover: '#3a5bc0',
    accentInk: '#33509e',
    onAccent: '#fff',
    tint: '#e8edfb',
    tintBorder: '#d3ddf6',
    glow: 'rgba(74, 111, 217, .30)',
    accentDk: '#8aa4ee',
    accentHoverDk: '#a6bcf4',
    accentInkDk: '#cdd9f7',
    onAccentDk: '#111a30',
    tintDk: 'rgba(138, 164, 238, .15)',
    tintBorderDk: 'rgba(138, 164, 238, .28)',
    bgDk: '#141118',
    bgGradDk: 'linear-gradient(180deg, #231b31 0%, #191521 40%, #141118 70%)',
    gradDk: 'linear-gradient(160deg, #a6bcf4, #8aa4ee)',
  },
  rose: {
    accent: '#d6608a',
    accentHover: '#c04d78',
    accentInk: '#a53d63',
    onAccent: '#fff',
    tint: '#fbe9f0',
    tintBorder: '#f3d3e0',
    glow: 'rgba(214, 96, 138, .30)',
    accentDk: '#eb8fb0',
    accentHoverDk: '#f2adc6',
    accentInkDk: '#f7d0de',
    onAccentDk: '#2a1119',
    tintDk: 'rgba(235, 143, 176, .15)',
    tintBorderDk: 'rgba(235, 143, 176, .28)',
    bgDk: '#141118',
    bgGradDk: 'linear-gradient(180deg, #231b31 0%, #191521 40%, #141118 70%)',
    gradDk: 'linear-gradient(160deg, #f2adc6, #eb8fb0)',
  },
  emerald: {
    accent: '#3e9a5e',
    accentHover: '#33864f',
    accentInk: '#2b6f42',
    onAccent: '#fff',
    tint: '#e4f2e8',
    tintBorder: '#cfe7d6',
    glow: 'rgba(62, 154, 94, .30)',
    accentDk: '#6fca8b',
    accentHoverDk: '#8ed9a3',
    accentInkDk: '#c4ecd0',
    onAccentDk: '#0e2016',
    tintDk: 'rgba(111, 202, 139, .15)',
    tintBorderDk: 'rgba(111, 202, 139, .28)',
    bgDk: '#141118',
    bgGradDk: 'linear-gradient(180deg, #231b31 0%, #191521 40%, #141118 70%)',
    gradDk: 'linear-gradient(160deg, #8ed9a3, #6fca8b)',
  },
  amber: {
    accent: '#e0913c',
    accentHover: '#c67d2f',
    accentInk: '#a76626',
    onAccent: '#2a2430',
    tint: '#fbeedd',
    tintBorder: '#f3ddc0',
    glow: 'rgba(224, 145, 60, .30)',
    accentDk: '#eeb15f',
    accentHoverDk: '#f3c483',
    accentInkDk: '#f7dcb6',
    onAccentDk: '#2a1c08',
    tintDk: 'rgba(238, 177, 95, .15)',
    tintBorderDk: 'rgba(238, 177, 95, .28)',
    bgDk: '#141118',
    bgGradDk: 'linear-gradient(180deg, #231b31 0%, #191521 40%, #141118 70%)',
    gradDk: 'linear-gradient(160deg, #f3c483, #eeb15f)',
  },
  // "Orange dark" marketing theme (matches simplybj.com) — the only palette whose bgDk/bgGradDk
  // depart from the shared near-black-violet default, and whose gradDk is a bespoke coral→orange
  // 2-stop gradient (not derived from accentDk/accentHoverDk like the other palettes).
  orange: {
    accent: '#f2732e',
    accentHover: '#e0631f',
    accentInk: '#c9541a',
    onAccent: '#fff',
    tint: '#fdecdf',
    tintBorder: '#f8d4bd',
    glow: 'rgba(242, 115, 46, .3)',
    accentDk: '#ff8c4d',
    accentHoverDk: '#ff9d63',
    accentInkDk: '#ffcda6',
    onAccentDk: '#221b12',
    tintDk: 'rgba(255, 140, 77, .15)',
    tintBorderDk: 'rgba(255, 140, 77, .30)',
    bgDk: '#0f1117',
    bgGradDk:
      'radial-gradient(900px 520px at 80% 18%, rgba(255,120,60,.18), transparent 60%), radial-gradient(760px 520px at 8% 92%, rgba(255,90,70,.12), transparent 60%), #0f1117',
    gradDk: 'linear-gradient(160deg, #ff4f56 12%, #ff8c4d 94%)',
  },
};

const DEFAULT_THEME: ThemeName = 'violet';

function isThemeName(name: string): name is ThemeName {
  return Object.prototype.hasOwnProperty.call(PALETTES, name);
}

/** Resolves the active palette from `VITE_THEME` (+ optional `VITE_ACCENT` accent override). */
export function resolveTheme(): Palette {
  const requested = (import.meta.env.VITE_THEME as string | undefined)?.trim().toLowerCase();
  const base = requested && isThemeName(requested) ? PALETTES[requested] : PALETTES[DEFAULT_THEME];
  const accentOverride = (import.meta.env.VITE_ACCENT as string | undefined)?.trim();
  return accentOverride ? { ...base, accent: accentOverride } : base;
}

/** Palette field → the CSS custom property it's written to on `:root`. */
const CSS_VAR_NAMES: Record<keyof Palette, string> = {
  accent: '--accent',
  accentHover: '--accent-hover',
  accentInk: '--accent-ink',
  onAccent: '--on-accent',
  tint: '--accent-tint',
  tintBorder: '--accent-tint-border',
  glow: '--accent-glow',
  accentDk: '--accent-dk',
  accentHoverDk: '--accent-hover-dk',
  accentInkDk: '--accent-ink-dk',
  onAccentDk: '--on-accent-dk',
  tintDk: '--accent-tint-dk',
  tintBorderDk: '--accent-tint-border-dk',
  bgDk: '--site-bg-dk',
  bgGradDk: '--site-bggrad-dk',
  gradDk: '--accent-grad-dk',
};

/** Sets the resolved palette as CSS custom properties on `document.documentElement`. Call once at boot. */
export function applyTheme(palette: Palette = resolveTheme()): void {
  const root = document.documentElement;
  (Object.keys(CSS_VAR_NAMES) as (keyof Palette)[]).forEach((key) => {
    root.style.setProperty(CSS_VAR_NAMES[key], palette[key]);
  });
}
