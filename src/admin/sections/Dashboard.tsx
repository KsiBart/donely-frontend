import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { AdminStats, EventLogItem } from '../../api/types';
import { toIntlLocale } from '../../i18n';
import { monthName, relTime } from '../../lib/format';
import { useToast } from '../../state/ToastContext';
import { usePending } from '../AdminApp';
import { PendingRow } from '../PendingQueue';
import { KpiCard, cardStyle } from '../ui';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const { showToast } = useToast();
  const { pending, pendingCount, approve, reject } = usePending();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [feed, setFeed] = useState<EventLogItem[]>([]);

  useEffect(() => {
    api.adminStats().then(setStats).catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    api.adminFeed().then(setFeed).catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        <KpiCard
          label={t('admin.dashboard.kpiUsers')}
          value={stats ? stats.users.toLocaleString(locale) : '—'}
          sub={stats ? t('admin.dashboard.kpiUsersSub', { count: stats.usersWeekDelta }) : ''}
          subColor="#3e7a48"
        />
        <KpiCard
          label={t('admin.dashboard.kpiProviders')}
          value={stats ? stats.providers.toLocaleString(locale) : '—'}
          sub={t('admin.dashboard.kpiProvidersSub', { count: pendingCount })}
          subColor="var(--accent)"
        />
        <KpiCard
          label={t('admin.dashboard.kpiBookingsToday')}
          value={stats ? String(stats.bookingsToday) : '—'}
          sub={stats ? t('admin.dashboard.kpiBookingsTodaySub', { count: stats.cancelledToday }) : ''}
        />
        <KpiCard
          label={t('admin.dashboard.kpiRevenue', { month: monthName(locale) })}
          value={stats?.revenueMonthLabel ?? '—'}
          sub={stats ? t('admin.dashboard.kpiRevenueSub', { tax: stats.taxMonthLabel }) : ''}
          subColor="#3e7a48"
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
        <div style={{ ...cardStyle, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12 }}>{t('admin.dashboard.pendingTitle')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{t('admin.dashboard.pendingEmpty')}</div>}
            {pending.map((p) => (
              <PendingRow key={p.id} p={p} variant="dashboard" onApprove={approve} onReject={reject} />
            ))}
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12 }}>{t('admin.dashboard.feedTitle')}</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {feed.map((f) => (
              <div key={f.id} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid #f3ede2' }}>
                <span style={{ flex: 'none', width: 8, height: 8, borderRadius: '50%', background: f.dotColor, marginTop: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>{f.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--navmuted)', marginTop: 1 }}>{relTime(f.createdAt, t)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
