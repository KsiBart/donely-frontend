import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useCheckoutMutation, useCreateBookingMutation, useMockCompletePaymentMutation, useProviderQuery, useSlotsQuery } from '../../api/hooks';
import type { CreateBookingPayload, PaymentMethod, ProviderDetail, Service } from '../../api/models';
import { useBrand } from '../../brand';
import { stripes } from '../../components/ui';
import { toIntlLocale } from '../../i18n';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { BRICO, ddmm, formatKm, isoDay } from '../../lib/format';
import { useAuth } from '../../state/AuthContext';
import { useToast } from '../../state/ToastContext';
import { clickable } from '../../lib/a11y';

interface WizardDay {
  label: string;
  sub: string;
  date: Date;
}

function buildDays(t: (k: string) => string, dowFull: string[], dowShort: string[]): WizardDay[] {
  const out: WizardDay[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const label = i === 0 ? t('booking.dayToday') : i === 1 ? t('booking.dayTomorrow') : dowFull[d.getDay()];
    const sub = i === 2 ? ddmm(d) : `${dowShort[d.getDay()]} ${ddmm(d)}`;
    out.push({ label, sub, date: d });
  }
  return out;
}

const METHOD_KEY: Record<PaymentMethod, string> = {
  P24_BLIK: 'p24',
  PAYPAL: 'paypal',
};

// Small-caps section eyebrow ("ADRES" / "METODA PŁATNOŚCI" / …) — margin varies per call site so
// it's applied via clsx at each usage rather than baked into this base string.
const uppercaseLabelCls = 'text-xs font-bold text-muted tracking-[0.06em] uppercase';

export default function BookingWizard() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const brand = useBrand();
  const { providerId, serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { me } = useAuth();
  const { showToast } = useToast();
  const isDesktop = useIsDesktop();

  const navState = (location.state ?? {}) as { provider?: ProviderDetail; service?: Service };
  const [pv, setPv] = useState<ProviderDetail | null>(navState.provider ?? null);
  const [service, setService] = useState<Service | null>(navState.service ?? null);

  const dowFull = t('common.dowFull', { returnObjects: true }) as unknown as string[];
  const dowShort = t('common.dowShort', { returnObjects: true }) as unknown as string[];
  const windows = t('booking.windows', { returnObjects: true }) as unknown as string[];
  const days = useMemo(() => buildDays(t, dowFull, dowShort), [i18n.language]); // eslint-disable-line react-hooks/exhaustive-deps

  const [step, setStep] = useState(1);
  const [slotDay, setSlotDay] = useState(0);
  const [slotTime, setSlotTime] = useState<string | null>(null);
  const [windowSel, setWindowSel] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState(
    () => me?.savedAddresses?.[0]?.addr ?? me?.locationLabel ?? '',
  );
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [busy, setBusy] = useState(false);

  const createBookingMutation = useCreateBookingMutation();
  const checkoutMutation = useCheckoutMutation();
  const mockCompletePaymentMutation = useMockCompletePaymentMutation();

  const { data: fetchedProvider, error: providerError } = useProviderQuery(!pv ? providerId : undefined);

  useEffect(() => {
    if (!fetchedProvider) return;
    setPv(fetchedProvider);
    setService(fetchedProvider.services.find((s) => String(s.id) === serviceId) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedProvider]);

  useEffect(() => {
    if (providerError) showToast(providerError instanceof Error ? providerError.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerError]);

  const isQuote = service?.priceType === 'QUOTE';
  const atSpot = service?.location === 'SPOT';

  const slotDayIso = days[slotDay] ? isoDay(days[slotDay].date) : '';
  const { data: slotsData, error: slotsError } = useSlotsQuery(providerId, slotDayIso, !isQuote && !!service);
  const times = slotsData?.times ?? [];

  useEffect(() => {
    setSlotTime(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, slotDay, isQuote, !!service]);

  useEffect(() => {
    if (slotsError) showToast(slotsError instanceof Error ? slotsError.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotsError]);

  if (!pv || !service) {
    return <div className="flex-1" />;
  }

  const slotLabel = slotTime ? `${days[slotDay].label}, ${days[slotDay].sub} · ${slotTime}` : '';
  const placeVal = atSpot
    ? t('booking.summary.placeAtSpot', { address: pv.spotAddress ?? '' })
    : t('booking.summary.placeAtClient', { address });
  const step1ok = isQuote ? notes.trim().length > 0 && !!windowSel : !!slotTime;
  const step3ok = isQuote ? true : !!method;
  const canNext = step === 1 ? step1ok : step === 3 ? step3ok : true;

  const summary: { k: string; v: string }[] = isQuote
    ? [
        { k: t('booking.summary.provider'), v: pv.name },
        { k: t('booking.summary.service'), v: service.title },
        { k: t('booking.summary.preferredDate'), v: windowSel ?? '' },
        { k: t('booking.summary.place'), v: placeVal },
        { k: t('booking.summary.price'), v: t('booking.summary.priceQuotePending') },
      ]
    : [
        { k: t('booking.summary.provider'), v: pv.name },
        { k: t('booking.summary.service'), v: service.title },
        { k: t('booking.summary.date'), v: slotLabel },
        { k: t('booking.summary.place'), v: placeVal },
        { k: t('booking.summary.price'), v: service.priceLabel },
      ];

  const submit = async () => {
    if (busy) return;
    if (!isQuote && !method) {
      showToast(t('booking.validation.choosePaymentMethod'));
      return;
    }
    setBusy(true);
    try {
      const payload: CreateBookingPayload = {
        providerProfileId: pv.id,
        serviceId: service.id,
        notes,
        address: atSpot ? (pv.spotAddress ?? '') : address,
        atSpot: !!atSpot,
      };
      if (isQuote) {
        payload.preferredWindow = windowSel ?? undefined;
      } else if (slotTime) {
        const [h, m] = slotTime.split(':').map(Number);
        const dt = new Date(days[slotDay].date);
        dt.setHours(h, m, 0, 0);
        payload.startAt = dt.toISOString();
      }
      const booking = await createBookingMutation.mutateAsync(payload);

      if (isQuote) {
        navigate('/success', {
          replace: true,
          state: {
            isQuote: true,
            atSpot,
            providerName: pv.name,
            spotAddr: pv.spotAddress ?? '',
            address,
            slotLabel,
          },
        });
        return;
      }

      // Phase 2 — escrow checkout: instant/accepted-quote bookings need a HELD payment
      // before they become CONFIRMED.
      try {
        const chk = await checkoutMutation.mutateAsync({ bookingId: booking.id, method: method! });
        if (chk.redirectUrl) {
          window.location.href = chk.redirectUrl;
          return;
        }
        // mock mode — simulate the customer finishing payment on the gateway's hosted page
        await mockCompletePaymentMutation.mutateAsync(chk.paymentId);
        navigate('/success', {
          replace: true,
          state: {
            isQuote: false,
            atSpot,
            providerName: pv.name,
            spotAddr: pv.spotAddress ?? '',
            address,
            slotLabel,
          },
        });
      } catch (e) {
        showToast(e instanceof Error ? e.message : t('booking.paymentFailed'));
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('booking.createFailed'));
    } finally {
      setBusy(false);
    }
  };

  const nextStep = () => {
    if (!canNext) {
      showToast(
        step === 3 && !isQuote
          ? t('booking.validation.choosePaymentMethod')
          : isQuote
            ? t('booking.validation.describeAndWindow')
            : t('booking.validation.chooseTime'),
      );
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    void submit();
  };

  const bookBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  };

  const content = (
    <>
      <div className={clsx('flex-none pt-5', isDesktop ? 'px-6' : 'px-5')}>
        <div className="flex items-center gap-2.5">
          <span
            {...clickable(bookBack, { label: t('a11y.back', 'Wstecz') })}
            className="w-[34px] h-[34px] rounded-full bg-surface2 flex items-center justify-center text-base font-bold cursor-pointer"
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
        <div className="h-[5px] rounded-[3px] bg-surface2 mt-3.5 mb-1 overflow-hidden">
          <div
            className="h-full rounded-[3px] bg-accent transition-[width] duration-[0.25s]"
            style={{ width: `${step * 33.4}%` }} // eslint-disable-line react/no-inline-styles -- dynamic: wizard progress derived from `step`
          />
        </div>
      </div>

      <div className={clsx(isDesktop ? 'pt-4 px-6 pb-[22px]' : 'flex-1 overflow-auto pt-3.5 px-5 pb-5')}>
        {step === 1 && !isQuote && (
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
              {atSpot ? t('booking.slotNoteAtSpot', { address: pv.spotAddress ?? '' }) : t('booking.slotNoteAtClient')}
            </div>
          </>
        )}

        {step === 1 && isQuote && (
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
              className="w-full box-border h-[110px] rounded-2xl border-[1.5px] border-border bg-surface text-text py-3 px-3.5 font-medium text-sm font-['Figtree',sans-serif] resize-none outline-none"
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
            <div className={clsx(uppercaseLabelCls, 'mx-0 mt-[18px] mb-2')}>{t('booking.preferredWindowLabel')}</div>
            <div className="flex gap-2 flex-wrap">
              {windows.map((w) => {
                const sel = w === windowSel;
                return (
                  <span
                    key={w}
                    {...clickable(() => setWindowSel(w), { pressed: sel })}
                    className={clsx(
                      'rounded-[14px] py-[9px] px-[13px] text-[12.5px] font-bold cursor-pointer border-[1.5px]',
                      sel ? 'bg-accent text-onaccent border-transparent' : 'bg-surface text-muted2 border-border',
                    )}
                  >
                    {w}
                  </span>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
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
                  className="w-full box-border rounded-2xl border-[1.5px] border-accent bg-surface text-text py-[13px] px-3.5 font-semibold text-sm font-['Figtree',sans-serif] outline-none"
                />
                {(me?.savedAddresses ?? []).length > 0 && (
                  <div className="flex gap-2 mt-2.5 flex-wrap">
                    {(me?.savedAddresses ?? []).map((a) => (
                      <span
                        key={a.label}
                        {...clickable(() => setAddress(a.addr))}
                        className="bg-surface2 rounded-xl py-1.5 px-[11px] text-xs font-semibold text-muted2 cursor-pointer"
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
                <div className="h-[110px] relative bg-[var(--map)]">
                  <div className="absolute -left-[20%] top-[40%] w-[140%] h-4 bg-[var(--road)] rotate-[-6deg]" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-accent border-[3px] border-white shadow-[var(--glow)]" />
                </div>
                <div className="py-[13px] px-[15px]">
                  <div className="text-[10.5px] font-bold text-accent tracking-[0.05em] uppercase mb-1">{t('booking.atSpotBadge')}</div>
                  <div className="font-bold text-[14.5px]">{pv.spotAddress}</div>
                  <div className="text-[12.5px] text-muted mt-[3px]">{t('booking.atSpotDistance', { distance: formatKm(pv.distanceKm, locale) })}</div>
                </div>
              </div>
            )}
            <label htmlFor="booking-notes" className={clsx(uppercaseLabelCls, 'mx-0 mt-[18px] mb-2 block')}>
              {t('booking.notesLabel')}
            </label>
            <textarea
              id="booking-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={(atSpot ? t('booking.notesPlaceholderSpot') : t('booking.notesPlaceholderClient')) ?? ''}
              className="w-full box-border h-[84px] rounded-2xl border-[1.5px] border-border bg-surface text-text py-3 px-3.5 font-medium text-sm font-['Figtree',sans-serif] resize-none outline-none"
            />
          </>
        )}

        {step === 3 && (
          <>
            {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
            <h1 style={{ fontFamily: BRICO }} className="text-[19px] font-bold m-0 mb-3.5">
              {isQuote ? t('booking.step3TitleQuote') : t('booking.step3TitleInstant')}
            </h1>
            <div className="bg-surface rounded-[20px] shadow-[var(--shadow)] overflow-hidden">
              {summary.map((r) => (
                <div key={r.k} className="flex justify-between gap-3 py-[13px] px-4 border-b border-border">
                  <span className="text-[13px] text-muted flex-none">{r.k}</span>
                  <span className="text-[13.5px] font-bold text-right">{r.v}</span>
                </div>
              ))}
            </div>

            {!isQuote && (
              <>
                <div className={clsx(uppercaseLabelCls, 'mx-0 mt-[18px] mb-2')}>{t('booking.paymentMethodLabel')}</div>
                <div role="radiogroup" aria-label={t('booking.paymentMethodLabel')} className="flex flex-col gap-[9px]">
                  {brand.paymentMethods.map((m) => {
                    const sel = m === method;
                    const key = METHOD_KEY[m];
                    return (
                      <div
                        key={m}
                        {...clickable(() => setMethod(m), { pressed: sel })}
                        className={clsx(
                          'flex items-center gap-3 rounded-2xl py-[13px] px-3.5 cursor-pointer bg-surface border-2',
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
              <span aria-hidden="true" className="w-[30px] h-[30px] rounded-full bg-ver-bg text-ver-fg flex items-center justify-center font-bold flex-none">
                ✓
              </span>
              <span className="text-[12.5px] text-muted2 leading-[1.45]">{isQuote ? t('booking.infoQuote') : t('booking.infoInstant', { appName: brand.appName })}</span>
            </div>
          </>
        )}
      </div>

      <div className={clsx('flex-none bg-surface border-t border-border', isDesktop ? 'pt-3.5 px-6 pb-[22px]' : 'pt-3 px-5 pb-5')}>
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
      <div className="max-w-[640px] mt-[26px] mx-auto mb-12">
        <div className="bg-surface rounded-3xl shadow-[var(--shadow)] overflow-hidden">{content}</div>
      </div>
    );
  }

  return <div className="flex-1 flex flex-col overflow-hidden">{content}</div>;
}
