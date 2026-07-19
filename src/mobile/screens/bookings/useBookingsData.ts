import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAcceptQuoteMutation,
  useApproveCompletionMutation,
  useBookingsQuery,
  useCancelBookingMutation,
  useCheckoutMutation,
  useDeclineQuoteMutation,
  useMockCompletePaymentMutation,
  usePostReviewMutation,
} from '../../../api/hooks';
import type { Booking, PaymentMethod } from '../../../api/models';
import { useBrand } from '../../../brand';
import { useIsDesktop } from '../../../lib/useIsDesktop';
import { toIntlLocale } from '../../../lib/format';
import { useToast } from '../../../state/ToastContext';

/** All data-fetching, state, and handlers for the Bookings tab. Extracted verbatim from
 * Bookings.tsx so the component files only hold layout/JSX. */
export function useBookingsData() {
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

  return {
    t,
    locale,
    brand,
    isDesktop,
    upcoming,
    completed,
    expanded,
    setExpanded,
    reviewFor,
    setReviewFor,
    reviewRating,
    setReviewRating,
    reviewText,
    setReviewText,
    reviewed,
    approving,
    payFor,
    setPayFor,
    payMethod,
    setPayMethod,
    payBusy,
    locLine,
    cancel,
    acceptQuote,
    payNow,
    declineQuote,
    approveCompletion,
    sendReview,
  };
}
