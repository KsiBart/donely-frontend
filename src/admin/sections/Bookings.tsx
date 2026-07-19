import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminBookingsQuery, useAdminCancelBookingMutation } from '../../api/hooks';
import type { AdminBookingRow, BookingStatus } from '../../api/models';
import { bookingStatusLabel, statusChipColors, whenLabel } from '../../lib/format';
import { clickable } from '../../lib/a11y';
import { useToast } from '../../state/ToastContext';
import { CARD_CLASS, FilterChip, StatusChip, TableHead, rowClass } from '../ui';

const COLS = '.6fr 1.1fr 1.1fr 1.3fr 1fr .7fr .9fr .8fr';

const FILTER_STATUSES: (BookingStatus | undefined)[] = [undefined, 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'];

export default function Bookings() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, error } = useAdminBookingsQuery();
  const [rows, setRows] = useState<AdminBookingRow[]>([]);
  const [filter, setFilter] = useState(0);
  const cancelBookingMutation = useAdminCancelBookingMutation();

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  useEffect(() => {
    if (error) showToast(error instanceof Error ? error.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const filterLabels = t('admin.bookings.filters', { returnObjects: true }) as unknown as string[];
  const columns = t('admin.bookings.columns', { returnObjects: true }) as unknown as string[];
  const activeStatus = FILTER_STATUSES[filter];
  const filtered = rows.filter((b) => !activeStatus || b.status === activeStatus);

  const cancel = async (b: AdminBookingRow) => {
    try {
      await cancelBookingMutation.mutateAsync(b.id);
      setRows((list) => list.map((x) => (x.id === b.id ? { ...x, status: 'CANCELLED' } : x)));
      showToast(t('admin.bookings.cancelToast', { id: b.id }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  return (
    <>
      <div className="mb-4 flex gap-2">
        {filterLabels.map((label, i) => (
          <FilterChip key={label} label={label} active={i === filter} onClick={() => setFilter(i)} />
        ))}
      </div>
      <div className={`${CARD_CLASS} overflow-hidden`}>
        <TableHead cols={COLS} columns={columns} />
        {filtered.map((b) => {
          const [stBg, stFg] = statusChipColors(b.status);
          const canCancel = b.status === 'CONFIRMED' || b.status === 'PENDING';
          return (
            <div
              key={b.id}
              className={rowClass(12.5)}
              // eslint-disable-next-line react/no-inline-styles -- dynamic: gridTemplateColumns is a runtime string constant, Tailwind JIT can't scan it
              style={{ gridTemplateColumns: COLS }}
            >
              <span className="font-bold text-[var(--navmuted)]">#{b.id}</span>
              <span className="font-bold">{b.customer}</span>
              <span>{b.provider}</span>
              <span className="text-muted2">{b.service}</span>
              <span className="text-muted2">{b.when}</span>
              <span className="font-bold">{b.price}</span>
              <StatusChip bg={stBg} fg={stFg}>
                {bookingStatusLabel(b.status, t)}
              </StatusChip>
              {canCancel ? (
                <span
                  {...clickable(() => void cancel(b))}
                  className="justify-self-end cursor-pointer text-[12px] font-bold text-[#d64550]"
                >
                  {t('admin.bookings.cancel')}
                </span>
              ) : (
                <span />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
