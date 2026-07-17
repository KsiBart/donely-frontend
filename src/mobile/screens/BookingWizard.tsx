import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { CreateBookingPayload, PaymentMethod, ProviderDetail, Service } from '../../api/types';
import { useBrand } from '../../brand';
import { stripes } from '../../components/ui';
import { toIntlLocale } from '../../i18n';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { BRICO, ddmm, formatKm, isoDay } from '../../lib/format';
import { useAuth } from '../../state/AuthContext';
import { useToast } from '../../state/ToastContext';

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
  const [times, setTimes] = useState<{ label: string; available: boolean }[]>([]);
  const [windowSel, setWindowSel] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState(
    () => me?.savedAddresses?.[0]?.addr ?? me?.locationLabel ?? '',
  );
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (pv || !providerId) return;
    api
      .provider(providerId)
      .then((d) => {
        setPv(d);
        setService(d.services.find((s) => String(s.id) === serviceId) ?? null);
      })
      .catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const isQuote = service?.priceType === 'QUOTE';
  const atSpot = service?.location === 'SPOT';

  useEffect(() => {
    if (!providerId || isQuote || !service) return;
    setSlotTime(null);
    api
      .slots(providerId, isoDay(days[slotDay].date))
      .then((r) => setTimes(r.times))
      .catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, slotDay, isQuote, !!service]);

  if (!pv || !service) {
    return <div style={{ flex: 1 }} />;
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
      const booking = await api.createBooking(payload);

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
        const chk = await api.checkout(booking.id, method!);
        if (chk.redirectUrl) {
          window.location.href = chk.redirectUrl;
          return;
        }
        // mock mode — simulate the customer finishing payment on the gateway's hosted page
        await api.mockCompletePayment(chk.paymentId);
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

  const uppercaseLabel: CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--muted)',
    letterSpacing: '.06em',
    textTransform: 'uppercase',
  };

  const content = (
    <>
      <div style={{ padding: isDesktop ? '20px 24px 0' : '20px 20px 0', flex: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            onClick={bookBack}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--surface2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ‹
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{service.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {pv.name} · {t('booking.step', { step })}
            </div>
          </div>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: 'var(--surface2)', margin: '14px 0 4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: 'var(--accent)', width: `${step * 33.4}%`, transition: 'width .25s' }} />
        </div>
      </div>

      <div style={isDesktop ? { padding: '16px 24px 22px' } : { flex: 1, overflow: 'auto', padding: '14px 20px 20px' }}>
        {step === 1 && !isQuote && (
          <>
            <div style={{ fontFamily: BRICO, fontSize: 19, fontWeight: 700, marginBottom: 14 }}>{t('booking.chooseSlotTitle')}</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {days.map((d, i) => {
                const sel = i === slotDay;
                return (
                  <span
                    key={d.sub}
                    onClick={() => setSlotDay(i)}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      borderRadius: 16,
                      padding: '11px 6px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: sel ? 'var(--accent)' : 'var(--surface)',
                      color: sel ? 'var(--onaccent)' : 'var(--text)',
                      border: sel ? '2px solid transparent' : '2px solid var(--border)',
                    }}
                  >
                    {d.label}
                    <br />
                    <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>{d.sub}</span>
                  </span>
                );
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
              {times.map((tm) => {
                const disabled = !tm.available;
                const sel = tm.label === slotTime;
                return (
                  <span
                    key={tm.label}
                    onClick={() => {
                      if (!disabled) setSlotTime(tm.label);
                    }}
                    style={{
                      textAlign: 'center',
                      borderRadius: 14,
                      padding: '12px 4px',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: disabled ? 'default' : 'pointer',
                      background: sel ? 'var(--accent)' : 'var(--surface)',
                      color: disabled ? 'var(--navmuted)' : sel ? 'var(--onaccent)' : 'var(--text)',
                      border: sel ? '2px solid transparent' : '2px solid var(--border)',
                      textDecoration: disabled ? 'line-through' : 'none',
                    }}
                  >
                    {tm.label}
                  </span>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 14, lineHeight: 1.5 }}>
              {atSpot
                ? t('booking.slotNoteAtSpot', { address: pv.spotAddress ?? '' })
                : t('booking.slotNoteAtClient')}
            </div>
          </>
        )}

        {step === 1 && isQuote && (
          <>
            <div style={{ fontFamily: BRICO, fontSize: 19, fontWeight: 700, marginBottom: 6 }}>{t('booking.describeTitle')}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>{t('booking.describeSubtitle')}</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('booking.notesPlaceholderQuote') ?? ''}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                height: 110,
                borderRadius: 16,
                border: '1.5px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                padding: '12px 14px',
                font: "500 14px 'Figtree', sans-serif",
                resize: 'none',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  border: '1.5px dashed var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--muted)',
                  fontSize: 22,
                }}
              >
                +
              </div>
              <div style={{ width: 64, height: 64, borderRadius: 14, background: stripes() }} />
            </div>
            <div style={{ ...uppercaseLabel, margin: '18px 0 8px' }}>{t('booking.preferredWindowLabel')}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {windows.map((w) => {
                const sel = w === windowSel;
                return (
                  <span
                    key={w}
                    onClick={() => setWindowSel(w)}
                    style={{
                      borderRadius: 14,
                      padding: '9px 13px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: sel ? 'var(--accent)' : 'var(--surface)',
                      color: sel ? 'var(--onaccent)' : 'var(--muted2)',
                      border: sel ? '1.5px solid transparent' : '1.5px solid var(--border)',
                    }}
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
            <div style={{ fontFamily: BRICO, fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
              {atSpot ? t('booking.step2TitleAtSpot') : t('booking.step2TitleAtClient')}
            </div>
            {!atSpot && (
              <>
                <div style={{ ...uppercaseLabel, marginBottom: 8 }}>{t('booking.addressLabel')}</div>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    borderRadius: 16,
                    border: '1.5px solid var(--accent)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    padding: '13px 14px',
                    font: "600 14px 'Figtree', sans-serif",
                    outline: 'none',
                  }}
                />
                {(me?.savedAddresses ?? []).length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {(me?.savedAddresses ?? []).map((a) => (
                      <span
                        key={a.label}
                        onClick={() => setAddress(a.addr)}
                        style={{
                          background: 'var(--surface2)',
                          borderRadius: 12,
                          padding: '6px 11px',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--muted2)',
                          cursor: 'pointer',
                        }}
                      >
                        {a.label} · {a.addr}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
            {atSpot && (
              <div style={{ background: 'var(--surface)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                <div style={{ height: 110, position: 'relative', background: 'var(--map)' }}>
                  <div style={{ position: 'absolute', left: '-20%', top: '40%', width: '140%', height: 16, background: 'var(--road)', transform: 'rotate(-6deg)' }} />
                  <span
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%,-50%)',
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      border: '3px solid #fff',
                      boxShadow: 'var(--glow)',
                    }}
                  />
                </div>
                <div style={{ padding: '13px 15px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {t('booking.atSpotBadge')}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{pv.spotAddress}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>
                    {t('booking.atSpotDistance', { distance: formatKm(pv.distanceKm, locale) })}
                  </div>
                </div>
              </div>
            )}
            <div style={{ ...uppercaseLabel, margin: '18px 0 8px' }}>{t('booking.notesLabel')}</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={(atSpot ? t('booking.notesPlaceholderSpot') : t('booking.notesPlaceholderClient')) ?? ''}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                height: 84,
                borderRadius: 16,
                border: '1.5px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                padding: '12px 14px',
                font: "500 14px 'Figtree', sans-serif",
                resize: 'none',
                outline: 'none',
              }}
            />
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ fontFamily: BRICO, fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
              {isQuote ? t('booking.step3TitleQuote') : t('booking.step3TitleInstant')}
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: 20, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              {summary.map((r) => (
                <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)', flex: 'none' }}>{r.k}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, textAlign: 'right' }}>{r.v}</span>
                </div>
              ))}
            </div>

            {!isQuote && (
              <>
                <div style={{ ...uppercaseLabel, margin: '18px 0 8px' }}>{t('booking.paymentMethodLabel')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {brand.paymentMethods.map((m) => {
                    const sel = m === method;
                    const key = METHOD_KEY[m];
                    return (
                      <div
                        key={m}
                        onClick={() => setMethod(m)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          borderRadius: 16,
                          padding: '13px 14px',
                          cursor: 'pointer',
                          background: sel ? 'var(--surface)' : 'var(--surface)',
                          border: sel ? '2px solid var(--accent)' : '2px solid var(--border)',
                          boxShadow: sel ? 'var(--shadow)' : 'none',
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: sel ? '6px solid var(--accent)' : '2px solid var(--border)',
                            flex: 'none',
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{t(`booking.paymentMethods.${key}.title`)}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{t(`booking.paymentMethods.${key}.subtitle`)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 10, background: 'var(--surface2)', borderRadius: 16, padding: '12px 14px', marginTop: 14, alignItems: 'center' }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'var(--ver-bg)',
                  color: 'var(--ver-fg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  flex: 'none',
                }}
              >
                ✓
              </span>
              <span style={{ fontSize: 12.5, color: 'var(--muted2)', lineHeight: 1.45 }}>
                {isQuote ? t('booking.infoQuote') : t('booking.infoInstant', { appName: brand.appName })}
              </span>
            </div>
          </>
        )}
      </div>

      <div style={{ flex: 'none', padding: isDesktop ? '14px 24px 22px' : '12px 20px 20px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div
          onClick={nextStep}
          style={{
            textAlign: 'center',
            background: canNext ? 'var(--accent)' : 'var(--surface2)',
            color: canNext ? 'var(--onaccent)' : 'var(--navmuted)',
            borderRadius: 18,
            padding: 14,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: canNext ? 'var(--glow)' : 'none',
            opacity: busy ? 0.7 : 1,
          }}
        >
          {step < 3 ? t('booking.cta.next') : isQuote ? t('booking.cta.sendQuote') : t('booking.cta.confirm')}
        </div>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <div style={{ maxWidth: 640, margin: '26px auto 48px' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 24, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>{content}</div>
      </div>
    );
  }

  return <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>{content}</div>;
}
