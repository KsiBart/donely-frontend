import React from 'react';

/** AI sparkle icon used in the search bar. */
export function SparkleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="flex-none">
      <path d="M8 1l1.6 4.4L14 7l-4.4 1.6L8 13l-1.6-4.4L2 7l4.4-1.6z" fill="var(--accent)" />
    </svg>
  );
}
