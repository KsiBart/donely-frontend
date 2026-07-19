import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminCalendarQuery, useAdminCreateBlockMutation, useAdminDeleteBlockMutation, useAdminProvidersQuery } from '../../api/hooks';
import type { AdminCalendarCell, AdminCalendarResponse, AdminProvider } from '../../api/models';
import { isoDay } from '../../lib/format';
import { clickable } from '../../lib/a11y';
import { useToast } from '../../state/ToastContext';
import { CARD_CLASS, FilterChip } from '../ui';

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

/** Static Tailwind classes per calendar-cell status — the possible bg/border/fg combinations are a
 * fixed closed set (free/off/booked/blocked), so unlike StatusChip's caller-supplied colors these
 * are fully expressible as literal classNames. */
const CELL_TONE: Record<'free' | 'off' | 'booked' | 'blocked', { bg: string; fg: string }> = {
  free: { bg: 'bg-surface border-[1.5px] border-dashed border-border', fg: 'text-muted2' },
  off: { bg: 'bg-surface2', fg: 'text-white' },
  booked: { bg: 'bg-accent', fg: 'text-white' },
  blocked: { bg: 'bg-border', fg: 'text-muted2' },
};

export default function Calendars() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: providersData, error: providersError } = useAdminProvidersQuery('VERIFIED');
  const providers = providersData ?? [];
  const [sel, setSel] = useState(0);
  const createBlockMutation = useAdminCreateBlockMutation();
  const deleteBlockMutation = useAdminDeleteBlockMutation();

  const monday = useMemo(nextMonday, []);
  const weekStart = isoDay(monday);
  const provider = providers[sel];
  const dowAdmin = t('common.dowShortAdmin', { returnObjects: true }) as unknown as string[];

  function dayHeaders(res: AdminCalendarResponse | null | undefined): string[] {
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
    if (providersError) showToast(providersError instanceof Error ? providersError.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providersError]);

  const { data: cal, error: calError, refetch: loadCal } = useAdminCalendarQuery(provider?.id, weekStart);

  useEffect(() => {
    if (calError) showToast(calError instanceof Error ? calError.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calError]);

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
          await deleteBlockMutation.mutateAsync(cell.blockId);
          showToast(t('admin.calendars.slotFreedToast'));
          void loadCal();
        }
        return;
      }
      const start = cellDate(dayIdx, hour);
      const end = cellDate(dayIdx, hour + 1);
      await createBlockMutation.mutateAsync({ providerProfileId: provider.id, startAt: start.toISOString(), endAt: end.toISOString() });
      showToast(t('admin.calendars.slotBlockedToast', { name: provider.name }));
      void loadCal();
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const cellView = (cell: AdminCalendarCell, dayIdx: number, hour: number) => {
    const status = (cell.status ?? 'free') as keyof typeof CELL_TONE;
    const tone = CELL_TONE[status] ?? CELL_TONE.free;
    let label = '';
    let tip = t('admin.calendars.tipBlock');
    if (cell.status === 'off') {
      tip = t('admin.calendars.tipOff');
    } else if (cell.status === 'booked') {
      label = cell.label ?? '';
      tip = cell.label ?? '';
    } else if (cell.status === 'blocked') {
      label = t('admin.calendars.blockedLabel');
      tip = t('admin.calendars.tipUnblock');
    }
    const dayLabel = heads[dayIdx] ?? '';
    return (
      <div
        key={`${hour}-${dayIdx}`}
        {...clickable(() => void onCell(cell, dayIdx, hour), { label: `${dayLabel} ${hour}:00 — ${tip}` })}
        title={tip}
        className={clsx('flex h-[34px] items-center justify-center overflow-hidden rounded-lg cursor-pointer', tone.bg)}
      >
        <span className={clsx('overflow-hidden text-ellipsis whitespace-nowrap px-1 text-[10px] font-bold', tone.fg)}>{label}</span>
      </div>
    );
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[12.5px] font-semibold text-muted">{t('admin.calendars.providerLabel')}</span>
        {providers.map((p, i) => (
          <FilterChip key={p.id} label={p.name} active={i === sel} onClick={() => setSel(i)} />
        ))}
      </div>
      <div className={`${CARD_CLASS} overflow-auto p-[18px]`}>
        <div className="grid min-w-[760px] grid-cols-[52px_repeat(6,1fr)] gap-[5px]">
          <span />
          {heads.map((h, i) => (
            <span key={i} className="pb-1 text-center text-[11.5px] font-bold text-muted">
              {h}
            </span>
          ))}
          {rows.map((row) => (
            <React.Fragment key={row.hour}>
              <span className="pt-2 text-[11px] font-bold text-[var(--navmuted)]">{row.label}</span>
              {row.cells.map((cell, dayIdx) => cellView(cell, dayIdx, row.hour))}
            </React.Fragment>
          ))}
        </div>
        {!cal && <div className="py-3 text-[12.5px] text-muted">{t('admin.calendars.loading')}</div>}
        <div className="mt-3.5 flex flex-wrap gap-4 text-[11.5px] text-muted2">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-accent" />
            {t('admin.calendars.legendBooked')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-border" />
            {t('admin.calendars.legendBlocked')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border-[1.5px] border-dashed border-border bg-surface" />
            {t('admin.calendars.legendFree')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-surface2" />
            {t('admin.calendars.legendOff')}
          </span>
        </div>
      </div>
    </>
  );
}
