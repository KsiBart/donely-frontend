import type { TFunction } from 'i18next';
import type {
  BookingStatus,
  BusinessType,
  DocumentStatus,
  DocumentType,
  PaymentMethod,
  PaymentStatus,
  PayoutStatus,
} from '../api/types';
import { toIntlLocale } from '../i18n';

export const BRICO = "'Bricolage Grotesque', sans-serif";

export function comma(v: number | string): string {
  return String(v).replace('.', ',');
}

/** Numeric rating (Intl-formatted, 1 decimal — comma for pl, dot for en). */
export function formatRating(r: number | string | null | undefined, locale = 'pl-PL'): string {
  if (r == null) return '–';
  const n = typeof r === 'string' ? Number.parseFloat(r) : r;
  if (Number.isNaN(n)) return String(r);
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
}

/** Distance in km (Intl unit formatting with the active locale). */
export function formatKm(km: number | null | undefined, locale = 'pl-PL'): string {
  if (km == null) return '';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'kilometer',
      unitDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(km);
  } catch {
    return `${comma(Math.round(km * 10) / 10)} km`;
  }
}

/** grosz (int) → localized currency string. pl-PL keeps the exact Phase-1 design formatting
 * (no decimals when whole zł); other locales use full Intl currency formatting. */
export function formatZl(grosz: number, locale = 'pl-PL'): string {
  const zl = grosz / 100;
  if (locale === 'pl-PL') {
    const s = Number.isInteger(zl)
      ? zl.toLocaleString('pl-PL')
      : zl.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${s} zł`;
  }
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'PLN' }).format(zl);
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Numeric day.month badge (kept locale-invariant on purpose — matches pixel-exact design). */
export function ddmm(d: Date): string {
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Numeric H:MM (no leading zero on the hour — matches pixel-exact design). */
export function hhmm(d: Date): string {
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dowShort(t: TFunction): string[] {
  return t('common.dowShort', { returnObjects: true }) as unknown as string[];
}

/** 'dziś 15:30' | 'jutro 9:00' | 'wt 21.07, 10:00' (sep=', ') / 'wt 21.07 10:00' (sep=' ') */
export function whenLabel(startAt: string | null | undefined, preferredWindow: string | null | undefined, t: TFunction, sep = ', '): string {
  if (startAt) {
    const d = new Date(startAt);
    if (!Number.isNaN(d.getTime())) {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      if (sameDay(d, now)) return `${t('common.today')} ${hhmm(d)}`;
      if (sameDay(d, tomorrow)) return `${t('common.tomorrow')} ${hhmm(d)}`;
      return `${dowShort(t)[d.getDay()]} ${ddmm(d)}${sep}${hhmm(d)}`;
    }
  }
  return preferredWindow || t('common.notSet');
}

export function dayLabel(startAt: string | null | undefined, t: TFunction): string {
  if (!startAt) return '';
  const d = new Date(startAt);
  if (Number.isNaN(d.getTime())) return '';
  return `${dowShort(t)[d.getDay()]} ${ddmm(d)}`;
}

export function relTime(iso: string, t: TFunction): string {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return '';
  const min = Math.max(1, Math.round((Date.now() - time) / 60000));
  if (min < 60) return t('common.relTime.minutesAgo', { count: min });
  const h = Math.round(min / 60);
  if (h < 24) return t('common.relTime.hoursAgo', { count: h });
  const d = Math.round(h / 24);
  return t('common.relTime.daysAgo', { count: d });
}

/** Long localized date (admin header). Intl-based — same 'pl-PL' call as Phase 1, just parameterized. */
export function headerDate(locale = 'pl-PL', d = new Date()): string {
  return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Localized month name ("lipiec" / "July"). */
export function monthName(locale = 'pl-PL', d = new Date()): string {
  return d.toLocaleDateString(locale, { month: 'long' });
}

export function bookingStatusLabel(status: BookingStatus, t: TFunction): string {
  return t(`common.status.${status}`);
}

export function statusChipColors(status: BookingStatus): [string, string] {
  switch (status) {
    case 'CONFIRMED':
    case 'AWAITING_APPROVAL':
      return ['#e4f0e4', '#3e7a48'];
    case 'PENDING':
      return ['var(--accent-tint)', 'var(--accent)'];
    case 'CANCELLED':
    case 'DECLINED':
      return ['#fbe4e6', '#d64550'];
    default:
      return ['#f7f2ea', '#8a7a9e'];
  }
}

export function bizShort(b: BusinessType | undefined, t: TFunction): string {
  return t(`common.businessType.short.${b === 'JDG' ? 'JDG' : 'PRIVATE'}`);
}

export function bizLong(b: BusinessType | undefined, t: TFunction, appName: string): string {
  return t(`common.businessType.long.${b === 'JDG' ? 'JDG' : 'PRIVATE'}`, { appName });
}

export function docTypeLabel(type: DocumentType, t: TFunction): string {
  return t(`common.documentType.${type}`);
}

export function docStatusLabel(status: DocumentStatus, t: TFunction): string {
  return t(`common.documentStatus.${status}`);
}

export function paymentMethodLabel(method: PaymentMethod, t: TFunction): string {
  return t(`common.paymentMethod.${method}`);
}

export function paymentStatusLabel(status: PaymentStatus, t: TFunction): string {
  return t(`common.paymentStatus.${status}`);
}

export function payoutStatusLabel(status: PayoutStatus, t: TFunction): string {
  return t(`common.payoutStatus.${status}`);
}

export { toIntlLocale };
