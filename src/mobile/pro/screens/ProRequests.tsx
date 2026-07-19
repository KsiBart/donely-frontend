import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  useAcceptRequestMutation,
  useCompleteRequestMutation,
  useDeclineRequestMutation,
  useProviderRequestsQuery,
  useQuoteRequestMutation,
} from '../../../api/hooks';
import type { ProviderRequestItem } from '../../../api/hooks/provider';
import { BRICO } from '../../../lib/format';
import { useToast } from '../../../state/ToastContext';
import { clickable } from '../../../lib/a11y';
import { statusPillVariants } from '../../../components/ui/variants';

function statusTone(status: ProviderRequestItem['status']): 'ver' | 'accent' | 'neutral' | 'danger' {
  switch (status) {
    case 'accepted':
      return 'ver';
    case 'quoted':
      return 'accent';
    case 'declined':
      return 'danger';
    default:
      return 'neutral';
  }
}

/** Pro "Zlecenia" — incoming booking/quote requests from `GET /provider/requests`, with the full
 * accept / decline / quote / complete action set wired to the Stage A mutations. `typeLabel`,
 * `addr`, `when`, `price`, `ago`, `acceptLabel` arrive pre-formatted PL-only from the backend (same
 * accepted scope cut as the EventLog feed — see CLAUDE.md); only the client-side `status` enum and
 * this screen's own copy are run through i18n. */
export default function ProRequests() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, isSuccess, error, refetch } = useProviderRequestsQuery();
  const loaded = isSuccess;
  const items = data ?? [];

  const [quoteFor, setQuoteFor] = useState<number | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const acceptMutation = useAcceptRequestMutation();
  const declineMutation = useDeclineRequestMutation();
  const quoteMutation = useQuoteRequestMutation();
  const completeMutation = useCompleteRequestMutation();

  useEffect(() => {
    if (error) showToast(error instanceof Error ? error.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const accept = async (item: ProviderRequestItem) => {
    if (busyId) return;
    setBusyId(item.id);
    try {
      await acceptMutation.mutateAsync(item.id);
      showToast(t('pro.requests.acceptToast'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setBusyId(null);
    }
  };

  const decline = async (item: ProviderRequestItem) => {
    if (busyId) return;
    setBusyId(item.id);
    try {
      await declineMutation.mutateAsync(item.id);
      showToast(t('pro.requests.declineToast'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setBusyId(null);
    }
  };

  const sendQuote = async (item: ProviderRequestItem) => {
    const zl = Number.parseFloat(quoteAmount.replace(',', '.'));
    if (!Number.isFinite(zl) || zl <= 0) {
      showToast(t('pro.requests.quoteInvalid'));
      return;
    }
    if (busyId) return;
    setBusyId(item.id);
    try {
      await quoteMutation.mutateAsync({ id: item.id, amount: Math.round(zl * 100) });
      showToast(t('pro.requests.quoteSentToast'));
      setQuoteFor(null);
      setQuoteAmount('');
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setBusyId(null);
    }
  };

  const complete = async (item: ProviderRequestItem) => {
    if (busyId) return;
    setBusyId(item.id);
    try {
      await completeMutation.mutateAsync(item.id);
      showToast(t('pro.requests.completeToast'));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex-1 overflow-auto pt-5 px-5 pb-[18px]">
      <div className="flex items-center justify-between mx-0 mt-2 mb-[18px]">
        {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
        <h1 style={{ fontFamily: BRICO }} className="text-2xl font-bold m-0">
          {t('pro.requests.title')}
        </h1>
        <span {...clickable(() => void refetch(), { label: t('a11y.refresh') })} className="text-[12.5px] font-bold text-accent cursor-pointer">
          <span aria-hidden="true">↻</span>
        </span>
      </div>

      {!loaded && <div className="text-[13px] text-muted animate-[ptpulse_1.6s_infinite]">{t('common.loading')}</div>}
      {loaded && items.length === 0 && <div className="text-[13px] text-muted">{t('pro.requests.empty')}</div>}

      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          const busy = busyId === item.id;
          const isQuoting = quoteFor === item.id;
          return (
            <div key={item.id} className="bg-surface rounded-[20px] p-3.5 shadow-[var(--shadow)]">
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-accent uppercase tracking-[0.04em]">{item.typeLabel}</div>
                  <div className="font-bold text-[14.5px]">{item.service}</div>
                  <div className="text-[12.5px] text-muted">{item.customer}</div>
                </div>
                <span className={statusPillVariants({ tone: statusTone(item.status) })}>{t(`pro.requests.status.${item.status}`)}</span>
              </div>
              <div className="text-[11.5px] text-muted2 mt-1.5">{item.addr}</div>
              {item.desc && <div className="text-[12px] text-muted2 mt-1 italic">"{item.desc}"</div>}
              <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-border text-[12.5px]">
                <span className="text-muted">{item.when}</span>
                <span className="font-bold">{item.price}</span>
              </div>
              <div className="text-[11px] text-muted2 mt-1">{item.ago}</div>

              {item.status === 'new' && !isQuoting && (
                <div className="flex gap-[9px] mt-3">
                  <span {...clickable(() => void decline(item), { disabled: busy })} className={clsx('flex-1 text-center border-[1.5px] border-border text-muted2 rounded-[14px] p-2.5 text-[13px] font-bold cursor-pointer', busy && 'opacity-70')}>
                    {t('pro.requests.declineCta')}
                  </span>
                  <span
                    {...clickable(() => (item.type === 'QUOTE' ? setQuoteFor(item.id) : void accept(item)), { disabled: busy })}
                    className={clsx('flex-[2] text-center bg-accent text-onaccent rounded-[14px] p-2.5 text-[13px] font-bold cursor-pointer', busy && 'opacity-70')}
                  >
                    {item.acceptLabel}
                  </span>
                </div>
              )}

              {item.status === 'new' && isQuoting && (
                <div className="mt-3 pt-3 border-t border-border">
                  <input
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void sendQuote(item);
                    }}
                    inputMode="decimal"
                    autoFocus
                    placeholder={t('pro.requests.quotePlaceholder')}
                    aria-label={t('pro.requests.quotePlaceholder')}
                    className="w-full box-border border-[1.5px] border-border bg-surface2 text-text rounded-[14px] py-[11px] px-3.5 text-[13.5px] outline-none mb-2"
                  />
                  <div className="flex gap-[9px]">
                    <span {...clickable(() => setQuoteFor(null), { disabled: busy })} className="flex-1 text-center border-[1.5px] border-border text-muted2 rounded-[14px] p-2.5 text-[13px] font-bold cursor-pointer">
                      {t('proTerms.cancel')}
                    </span>
                    <span {...clickable(() => void sendQuote(item), { disabled: busy })} className={clsx('flex-[2] text-center bg-accent text-onaccent rounded-[14px] p-2.5 text-[13px] font-bold cursor-pointer', busy && 'opacity-70')}>
                      {t('pro.requests.quoteSendCta')}
                    </span>
                  </div>
                </div>
              )}

              {item.status === 'accepted' && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span {...clickable(() => void complete(item), { disabled: busy })} className={clsx('block text-center bg-accent text-onaccent rounded-[14px] p-2.5 text-[13px] font-bold cursor-pointer', busy && 'opacity-70')}>
                    {t('pro.requests.completeCta')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
