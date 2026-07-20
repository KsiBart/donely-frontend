import type { TFunction } from 'i18next';
import type { ProviderListItem } from '../../../api/models';
import { AvatarTile } from '../../../components/ui';
import { clickable } from '../../../lib/a11y';
import { providerMeta } from '../../shared';
import { verifiedShortCls } from './constants';

interface DesktopGridProps {
  t: TFunction;
  locale: string;
  providers: ProviderListItem[];
  openProvider: (id: number) => void;
}

/** Desktop Home, map-off branch: 3-column provider card grid. */
export default function DesktopGrid({ t, locale, providers, openProvider }: DesktopGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3.5">
      {providers.map((p) => (
        <div key={p.id} {...clickable(() => openProvider(p.id))} className="dw-card-hover flex flex-col gap-2.75 bg-surface rounded-[20px] p-3.5 shadow-[var(--shadow)] cursor-pointer">
          <div className="flex gap-3 items-center">
            <AvatarTile init={p.init} size={52} radius={15} fontSize={15} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-bold text-[14.5px]">{p.name}</span>
                {p.verified && (
                  <span aria-hidden="true" className={verifiedShortCls}>
                    {t('common.verifiedShort')}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted mt-0.5">{providerMeta(p, locale)}</div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12.5px] text-muted2">
              {t('home.priceFromPrefix')} <b className="text-text">{p.priceFromLabel}</b>
            </span>
            <span className="bg-accent text-onaccent rounded-[13px] py-1.5 px-3 text-[11.5px] font-bold">
              {p.nextSlotLabel} <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
