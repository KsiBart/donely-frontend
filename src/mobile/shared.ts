import type { ProviderListItem } from '../api/types';
import { formatKm, formatRating } from '../lib/format';

/** 'Hydraulik · 1,2 km · ★ 4,9 (128)' */
export function providerMeta(p: ProviderListItem, locale = 'pl-PL'): string {
  return `${p.categoryName} · ${formatKm(p.distanceKm, locale)} · ★ ${formatRating(p.rating, locale)} (${p.reviewCount})`;
}

/** Deterministic map-pin positions (design positions first, generated fallback). */
const PIN_POS: [string, string][] = [
  ['24%', '44%'],
  ['58%', '52%'],
  ['40%', '68%'],
  ['70%', '36%'],
  ['12%', '58%'],
  ['32%', '22%'],
  ['66%', '72%'],
  ['82%', '48%'],
];

export function pinPos(index: number): [string, string] {
  if (index < PIN_POS.length) return PIN_POS[index];
  return [`${(17 + index * 23) % 80}%`, `${(24 + index * 17) % 70}%`];
}
