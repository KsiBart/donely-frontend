import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminAddCategoryMutation, useAdminCategoriesQuery, useAdminPatchCategoryMutation } from '../../api/hooks';
import type { Category } from '../../api/models';
import { BRICO } from '../../lib/format';
import { clickable } from '../../lib/a11y';
import { useToast } from '../../state/ToastContext';
import { cardStyle } from '../ui';

function providerCount(c: Category): number {
  return c.providerCount ?? c.count ?? 0;
}

export default function Categories() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, error } = useAdminCategoriesQuery();
  const [cats, setCats] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState('');
  const addCategoryMutation = useAdminAddCategoryMutation();
  const patchCategoryMutation = useAdminPatchCategoryMutation();

  useEffect(() => {
    if (data) setCats(data);
  }, [data]);

  useEffect(() => {
    if (error) showToast(error instanceof Error ? error.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const addCat = async () => {
    if (!newCat.trim()) {
      showToast(t('admin.categories.nameRequiredToast'));
      return;
    }
    try {
      const created = await addCategoryMutation.mutateAsync(newCat.trim());
      setCats((list) => [...list, created]);
      setNewCat('');
      showToast(t('admin.categories.addedToast'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const toggle = async (c: Category) => {
    try {
      await patchCategoryMutation.mutateAsync({ id: c.id, active: !c.active });
      setCats((list) => list.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void addCat();
          }}
          placeholder={t('admin.categories.newPlaceholder') ?? ''}
          aria-label={t('admin.categories.newPlaceholder') ?? ''}
          style={{
            flex: 1,
            maxWidth: 320,
            borderRadius: 14,
            border: '1.5px solid var(--border)',
            background: 'var(--surface)',
            padding: '11px 14px',
            font: "600 13px 'Figtree', sans-serif",
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        <span
          {...clickable(() => void addCat())}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 14,
            padding: '11px 18px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {t('admin.categories.addCta')}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {cats.map((c) => (
          <div
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              ...cardStyle,
              padding: '14px 16px',
              opacity: c.active ? 1 : 0.55,
              animation: 'crmfade .25s ease',
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: 'var(--app-tint)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: BRICO,
                fontWeight: 700,
                fontSize: 16,
                flex: 'none',
              }}
            >
              {c.name[0] ?? '?'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{t('admin.categories.providerCount', { count: providerCount(c) })}</div>
            </div>
            <span
              {...clickable(() => void toggle(c), { pressed: c.active, label: t('a11y.toggleActive', 'Aktywna') })}
              style={{
                width: 40,
                height: 24,
                borderRadius: 12,
                background: c.active ? 'var(--accent)' : 'var(--border)',
                position: 'relative',
                cursor: 'pointer',
                flex: 'none',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: c.active ? 20 : 3,
                  width: 17,
                  height: 17,
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,.25)',
                  transition: 'left .2s',
                }}
              />
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
