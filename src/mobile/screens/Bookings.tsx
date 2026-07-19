import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  useAcceptQuoteMutation,
  useApproveCompletionMutation,
  useBookingsQuery,
  useCancelBookingMutation,
  useCheckoutMutation,
  useDeclineQuoteMutation,
  useMockCompletePaymentMutation,
  usePostReviewMutation,
} from '../../api/hooks';
import type { Booking, PaymentMethod } from '../../api/models';
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

// Bookings.tsx section eyebrow ("NADCHODZĄCE" / "ZAKOŃCZONE").
const sectionLabelCls = 'text-xs font-bold text-muted tracking-[0.06em] uppercase mb-2.5';

// Full-width accent CTA rows (payNow / approveCompletion / reviewSend) share this padding=11 shape
// — 1px off buttonVariants('md') (which pairs 16/10, not a uniform 11), so built by hand here.
const ctaGlowCls = 'text-center bg-accent text-onaccent rounded-[14px] p-[11px] text-[13px] font-bold cursor-pointer shadow-[var(--glow)]';

export default function BookingsTab() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const brand = useBrand();
  const { showToast } = useToast();
  const isDesktop = useIsDesktop();
  const { data: bookingsData, error: bookingsError, refetch: refetchBookings } = useBookingsQuery();
  const upcoming = bookingsData?.upcoming ?? [];
  const completed = bookingsData?.completed ?? [];
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

  const cancelBookingMutation = useCancelBookingMutation();
  const acceptQuoteMutation = useAcceptQuoteMutation();
  const declineQuoteMutation = useDeclineQuoteMutation();
  const checkoutMutation = useCheckoutMutation();
  const mockCompletePaymentMutation = useMockCompletePaymentMutation();
  const approveCompletionMutation = useApproveCompletionMutation();
  const postReviewMutation = usePostReviewMutation();

  const load = () => refetchBookings();

  useEffect(() => {
    if (bookingsError) showToast(bookingsError instanceof Error ? bookingsError.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingsError]);

  function locLine(b: Booking): string {
    return b.atSpot ? t('bookings.locLineAtSpot', { address: b.address }) : t('bookings.locLineAtClient', { address: b.address });
  }

  const cancel = async (b: Booking) => {
    try {
      await cancelBookingMutation.mutateAsync(b.id);
      showToast(t('bookings.cancelToast', { id: b.id }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const acceptQuote = async (b: Booking) => {
    try {
      await acceptQuoteMutation.mutateAsync(b.id);
      // Accepting a quote does NOT confirm the booking — it only makes payment required
      // (backend keeps status PENDING until a HELD payment lands). Open the method picker
      // right away so the customer can finish the escrow checkout.
      showToast(t('bookings.quoteAcceptedToast'));
      setPayFor(b.id);
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const payNow = async (b: Booking) => {
    if (!payMethod || payBusy) return;
    setPayBusy(true);
    try {
      const chk = await checkoutMutation.mutateAsync({ bookingId: b.id, method: payMethod });
      if (chk.redirectUrl) {
        window.location.href = chk.redirectUrl;
        return;
      }
      // mock mode — simulate the customer finishing payment on the gateway's hosted page
      await mockCompletePaymentMutation.mutateAsync(chk.paymentId);
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
      await declineQuoteMutation.mutateAsync(b.id);
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const approveCompletion = async (b: Booking) => {
    if (approving) return;
    setApproving(b.id);
    try {
      await approveCompletionMutation.mutateAsync(b.id);
      showToast(t('bookings.approveSuccessToast'));
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
      await postReviewMutation.mutateAsync({ id: b.id, rating: reviewRating as 1 | 2 | 3 | 4 | 5, text: reviewText.trim() });
      setReviewed((s) => new Set(s).add(b.id));
      setReviewFor(null);
      setReviewText('');
      setReviewRating(5);
      showToast(t('bookings.reviewAddedToast'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  return (
    <div className={clsx(isDesktop ? 'max-w-[760px] mx-auto pt-7 px-7 pb-12' : 'flex-1 overflow-auto pt-5 px-5 pb-[18px]')}>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h1 style={{ fontFamily: BRICO }} className="text-2xl font-bold mx-0 mt-2 mb-[18px]">
        {t('bookings.title')}
      </h1>

      <div className={sectionLabelCls}>{t('bookings.upcomingLabel')}</div>
      <div className="flex flex-col gap-2.5 mb-[22px]">
        {upcoming.length === 0 && <div className="text-[13px] text-muted">{t('bookings.noneUpcoming')}</div>}
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
              className={clsx(
                'bg-surface rounded-[20px] p-3.5 shadow-[var(--shadow)] animate-[dwfade_.3s_ease] border-[1.5px]',
                awaitingApproval || needsPayment ? 'border-accent' : 'border-transparent',
              )}
            >
              <div className="flex items-center gap-2.5">
                <AvatarTile init={providerInit(b)} size={44} radius={13} fontSize={14} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14.5px]">{serviceTitle(b)}</div>
                  <div className="text-[12.5px] text-muted">
                    {providerName(b)} · {when}
                  </div>
                  <div className="text-[11.5px] text-muted2 mt-0.5">{locLine(b)}</div>
                </div>
                <span
                  className={clsx(
                    'flex-none text-[11px] font-bold rounded-[10px] py-1 px-[9px]',
                    stOk ? 'bg-ver-bg text-ver-fg' : 'bg-surface2',
                    !stOk && (needsPayment ? 'text-warn' : 'text-muted2'),
                  )}
                >
                  {statusLabel}
                </span>
              </div>
              {frozen && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-[5px] text-[10.5px] font-bold rounded-[9px] py-[3px] px-2 bg-surface2 text-accent">
                    <span aria-hidden="true">🔒</span> {t('bookings.frozenBadge')}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center mt-[11px] pt-[11px] border-t border-border">
                <span className="text-[13px] text-muted2">{price}</span>
                <span {...clickable(() => setExpanded(isExpanded ? null : b.id), { expanded: isExpanded })} className="text-[12.5px] font-bold text-accent cursor-pointer">
                  {t('bookings.detailsCta')}
                </span>
              </div>
              {quoted && (
                <div className="flex gap-[9px] mt-3">
                  <span
                    {...clickable(() => void declineQuote(b))}
                    className="flex-1 text-center border-[1.5px] border-border text-muted2 rounded-[14px] p-2.5 text-[13px] font-bold cursor-pointer"
                  >
                    {t('bookings.decline')}
                  </span>
                  <span
                    {...clickable(() => void acceptQuote(b))}
                    className="flex-[2] text-center bg-accent text-onaccent rounded-[14px] p-2.5 text-[13px] font-bold cursor-pointer"
                  >
                    {t('bookings.accept')}
                  </span>
                </div>
              )}
              {needsPayment && (
                <div className="mt-3 pt-3 border-t border-border">
                  {payFor === b.id ? (
                    <>
                      <div className="text-[11.5px] font-bold text-muted tracking-[0.05em] uppercase mb-2">{t('booking.paymentMethodLabel')}</div>
                      <div role="radiogroup" aria-label={t('booking.paymentMethodLabel')} className="flex flex-col gap-2 mb-2.5">
                        {brand.paymentMethods.map((m) => {
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
                        {...clickable(() => void payNow(b))}
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
              )}
              {awaitingApproval && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-xs text-muted2 leading-[1.45] mb-2.5">{t('bookings.approveCompletionNote')}</div>
                  <div {...clickable(() => void approveCompletion(b))} className={clsx(ctaGlowCls, approving === b.id && 'opacity-70')}>
                    {t('bookings.approveCompletionCta')}
                  </div>
                </div>
              )}
              {isExpanded && (
                <div className="mt-2.5 text-[12.5px] text-muted2 leading-[1.5]">
                  {b.notes && <div className="mb-2">{b.notes}</div>}
                  {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                    <div
                      {...clickable(() => void cancel(b))}
                      className="text-center border-[1.5px] border-danger text-danger rounded-[14px] p-[9px] text-[13px] font-bold cursor-pointer"
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

      <div className={sectionLabelCls}>{t('bookings.completedLabel')}</div>
      <div className="flex flex-col gap-2.5">
        {completed.length === 0 && <div className="text-[13px] text-muted">{t('bookings.noneCompleted')}</div>}
        {completed.map((b) => {
          const canReview = b.status === 'COMPLETED' && !hasReview(b) && !reviewed.has(b.id);
          const isReviewing = reviewFor === b.id;
          return (
            <div key={b.id} className="bg-surface rounded-[20px] p-3.5 shadow-[var(--shadow)]">
              <div className="flex items-center gap-2.5">
                <AvatarTile init={providerInit(b)} size={44} radius={13} fontSize={14} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14.5px]">{serviceTitle(b)}</div>
                  <div className="text-[12.5px] text-muted">
                    {providerName(b)} · {dayLabel(b.startAt, t) || whenLabel(b.startAt, b.preferredWindow, t)} · {b.priceLabel}
                  </div>
                </div>
                {b.status !== 'COMPLETED' && (
                  <span className="flex-none text-[11px] font-bold rounded-[10px] py-1 px-[9px] bg-danger-bg text-danger">{bookingStatusLabel(b.status, t)}</span>
                )}
              </div>
              {canReview && !isReviewing && (
                <div
                  {...clickable(() => setReviewFor(b.id))}
                  className="mt-[11px] text-center border-[1.5px] border-accent text-accent rounded-[14px] p-2 text-[13px] font-bold cursor-pointer"
                >
                  {t('bookings.reviewCta')}
                </div>
              )}
              {canReview && isReviewing && (
                <div className="mt-[11px] pt-[11px] border-t border-border">
                  <div role="radiogroup" aria-label={t('a11y.starRating', 'Ocena w gwiazdkach')} className="flex justify-center gap-1.5 mb-2.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        {...clickable(() => setReviewRating(n), {
                          pressed: n <= reviewRating,
                          label: t('a11y.starLabel', '{{n}} z 5 gwiazdek', { n }),
                        })}
                        className={clsx('text-[26px] cursor-pointer', n <= reviewRating ? 'text-warn' : 'text-border')}
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
                    className="w-full box-border h-20 rounded-2xl border-[1.5px] border-border bg-surface text-text py-3 px-3.5 font-medium text-sm font-['Figtree',sans-serif] resize-none outline-none"
                  />
                  <div {...clickable(() => void sendReview(b))} className="mt-2.5 text-center bg-accent text-onaccent rounded-[14px] p-[9px] text-[13px] font-bold cursor-pointer">
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
