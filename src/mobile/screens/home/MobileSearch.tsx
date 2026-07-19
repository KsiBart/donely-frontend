import type { TFunction } from 'i18next';
import { SparkleIcon } from '../../../components/ui';
import { clickable } from '../../../lib/a11y';

interface MobileSearchProps {
  t: TFunction;
  query: string;
  setQuery: (v: string) => void;
  runAI: () => void;
  suggestions: string[];
}

/** Mobile Home, map-off branch: AI search bar + quick-suggestion chips. */
export default function MobileSearch({ t, query, setQuery, runAI, suggestions }: MobileSearchProps) {
  return (
    <>
      <div className="mt-3.5 mx-5 bg-surface border-[1.5px] border-accent rounded-[20px] p-1 pl-3.5 flex items-center gap-[9px] shadow-[var(--shadow)]">
        <SparkleIcon size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') runAI();
          }}
          placeholder={t('home.searchPlaceholder')}
          aria-label={t('home.searchPlaceholder')}
          className="flex-1 min-w-0 border-none bg-transparent text-text outline-none py-2.5 px-0 font-semibold text-[13.5px] font-['Figtree',sans-serif]"
        />
        <span {...clickable(runAI, { label: t('home.searchCta') })} className="flex-none w-[38px] h-[38px] rounded-2xl bg-accent text-onaccent flex items-center justify-center font-bold cursor-pointer">
          →
        </span>
      </div>

      <div className="flex gap-[7px] mt-2.5 mx-5 flex-wrap">
        {suggestions.map((s) => (
          <span
            key={s}
            {...clickable(() => setQuery(s))}
            className="border border-border-strong bg-surface rounded-[13px] py-1.5 px-[11px] text-[11.5px] font-semibold text-muted2 cursor-pointer"
          >
            {s}
          </span>
        ))}
      </div>
    </>
  );
}
