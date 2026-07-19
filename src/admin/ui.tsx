import React from 'react';
import clsx from 'clsx';
import { BRICO } from '../lib/format';
import { clickable } from '../lib/a11y';

/** Admin CRM card shadow — distinct rgba constant from the app's `--shadow` token (admin surface
 * doesn't theme-swap this one; matches the original design pixel-for-pixel). */
export const CRM_SHADOW = '0 4px 14px rgba(74,52,102,.08)';
const CRM_SHADOW_CLASS = 'shadow-[0_4px_14px_rgba(74,52,102,.08)]';

/** Base admin card look: surface bg + rounded-2xl + the CRM shadow. Compose with padding/overflow
 * utilities per call site, e.g. `className={clsx(CARD_CLASS, 'p-[18px]')}`. */
export const CARD_CLASS = clsx('bg-surface rounded-2xl', CRM_SHADOW_CLASS);

/** KPI card: label / big value / colored sub line. */
export function KpiCard({ label, value, sub, subColor }: { label: string; value: string; sub: string; subColor?: string }) {
  return (
    <div className={clsx(CARD_CLASS, 'p-4')}>
      <div className="text-[12px] font-semibold text-muted">{label}</div>
      <div
        className="mt-1 text-[26px] font-bold"
        // eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping
        style={{ fontFamily: BRICO }}
      >
        {value}
      </div>
      <div
        className={clsx('mt-0.5 text-[11.5px]', subColor ? 'font-bold' : 'font-normal')}
        // eslint-disable-next-line react/no-inline-styles -- dynamic: subColor is caller-supplied (per-KPI semantic color), not a static literal
        style={{ color: subColor ?? 'var(--muted)' }}
      >
        {sub}
      </div>
    </div>
  );
}

export function TableHead({ columns, cols }: { columns: string[]; cols: string }) {
  return (
    <div
      className="grid gap-[10px] px-[18px] py-3 bg-surface2 text-[11px] font-bold uppercase tracking-[.05em] text-muted"
      // eslint-disable-next-line react/no-inline-styles -- dynamic: gridTemplateColumns varies per table (cols prop), Tailwind JIT can't scan a runtime string
      style={{ gridTemplateColumns: cols }}
    >
      {columns.map((c, i) => (
        <span key={i}>{c}</span>
      ))}
    </div>
  );
}

const ROW_BASE_CLASS = 'grid gap-[10px] items-center px-[18px] py-3 border-t border-border';

/** Static Tailwind part of a table row. `fontSize` picks the row text size (13px default; Bookings
 * + Billing rows use 12.5px) as a single literal class — avoids stacking two same-specificity
 * `text-[…]` utilities whose cascade order Tailwind doesn't guarantee. Pair with an inline
 * `style={{ gridTemplateColumns: cols }}` at the call site — grid-template-columns varies per
 * table (`cols` is a runtime string), so it can't be expressed as a Tailwind arbitrary value (JIT
 * can't scan it). */
export function rowClass(fontSize: 13 | 12.5 = 13): string {
  return clsx(ROW_BASE_CLASS, fontSize === 12.5 ? 'text-[12.5px]' : 'text-[13px]');
}

export function StatusChip({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <span
      className="justify-self-start rounded-[9px] px-[9px] py-[3px] text-[11px] font-bold"
      // eslint-disable-next-line react/no-inline-styles -- dynamic: bg/fg are caller-supplied per status/tone, arbitrary strings (var(--x) or hex) not a fixed literal set
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  );
}

/** Filter / selector chip row item (Rezerwacje filters, Kalendarze providers). */
export function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <span
      {...clickable(onClick, { pressed: active })}
      className={clsx(
        'rounded-[13px] px-3.5 py-2 text-[12.5px] font-bold cursor-pointer',
        active ? 'bg-accent text-white shadow-[0_4px_10px_rgba(74,52,102,.28)]' : 'bg-surface text-muted2 shadow-[0_2px_8px_rgba(74,52,102,.08)]',
      )}
    >
      {label}
    </span>
  );
}
