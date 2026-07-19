import type { TFunction } from 'i18next';
import type { Booking } from '../../../api/models';
import { AvatarTile } from '../../../components/ui';
import { bookingStatusLabel, dayLabel, whenLabel } from '../../../lib/format';
import { clickable } from '../../../lib/a11y';
import { providerInit, providerName, serviceTitle, hasReview } from './helpers';
import ReviewForm from './ReviewForm';

interface CompletedBookingRowProps {
  t: TFunction;
  b: Booking;
  reviewFor: number | null;
  setReviewFor: (id: number | null) => void;
  reviewRating: number;
  setReviewRating: (n: number) => void;
  reviewText: string;
  setReviewText: (v: string) => void;
  reviewed: Set<number>;
  onSendReview: (b: Booking) => void;
}

/** One card in the "Completed" list — the review CTA + form when applicable. */
export default function CompletedBookingRow({
  t,
  b,
  reviewFor,
  setReviewFor,
  reviewRating,
  setReviewRating,
  reviewText,
  setReviewText,
  reviewed,
  onSendReview,
}: CompletedBookingRowProps) {
  const canReview = b.status === 'COMPLETED' && !hasReview(b) && !reviewed.has(b.id);
  const isReviewing = reviewFor === b.id;

  return (
    <div className="bg-surface rounded-[20px] p-3.5 shadow-[var(--shadow)]">
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
        <ReviewForm t={t} b={b} reviewRating={reviewRating} setReviewRating={setReviewRating} reviewText={reviewText} setReviewText={setReviewText} onSend={onSendReview} />
      )}
    </div>
  );
}
