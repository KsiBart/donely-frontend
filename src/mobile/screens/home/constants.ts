export function shortCatLabel(name: string): string {
  return name.split(/ \/ | nad /)[0];
}

// Verified badge (short form) — Home.tsx list/grid/map rows share this exact pill shape.
export const verifiedShortCls = 'bg-ver-bg text-ver-fg rounded-[10px] py-0.5 px-1.75 text-[10px] font-bold';
