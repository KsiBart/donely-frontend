import type { TFunction } from 'i18next';
import clsx from 'clsx';
import type { Booking, PaymentMethod } from '../../../api/models';
import type { BrandConfig } from '../../../brand';
import { AvatarTile } from '../../../components/ui';
import { bookingStatusLabel, formatZl, whenLabel } from '../../../lib/format';
import { clickable } from '../../../lib/a11y';
import { providerInit, providerName, serviceTitle, isFrozen, ctaGlowCls } from './helpers';
import PaymentMethodPicker from './PaymentMethodPicker';

interface UpcomingBookingRowProps {
  t: TFunction;
  locale: string;
  brand: BrandConfig;
  b: Booking;
  expanded: number | null;
  setExpanded: (id: number | null) => void;
  payFor: number | null;
  setPayFor: (id: number | null) => void;
  payMethod: PaymentMethod | null;
  setPayMethod: (m: PaymentMethod) => void;
  payBusy: boolean;
  approving: number | null;
  locLine: (b: Booking) => string;
  onCancel: (b: Booking) => void;
  onAcceptQuote: (b: Booking) => void;
  onDeclineQuote: (b: Booking) => void;
  onPayNow: (b: Booking) => void;
  onApproveCompletion: (b: Booking) => void;
}

/** One card in the "Upcoming" list — covers instant/quote bookings across every state: needs
 * payment, quote pending accept/decline, awaiting provider completion, or plain confirmed. */
export default function UpcomingBookingRow({
  t,
  locale,
  brand,
  b,
  expanded,
  setExpanded,
  payFor,
  setPayFor,
  payMethod,
  setPayMethod,
  payBusy,
  approving,
  locLine,
  onCancel,
  onAcceptQuote,
  onDeclineQuote,
  onPayNow,
  onApproveCompletion,
}: UpcomingBookingRowProps) {
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
            {...clickable(() => onDeclineQuote(b))}
            className="flex-1 text-center border-[1.5px] border-border text-muted2 rounded-[14px] p-2.5 text-[13px] font-bold cursor-pointer"
          >
            {t('bookings.decline')}
          </span>
          <span
            {...clickable(() => onAcceptQuote(b))}
            className="flex-[2] text-center bg-accent text-onaccent rounded-[14px] p-2.5 text-[13px] font-bold cursor-pointer"
          >
            {t('bookings.accept')}
          </span>
        </div>
      )}
      {needsPayment && (
        <PaymentMethodPicker
          t={t}
          b={b}
          paymentMethods={brand.paymentMethods}
          payFor={payFor}
          setPayFor={setPayFor}
          payMethod={payMethod}
          setPayMethod={setPayMethod}
          payBusy={payBusy}
          onPayNow={onPayNow}
        />
      )}
      {awaitingApproval && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted2 leading-[1.45] mb-2.5">{t('bookings.approveCompletionNote')}</div>
          <div {...clickable(() => onApproveCompletion(b))} className={clsx(ctaGlowCls, approving === b.id && 'opacity-70')}>
            {t('bookings.approveCompletionCta')}
          </div>
        </div>
      )}
      {isExpanded && (
        <div className="mt-2.5 text-[12.5px] text-muted2 leading-[1.5]">
          {b.notes && <div className="mb-2">{b.notes}</div>}
          {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
            <div
              {...clickable(() => onCancel(b))}
              className="text-center border-[1.5px] border-danger text-danger rounded-[14px] p-[9px] text-[13px] font-bold cursor-pointer"
            >
              {t('bookings.cancel')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
