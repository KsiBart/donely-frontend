import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { AdminProvider } from '../../api/types';
import { toIntlLocale } from '../../i18n';
import { bizLong, formatRating } from '../../lib/format';
import { useBrand } from '../../brand';
import { useToast } from '../../state/ToastContext';
import { usePending } from '../AdminApp';
import { PendingRow } from '../PendingQueue';
import { StatusChip, TableHead, cardStyle, rowStyle } from '../ui';

const COLS = '1.4fr 1fr 1.4fr .7fr .9fr';

export default function Providers() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const brand = useBrand();
  const { showToast } = useToast();
  const { pending, pendingCount, approve, reject } = usePending();
  const [verified, setVerified] = useState<AdminProvider[]>([]);

  useEffect(() => {
    api
      .adminProviders('VERIFIED')
      .then(setVerified)
      .catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = t('admin.providers.columns', { returnObjects: true }) as unknown as string[];

  return (
    <>
      <h2 style={{ fontWeight: 700, fontSize: 14.5, margin: '0 0 12px' }}>{t('admin.providers.queueTitle', { count: pendingCount })}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {pending.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{t('admin.providers.queueEmpty')}</div>}
        {pending.map((p) => (
          <PendingRow key={p.id} p={p} variant="page" onApprove={approve} onReject={reject} />
        ))}
      </div>
      <h2 style={{ fontWeight: 700, fontSize: 14.5, margin: '0 0 12px' }}>{t('admin.providers.verifiedTitle')}</h2>
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <TableHead cols={COLS} columns={columns} />
        {verified.map((v) => (
          <div key={v.id} style={rowStyle(COLS)}>
            <span style={{ fontWeight: 700 }}>{v.name}</span>
            <span style={{ color: 'var(--muted2)' }}>{v.categoryName ?? v.category?.name ?? ''}</span>
            <span style={{ color: 'var(--muted2)', fontSize: 12 }}>{bizLong(v.businessType, t, brand.appName)}</span>
            <span style={{ fontWeight: 700 }}>
              <span aria-hidden="true">★</span> {formatRating(v.rating, locale)}
            </span>
            <StatusChip bg="var(--ver-bg)" fg="#3e7a48">
              {t('admin.providers.statusActive')}
            </StatusChip>
          </div>
        ))}
      </div>
    </>
  );
}
