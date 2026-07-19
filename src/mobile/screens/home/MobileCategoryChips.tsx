import type { TFunction } from 'i18next';
import clsx from 'clsx';
import type { Category } from '../../../api/models';
import { clickable } from '../../../lib/a11y';
import { chipVariants } from '../../../components/ui/variants';
import { shortCatLabel } from './constants';

interface MobileCategoryChipsProps {
  t: TFunction;
  cats: Category[];
  catSel: number;
  setCatSel: (i: number) => void;
}

/** Mobile Home, map-off branch: horizontally-scrolling category chip row. */
export default function MobileCategoryChips({ t, cats, catSel, setCatSel }: MobileCategoryChipsProps) {
  return (
    <div className="hide-scroll flex gap-2 overflow-auto mt-4 px-5 pb-1">
      {[t('home.categoriesAll'), ...cats.map((c) => shortCatLabel(c.name))].map((label, i) => {
        const active = i === catSel;
        return (
          <span key={label} {...clickable(() => setCatSel(i), { pressed: active })} className={clsx('flex-none', chipVariants({ active }))}>
            {label}
          </span>
        );
      })}
    </div>
  );
}
