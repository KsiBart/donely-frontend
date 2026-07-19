import type { TFunction } from 'i18next';
import { BRICO } from '../../../lib/format';
import { clickable } from '../../../lib/a11y';
import clsx from 'clsx';
import type { WizardDay } from './wizardDays';

interface SlotTime {
  label: string;
  available: boolean;
}

interface Step1SlotProps {
  t: TFunction;
  days: WizardDay[];
  slotDay: number;
  setSlotDay: (i: number) => void;
  times: SlotTime[];
  slotTime: string | null;
  setSlotTime: (label: string) => void;
  atSpot: boolean;
  spotAddress?: string;
}

/** Wizard step 1 for instant-priced services: pick a day + time slot. */
export default function Step1Slot({ t, days, slotDay, setSlotDay, times, slotTime, setSlotTime, atSpot, spotAddress }: Step1SlotProps) {
  return (
    <>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h1 style={{ fontFamily: BRICO }} className="text-[19px] font-bold m-0 mb-3.5">
        {t('booking.chooseSlotTitle')}
      </h1>
      <div role="radiogroup" aria-label={t('booking.chooseSlotTitle')} className="flex gap-2 mb-4">
        {days.map((d, i) => {
          const sel = i === slotDay;
          return (
            <span
              key={d.sub}
              {...clickable(() => setSlotDay(i), { pressed: sel })}
              className={clsx(
                'flex-1 text-center rounded-2xl py-[11px] px-1.5 text-[13px] font-bold cursor-pointer border-2',
                sel ? 'bg-accent text-onaccent border-transparent' : 'bg-surface text-text border-border',
              )}
            >
              {d.label}
              <br />
              <span className="text-[11px] font-semibold opacity-70">{d.sub}</span>
            </span>
          );
        })}
      </div>
      <div role="radiogroup" aria-label={t('a11y.timePicker', 'Wybierz godzinę')} className="grid grid-cols-3 gap-[9px]">
        {times.map((tm) => {
          const disabled = !tm.available;
          const sel = tm.label === slotTime;
          return (
            <span
              key={tm.label}
              {...clickable(() => setSlotTime(tm.label), { pressed: sel, disabled })}
              className={clsx(
                'text-center rounded-[14px] py-3 px-1 text-sm font-bold border-2',
                sel ? 'bg-accent border-transparent' : 'bg-surface border-border',
                disabled ? 'text-[var(--navmuted)] line-through cursor-default' : 'cursor-pointer',
                sel && !disabled && 'text-onaccent',
                !sel && !disabled && 'text-text',
              )}
            >
              {tm.label}
            </span>
          );
        })}
      </div>
      <div className="text-xs text-muted mt-3.5 leading-[1.5]">
        {atSpot ? t('booking.slotNoteAtSpot', { address: spotAddress ?? '' }) : t('booking.slotNoteAtClient')}
      </div>
    </>
  );
}
