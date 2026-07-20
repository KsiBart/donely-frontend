import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminFeedQuery, useAdminStatsQuery } from '../../api/hooks';
import { toIntlLocale } from '../../i18n';
import { monthName, relTime } from '../../lib/format';
import { useToast } from '../../state/ToastContext';
import { usePending } from '../AdminApp';
import { PendingRow } from '../PendingQueue';
import { CARD_CLASS, KpiCard } from '../ui';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const { showToast } = useToast();
  const { pending, pendingCount, approve, reject } = usePending();
  const { data: stats, error: statsError } = useAdminStatsQuery();
  const { data: feedData, error: feedError } = useAdminFeedQuery();
  const feed = feedData ?? [];

  useEffect(() => {
    if (statsError) showToast(statsError instanceof Error ? statsError.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsError]);

  useEffect(() => {
    if (feedError) showToast(feedError instanceof Error ? feedError.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedError]);

  return (
    <>
      <div className="mb-5.5 grid grid-cols-4 gap-3.5">
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
      <div className="grid grid-cols-[1.2fr_1fr] gap-3.5">
        <div className={`${CARD_CLASS} p-4.5`}>
          <h2 className="mb-3 text-[14.5px] font-bold">{t('admin.dashboard.pendingTitle')}</h2>
          <div className="flex flex-col gap-2.5">
            {pending.length === 0 && <div className="text-[13px] text-muted">{t('admin.dashboard.pendingEmpty')}</div>}
            {pending.map((p) => (
              <PendingRow key={p.id} p={p} variant="dashboard" onApprove={approve} onReject={reject} />
            ))}
          </div>
        </div>
        <div className={`${CARD_CLASS} p-4.5`}>
          <h2 className="mb-3 text-[14.5px] font-bold">{t('admin.dashboard.feedTitle')}</h2>
          <div className="flex flex-col">
            {feed.map((f, i) => (
              <div key={i} className="flex gap-2.5 border-b border-border py-2.25">
                <span
                  className="mt-1.25 h-2 w-2 flex-none rounded-full"
                  // eslint-disable-next-line react/no-inline-styles -- dynamic: f.dot is a per-feed-item color from backend data
                  style={{ background: f.dot }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] leading-[1.4]">{f.text}</div>
                  <div className="mt-px text-[11px] text-[var(--navmuted)]">{f.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
