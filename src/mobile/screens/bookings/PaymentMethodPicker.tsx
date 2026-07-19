import type { TFunction } from 'i18next';
import clsx from 'clsx';
import type { Booking, PaymentMethod } from '../../../api/models';
import { paymentMethodLabel } from '../../../lib/format';
import { clickable } from '../../../lib/a11y';
import { ctaGlowCls } from './helpers';

interface PaymentMethodPickerProps {
  t: TFunction;
  b: Booking;
  paymentMethods: PaymentMethod[];
  payFor: number | null;
  setPayFor: (id: number | null) => void;
  payMethod: PaymentMethod | null;
  setPayMethod: (m: PaymentMethod) => void;
  payBusy: boolean;
  onPayNow: (b: Booking) => void;
}

/** Upcoming-booking card: the "needs payment" block — either the payNow CTA or (once opened)
 * the method picker + confirm CTA. */
export default function PaymentMethodPicker({ t, b, paymentMethods, payFor, setPayFor, payMethod, setPayMethod, payBusy, onPayNow }: PaymentMethodPickerProps) {
  return (
    <div className="mt-3 pt-3 border-t border-border">
      {payFor === b.id ? (
        <>
          <div className="text-[11.5px] font-bold text-muted tracking-[0.05em] uppercase mb-2">{t('booking.paymentMethodLabel')}</div>
          <div role="radiogroup" aria-label={t('booking.paymentMethodLabel')} className="flex flex-col gap-2 mb-2.5">
            {paymentMethods.map((m) => {
              const sel = m === payMethod;
              return (
                <div
                  key={m}
                  {...clickable(() => setPayMethod(m), { pressed: sel })}
                  className={clsx('flex items-center gap-2.5 rounded-[14px] py-2.5 px-3 cursor-pointer', sel ? 'border-2 border-accent' : 'border-[1.5px] border-border')}
                >
                  <span className={clsx('w-4 h-4 rounded-full flex-none', sel ? 'border-[5px] border-accent' : 'border-2 border-border')} />
                  <span className="text-[13px] font-bold">{paymentMethodLabel(m, t)}</span>
                </div>
              );
            })}
          </div>
          <div
            {...clickable(() => onPayNow(b))}
            className={clsx(
              'text-center rounded-[14px] p-[11px] text-[13px] font-bold cursor-pointer',
              payMethod ? 'bg-accent text-onaccent shadow-[var(--glow)]' : 'bg-surface2 text-[var(--navmuted)] shadow-none',
              payBusy && 'opacity-70',
            )}
          >
            {t('bookings.payNowCta')}
          </div>
        </>
      ) : (
        <div {...clickable(() => setPayFor(b.id))} className={ctaGlowCls}>
          {t('bookings.payNowCta')}
        </div>
      )}
    </div>
  );
}
