import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAdminBillingQuery,
  useAdminPaymentsQuery,
  useAdminPayoutsQuery,
  useAdminRunPayoutBatchMutation,
} from '../../api/hooks';
import type { AdminBilling, AdminDocument, AdminPaymentRow, AdminPayoutRow } from '../../api/models';
import { toIntlLocale } from '../../i18n';
import { formatZl, monthName, paymentMethodLabel, paymentStatusLabel, payoutStatusLabel } from '../../lib/format';
import { clickable } from '../../lib/a11y';
import { useToast } from '../../state/ToastContext';
import { CARD_CLASS, KpiCard, StatusChip, TableHead, rowClass } from '../ui';

const DOC_COLS = '1fr 1.3fr 1fr .8fr .8fr .9fr';
const PAYMENT_COLS = '.7fr 1.1fr 1.1fr 1fr .9fr 1fr';
const PAYOUT_COLS = '1.3fr 1fr 1fr 1fr .9fr 1fr';

/** Documents come from the legacy (Phase 1) `admin.billing()` endpoint, which pre-formats
 * `type`/`status`/`amount`/`tax` as Polish display strings server-side — backend-originated
 * copy PLAN.md explicitly carves out of the i18n migration. Render as-is; string-match on
 * the Polish label only for chip coloring (no enum is available from this endpoint). */
function paymentStatusColors(status: AdminPaymentRow['status']): [string, string] {
  switch (status) {
    case 'HELD':
    case 'RELEASED':
      return ['var(--ver-bg)', '#3e7a48'];
    case 'CAPTURED':
    case 'PENDING':
      return ['var(--app-tint)', 'var(--accent)'];
    case 'REFUNDED':
    case 'FAILED':
      return ['var(--danger-bg)', '#d64550'];
    default:
      return ['var(--surface2)', 'var(--muted)'];
  }
}

function payoutStatusColors(status: AdminPayoutRow['status']): [string, string] {
  return status === 'PAID' ? ['var(--ver-bg)', '#3e7a48'] : ['var(--app-tint)', 'var(--accent)'];
}

export default function Billing() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const { showToast } = useToast();
  const { data: billingData, error: billingError, refetch: refetchBilling } = useAdminBillingQuery();
  const { data: paymentsData, error: paymentsError } = useAdminPaymentsQuery();
  const { data: payoutsData, error: payoutsError, refetch: refetchPayouts } = useAdminPayoutsQuery();
  const runPayoutBatchMutation = useAdminRunPayoutBatchMutation();
  const [running, setRunning] = useState(false);

  const billing: AdminBilling | null = billingData ?? null;
  const payments = paymentsData ?? [];
  const payouts = payoutsData ?? [];

  useEffect(() => {
    const e = billingError ?? paymentsError ?? payoutsError;
    if (e) showToast(e instanceof Error ? e.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingError, paymentsError, payoutsError]);

  const runBatch = async () => {
    if (running) return;
    setRunning(true);
    try {
      const res = await runPayoutBatchMutation.mutateAsync();
      const count = res.batched ?? res.count ?? 0;
      if (count > 0) {
        showToast(t('admin.billing.runBatchToast', { count }));
        void refetchPayouts();
        void refetchBilling();
      } else {
        showToast(t('admin.billing.runBatchEmptyToast'));
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setRunning(false);
    }
  };

  const docColumns = t('admin.billing.columns', { returnObjects: true }) as unknown as string[];
  const paymentColumns = t('admin.billing.paymentsColumns', { returnObjects: true }) as unknown as string[];
  const payoutColumns = t('admin.billing.payoutsColumns', { returnObjects: true }) as unknown as string[];

  return (
    <>
      <div className="mb-5.5 grid grid-cols-3 gap-3.5">
        <KpiCard
          label={t('admin.billing.kpiDocs', { month: monthName(locale) })}
          value={billing ? String(billing.docsCount) : '—'}
          sub={t('admin.billing.kpiDocsSub')}
        />
        <KpiCard
          label={t('admin.billing.kpiTax')}
          value={billing?.taxTotalLabel ?? '—'}
          sub={
            billing?.privatePersonsCount != null
              ? t('admin.billing.kpiTaxSubCount', { count: billing.privatePersonsCount })
              : t('admin.billing.kpiTaxSubDefault')
          }
          subColor="#3e7a48"
        />
        <KpiCard
          label={t('admin.billing.kpiPayout')}
          value={billing?.payoutTotalLabel ?? '—'}
          sub={billing ? t('admin.billing.kpiPayoutSub', { date: billing.nextPayoutLabel }) : ''}
        />
      </div>

      <h2 className="mb-3 text-[14.5px] font-bold">{t('admin.billing.documentsTitle')}</h2>
      <div className={`${CARD_CLASS} mb-6 overflow-hidden`}>
        <TableHead cols={DOC_COLS} columns={docColumns} />
        {(billing?.documents ?? []).map((d) => {
          const paidOut = d.status === 'Wypłacona' || d.status === 'Paid out';
          return (
            <div
              key={d.number}
              className={rowClass(12.5)}
              // eslint-disable-next-line react/no-inline-styles -- dynamic: gridTemplateColumns is a runtime string constant, Tailwind JIT can't scan it
              style={{ gridTemplateColumns: DOC_COLS }}
            >
              <span className="font-bold text-accent">{d.number}</span>
              <span className="font-bold">{d.who}</span>
              <span className="text-[12px] text-muted2">{d.type}</span>
              <span className="font-bold">{d.amount}</span>
              <span className="text-muted2">{d.tax || '—'}</span>
              <StatusChip bg={paidOut ? 'var(--ver-bg)' : 'var(--app-tint)'} fg={paidOut ? '#3e7a48' : 'var(--accent)'}>
                {d.status}
              </StatusChip>
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 text-[14.5px] font-bold">{t('admin.billing.paymentsTitle')}</h2>
      <div className={`${CARD_CLASS} mb-6 overflow-hidden`}>
        <TableHead cols={PAYMENT_COLS} columns={paymentColumns} />
        {payments.length === 0 && <div className="px-4.5 py-3.5 text-[12.5px] text-muted">{t('admin.billing.noPayments')}</div>}
        {payments.map((p) => {
          const [bg, fg] = paymentStatusColors(p.status);
          return (
            <div
              key={p.id}
              className={rowClass(12.5)}
              // eslint-disable-next-line react/no-inline-styles -- dynamic: gridTemplateColumns is a runtime string constant, Tailwind JIT can't scan it
              style={{ gridTemplateColumns: PAYMENT_COLS }}
            >
              <span className="font-bold text-[var(--navmuted)]">#{p.bookingId}</span>
              <span className="font-bold">{p.customerName}</span>
              <span>{p.providerName}</span>
              <span className="text-[12px] text-muted2">{paymentMethodLabel(p.method, t)}</span>
              <span className="font-bold">{p.amountLabel ?? formatZl(p.amount, locale)}</span>
              <StatusChip bg={bg} fg={fg}>
                {paymentStatusLabel(p.status, t)}
              </StatusChip>
            </div>
          );
        })}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[14.5px] font-bold">{t('admin.billing.payoutsTitle')}</h2>
        <span
          {...clickable(() => void runBatch())}
          className={clsx('cursor-pointer rounded-xl bg-accent px-4 py-2.25 text-[12.5px] font-bold text-white', running && 'opacity-70')}
        >
          {t('admin.billing.runBatchCta')}
        </span>
      </div>
      <div className={`${CARD_CLASS} overflow-hidden`}>
        <TableHead cols={PAYOUT_COLS} columns={payoutColumns} />
        {payouts.length === 0 && <div className="px-4.5 py-3.5 text-[12.5px] text-muted">{t('admin.billing.noPayouts')}</div>}
        {payouts.map((p) => {
          const [bg, fg] = payoutStatusColors(p.status);
          return (
            <div
              key={p.id}
              className={rowClass(12.5)}
              // eslint-disable-next-line react/no-inline-styles -- dynamic: gridTemplateColumns is a runtime string constant, Tailwind JIT can't scan it
              style={{ gridTemplateColumns: PAYOUT_COLS }}
            >
              <span className="font-bold">{p.providerName}</span>
              <span>{p.grossAmountLabel ?? formatZl(p.grossAmount, locale)}</span>
              <span className="text-muted2">{p.taxAmountLabel ?? formatZl(p.taxAmount, locale)}</span>
              <span className="font-bold">{p.netAmountLabel ?? formatZl(p.netAmount, locale)}</span>
              <StatusChip bg={bg} fg={fg}>
                {payoutStatusLabel(p.status, t)}
              </StatusChip>
              <span className="text-muted2">{p.batchDate ? new Date(p.batchDate).toLocaleDateString(locale) : '—'}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
