import type { Booking } from '../../../api/models';
import { initials } from '../../../lib/format';

export function providerName(b: Booking): string {
  return b.providerName ?? b.provider?.name ?? '';
}
export function providerInit(b: Booking): string {
  return b.providerInit ?? b.provider?.init ?? initials(providerName(b));
}
export function serviceTitle(b: Booking): string {
  return b.serviceTitle ?? b.service?.title ?? '';
}
export function hasReview(b: Booking): boolean {
  return b.hasReview ?? !!b.review;
}
export function isFrozen(b: Booking): boolean {
  return b.payment?.status === 'HELD';
}

// Bookings.tsx section eyebrow ("NADCHODZĄCE" / "ZAKOŃCZONE").
export const sectionLabelCls = 'text-xs font-bold text-muted tracking-[0.06em] uppercase mb-2.5';

// Full-width accent CTA rows (payNow / approveCompletion / reviewSend) share this padding=11 shape
// — 1px off buttonVariants('md') (which pairs 16/10, not a uniform 11), so built by hand here.
export const ctaGlowCls = 'text-center bg-accent text-onaccent rounded-[14px] p-2.75 text-[13px] font-bold cursor-pointer shadow-[var(--glow)]';
