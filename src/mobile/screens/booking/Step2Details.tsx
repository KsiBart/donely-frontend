import type { TFunction } from 'i18next';
import clsx from 'clsx';
import type { SavedAddress } from '../../../api/models';
import { BRICO, formatKm } from '../../../lib/format';
import { clickable } from '../../../lib/a11y';
import { uppercaseLabelCls } from './constants';

interface Step2DetailsProps {
  t: TFunction;
  locale: string;
  atSpot: boolean;
  address: string;
  setAddress: (v: string) => void;
  savedAddresses: SavedAddress[];
  spotAddress?: string;
  distanceKm: number;
  notes: string;
  setNotes: (v: string) => void;
}

/** Wizard step 2: address (or the provider's spot location) + free-text notes. */
export default function Step2Details({ t, locale, atSpot, address, setAddress, savedAddresses, spotAddress, distanceKm, notes, setNotes }: Step2DetailsProps) {
  return (
    <>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h1 style={{ fontFamily: BRICO }} className="text-[19px] font-bold m-0 mb-3.5">
        {atSpot ? t('booking.step2TitleAtSpot') : t('booking.step2TitleAtClient')}
      </h1>
      {!atSpot && (
        <>
          <label htmlFor="booking-address" className={clsx(uppercaseLabelCls, 'mb-2 block')}>
            {t('booking.addressLabel')}
          </label>
          <input
            id="booking-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full box-border rounded-2xl border-[1.5px] border-accent bg-surface text-text py-3.25 px-3.5 font-semibold text-sm font-['Figtree',sans-serif] outline-none"
          />
          {savedAddresses.length > 0 && (
            <div className="flex gap-2 mt-2.5 flex-wrap">
              {savedAddresses.map((a) => (
                <span
                  key={a.label}
                  {...clickable(() => setAddress(a.addr))}
                  className="bg-surface2 rounded-xl py-1.5 px-2.75 text-xs font-semibold text-muted2 cursor-pointer"
                >
                  {a.label} · {a.addr}
                </span>
              ))}
            </div>
          )}
        </>
      )}
      {atSpot && (
        <div className="bg-surface rounded-[18px] overflow-hidden shadow-[var(--shadow)]">
          <div className="h-27.5 relative bg-[var(--map)]">
            <div className="absolute -left-[20%] top-[40%] w-[140%] h-4 bg-[var(--road)] rotate-[-6deg]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-accent border-[3px] border-white shadow-[var(--glow)]" />
          </div>
          <div className="py-3.25 px-3.75">
            <div className="text-[10.5px] font-bold text-accent tracking-[0.05em] uppercase mb-1">{t('booking.atSpotBadge')}</div>
            <div className="font-bold text-[14.5px]">{spotAddress}</div>
            <div className="text-[12.5px] text-muted mt-0.75">{t('booking.atSpotDistance', { distance: formatKm(distanceKm, locale) })}</div>
          </div>
        </div>
      )}
      <label htmlFor="booking-notes" className={clsx(uppercaseLabelCls, 'mx-0 mt-4.5 mb-2 block')}>
        {t('booking.notesLabel')}
      </label>
      <textarea
        id="booking-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={(atSpot ? t('booking.notesPlaceholderSpot') : t('booking.notesPlaceholderClient')) ?? ''}
        className="w-full box-border h-21 rounded-2xl border-[1.5px] border-border bg-surface text-text py-3 px-3.5 font-medium text-sm font-['Figtree',sans-serif] resize-none outline-none"
      />
    </>
  );
}
