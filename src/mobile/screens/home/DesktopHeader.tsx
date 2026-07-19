import type { TFunction } from 'i18next';
import clsx from 'clsx';
import type { Category } from '../../../api/models';
import { BRICO } from '../../../lib/format';
import { SparkleIcon } from '../../../components/ui';
import { clickable } from '../../../lib/a11y';
import { shortCatLabel } from './constants';
import SegToggle from './SegToggle';

interface DesktopHeaderProps {
  t: TFunction;
  query: string;
  setQuery: (v: string) => void;
  runAI: () => void;
  cats: Category[];
  catSel: number;
  setCatSel: (i: number) => void;
  providersCount: number;
  relocate: () => void;
  myLocation: string;
  locating: boolean;
  mapOn: boolean;
  setMapOn: (v: boolean) => void;
}

/** Desktop-only Home header: search bar, category pills, and the title/location/toggle row. */
export default function DesktopHeader({ t, query, setQuery, runAI, cats, catSel, setCatSel, providersCount, relocate, myLocation, locating, mapOn, setMapOn }: DesktopHeaderProps) {
  return (
    <>
      <div className="bg-surface border-[1.5px] border-accent rounded-[22px] py-[5px] pr-[5px] pl-[18px] flex items-center gap-[11px] shadow-[var(--shadow)]">
        <SparkleIcon size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') runAI();
          }}
          placeholder={t('home.searchPlaceholder')}
          aria-label={t('home.searchPlaceholder')}
          className="flex-1 min-w-0 border-none bg-transparent text-text outline-none py-2.5 px-0 font-semibold text-[14.5px] font-['Figtree',sans-serif]"
        />
        <span {...clickable(runAI)} className="flex-none h-[42px] rounded-[17px] bg-accent text-onaccent flex items-center justify-center gap-[7px] font-bold text-[13.5px] px-[18px] cursor-pointer">
          {t('home.searchCta')} <span aria-hidden="true">→</span>
        </span>
      </div>

      <div className="flex gap-2 mt-3.5 flex-wrap">
        {[t('home.categoriesAll'), ...cats.map((c) => shortCatLabel(c.name))].map((label, i) => {
          const active = i === catSel;
          return (
            <span
              key={label}
              {...clickable(() => setCatSel(i), { pressed: active })}
              className={clsx(
                'flex-none rounded-2xl py-[7px] px-3.5 text-[12.5px] cursor-pointer',
                active ? 'bg-accent text-onaccent font-bold' : 'bg-surface text-muted2 font-medium',
              )}
            >
              {label}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mx-0 mt-[26px] mb-3.5">
        {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
        <h1 style={{ fontFamily: BRICO }} className="text-xl font-bold m-0">
          {t('home.providersCount', { count: providersCount })}
        </h1>
        <span {...clickable(relocate)} title={t('home.changeLocation')} className="inline-flex items-center gap-1.5 text-[12.5px] text-muted cursor-pointer">
          <span aria-hidden="true">◉</span> {myLocation}
          <span className="text-accent font-bold">· {locating ? t('home.locating') : t('home.changeLocation')}</span>
        </span>
        <span className="ml-auto flex items-center gap-3.5">
          {!mapOn && <span className="text-[12.5px] text-muted cursor-pointer">{t('home.sortNearest')}</span>}
          <SegToggle t={t} mapOn={mapOn} setMapOn={setMapOn} />
        </span>
      </div>
    </>
  );
}
