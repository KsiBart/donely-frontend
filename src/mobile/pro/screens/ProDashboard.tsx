import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProviderDashboardQuery } from '../../../api/hooks';
import { useAuth } from '../../../state/AuthContext';
import { useToast } from '../../../state/ToastContext';
import { BRICO } from '../../../lib/format';
import { cardVariants } from '../../../components/ui/variants';
import { clickable } from '../../../lib/a11y';

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className={cardVariants({ elevation: 'raised', padding: 'md' })}>
      <div className="text-[11px] font-bold text-muted uppercase tracking-[0.04em] mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {sub && <div className="text-[11.5px] text-muted2 mt-0.5">{sub}</div>}
    </div>
  );
}

/** Pro "Pulpit" (dashboard) — real KPIs + today's agenda from `GET /provider/dashboard`. */
export default function ProDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { me } = useAuth();
  const { showToast } = useToast();
  const { data, isSuccess, error } = useProviderDashboardQuery();
  const loaded = isSuccess;
  const agenda = data?.todayAgenda ?? [];

  useEffect(() => {
    if (error) showToast(error instanceof Error ? error.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <div className="flex-1 overflow-auto pt-5 px-5 pb-[18px]">
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h1 style={{ fontFamily: BRICO }} className="text-2xl font-bold mx-0 mt-2 mb-[18px]">
        {t('pro.dashboard.title')}
      </h1>

      {me?.providerStatus === 'PENDING' && (
        <div className="bg-[var(--app-tint)] rounded-[16px] p-3.5 mb-4 text-[12.5px] leading-[1.5]">{t('pro.dashboard.statusPendingBanner')}</div>
      )}
      {me?.providerStatus === 'REJECTED' && (
        <div className="bg-danger-bg text-danger rounded-[16px] p-3.5 mb-4 text-[12.5px] leading-[1.5]">{t('pro.dashboard.statusRejectedBanner')}</div>
      )}

      {!loaded && <div className="text-[13px] text-muted animate-[ptpulse_1.6s_infinite] mb-4">{t('common.loading')}</div>}

      {loaded && (
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <Kpi label={t('pro.dashboard.kpiBookings')} value={String(data?.monthBookings ?? 0)} />
          <Kpi label={t('pro.dashboard.kpiRevenue')} value={data?.monthRevenueLabel ?? '—'} />
          <div {...clickable(() => navigate('/pro/requests'))} className="cursor-pointer">
            <Kpi label={t('pro.dashboard.kpiNewRequests')} value={String(data?.newRequestsCount ?? 0)} sub={t('pro.dashboard.viewRequestsCta')} />
          </div>
          <Kpi label={t('pro.dashboard.kpiRating')} value={data ? data.rating.toFixed(1) : '—'} sub={t('pro.dashboard.kpiRatingSub', { count: data?.reviewCount ?? 0 })} />
          <Kpi label={t('pro.dashboard.kpiDocs')} value={String(data?.docsCount ?? 0)} />
          <Kpi label={t('pro.dashboard.kpiNet')} value={data?.netLabel ?? '—'} sub={data ? t('pro.dashboard.kpiNetSub', { tax: data.taxLabel }) : undefined} />
        </div>
      )}

      <div className="text-xs font-bold text-muted tracking-[0.06em] uppercase mb-2.5">{t('pro.dashboard.agendaTitle')}</div>
      <div className="flex flex-col gap-2">
        {loaded && agenda.length === 0 && <div className="text-[13px] text-muted">{t('pro.dashboard.agendaEmpty')}</div>}
        {agenda.map((row, i) =>
          row.isBuffer ? (
            <div key={i} className="text-[11.5px] text-muted2 px-1">
              {t('pro.dashboard.bufferRow', { label: row.label })}
            </div>
          ) : (
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
          ),
        )}
      </div>
    </div>
  );
}
