import type { TFunction } from 'i18next';
import type { ProviderListItem } from '../../../api/models';
import { AvatarTile } from '../../../components/ui';
import { BRICO } from '../../../lib/format';
import { clickable } from '../../../lib/a11y';
import { providerMeta } from '../../shared';

interface MobileProviderListProps {
  t: TFunction;
  locale: string;
  providers: ProviderListItem[];
  openProvider: (id: number) => void;
}

/** Mobile Home, map-off branch: section title (with count) + the full provider list. */
export default function MobileProviderList({ t, locale, providers, openProvider }: MobileProviderListProps) {
  return (
    <>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h2 style={{ fontFamily: BRICO }} className="text-base font-bold mt-4 mx-5 mb-2.5">
        {t('home.providersCount', { count: providers.length })}
      </h2>
      <div className="flex flex-col gap-2.5 px-5">
        {providers.map((p) => (
          <div key={p.id} {...clickable(() => openProvider(p.id))} className="flex gap-3 bg-surface rounded-[20px] p-3 cursor-pointer shadow-[var(--shadow)]">
            <AvatarTile init={p.init} size={64} radius={16} fontSize={18} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[15px]">{p.name}</span>
                {p.verified && (
                  <span className="inline-flex bg-ver-bg text-ver-fg rounded-[10px] py-0.5 px-1.75 text-[10.5px] font-bold">{t('common.verifiedFull')}</span>
                )}
              </div>
              <div className="text-[12.5px] text-muted mt-0.5">{providerMeta(p, locale)}</div>
              <div className="text-[11.5px] text-muted2 mt-0.75">{p.locLine}</div>
              <div className="flex justify-between items-center mt-1.75">
                <span className="text-[13px] text-muted2">
                  {t('home.priceFromPrefix')} <b className="text-text">{p.priceFromLabel}</b>
                </span>
                <span className="bg-accent text-onaccent rounded-[14px] py-1.5 px-3 text-xs font-bold">
                  {p.nextSlotLabel} <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
