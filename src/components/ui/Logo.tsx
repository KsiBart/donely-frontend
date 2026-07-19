import React from 'react';

/** Donely logo: circle-check with sparkle (exact SVG from designs). */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="flex-none text-accent">
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
