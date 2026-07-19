import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminProvidersQuery } from '../../api/hooks';
import { toIntlLocale } from '../../i18n';
import { bizLong, formatRating } from '../../lib/format';
import { useBrand } from '../../brand';
import { useToast } from '../../state/ToastContext';
import { usePending } from '../AdminApp';
import { PendingRow } from '../PendingQueue';
import { CARD_CLASS, StatusChip, TableHead, rowClass } from '../ui';

const COLS = '1.4fr 1fr 1.4fr .7fr .9fr';

export default function Providers() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const brand = useBrand();
  const { showToast } = useToast();
  const { pending, pendingCount, approve, reject } = usePending();
  const { data: verifiedData, error: verifiedError } = useAdminProvidersQuery('VERIFIED');
  const verified = verifiedData ?? [];

  useEffect(() => {
    if (verifiedError) showToast(verifiedError instanceof Error ? verifiedError.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedError]);

  const columns = t('admin.providers.columns', { returnObjects: true }) as unknown as string[];

  return (
    <>
      <h2 className="mb-3 text-[14.5px] font-bold">{t('admin.providers.queueTitle', { count: pendingCount })}</h2>
      <div className="mb-6 flex flex-col gap-2.5">
        {pending.length === 0 && <div className="text-[13px] text-muted">{t('admin.providers.queueEmpty')}</div>}
        {pending.map((p) => (
          <PendingRow key={p.id} p={p} variant="page" onApprove={approve} onReject={reject} />
        ))}
      </div>
      <h2 className="mb-3 text-[14.5px] font-bold">{t('admin.providers.verifiedTitle')}</h2>
      <div className={`${CARD_CLASS} overflow-hidden`}>
        <TableHead cols={COLS} columns={columns} />
        {verified.map((v) => (
          <div
            key={v.id}
            className={rowClass()}
            // eslint-disable-next-line react/no-inline-styles -- dynamic: gridTemplateColumns is a runtime string constant, Tailwind JIT can't scan it
            style={{ gridTemplateColumns: COLS }}
          >
            <span className="font-bold">{v.name}</span>
            <span className="text-muted2">{v.categoryName ?? v.category?.name ?? ''}</span>
            <span className="text-[12px] text-muted2">{bizLong(v.businessType, t, brand.appName)}</span>
            <span className="font-bold">
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
