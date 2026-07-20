import clsx from 'clsx';
import { clickable } from '../../lib/a11y';
import { useBookingWizard } from './booking/useBookingWizard';
import Step1Slot from './booking/Step1Slot';
import Step1Describe from './booking/Step1Describe';
import Step2Details from './booking/Step2Details';
import Step3Summary from './booking/Step3Summary';

export default function BookingWizard() {
  const {
    t,
    locale,
    brand,
    isDesktop,
    pv,
    service,
    days,
    windows,
    step,
    slotDay,
    setSlotDay,
    slotTime,
    setSlotTime,
    windowSel,
    setWindowSel,
    notes,
    setNotes,
    address,
    setAddress,
    method,
    setMethod,
    busy,
    times,
    isQuote,
    atSpot,
    summary,
    canNext,
    me,
    nextStep,
    bookBack,
  } = useBookingWizard();

  if (!pv || !service) {
    return <div className="flex-1" />;
  }

  const content = (
    <>
      <div className={clsx('flex-none pt-5', isDesktop ? 'px-6' : 'px-5')}>
        <div className="flex items-center gap-2.5">
          <span
            {...clickable(bookBack, { label: t('a11y.back', 'Wstecz') })}
            className="w-8.5 h-8.5 rounded-full bg-surface2 flex items-center justify-center text-base font-bold cursor-pointer"
          >
            ‹
          </span>
          <div>
            <div className="font-bold text-[15px]">{service.title}</div>
            <div className="text-xs text-muted">
              {pv.name} · {t('booking.step', { step })}
            </div>
          </div>
        </div>
        <div className="h-1.25 rounded-[3px] bg-surface2 mt-3.5 mb-1 overflow-hidden">
          <div
            className="h-full rounded-[3px] bg-accent transition-[width] duration-[0.25s]"
            style={{ width: `${step * 33.4}%` }} // eslint-disable-line react/no-inline-styles -- dynamic: wizard progress derived from `step`
          />
        </div>
      </div>

      <div className={clsx(isDesktop ? 'pt-4 px-6 pb-5.5' : 'flex-1 overflow-auto pt-3.5 px-5 pb-5')}>
        {step === 1 && !isQuote && (
          <Step1Slot t={t} days={days} slotDay={slotDay} setSlotDay={setSlotDay} times={times} slotTime={slotTime} setSlotTime={setSlotTime} atSpot={atSpot} spotAddress={pv.spotAddress ?? undefined} />
        )}

        {step === 1 && isQuote && (
          <Step1Describe t={t} notes={notes} setNotes={setNotes} windows={windows} windowSel={windowSel} setWindowSel={setWindowSel} />
        )}

        {step === 2 && (
          <Step2Details
            t={t}
            locale={locale}
            atSpot={atSpot}
            address={address}
            setAddress={setAddress}
            savedAddresses={me?.savedAddresses ?? []}
            spotAddress={pv.spotAddress ?? undefined}
            distanceKm={pv.distanceKm}
            notes={notes}
            setNotes={setNotes}
          />
        )}

        {step === 3 && (
          <Step3Summary t={t} isQuote={isQuote} summary={summary} paymentMethods={brand.paymentMethods} method={method} setMethod={setMethod} appName={brand.appName} />
        )}
      </div>

      <div className={clsx('flex-none bg-surface border-t border-border', isDesktop ? 'pt-3.5 px-6 pb-5.5' : 'pt-3 px-5 pb-5')}>
        <div
          {...clickable(nextStep)}
          className={clsx(
            'text-center rounded-[18px] p-3.5 text-[15px] font-bold cursor-pointer',
            canNext ? 'bg-accent text-onaccent shadow-[var(--glow)]' : 'bg-surface2 text-[var(--navmuted)] shadow-none',
            busy && 'opacity-70',
          )}
        >
          {step < 3 ? t('booking.cta.next') : isQuote ? t('booking.cta.sendQuote') : t('booking.cta.confirm')}
        </div>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <div className="max-w-160 mt-6.5 mx-auto mb-12">
        <div className="bg-surface rounded-3xl shadow-[var(--shadow)] overflow-hidden">{content}</div>
      </div>
    );
  }

  return <div className="flex-1 flex flex-col overflow-hidden">{content}</div>;
}
