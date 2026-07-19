import clsx from 'clsx';

// Photo-caption badge on both the desktop "before" hero photo and the mobile photo strip.
export const photoCaptionCls = "font-semibold text-[10px] font-[ui-monospace,monospace] bg-[rgba(0,0,0,.5)] text-white rounded-lg py-[3px] px-2";
// Top-of-photo round icon buttons (back / favorite) — desktop and mobile share the shape,
// differing only in left/right placement and (favorite) color/size.
export const roundBtnBase = 'absolute top-[26px] w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center font-bold cursor-pointer shadow-[var(--shadow)]';
// tagsRow pills (business type / travel radius / spot address / work hours) — identical shape on
// desktop and mobile.
export const tagVerCls = 'bg-ver-bg text-ver-fg rounded-xl py-1.5 px-[11px] text-xs font-bold';
export const tagNeutralCls = 'bg-surface2 rounded-xl py-1.5 px-[11px] text-xs font-semibold text-muted2';
// Service-location tag ("u Ciebie" / "w salonie") under each service row.
export const svcTagCls = (atClient: boolean) => clsx('inline-block text-[10.5px] font-bold mt-[5px] rounded-[9px] py-[3px] px-2', atClient ? 'bg-ver-bg text-ver-fg' : 'bg-surface2 text-accent');
// Review card header (name + star rating).
export const reviewNameCls = 'font-bold text-[13.5px]';
export const reviewStarsCls = 'text-warn text-xs tracking-[1px]';
