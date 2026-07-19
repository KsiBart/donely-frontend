import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCheckoutMutation, useCreateBookingMutation, useMockCompletePaymentMutation, useProviderQuery, useSlotsQuery } from '../../../api/hooks';
import type { CreateBookingPayload, PaymentMethod, ProviderDetail, Service } from '../../../api/models';
import { useBrand } from '../../../brand';
import { toIntlLocale } from '../../../i18n';
import { useIsDesktop } from '../../../lib/useIsDesktop';
import { isoDay } from '../../../lib/format';
import { useAuth } from '../../../state/AuthContext';
import { useToast } from '../../../state/ToastContext';
import { buildDays } from './wizardDays';

/** All state, data-fetching wiring, and handlers for the booking wizard screen. Extracted verbatim
 * from BookingWizard.tsx so the component file only holds layout/JSX. */
export function useBookingWizard() {
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

  const slotLabel = slotTime && days[slotDay] ? `${days[slotDay].label}, ${days[slotDay].sub} · ${slotTime}` : '';
  const placeVal = pv
    ? atSpot
      ? t('booking.summary.placeAtSpot', { address: pv.spotAddress ?? '' })
      : t('booking.summary.placeAtClient', { address })
    : '';
  const step1ok = isQuote ? notes.trim().length > 0 && !!windowSel : !!slotTime;
  const step3ok = isQuote ? true : !!method;
  const canNext = step === 1 ? step1ok : step === 3 ? step3ok : true;

  const summary: { k: string; v: string }[] =
    pv && service
      ? isQuote
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
          ]
      : [];

  const submit = async () => {
    if (!pv || !service) return;
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

  return {
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
  };
}
