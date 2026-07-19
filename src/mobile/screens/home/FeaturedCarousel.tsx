import type { TFunction } from 'i18next';
import type { ProviderListItem } from '../../../api/models';
import { stripes } from '../../../components/ui';
import { BRICO, formatKm, formatRating } from '../../../lib/format';
import { clickable } from '../../../lib/a11y';

interface FeaturedCarouselProps {
  t: TFunction;
  locale: string;
  featured: ProviderListItem[];
  openProvider: (id: number) => void;
}

/** Mobile Home, map-off branch: horizontally-scrolling featured providers strip. Renders nothing
 * when there are no featured providers (same as the inline `featured.length > 0 && …` it replaces). */
export default function FeaturedCarousel({ t, locale, featured, openProvider }: FeaturedCarouselProps) {
  if (featured.length === 0) return null;
  return (
    <>
      <div className="flex justify-between items-baseline mt-[22px] mx-5 mb-2.5">
        {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
        <h2 style={{ fontFamily: BRICO }} className="text-base font-bold m-0">
          {t('home.featuredTitle')}
        </h2>
        <span className="text-[11px] font-bold text-accent bg-surface2 rounded-[9px] py-[3px] px-2">{t('home.featuredBadge')}</span>
      </div>
      <div className="hide-scroll flex gap-2.5 overflow-auto pt-0.5 px-5 pb-1.5">
        {featured.map((p) => (
          <div key={p.id} {...clickable(() => openProvider(p.id))} className="flex-none w-[200px] bg-surface rounded-[20px] overflow-hidden shadow-[var(--shadow)] cursor-pointer">
            <div
              className="h-24 flex items-end p-2"
              style={{ background: stripes(45, 8) }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
            >
              <span className="font-semibold text-[9px] font-[ui-monospace,monospace] bg-[rgba(0,0,0,.5)] text-white rounded-[7px] py-0.5 px-[7px]">{t('home.workPhoto')}</span>
            </div>
            <div className="pt-2.5 px-3 pb-3">
              <div className="font-bold text-[13.5px]">{p.name}</div>
              <div className="text-[11.5px] text-muted mt-0.5">
                {p.categoryName} · <span aria-hidden="true">★</span> {formatRating(p.rating, locale)} · {formatKm(p.distanceKm, locale)}
              </div>
              <div className="text-[11.5px] font-bold text-accent mt-[5px]">
                {p.nextSlotLabel} <span aria-hidden="true">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
