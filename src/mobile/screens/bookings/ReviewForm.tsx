import type { TFunction } from 'i18next';
import clsx from 'clsx';
import type { Booking } from '../../../api/models';
import { clickable } from '../../../lib/a11y';

interface ReviewFormProps {
  t: TFunction;
  b: Booking;
  reviewRating: number;
  setReviewRating: (n: number) => void;
  reviewText: string;
  setReviewText: (v: string) => void;
  onSend: (b: Booking) => void;
}

/** Completed-booking card: star rating + free-text review form, shown once "Add review" is tapped. */
export default function ReviewForm({ t, b, reviewRating, setReviewRating, reviewText, setReviewText, onSend }: ReviewFormProps) {
  return (
    <div className="mt-2.75 pt-2.75 border-t border-border">
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
      <div {...clickable(() => onSend(b))} className="mt-2.5 text-center bg-accent text-onaccent rounded-[14px] p-2.25 text-[13px] font-bold cursor-pointer">
        {t('bookings.reviewSend')}
      </div>
    </div>
  );
}
