import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProviderBillingQuery, useProviderPayoutsQuery } from '../../../api/hooks';
import { BRICO, formatZl, payoutStatusLabel, toIntlLocale } from '../../../lib/format';
import { useToast } from '../../../state/ToastContext';
import { cardVariants, statusPillVariants } from '../../../components/ui/variants';

/** Pro "Wypłaty" — monthly billing summary (`GET /provider/billing`, docs already pre-formatted
 * PL-only display strings from the backend, same accepted scope cut as admin billing) + payout
 * history (`GET /provider/payouts`, raw grosze amounts formatted client-side via `formatZl`). */
export default function ProPayouts() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const { showToast } = useToast();
  const { data: billing, isSuccess: billingLoaded, error: billingError } = useProviderBillingQuery();
  const { data: payoutsData, isSuccess: payoutsLoaded, error: payoutsError } = useProviderPayoutsQuery();
  const documents = billing?.documents ?? [];
  const payouts = payoutsData ?? [];

  useEffect(() => {
    const e = billingError ?? payoutsError;
    if (e) showToast(e instanceof Error ? e.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingError, payoutsError]);

  return (
    <div className="flex-1 overflow-auto pt-5 px-5 pb-4.5">
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h1 style={{ fontFamily: BRICO }} className="text-2xl font-bold mx-0 mt-2 mb-4.5">
        {t('pro.payouts.title')}
      </h1>

      <div className="text-xs font-bold text-muted tracking-[0.06em] uppercase mb-2.5">{t('pro.payouts.billingSummaryTitle')}</div>
      {!billingLoaded && <div className="text-[13px] text-muted animate-[ptpulse_1.6s_infinite] mb-5">{t('common.loading')}</div>}
      {billingLoaded && (
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className={cardVariants({ elevation: 'raised', padding: 'sm' })}>
            <div className="text-[10.5px] font-bold text-muted uppercase tracking-[0.03em] mb-1">{t('pro.payouts.kpiDocs')}</div>
            <div className="text-lg font-bold">{billing?.docsCount ?? 0}</div>
          </div>
          <div className={cardVariants({ elevation: 'raised', padding: 'sm' })}>
            <div className="text-[10.5px] font-bold text-muted uppercase tracking-[0.03em] mb-1">{t('pro.payouts.kpiTax')}</div>
            <div className="text-lg font-bold">{billing?.taxLabel ?? '—'}</div>
          </div>
          <div className={cardVariants({ elevation: 'raised', padding: 'sm' })}>
            <div className="text-[10.5px] font-bold text-muted uppercase tracking-[0.03em] mb-1">{t('pro.payouts.kpiNet')}</div>
            <div className="text-lg font-bold">{billing?.netLabel ?? '—'}</div>
          </div>
        </div>
      )}

      <div className="text-xs font-bold text-muted tracking-[0.06em] uppercase mb-2.5">{t('pro.payouts.documentsTitle')}</div>
      <div className="flex flex-col gap-2 mb-5">
        {billingLoaded && documents.length === 0 && <div className="text-[13px] text-muted">{t('pro.payouts.documentsEmpty')}</div>}
        {documents.map((d) => (
          <div key={d.number} className="flex items-center justify-between gap-2.5 bg-surface rounded-[16px] p-3 shadow-[var(--shadow)]">
            <div className="min-w-0">
              <div className="font-bold text-[13px] text-accent">{d.number}</div>
              <div className="text-[11.5px] text-muted2">{d.typeLabel}</div>
            </div>
            <div className="text-right flex-none">
              <div className="font-bold text-[13px]">{d.amountLabel}</div>
              <div className="text-[11px] text-muted2">{d.statusLabel}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs font-bold text-muted tracking-[0.06em] uppercase mb-2.5">{t('pro.payouts.payoutsTitle')}</div>
      {!payoutsLoaded && <div className="text-[13px] text-muted animate-[ptpulse_1.6s_infinite]">{t('common.loading')}</div>}
      <div className="flex flex-col gap-2">
        {payoutsLoaded && payouts.length === 0 && <div className="text-[13px] text-muted">{t('pro.payouts.payoutsEmpty')}</div>}
        {payouts.map((p) => (
          <div key={p.id} className="bg-surface rounded-[16px] p-3 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[14px]">{formatZl(p.netAmount, locale)}</span>
              <span className={statusPillVariants({ tone: p.status === 'PAID' ? 'ver' : 'warn' })}>{p.statusLabel ?? payoutStatusLabel(p.status, t)}</span>
            </div>
            <div className="text-[11.5px] text-muted2 mt-1">
              {t('pro.payouts.kpiTax')}: {formatZl(p.taxAmount, locale)} · {new Date(p.createdAt).toLocaleDateString(locale)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
