// Profile.tsx becomeProvider / push-promo CTAs: uniform 10px padding (all sides) — not the same
// shape as buttonVariants('md') which pairs 16px horizontal with 10px vertical, so built by hand
// here to keep the pixel-exact match to the design.
export const ctaCls = 'text-center bg-accent text-onaccent rounded-[14px] p-2.5 text-[13px] font-bold cursor-pointer';

export type PanelKind = 'location' | 'addresses' | 'payments' | 'proTerms' | null;
