import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminAddCategoryMutation, useAdminCategoriesQuery, useAdminPatchCategoryMutation } from '../../api/hooks';
import type { Category } from '../../api/models';
import { BRICO } from '../../lib/format';
import { clickable } from '../../lib/a11y';
import { useToast } from '../../state/ToastContext';
import { CARD_CLASS } from '../ui';

function providerCount(c: Category): number {
  return c.providerCount ?? c.count ?? 0;
}

const BRICO_STYLE = { fontFamily: BRICO };

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
      <div className="mb-[18px] flex gap-2.5">
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void addCat();
          }}
          placeholder={t('admin.categories.newPlaceholder') ?? ''}
          aria-label={t('admin.categories.newPlaceholder') ?? ''}
          className="max-w-[320px] flex-1 rounded-2xl border-[1.5px] border-border bg-surface px-3.5 py-[11px] font-[Figtree,sans-serif] text-[13px] font-semibold text-text outline-none"
        />
        <span
          {...clickable(() => void addCat())}
          className="cursor-pointer rounded-2xl bg-accent px-[18px] py-[11px] text-[13px] font-bold text-white"
        >
          {t('admin.categories.addCta')}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cats.map((c) => (
          <div
            key={c.id}
            className={clsx('flex items-center gap-3 px-4 py-3.5 animate-[crmfade_.25s_ease]', CARD_CLASS, !c.active && 'opacity-[.55]')}
          >
            <span
              className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-[var(--app-tint)] text-[16px] font-bold text-accent"
              // eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO_STYLE is a shared font-family constant with no Tailwind token mapping
              style={BRICO_STYLE}
            >
              {c.name[0] ?? '?'}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-bold">{c.name}</div>
              <div className="text-[11.5px] text-muted">{t('admin.categories.providerCount', { count: providerCount(c) })}</div>
            </div>
            <span
              {...clickable(() => void toggle(c), { pressed: c.active, label: t('a11y.toggleActive', 'Aktywna') })}
              className={clsx('relative h-6 w-10 flex-none cursor-pointer rounded-xl', c.active ? 'bg-accent' : 'bg-border')}
            >
              <span
                className={clsx(
                  'absolute top-[3px] h-[17px] w-[17px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.25)] transition-[left] duration-200',
                  c.active ? 'left-5' : 'left-[3px]',
                )}
              />
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
