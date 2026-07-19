import React from 'react';
import { BRICO } from '../../lib/format';

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
    // eslint-disable-next-line react/no-inline-styles -- dynamic: base merges fontSize from the `size` prop with the BRICO font-family constant, neither expressible as static Tailwind
    <span style={base}>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: color depends on `variant` prop */}
      <span style={{ color: doneColor }}>Done</span>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: color depends on `variant` prop */}
      <span style={{ color: lyColor }}>Ly</span>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: multi-stop animated gradient text-clip, not expressible as static utilities */}
      <span className="wordmark-ai" style={AI_GRADIENT}> AI</span>
    </span>
  );
}
