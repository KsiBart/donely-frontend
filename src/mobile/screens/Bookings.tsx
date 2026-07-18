import { useEffect, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { Booking, PaymentMethod } from '../../api/types';
import { useBrand } from '../../brand';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { AvatarTile } from '../../components/ui';
import { BRICO, bookingStatusLabel, dayLabel, formatZl, initials, paymentMethodLabel, toIntlLocale, whenLabel } from '../../lib/format';
import { useToast } from '../../state/ToastContext';
import { clickable } from '../../lib/a11y';

function providerName(b: Booking): string {
  return b.providerName ?? b.provider?.name ?? '';
}
function providerInit(b: Booking): string {
  return b.providerInit ?? b.provider?.init ?? initials(providerName(b));
}
function serviceTitle(b: Booking): string {
  return b.serviceTitle ?? b.service?.title ?? '';
}
function hasReview(b: Booking): boolean {
  return b.hasReview ?? !!b.review;
}
function isFrozen(b: Booking): boolean {
  return b.payment?.status === 'HELD';
}

export default function BookingsTab() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const brand = useBrand();
  const { showToast } = useToast();
  const isDesktop = useIsDesktop();
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [completed, setCompleted] = useState<Booking[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [reviewFor, setReviewFor] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  const [approving, setApproving] = useState<number | null>(null);
  // Phase 2 — escrow: accepted quotes and un/under-paid instant bookings need a HELD payment
  // before they can become CONFIRMED. `payFor` tracks which card has its method picker open.
  const [payFor, setPayFor] = useState<number | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod | null>(null);
  const [payBusy, setPayBusy] = useState(false);

  const load = () =>
    api
      .bookings()
      .then((r) => {
        setUpcoming(r.upcoming);
        setCompleted(r.completed);
      })
      .catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function locLine(b: Booking): string {
    return b.atSpot ? t('bookings.locLineAtSpot', { address: b.address }) : t('bookings.locLineAtClient', { address: b.address });
  }

  const cancel = async (b: Booking) => {
    try {
      await api.cancelBooking(b.id);
      showToast(t('bookings.cancelToast', { id: b.id }));
      void load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const acceptQuote = async (b: Booking) => {
    try {
      await api.acceptQuote(b.id);
      // Accepting a quote does NOT confirm the booking — it only makes payment required
      // (backend keeps status PENDING until a HELD payment lands). Open the method picker
      // right away so the customer can finish the escrow checkout.
      showToast(t('bookings.quoteAcceptedToast'));
      setPayFor(b.id);
      void load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const payNow = async (b: Booking) => {
    if (!payMethod || payBusy) return;
    setPayBusy(true);
    try {
      const chk = await api.checkout(b.id, payMethod);
      if (chk.redirectUrl) {
        window.location.href = chk.redirectUrl;
        return;
      }
      // mock mode — simulate the customer finishing payment on the gateway's hosted page
      await api.mockCompletePayment(chk.paymentId);
      showToast(t('bookings.paymentHeldToast'));
      setPayFor(null);
      setPayMethod(null);
      void load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('booking.paymentFailed'));
    } finally {
      setPayBusy(false);
    }
  };

  const declineQuote = async (b: Booking) => {
    try {
      await api.declineQuote(b.id);
      void load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const approveCompletion = async (b: Booking) => {
    if (approving) return;
    setApproving(b.id);
    try {
      await api.approveCompletion(b.id);
      showToast(t('bookings.approveSuccessToast'));
      void load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setApproving(null);
    }
  };

  const sendReview = async (b: Booking) => {
    if (!reviewText.trim()) {
      showToast(t('bookings.reviewEmptyToast'));
      return;
    }
    try {
      await api.postReview(b.id, reviewRating, reviewText.trim());
      setReviewed((s) => new Set(s).add(b.id));
      setReviewFor(null);
      setReviewText('');
      setReviewRating(5);
      showToast(t('bookings.reviewAddedToast'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const sectionLabel: CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--muted)',
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    marginBottom: 10,
  };

  return (
    <div
      style={
        isDesktop
          ? { maxWidth: 760, margin: '0 auto', padding: '28px 28px 48px' }
          : { flex: 1, overflow: 'auto', padding: '20px 20px 18px' }
      }
    >
      <h1 style={{ fontFamily: BRICO, fontSize: 24, fontWeight: 700, margin: '8px 0 18px' }}>{t('bookings.title')}</h1>

      <div style={sectionLabel}>{t('bookings.upcomingLabel')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
        {upcoming.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{t('bookings.noneUpcoming')}</div>
        )}
        {upcoming.map((b) => {
          const quoted = b.type === 'QUOTE' && b.status === 'PENDING' && b.quoteStatus === 'QUOTED';
          const awaiting = b.type === 'QUOTE' && b.status === 'PENDING' && b.quoteStatus === 'AWAITING';
          const awaitingApproval = b.status === 'AWAITING_APPROVAL';
          // Phase 2 — escrow: covers both a just-accepted quote (quoteStatus ACCEPTED) and an
          // instant booking whose checkout was never finished/failed — either way the booking
          // is stuck PENDING until a HELD payment lands.
          const needsPayment = !!b.paymentRequired && (!b.payment || b.payment.status === 'PENDING' || b.payment.status === 'FAILED');
          const statusLabel = needsPayment
            ? t('bookings.statusNeedsPayment')
            : awaiting
              ? t('bookings.statusQuoteSent')
              : bookingStatusLabel(b.status, t);
          const stOk = b.status === 'CONFIRMED' || awaitingApproval;
          const frozen = isFrozen(b);
          const when =
            b.type === 'QUOTE' && b.status === 'PENDING'
              ? t('bookings.whenProposal', { window: b.preferredWindow ?? t('common.notSet') })
              : whenLabel(b.startAt, b.preferredWindow, t);
          const amountForDisplay = b.quotedAmount != null ? formatZl(b.quotedAmount, locale) : b.priceLabel;
          const price = needsPayment
            ? t('bookings.priceToPay', { amount: amountForDisplay })
            : awaiting
              ? t('bookings.priceAwaitingQuote')
              : quoted
                ? t('bookings.priceQuoted', { amount: amountForDisplay })
                : b.payment
                  ? t('bookings.pricePaidOnline', { price: b.priceLabel })
                  : b.priceLabel;
          const isExpanded = expanded === b.id;
          return (
            <div
              key={b.id}
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                padding: 14,
                boxShadow: 'var(--shadow)',
                animation: 'dwfade .3s ease',
                border: awaitingApproval || needsPayment ? '1.5px solid var(--accent)' : '1.5px solid transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AvatarTile init={providerInit(b)} size={44} radius={13} fontSize={14} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{serviceTitle(b)}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                    {providerName(b)} · {when}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted2)', marginTop: 2 }}>{locLine(b)}</div>
                </div>
                <span
                  style={{
                    flex: 'none',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 10,
                    padding: '4px 9px',
                    background: stOk ? 'var(--ver-bg)' : 'var(--surface2)',
                    color: stOk ? 'var(--ver-fg)' : needsPayment ? 'var(--warn)' : 'var(--muted2)',
                  }}
                >
                  {statusLabel}
                </span>
              </div>
              {frozen && (
                <div style={{ marginTop: 8 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 10.5,
                      fontWeight: 700,
                      borderRadius: 9,
                      padding: '3px 8px',
                      background: 'var(--surface2)',
                      color: 'var(--accent)',
                    }}
                  >
                    <span aria-hidden="true">🔒</span> {t('bookings.frozenBadge')}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 11, paddingTop: 11, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--muted2)' }}>{price}</span>
                <span
                  {...clickable(() => setExpanded(isExpanded ? null : b.id), { expanded: isExpanded })}
                  style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)', cursor: 'pointer' }}
                >
                  {t('bookings.detailsCta')}
                </span>
              </div>
              {quoted && (
                <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
                  <span
                    {...clickable(() => void declineQuote(b))}
                    style={{ flex: 1, textAlign: 'center', border: '1.5px solid var(--border)', color: 'var(--muted2)', borderRadius: 14, padding: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {t('bookings.decline')}
                  </span>
                  <span
                    {...clickable(() => void acceptQuote(b))}
                    style={{ flex: 2, textAlign: 'center', background: 'var(--accent)', color: 'var(--onaccent)', borderRadius: 14, padding: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {t('bookings.accept')}
                  </span>
                </div>
              )}
              {needsPayment && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  {payFor === b.id ? (
                    <>
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: 'var(--muted)',
                          letterSpacing: '.05em',
                          textTransform: 'uppercase',
                          marginBottom: 8,
                        }}
                      >
                        {t('booking.paymentMethodLabel')}
                      </div>
                      <div role="radiogroup" aria-label={t('booking.paymentMethodLabel')} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                        {brand.paymentMethods.map((m) => {
                          const sel = m === payMethod;
                          return (
                            <div
                              key={m}
                              {...clickable(() => setPayMethod(m), { pressed: sel })}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                borderRadius: 14,
                                padding: '10px 12px',
                                cursor: 'pointer',
                                border: sel ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                              }}
                            >
                              <span
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  border: sel ? '5px solid var(--accent)' : '2px solid var(--border)',
                                  flex: 'none',
                                }}
                              />
                              <span style={{ fontSize: 13, fontWeight: 700 }}>{paymentMethodLabel(m, t)}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div
                        {...clickable(() => void payNow(b))}
                        style={{
                          textAlign: 'center',
                          background: payMethod ? 'var(--accent)' : 'var(--surface2)',
                          color: payMethod ? 'var(--onaccent)' : 'var(--navmuted)',
                          borderRadius: 14,
                          padding: 11,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: payMethod ? 'var(--glow)' : 'none',
                          opacity: payBusy ? 0.7 : 1,
                        }}
                      >
                        {t('bookings.payNowCta')}
                      </div>
                    </>
                  ) : (
                    <div
                      {...clickable(() => setPayFor(b.id))}
                      style={{
                        textAlign: 'center',
                        background: 'var(--accent)',
                        color: 'var(--onaccent)',
                        borderRadius: 14,
                        padding: 11,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: 'var(--glow)',
                      }}
                    >
                      {t('bookings.payNowCta')}
                    </div>
                  )}
                </div>
              )}
              {awaitingApproval && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.45, marginBottom: 10 }}>
                    {t('bookings.approveCompletionNote')}
                  </div>
                  <div
                    {...clickable(() => void approveCompletion(b))}
                    style={{
                      textAlign: 'center',
                      background: 'var(--accent)',
                      color: 'var(--onaccent)',
                      borderRadius: 14,
                      padding: 11,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: 'var(--glow)',
                      opacity: approving === b.id ? 0.7 : 1,
                    }}
                  >
                    {t('bookings.approveCompletionCta')}
                  </div>
                </div>
              )}
              {isExpanded && (
                <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--muted2)', lineHeight: 1.5 }}>
                  {b.notes && <div style={{ marginBottom: 8 }}>{b.notes}</div>}
                  {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                    <div
                      {...clickable(() => void cancel(b))}
                      style={{ textAlign: 'center', border: '1.5px solid #d64550', color: '#d64550', borderRadius: 14, padding: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                    >
                      {t('bookings.cancel')}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={sectionLabel}>{t('bookings.completedLabel')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {completed.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{t('bookings.noneCompleted')}</div>}
        {completed.map((b) => {
          const canReview = b.status === 'COMPLETED' && !hasReview(b) && !reviewed.has(b.id);
          const isReviewing = reviewFor === b.id;
          return (
            <div key={b.id} style={{ background: 'var(--surface)', borderRadius: 20, padding: 14, boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AvatarTile init={providerInit(b)} size={44} radius={13} fontSize={14} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{serviceTitle(b)}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                    {providerName(b)} · {dayLabel(b.startAt, t) || whenLabel(b.startAt, b.preferredWindow, t)} · {b.priceLabel}
                  </div>
                </div>
                {b.status !== 'COMPLETED' && (
                  <span
                    style={{
                      flex: 'none',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 10,
                      padding: '4px 9px',
                      background: 'var(--danger-bg)',
                      color: '#d64550',
                    }}
                  >
                    {bookingStatusLabel(b.status, t)}
                  </span>
                )}
              </div>
              {canReview && !isReviewing && (
                <div
                  {...clickable(() => setReviewFor(b.id))}
                  style={{ marginTop: 11, textAlign: 'center', border: '1.5px solid var(--accent)', color: 'var(--accent)', borderRadius: 14, padding: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {t('bookings.reviewCta')}
                </div>
              )}
              {canReview && isReviewing && (
                <div style={{ marginTop: 11, paddingTop: 11, borderTop: '1px solid var(--border)' }}>
                  <div role="radiogroup" aria-label={t('a11y.starRating', 'Ocena w gwiazdkach')} style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        {...clickable(() => setReviewRating(n), {
                          pressed: n <= reviewRating,
                          label: t('a11y.starLabel', '{{n}} z 5 gwiazdek', { n }),
                        })}
                        style={{ fontSize: 26, cursor: 'pointer', color: n <= reviewRating ? '#e8a13c' : 'var(--border)' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={t('bookings.reviewPlaceholder') ?? ''}
                    aria-label={t('bookings.reviewPlaceholder') ?? ''}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      height: 80,
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
                  <div
                    {...clickable(() => void sendReview(b))}
                    style={{ marginTop: 10, textAlign: 'center', background: 'var(--accent)', color: 'var(--onaccent)', borderRadius: 14, padding: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {t('bookings.reviewSend')}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
