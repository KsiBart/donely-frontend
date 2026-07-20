import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useCreateBlockMutation, useDeleteBlockMutation, useProviderCalendarQuery } from '../../../api/hooks';
import { BRICO, headerDate, isoDay, toIntlLocale } from '../../../lib/format';
import { useToast } from '../../../state/ToastContext';
import { clickable } from '../../../lib/a11y';

/** Matches the backend's 90-min slot grid (`SLOT_MINUTES` in
 * `donely-backend/src/common/format.ts`) — a tapped `isFree` row blocks exactly one slot. */
const SLOT_MINUTES = 90;

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function slotStart(day: Date, time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(day);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

/** Pro "Kalendarz" — single-day agenda from `GET /provider/calendar?day=`. Confirmed jobs render
 * read-only; free 90-min slots can be blocked, and blocks created (`id` present, see the
 * provider-area backend fix that added it to `isBlock` rows) can be unblocked from here. */
export default function ProCalendar() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const { showToast } = useToast();
  const [day, setDay] = useState<Date>(() => startOfDay(new Date()));
  const dayStr = isoDay(day);
  const { data, isSuccess, error } = useProviderCalendarQuery(dayStr);
  const loaded = isSuccess;
  const rows = data?.rows ?? [];

  const createBlockMutation = useCreateBlockMutation();
  const deleteBlockMutation = useDeleteBlockMutation();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    if (error) showToast(error instanceof Error ? error.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const shiftDay = (delta: number) => {
    const next = new Date(day);
    next.setDate(day.getDate() + delta);
    setDay(startOfDay(next));
  };

  const block = async (time: string) => {
    const key = `block-${time}`;
    if (busyKey) return;
    setBusyKey(key);
    try {
      const start = slotStart(day, time);
      const end = new Date(start.getTime() + SLOT_MINUTES * 60000);
      await createBlockMutation.mutateAsync({ startAt: start.toISOString(), endAt: end.toISOString() });
      showToast(t('pro.calendar.blockToast'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setBusyKey(null);
    }
  };

  const unblock = async (id: number | undefined) => {
    if (id == null) {
      showToast(t('pro.calendar.unblockUnavailable'));
      return;
    }
    const key = `unblock-${id}`;
    if (busyKey) return;
    setBusyKey(key);
    try {
      await deleteBlockMutation.mutateAsync(id);
      showToast(t('pro.calendar.unblockToast'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto pt-5 px-5 pb-4.5">
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h1 style={{ fontFamily: BRICO }} className="text-2xl font-bold mx-0 mt-2 mb-4.5">
        {t('pro.calendar.title')}
      </h1>

      <div className="flex items-center justify-between mb-4 bg-surface rounded-[16px] p-2.5 shadow-[var(--shadow)]">
        <span {...clickable(() => shiftDay(-1), { label: t('pro.calendar.prevDayLabel') })} className="w-8 h-8 flex items-center justify-center rounded-full text-accent font-bold cursor-pointer">
          <span aria-hidden="true">‹</span>
        </span>
        <span {...clickable(() => setDay(startOfDay(new Date())))} className="text-[13px] font-bold capitalize cursor-pointer">
          {headerDate(locale, day)}
        </span>
        <span {...clickable(() => shiftDay(1), { label: t('pro.calendar.nextDayLabel') })} className="w-8 h-8 flex items-center justify-center rounded-full text-accent font-bold cursor-pointer">
          <span aria-hidden="true">›</span>
        </span>
      </div>

      {!loaded && <div className="text-[13px] text-muted animate-[ptpulse_1.6s_infinite]">{t('common.loading')}</div>}
      {loaded && rows.length === 0 && <div className="text-[13px] text-muted">{t('pro.calendar.empty')}</div>}

      <div className="flex flex-col gap-2">
        {rows.map((row, i) => {
          if (row.isBuffer) {
            return (
              <div key={i} className="text-[11.5px] text-muted2 px-1">
                {t('pro.dashboard.bufferRow', { label: row.label })}
              </div>
            );
          }
          if (row.isJob) {
            return (
              <div key={i} className="flex items-center gap-2.5 bg-surface rounded-[16px] p-3 shadow-[var(--shadow)]">
                <div className="flex-none w-12 text-[12.5px] font-bold text-accent">{row.time}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[13.5px] truncate">{row.title}</div>
                  <div className="text-[11.5px] text-muted truncate">{row.sub}</div>
                </div>
                <div className="flex-none text-right">
                  <div className="font-bold text-[13px]">{row.price}</div>
                  <div className="text-[10.5px] text-muted2">{row.status}</div>
                </div>
              </div>
            );
          }
          if (row.isBlock) {
            const busy = busyKey === `unblock-${row.id}`;
            return (
              <div key={i} className="flex items-center gap-2.5 bg-surface2 rounded-[16px] p-3">
                <div className="flex-none w-12 text-[12.5px] font-bold text-muted2">{row.time}</div>
                <div className="flex-1 min-w-0 text-[12.5px] text-muted2">{row.label}</div>
                <span
                  {...clickable(() => void unblock(row.id), { disabled: busy })}
                  className={clsx('flex-none text-[12px] font-bold text-danger cursor-pointer', busy && 'opacity-70')}
                >
                  {t('pro.calendar.unblockCta')}
                </span>
              </div>
            );
          }
          if (row.isFree) {
            const busy = busyKey === `block-${row.time}`;
            return (
              <div key={i} className="flex items-center gap-2.5 bg-surface rounded-[16px] p-3 border-[1.5px] border-dashed border-border">
                <div className="flex-none w-12 text-[12.5px] font-bold text-muted2">{row.time}</div>
                <div className="flex-1 min-w-0 text-[12.5px] text-muted2">{t('pro.calendar.freeLabel')}</div>
                <span
                  {...clickable(() => void block(row.time as string), { disabled: busy })}
                  className={clsx('flex-none text-[12px] font-bold text-accent cursor-pointer', busy && 'opacity-70')}
                >
                  {t('pro.calendar.blockCta')}
                </span>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
