import clsx from 'clsx';
import { BRICO } from '../../lib/format';
import { useBookingsData } from './bookings/useBookingsData';
import { sectionLabelCls } from './bookings/helpers';
import UpcomingBookingRow from './bookings/UpcomingBookingRow';
import CompletedBookingRow from './bookings/CompletedBookingRow';

export default function BookingsTab() {
  const {
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
  } = useBookingsData();

  return (
    <div className={clsx(isDesktop ? 'max-w-[760px] mx-auto pt-7 px-7 pb-12' : 'flex-1 overflow-auto pt-5 px-5 pb-[18px]')}>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h1 style={{ fontFamily: BRICO }} className="text-2xl font-bold mx-0 mt-2 mb-[18px]">
        {t('bookings.title')}
      </h1>

      <div className={sectionLabelCls}>{t('bookings.upcomingLabel')}</div>
      <div className="flex flex-col gap-2.5 mb-[22px]">
        {upcoming.length === 0 && <div className="text-[13px] text-muted">{t('bookings.noneUpcoming')}</div>}
        {upcoming.map((b) => (
          <UpcomingBookingRow
            key={b.id}
            t={t}
            locale={locale}
            brand={brand}
            b={b}
            expanded={expanded}
            setExpanded={setExpanded}
            payFor={payFor}
            setPayFor={setPayFor}
            payMethod={payMethod}
            setPayMethod={setPayMethod}
            payBusy={payBusy}
            approving={approving}
            locLine={locLine}
            onCancel={(bk) => void cancel(bk)}
            onAcceptQuote={(bk) => void acceptQuote(bk)}
            onDeclineQuote={(bk) => void declineQuote(bk)}
            onPayNow={(bk) => void payNow(bk)}
            onApproveCompletion={(bk) => void approveCompletion(bk)}
          />
        ))}
      </div>

      <div className={sectionLabelCls}>{t('bookings.completedLabel')}</div>
      <div className="flex flex-col gap-2.5">
        {completed.length === 0 && <div className="text-[13px] text-muted">{t('bookings.noneCompleted')}</div>}
        {completed.map((b) => (
          <CompletedBookingRow
            key={b.id}
            t={t}
            b={b}
            reviewFor={reviewFor}
            setReviewFor={setReviewFor}
            reviewRating={reviewRating}
            setReviewRating={setReviewRating}
            reviewText={reviewText}
            setReviewText={setReviewText}
            reviewed={reviewed}
            onSendReview={(bk) => void sendReview(bk)}
          />
        ))}
      </div>
    </div>
  );
}
