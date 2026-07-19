import type { TFunction } from 'i18next';
import type { ProviderListItem } from '../../../api/models';
import MapView from '../../../components/MapView';
import { AvatarTile, SparkleIcon } from '../../../components/ui';
import { clickable } from '../../../lib/a11y';
import { providerMeta } from '../../shared';
import SegToggle from './SegToggle';

interface MobileMapPanelProps {
  t: TFunction;
  locale: string;
  providers: ProviderListItem[];
  userPoint: { lat: number; lng: number } | null;
  openProvider: (id: number) => void;
  query: string;
  mapOn: boolean;
  setMapOn: (v: boolean) => void;
}

/** Mobile Home, map-on branch: full-bleed map with a search-pill overlay + a bottom-sheet list. */
export default function MobileMapPanel({ t, locale, providers, userPoint, openProvider, query, mapOn, setMapOn }: MobileMapPanelProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 relative bg-[var(--map)] overflow-hidden">
        <MapView
          providers={providers}
          user={userPoint}
          activeId={providers[0]?.id}
          onSelect={openProvider}
          showZoom={false}
          // eslint-disable-next-line react/no-inline-styles -- dynamic: MapView only accepts a `style` prop (no `className`) — kept inline, see components/MapView.tsx
          style={{ position: 'absolute', inset: 0 }}
        />
        <div className="absolute left-[8%] top-[4%] right-[8%] flex items-center gap-2.5 z-[1000]">
          <div
            {...clickable(() => setMapOn(false))}
            className="flex-1 flex items-center gap-[9px] bg-surface rounded-[20px] py-[11px] px-3.5 shadow-[var(--shadow)] cursor-pointer"
          >
            <SparkleIcon size={15} />
            <span className="text-[13.5px] font-semibold text-muted2">{query || t('home.mapSearchPlaceholder')}</span>
          </div>
          <SegToggle t={t} mapOn={mapOn} setMapOn={setMapOn} />
        </div>
      </div>
      <div className="bg-surface rounded-t-[26px] -mt-6 relative pt-2.5 px-5 pb-1.5 shadow-[var(--shadow)] max-h-[40%] flex flex-col">
        <div className="w-10 h-1 rounded-sm bg-border mx-auto mb-3 flex-none" />
        <div className="overflow-auto flex flex-col gap-2.5 pb-2.5">
          {providers.map((p) => (
            <div key={p.id} {...clickable(() => openProvider(p.id))} className="flex gap-3 bg-surface2 rounded-[20px] p-3 cursor-pointer">
              <AvatarTile init={p.init} size={52} radius={14} fontSize={15} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{p.name}</div>
                <div className="text-xs text-muted mt-0.5">{providerMeta(p, locale)}</div>
                <div className="text-[11.5px] text-muted2 mt-0.5">{p.locLine}</div>
              </div>
              <span className="self-center flex-none bg-accent text-onaccent rounded-[14px] py-1.5 px-[11px] text-[11.5px] font-bold">{p.nextSlotLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
