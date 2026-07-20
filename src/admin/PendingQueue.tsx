import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { stripes } from '../components/ui';
import { bizShort, initials } from '../lib/format';
import { clickable } from '../lib/a11y';
import type { PendingItem } from './AdminApp';

function catName(p: PendingItem): string {
  return p.categoryName ?? p.category?.name ?? '';
}

/**
 * A single row of the provider verification queue.
 * variant 'dashboard' — compact row inside the Pulpit card (surface2 background);
 * variant 'page' — standalone card in the Wykonawcy section (includes business form).
 */
export function PendingRow({
  p,
  variant,
  onApprove,
  onReject,
}: {
  p: PendingItem;
  variant: 'dashboard' | 'page';
  onApprove: (p: PendingItem) => void;
  onReject: (p: PendingItem) => void;
}) {
  const { t } = useTranslation();
  const page = variant === 'page';
  const isNew = !p.decided;
  const ok = p.decided === 'ok';

  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-2xl',
        page ? 'bg-surface px-4 py-3.5 shadow-[0_4px_14px_rgba(74,52,102,.08)]' : 'bg-surface2 p-3',
      )}
    >
      <span
        className="flex h-9.5 w-9.5 flex-none items-center justify-center rounded-[11px] text-[13px] font-bold text-white"
        // eslint-disable-next-line react/no-inline-styles -- dynamic: stripes() generates a per-avatar gradient string at runtime
        style={{ background: stripes(45, 5) }}
      >
        {p.init ?? initials(p.name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-bold">
          {p.name}{' '}
          <span className="font-semibold text-muted">
            · {catName(p)}
            {page ? ` · ${bizShort(p.businessType, t)}` : ''}
          </span>
        </div>
        <div className="mt-0.5 text-[11.5px] text-muted2">{p.docsNote ?? ''}</div>
      </div>
      {isNew ? (
        <>
          <span
            {...clickable(() => onReject(p))}
            className="cursor-pointer rounded-[11px] border-[1.5px] border-border px-3 py-1.75 text-[12px] font-bold text-muted2"
          >
            {t('admin.providers.reject')}
          </span>
          <span
            {...clickable(() => onApprove(p))}
            className="cursor-pointer rounded-[11px] bg-accent px-3 py-1.75 text-[12px] font-bold text-white"
          >
            {t('admin.providers.approve')}
          </span>
        </>
      ) : (
        <span
          className={clsx(
            'rounded-[11px] px-3 py-1.75 text-[12px] font-bold',
            ok ? 'bg-ver-bg text-[#3e7a48]' : 'bg-surface2 text-muted',
          )}
        >
          {ok ? t('admin.providers.verifiedBadge') : t('admin.providers.rejectedBadge')}
        </span>
      )}
    </div>
  );
}
