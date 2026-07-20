import type { TFunction } from 'i18next';
import clsx from 'clsx';
import type { PaymentMethod } from '../../../api/models';
import { BRICO } from '../../../lib/format';
import { clickable } from '../../../lib/a11y';
import { uppercaseLabelCls, METHOD_KEY } from './constants';

interface Step3SummaryProps {
  t: TFunction;
  isQuote: boolean;
  summary: { k: string; v: string }[];
  paymentMethods: PaymentMethod[];
  method: PaymentMethod | null;
  setMethod: (m: PaymentMethod) => void;
  appName: string;
}

/** Wizard step 3: booking summary + (for instant services) payment method + escrow info note. */
export default function Step3Summary({ t, isQuote, summary, paymentMethods, method, setMethod, appName }: Step3SummaryProps) {
  return (
    <>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h1 style={{ fontFamily: BRICO }} className="text-[19px] font-bold m-0 mb-3.5">
        {isQuote ? t('booking.step3TitleQuote') : t('booking.step3TitleInstant')}
      </h1>
      <div className="bg-surface rounded-[20px] shadow-[var(--shadow)] overflow-hidden">
        {summary.map((r) => (
          <div key={r.k} className="flex justify-between gap-3 py-3.25 px-4 border-b border-border">
            <span className="text-[13px] text-muted flex-none">{r.k}</span>
            <span className="text-[13.5px] font-bold text-right">{r.v}</span>
          </div>
        ))}
      </div>

      {!isQuote && (
        <>
          <div className={clsx(uppercaseLabelCls, 'mx-0 mt-4.5 mb-2')}>{t('booking.paymentMethodLabel')}</div>
          <div role="radiogroup" aria-label={t('booking.paymentMethodLabel')} className="flex flex-col gap-2.25">
            {paymentMethods.map((m) => {
              const sel = m === method;
              const key = METHOD_KEY[m];
              return (
                <div
                  key={m}
                  {...clickable(() => setMethod(m), { pressed: sel })}
                  className={clsx(
                    'flex items-center gap-3 rounded-2xl py-3.25 px-3.5 cursor-pointer bg-surface border-2',
                    sel ? 'border-accent shadow-[var(--shadow)]' : 'border-border shadow-none',
                  )}
                >
                  <span className={clsx('w-5 h-5 rounded-full flex-none', sel ? 'border-[6px] border-accent' : 'border-2 border-border')} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{t(`booking.paymentMethods.${key}.title`)}</div>
                    <div className="text-xs text-muted mt-px">{t(`booking.paymentMethods.${key}.subtitle`)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="flex gap-2.5 bg-surface2 rounded-2xl py-3 px-3.5 mt-3.5 items-center">
        <span aria-hidden="true" className="w-7.5 h-7.5 rounded-full bg-ver-bg text-ver-fg flex items-center justify-center font-bold flex-none">
          ✓
        </span>
        <span className="text-[12.5px] text-muted2 leading-[1.45]">{isQuote ? t('booking.infoQuote') : t('booking.infoInstant', { appName })}</span>
      </div>
    </>
  );
}
