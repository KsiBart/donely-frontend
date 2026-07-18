import React from 'react';
import { BRICO } from '../lib/format';

export const CRM_SHADOW = '0 4px 14px rgba(74,52,102,.08)';

export const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  borderRadius: 16,
  boxShadow: CRM_SHADOW,
};

/** KPI card: label / big value / colored sub line. */
export function KpiCard({ label, value, sub, subColor }: { label: string; value: string; sub: string; subColor?: string }) {
  return (
    <div style={{ ...cardStyle, padding: 16 }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: BRICO, fontSize: 26, fontWeight: 700, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: subColor ?? 'var(--muted)', fontWeight: subColor ? 700 : 400, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

export function TableHead({ columns, cols }: { columns: string[]; cols: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: cols,
        gap: 10,
        padding: '12px 18px',
        background: 'var(--surface2)',
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--muted)',
        textTransform: 'uppercase',
        letterSpacing: '.05em',
      }}
    >
      {columns.map((c, i) => (
        <span key={i}>{c}</span>
      ))}
    </div>
  );
}

export function rowStyle(cols: string): React.CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: cols,
    gap: 10,
    alignItems: 'center',
    padding: '12px 18px',
    borderTop: '1px solid var(--border)',
    fontSize: 13,
  };
}

export function StatusChip({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 9,
        padding: '3px 9px',
        justifySelf: 'start',
        background: bg,
        color: fg,
      }}
    >
      {children}
    </span>
  );
}

/** Filter / selector chip row item (Rezerwacje filters, Kalendarze providers). */
export function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        borderRadius: 13,
        padding: '8px 14px',
        fontSize: 12.5,
        fontWeight: 700,
        cursor: 'pointer',
        background: active ? 'var(--accent)' : 'var(--surface)',
        color: active ? '#fff' : 'var(--muted2)',
        boxShadow: active ? '0 4px 10px rgba(74,52,102,.28)' : '0 2px 8px rgba(74,52,102,.08)',
      }}
    >
      {label}
    </span>
  );
}
