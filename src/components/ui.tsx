import React from 'react';
import { BRICO } from '../lib/format';

/**
 * "{appName}.app" wordmark (design: header, footer, auth brand panel, TopNav) — the ONE place the
 * wordmark markup lives. Reads `brand.appName` (frontend-owned, VITE_APP_NAME — see `src/brand.ts`)
 * so a white-label re-skin actually changes the mark, not just i18n prose. For the *default* brand
 * name we keep the exact hand-stylized "Done"+"Ly" split (capital L) pixel-identical to the
 * original design; a custom name falls back to a plain last-2-chars split so re-skins still get an
 * accented tail without hand-tuning capitalization per brand.
 * `variant="onDark"` matches the auth panel's gradient background (solid white, no accent tail).
 */
/** Orange→purple gradient for the "AI" so it stands out (clipped to the glyphs). Palindromic
 * (orange → purple → orange) + sized 200% so the `.wordmark-ai` shimmer (keyframe in landing.css,
 * bundled globally; respects prefers-reduced-motion) can flow it seamlessly with no colour jump. */
const AI_GRADIENT: React.CSSProperties = {
  background: 'linear-gradient(90deg,#ff9a3c,#f2732e,#d24d9e,#a855f7,#d24d9e,#f2732e,#ff9a3c)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
  fontWeight: 800,
};

export function Wordmark({ size = 23, variant = 'default' }: { size?: number; variant?: 'default' | 'onDark' }) {
  const base: React.CSSProperties = {
    fontFamily: BRICO,
    fontSize: size,
    fontWeight: 800,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  };
  // Brand: "DoneLy AI" — "Done" in ink/white, "Ly" in the accent, "AI" an orange→purple gradient.
  // No ".app" suffix. `onDark` (auth gradient panel) makes Done/Ly white; the gradient reads on any bg.
  const doneColor = variant === 'onDark' ? '#fff' : 'var(--ink, var(--text))';
  const lyColor = variant === 'onDark' ? 'rgba(255,255,255,.85)' : 'var(--accent)';
  return (
    <span style={base}>
      <span style={{ color: doneColor }}>Done</span>
      <span style={{ color: lyColor }}>Ly</span>
      <span className="wordmark-ai" style={AI_GRADIENT}> AI</span>
    </span>
  );
}

/** Donely logo: circle-check with sparkle (exact SVG from designs). */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ flex: 'none', color: 'var(--accent)' }}>
      <circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="4.5" />
      <path
        d="M15 24.5l6.5 6.5L34 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M40 2l1.7 5.3L47 9l-5.3 1.7L40 16l-1.7-5.3L34 9l5.3-1.7z" fill="currentColor" opacity=".8" />
    </svg>
  );
}

/** AI sparkle icon used in the search bar. */
export function SparkleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ flex: 'none' }}>
      <path d="M8 1l1.6 4.4L14 7l-4.4 1.6L8 13l-1.6-4.4L2 7l4.4-1.6z" fill="var(--accent)" />
    </svg>
  );
}

/** Repeating 45° stripes ph1/ph2 — avatar / photo placeholder background. */
export function stripes(angle = 45, step = 6): string {
  return `repeating-linear-gradient(${angle}deg, var(--ph1), var(--ph1) ${step}px, var(--ph2) ${step}px, var(--ph2) ${step * 2}px)`;
}

export function AvatarTile({
  init,
  size,
  radius,
  fontSize,
  round = false,
}: {
  init: string;
  size: number;
  radius?: number;
  fontSize?: number;
  round?: boolean;
}) {
  return (
    <div
      style={{
        flex: 'none',
        width: size,
        height: size,
        borderRadius: round ? '50%' : (radius ?? 14),
        background: stripes(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        color: '#fff',
        fontSize: fontSize ?? Math.round(size * 0.28),
      }}
    >
      {init}
    </div>
  );
}
