import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { AdminCalendarCell, AdminCalendarResponse, AdminProvider } from '../../api/types';
import { isoDay } from '../../lib/format';
import { clickable } from '../../lib/a11y';
import { useToast } from '../../state/ToastContext';
import { FilterChip, cardStyle } from '../ui';

/** Monday of the upcoming week (today if Monday). */
function nextMonday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const delta = (8 - d.getDay()) % 7;
  d.setDate(d.getDate() + delta);
  return d;
}

interface NormRow {
  hour: number;
  label: string;
  cells: AdminCalendarCell[];
}

function normalize(res: AdminCalendarResponse): NormRow[] {
  const raw = res.rows ?? res.grid ?? [];
  return raw.map((row, i) => {
    const hour = row.hour ?? Number.parseInt(row.label ?? '', 10);
    const h = Number.isNaN(hour) ? 8 + i : hour;
    const cells = (row.cells ?? []).map((c): AdminCalendarCell => {
      if (typeof c === 'string') return { status: c };
      // Backend sends `{ state, label }`; the component reads `status` — accept either.
      const anyC = c as AdminCalendarCell & { state?: AdminCalendarCell['status'] };
      return { ...anyC, status: anyC.status ?? anyC.state ?? 'free' };
    });
    return { hour: h, label: row.label ?? `${h}:00`, cells };
  });
}

export default function Calendars() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [sel, setSel] = useState(0);
  const [cal, setCal] = useState<AdminCalendarResponse | null>(null);

  const monday = useMemo(nextMonday, []);
  const weekStart = isoDay(monday);
  const provider = providers[sel];
  const dowAdmin = t('common.dowShortAdmin', { returnObjects: true }) as unknown as string[];

  function dayHeaders(res: AdminCalendarResponse | null): string[] {
    if (res?.days && res.days.length > 0) {
      return res.days.map((d) => {
        // Backend sends `{ label }` objects; older/other shapes may send a plain date string.
        const label = typeof d === 'string' ? d : ((d as { label?: string })?.label ?? '');
        const date = new Date(label);
        if (!Number.isNaN(date.getTime()) && /\d{4}-\d{2}-\d{2}/.test(label)) {
          return `${dowAdmin[date.getDay()]} ${date.getDate()}`;
        }
        return label;
      });
    }
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return `${dowAdmin[date.getDay()]} ${date.getDate()}`;
    });
  }

  useEffect(() => {
    api
      .adminProviders('VERIFIED')
      .then(setProviders)
      .catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCal = useCallback(() => {
    if (!provider) return;
    api
      .adminCalendar(provider.id, weekStart)
      .then(setCal)
      .catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider?.id, weekStart]);

  useEffect(() => {
    setCal(null);
    loadCal();
  }, [loadCal]);

  const rows = cal ? normalize(cal) : [];
  const heads = dayHeaders(cal);

  const cellDate = (dayIdx: number, hour: number): Date => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + dayIdx);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const onCell = async (cell: AdminCalendarCell, dayIdx: number, hour: number) => {
    if (!provider) return;
    if (cell.status === 'off') {
      showToast(t('admin.calendars.offToast'));
      return;
    }
    if (cell.status === 'booked') {
      showToast(t('admin.calendars.bookedToast', { label: cell.label ?? '' }).replace(':  —', ' —'));
      return;
    }
    try {
      if (cell.status === 'blocked') {
        if (cell.blockId != null) {
          await api.adminDeleteBlock(cell.blockId);
          showToast(t('admin.calendars.slotFreedToast'));
          loadCal();
        }
        return;
      }
      const start = cellDate(dayIdx, hour);
      const end = cellDate(dayIdx, hour + 1);
      await api.adminCreateBlock(provider.id, start.toISOString(), end.toISOString());
      showToast(t('admin.calendars.slotBlockedToast', { name: provider.name }));
      loadCal();
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const cellView = (cell: AdminCalendarCell, dayIdx: number, hour: number) => {
    let bg = 'var(--surface)';
    let bd = '1.5px dashed var(--border)';
    let fg = 'var(--muted2)';
    let label = '';
    let tip = t('admin.calendars.tipBlock');
    if (cell.status === 'off') {
      bg = 'var(--surface2)';
      bd = 'none';
      fg = '#fff';
      tip = t('admin.calendars.tipOff');
    } else if (cell.status === 'booked') {
      bg = 'var(--accent)';
      bd = 'none';
      fg = '#fff';
      label = cell.label ?? '';
      tip = cell.label ?? '';
    } else if (cell.status === 'blocked') {
      bg = 'var(--border)';
      bd = 'none';
      label = t('admin.calendars.blockedLabel');
      tip = t('admin.calendars.tipUnblock');
    }
    const dayLabel = heads[dayIdx] ?? '';
    return (
      <div
        key={`${hour}-${dayIdx}`}
        {...clickable(() => void onCell(cell, dayIdx, hour), { label: `${dayLabel} ${hour}:00 — ${tip}` })}
        title={tip}
        style={{
          height: 34,
          borderRadius: 8,
          cursor: 'pointer',
          background: bg,
          border: bd,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: fg,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            padding: '0 4px',
          }}
        >
          {label}
        </span>
      </div>
    );
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginRight: 4 }}>{t('admin.calendars.providerLabel')}</span>
        {providers.map((p, i) => (
          <FilterChip key={p.id} label={p.name} active={i === sel} onClick={() => setSel(i)} />
        ))}
      </div>
      <div style={{ ...cardStyle, padding: 18, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(6,1fr)', gap: 5, minWidth: 760 }}>
          <span />
          {heads.map((h, i) => (
            <span key={i} style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', paddingBottom: 4 }}>
              {h}
            </span>
          ))}
          {rows.map((row) => (
            <React.Fragment key={row.hour}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--navmuted)', paddingTop: 8 }}>{row.label}</span>
              {row.cells.map((cell, dayIdx) => cellView(cell, dayIdx, row.hour))}
            </React.Fragment>
          ))}
        </div>
        {!cal && <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '12px 0' }}>{t('admin.calendars.loading')}</div>}
        <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 11.5, color: 'var(--muted2)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--accent)' }} />
            {t('admin.calendars.legendBooked')}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--border)' }} />
            {t('admin.calendars.legendBlocked')}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, border: '1.5px dashed var(--border)', background: 'var(--surface)' }} />
            {t('admin.calendars.legendFree')}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--surface2)' }} />
            {t('admin.calendars.legendOff')}
          </span>
        </div>
      </div>
    </>
  );
}
