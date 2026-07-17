import { useTranslation } from 'react-i18next';
import { stripes } from '../components/ui';
import { bizShort, initials } from '../lib/format';
import { CRM_SHADOW } from './ui';
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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: page ? 'var(--surface)' : 'var(--surface2)',
        borderRadius: 14,
        padding: page ? '14px 16px' : 12,
        boxShadow: page ? CRM_SHADOW : 'none',
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: stripes(45, 5),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          color: '#fff',
          fontSize: 13,
          flex: 'none',
        }}
      >
        {p.init ?? initials(p.name)}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5 }}>
          {p.name}{' '}
          <span style={{ fontWeight: 600, color: 'var(--muted)' }}>
            · {catName(p)}
            {page ? ` · ${bizShort(p.businessType, t)}` : ''}
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted2)', marginTop: 2 }}>{p.docsNote ?? ''}</div>
      </div>
      {isNew ? (
        <>
          <span
            onClick={() => onReject(p)}
            style={{
              border: '1.5px solid #e5dccf',
              borderRadius: 11,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--muted2)',
              cursor: 'pointer',
            }}
          >
            {t('admin.providers.reject')}
          </span>
          <span
            onClick={() => onApprove(p)}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 11,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t('admin.providers.approve')}
          </span>
        </>
      ) : (
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 11,
            padding: '7px 12px',
            background: ok ? '#e4f0e4' : '#f7f2ea',
            color: ok ? '#3e7a48' : '#8a7a9e',
          }}
        >
          {ok ? t('admin.providers.verifiedBadge') : t('admin.providers.rejectedBadge')}
        </span>
      )}
    </div>
  );
}
