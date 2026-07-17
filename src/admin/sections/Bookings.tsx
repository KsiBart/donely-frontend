import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { AdminBookingRow, BookingStatus } from '../../api/types';
import { bookingStatusLabel, statusChipColors, whenLabel } from '../../lib/format';
import { useToast } from '../../state/ToastContext';
import { FilterChip, StatusChip, TableHead, cardStyle, rowStyle } from '../ui';

const COLS = '.6fr 1.1fr 1.1fr 1.3fr 1fr .7fr .9fr .8fr';

const FILTER_STATUSES: (BookingStatus | undefined)[] = [undefined, 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'];

export default function Bookings() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [rows, setRows] = useState<AdminBookingRow[]>([]);
  const [filter, setFilter] = useState(0);

  useEffect(() => {
    api.adminBookings().then(setRows).catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterLabels = t('admin.bookings.filters', { returnObjects: true }) as unknown as string[];
  const columns = t('admin.bookings.columns', { returnObjects: true }) as unknown as string[];
  const activeStatus = FILTER_STATUSES[filter];
  const filtered = rows.filter((b) => !activeStatus || b.status === activeStatus);

  const cancel = async (b: AdminBookingRow) => {
    try {
      await api.adminCancelBooking(b.id);
      setRows((list) => list.map((x) => (x.id === b.id ? { ...x, status: 'CANCELLED' } : x)));
      showToast(t('admin.bookings.cancelToast', { id: b.id }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {filterLabels.map((label, i) => (
          <FilterChip key={label} label={label} active={i === filter} onClick={() => setFilter(i)} />
        ))}
      </div>
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <TableHead cols={COLS} columns={columns} />
        {filtered.map((b) => {
          const [stBg, stFg] = statusChipColors(b.status);
          const canCancel = b.status === 'CONFIRMED' || b.status === 'PENDING';
          return (
            <div key={b.id} style={{ ...rowStyle(COLS), fontSize: 12.5 }}>
              <span style={{ color: 'var(--navmuted)', fontWeight: 700 }}>#{b.id}</span>
              <span style={{ fontWeight: 700 }}>{b.customerName ?? b.customer?.name ?? ''}</span>
              <span>{b.providerName ?? b.provider?.name ?? ''}</span>
              <span style={{ color: 'var(--muted2)' }}>{b.serviceTitle ?? b.service?.title ?? ''}</span>
              <span style={{ color: 'var(--muted2)' }}>{b.whenLabel ?? whenLabel(b.startAt, b.preferredWindow, t, ' ')}</span>
              <span style={{ fontWeight: 700 }}>{b.priceLabel ?? ''}</span>
              <StatusChip bg={stBg} fg={stFg}>
                {bookingStatusLabel(b.status, t)}
              </StatusChip>
              {canCancel ? (
                <span
                  onClick={() => void cancel(b)}
                  style={{ fontSize: 12, fontWeight: 700, color: '#d64550', cursor: 'pointer', justifySelf: 'end' }}
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
