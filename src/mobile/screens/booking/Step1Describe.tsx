import type { TFunction } from 'i18next';
import clsx from 'clsx';
import { BRICO } from '../../../lib/format';
import { stripes } from '../../../components/ui';
import { clickable } from '../../../lib/a11y';
import { uppercaseLabelCls } from './constants';

interface Step1DescribeProps {
  t: TFunction;
  notes: string;
  setNotes: (v: string) => void;
  windows: string[];
  windowSel: string | null;
  setWindowSel: (w: string) => void;
}

/** Wizard step 1 for quote-priced services: describe the job + pick a preferred time window. */
export default function Step1Describe({ t, notes, setNotes, windows, windowSel, setWindowSel }: Step1DescribeProps) {
  return (
    <>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h1 style={{ fontFamily: BRICO }} className="text-[19px] font-bold m-0 mb-1.5">
        {t('booking.describeTitle')}
      </h1>
      <div className="text-[12.5px] text-muted mb-3.5">{t('booking.describeSubtitle')}</div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t('booking.notesPlaceholderQuote') ?? ''}
        aria-label={t('booking.notesPlaceholderQuote') ?? ''}
        className="w-full box-border h-27.5 rounded-2xl border-[1.5px] border-border bg-surface text-text py-3 px-3.5 font-medium text-sm font-['Figtree',sans-serif] resize-none outline-none"
      />
      <div className="flex gap-2 mt-3">
        <div className="w-16 h-16 rounded-[14px] border-[1.5px] border-dashed border-[var(--muted)] flex items-center justify-center text-[var(--muted)] text-[22px]">
          +
        </div>
        <div
          className="w-16 h-16 rounded-[14px]"
          style={{ background: stripes() }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
        />
      </div>
      <div className={clsx(uppercaseLabelCls, 'mx-0 mt-4.5 mb-2')}>{t('booking.preferredWindowLabel')}</div>
      <div className="flex gap-2 flex-wrap">
        {windows.map((w) => {
          const sel = w === windowSel;
          return (
            <span
              key={w}
              {...clickable(() => setWindowSel(w), { pressed: sel })}
              className={clsx(
                'rounded-[14px] py-2.25 px-3.25 text-[12.5px] font-bold cursor-pointer border-[1.5px]',
                sel ? 'bg-accent text-onaccent border-transparent' : 'bg-surface text-muted2 border-border',
              )}
            >
              {w}
            </span>
          );
        })}
      </div>
    </>
  );
}
