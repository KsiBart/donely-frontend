import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAiSearchMutation } from '../../api/hooks';
import { useBrand } from '../../brand';
import { toIntlLocale } from '../../i18n';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { AvatarTile, Logo } from '../../components/ui';
import { useToast } from '../../state/ToastContext';
import { providerMeta } from '../shared';
import { clickable } from '../../lib/a11y';

export default function AiResults() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const brand = useBrand();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isDesktop = useIsDesktop();
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const { mutate: runSearch, data: res, reset } = useAiSearchMutation();

  useEffect(() => {
    if (!q) return;
    reset();
    runSearch(q, {
      onError: (e) => showToast(e instanceof Error ? e.message : t('aiResults.searchError')),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className={clsx('animate-[dwfade_.3s_ease]', isDesktop ? 'max-w-180 mx-auto pt-7 px-7 pb-12' : 'flex-1 overflow-auto p-5')}>
      <div className="flex items-center gap-2.5 mb-4">
        <span
          {...clickable(() => navigate('/'), { label: t('a11y.back', 'Wstecz') })}
          className="w-8.5 h-8.5 rounded-full bg-surface2 flex items-center justify-center text-base font-bold cursor-pointer"
        >
          ‹
        </span>
        <h1 className="font-bold text-[15px] m-0">{t('aiResults.title', { appName: brand.appName })}</h1>
      </div>

      <div className="flex justify-end mb-3">
        <span className="max-w-[78%] bg-accent text-onaccent rounded-[18px_18px_4px_18px] py-2.75 px-3.5 text-[13.5px] font-semibold">{q}</span>
      </div>

      <div className="flex gap-2.25 mb-4">
        <span className={clsx(!res && 'animate-[ptpulse_1.6s_infinite]')}>
          <Logo size={30} />
        </span>
        <span className="max-w-[82%] bg-surface rounded-[4px_18px_18px_18px] py-2.75 px-3.5 text-[13.5px] text-muted2 leading-[1.5] shadow-[var(--shadow)]">
          {res ? res.response : '…'}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {(res?.matches ?? []).map((p) => (
          <div key={p.id} {...clickable(() => navigate(`/provider/${p.id}`))} className="bg-surface rounded-[20px] p-3 cursor-pointer shadow-[var(--shadow)]">
            <div className="flex gap-3">
              <AvatarTile init={p.init} size={56} radius={14} fontSize={16} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[14.5px]">{p.name}</span>
                  {p.verified && (
                    <span aria-hidden="true" className="bg-ver-bg text-ver-fg rounded-[10px] py-0.5 px-1.75 text-[10px] font-bold">
                      {t('common.verifiedShort')}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted mt-0.5">{providerMeta(p, locale)}</div>
                <div className="text-xs text-muted2 mt-0.5">{p.locLine}</div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-border">
              <span className="text-[11.5px] font-bold text-accent bg-surface2 rounded-[10px] py-1 px-2.25">
                <span aria-hidden="true">✦</span> {p.why}
              </span>
              <span className="bg-accent text-onaccent rounded-[14px] py-1.5 px-3 text-xs font-bold">
                {p.nextSlotLabel} <span aria-hidden="true">→</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
