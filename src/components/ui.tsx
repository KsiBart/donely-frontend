import React from 'react';

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
