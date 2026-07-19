import type { TFunction } from 'i18next';
import type { ProviderListItem } from '../../../api/models';
import MapView from '../../../components/MapView';
import { AvatarTile } from '../../../components/ui';
import { clickable } from '../../../lib/a11y';
import { providerMeta } from '../../shared';
import { verifiedShortCls } from './constants';

interface DesktopMapPanelProps {
  t: TFunction;
  locale: string;
  providers: ProviderListItem[];
  userPoint: { lat: number; lng: number } | null;
  openProvider: (id: number) => void;
}

/** Desktop Home, map-on branch: full map + a scrollable provider list beside it. */
export default function DesktopMapPanel({ t, locale, providers, userPoint, openProvider }: DesktopMapPanelProps) {
  return (
    <div className="flex gap-[18px] items-stretch h-[560px]">
      <div className="flex-1 min-w-0 rounded-3xl overflow-hidden shadow-[var(--shadow)]">
        <MapView providers={providers} user={userPoint} activeId={providers[0]?.id} onSelect={openProvider} />
      </div>

      <div className="hide-scroll w-[340px] flex-none overflow-auto flex flex-col gap-2.5 pr-0.5">
        {providers.map((p) => (
          <div key={p.id} {...clickable(() => openProvider(p.id))} className="dw-card-hover flex gap-3 bg-surface rounded-[18px] p-3 shadow-[var(--shadow)] cursor-pointer">
            <AvatarTile init={p.init} size={52} radius={14} fontSize={15} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-bold text-sm">{p.name}</span>
                {p.verified && (
                  <span aria-hidden="true" className={verifiedShortCls}>
                    {t('common.verifiedShort')}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted mt-0.5">{providerMeta(p, locale)}</div>
              <div className="flex justify-between items-center mt-[7px]">
                <span className="text-xs text-muted2">
                  {t('home.priceFromPrefix')} <b className="text-text">{p.priceFromLabel}</b>
                </span>
                <span className="bg-accent text-onaccent rounded-xl py-[5px] px-2.5 text-[11px] font-bold">{p.nextSlotLabel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
