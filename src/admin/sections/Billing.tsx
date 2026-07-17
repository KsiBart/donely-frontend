import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { AdminBilling, AdminDocument, AdminPaymentRow, AdminPayoutRow } from '../../api/types';
import { toIntlLocale } from '../../i18n';
import { formatZl, monthName, paymentMethodLabel, paymentStatusLabel, payoutStatusLabel } from '../../lib/format';
import { useToast } from '../../state/ToastContext';
import { KpiCard, StatusChip, TableHead, cardStyle, rowStyle } from '../ui';

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
      return ['#e4f0e4', '#3e7a48'];
    case 'CAPTURED':
    case 'PENDING':
      return ['#f1ebf7', '#7a4fc0'];
    case 'REFUNDED':
    case 'FAILED':
      return ['#fbe4e6', '#d64550'];
    default:
      return ['#f7f2ea', '#8a7a9e'];
  }
}

function payoutStatusColors(status: AdminPayoutRow['status']): [string, string] {
  return status === 'PAID' ? ['#e4f0e4', '#3e7a48'] : ['#f1ebf7', '#7a4fc0'];
}

export default function Billing() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const { showToast } = useToast();
  const [billing, setBilling] = useState<AdminBilling | null>(null);
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [payouts, setPayouts] = useState<AdminPayoutRow[]>([]);
  const [running, setRunning] = useState(false);

  const loadPayouts = () => api.adminPayouts().then(setPayouts).catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));

  useEffect(() => {
    api.adminBilling().then(setBilling).catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    api.adminPayments().then(setPayments).catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    void loadPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runBatch = async () => {
    if (running) return;
    setRunning(true);
    try {
      const res = await api.adminRunPayoutBatch();
      const count = res.batched ?? res.count ?? 0;
      if (count > 0) {
        showToast(t('admin.billing.runBatchToast', { count }));
        void loadPayouts();
        api.adminBilling().then(setBilling).catch(() => {});
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 22 }}>
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

      <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12 }}>{t('admin.billing.documentsTitle')}</div>
      <div style={{ ...cardStyle, overflow: 'hidden', marginBottom: 24 }}>
        <TableHead cols={DOC_COLS} columns={docColumns} />
        {(billing?.documents ?? []).map((d) => {
          const paidOut = d.status === 'Wypłacona' || d.status === 'Paid out';
          return (
            <div key={d.number} style={{ ...rowStyle(DOC_COLS), fontSize: 12.5 }}>
              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{d.number}</span>
              <span style={{ fontWeight: 700 }}>{d.who ?? d.providerName ?? d.provider?.name ?? ''}</span>
              <span style={{ color: 'var(--muted2)', fontSize: 12 }}>{d.type}</span>
              <span style={{ fontWeight: 700 }}>{d.amount ?? ''}</span>
              <span style={{ color: 'var(--muted2)' }}>{d.tax ?? '—'}</span>
              <StatusChip bg={paidOut ? '#e4f0e4' : '#f1ebf7'} fg={paidOut ? '#3e7a48' : '#7a4fc0'}>
                {d.status}
              </StatusChip>
            </div>
          );
        })}
      </div>

      <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 12 }}>{t('admin.billing.paymentsTitle')}</div>
      <div style={{ ...cardStyle, overflow: 'hidden', marginBottom: 24 }}>
        <TableHead cols={PAYMENT_COLS} columns={paymentColumns} />
        {payments.length === 0 && <div style={{ padding: '14px 18px', fontSize: 12.5, color: 'var(--muted)' }}>{t('admin.billing.noPayments')}</div>}
        {payments.map((p) => {
          const [bg, fg] = paymentStatusColors(p.status);
          return (
            <div key={p.id} style={{ ...rowStyle(PAYMENT_COLS), fontSize: 12.5 }}>
              <span style={{ color: 'var(--navmuted)', fontWeight: 700 }}>#{p.bookingId}</span>
              <span style={{ fontWeight: 700 }}>{p.customerName ?? p.customer?.name ?? ''}</span>
              <span>{p.providerName ?? p.provider?.name ?? ''}</span>
              <span style={{ color: 'var(--muted2)', fontSize: 12 }}>{paymentMethodLabel(p.method, t)}</span>
              <span style={{ fontWeight: 700 }}>{p.amountLabel ?? formatZl(p.amount, locale)}</span>
              <StatusChip bg={bg} fg={fg}>
                {paymentStatusLabel(p.status, t)}
              </StatusChip>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 14.5 }}>{t('admin.billing.payoutsTitle')}</span>
        <span
          onClick={() => void runBatch()}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 12,
            padding: '9px 16px',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            opacity: running ? 0.7 : 1,
          }}
        >
          {t('admin.billing.runBatchCta')}
        </span>
      </div>
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <TableHead cols={PAYOUT_COLS} columns={payoutColumns} />
        {payouts.length === 0 && <div style={{ padding: '14px 18px', fontSize: 12.5, color: 'var(--muted)' }}>{t('admin.billing.noPayouts')}</div>}
        {payouts.map((p) => {
          const [bg, fg] = payoutStatusColors(p.status);
          return (
            <div key={p.id} style={{ ...rowStyle(PAYOUT_COLS), fontSize: 12.5 }}>
              <span style={{ fontWeight: 700 }}>{p.providerName ?? p.provider?.name ?? ''}</span>
              <span>{p.grossAmountLabel ?? (p.grossAmount != null ? formatZl(p.grossAmount, locale) : '—')}</span>
              <span style={{ color: 'var(--muted2)' }}>{p.taxAmountLabel ?? (p.taxAmount != null ? formatZl(p.taxAmount, locale) : '—')}</span>
              <span style={{ fontWeight: 700 }}>{p.netAmountLabel ?? (p.netAmount != null ? formatZl(p.netAmount, locale) : '—')}</span>
              <StatusChip bg={bg} fg={fg}>
                {payoutStatusLabel(p.status, t)}
              </StatusChip>
              <span style={{ color: 'var(--muted2)' }}>{p.batchDate ? new Date(p.batchDate).toLocaleDateString(locale) : '—'}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
