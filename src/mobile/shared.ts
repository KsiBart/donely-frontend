import type { ProviderListItem } from '../api/types';
import { formatKm, formatRating } from '../lib/format';

/** 'Hydraulik · 1,2 km · ★ 4,9 (128)' */
export function providerMeta(p: ProviderListItem, locale = 'pl-PL'): string {
  return `${p.categoryName} · ${formatKm(p.distanceKm, locale)} · ★ ${formatRating(p.rating, locale)} (${p.reviewCount})`;
}
