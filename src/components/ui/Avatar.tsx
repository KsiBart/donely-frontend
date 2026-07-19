import React from 'react';

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
      className="flex-none flex items-center justify-center font-bold text-white"
      // eslint-disable-next-line react/no-inline-styles -- dynamic: size/radius/fontSize come from props, background from stripes()
      style={{
        width: size,
        height: size,
        borderRadius: round ? '50%' : (radius ?? 14),
        background: stripes(),
        fontSize: fontSize ?? Math.round(size * 0.28),
      }}
    >
      {init}
    </div>
  );
}
