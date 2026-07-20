import type { TFunction } from 'i18next';
import type { ProviderReview } from '../../../api/models';
import { BRICO, formatRating } from '../../../lib/format';
import { reviewNameCls, reviewStarsCls } from './constants';

interface DesktopReviewsSectionProps {
  t: TFunction;
  locale: string;
  rating: number;
  reviewCount: number;
  reviews: ProviderReview[];
}

/** Desktop ProviderProfile: reviews title (with aggregate rating) + review cards. */
export default function DesktopReviewsSection({ t, locale, rating, reviewCount, reviews }: DesktopReviewsSectionProps) {
  return (
    <>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h2 style={{ fontFamily: BRICO }} className="text-lg font-bold mx-0 mt-6.5 mb-2.5">
        {t('providerProfile.reviewsTitle')}{' '}
        <span className="text-[13px] text-muted font-semibold">
          <span aria-hidden="true">★</span> {formatRating(rating, locale)} ({reviewCount})
        </span>
      </h2>
      <div className="flex flex-col gap-2.5">
        {reviews.map((r) => (
          <div key={r.id} className="bg-surface rounded-[18px] py-3.5 px-4 shadow-[var(--shadow)]">
            <div className="flex justify-between items-baseline">
              <span className={reviewNameCls}>{r.customerName ?? r.authorName ?? r.name ?? t('providerProfile.defaultCustomerName')}</span>
              <span aria-hidden="true" className={reviewStarsCls}>
                {'★★★★★'.slice(0, Math.max(1, Math.min(5, r.rating)))}
              </span>
            </div>
            <div className="text-[13.5px] text-muted2 leading-[1.5] mt-1.25">{r.text}</div>
          </div>
        ))}
      </div>
    </>
  );
}
