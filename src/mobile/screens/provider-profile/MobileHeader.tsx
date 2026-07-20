import type { TFunction } from 'i18next';
import type { ProviderDetail } from '../../../api/models';
import { BRICO, formatKm, formatRating } from '../../../lib/format';
import TagsRow from './TagsRow';

interface MobileHeaderProps {
  t: TFunction;
  locale: string;
  appName: string;
  pv: ProviderDetail;
}

/** Mobile ProviderProfile: name + verified badge, meta line, bio, and tags row. (Favorite toggle
 * lives on the photo header for this layout, not here.) */
export default function MobileHeader({ t, locale, appName, pv }: MobileHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
        <h1 style={{ fontFamily: BRICO }} className="text-[22px] font-bold m-0">
          {pv.name}
        </h1>
        {pv.verified && <span className="bg-ver-bg text-ver-fg rounded-[10px] py-0.5 px-2 text-[10.5px] font-bold">{t('common.verifiedFull')}</span>}
      </div>
      <div className="text-[13px] text-muted mt-1">
        {pv.categoryName} · {formatKm(pv.distanceKm, locale)} · <span aria-hidden="true">★</span> {formatRating(pv.rating, locale)} ({pv.reviewCount}) ·{' '}
        {t('providerProfile.respondsIn', { minutes: pv.responseMinutes ?? 15 })}
      </div>
      <div className="text-[13.5px] text-muted2 leading-[1.5] mt-2.5">{pv.bio}</div>
      <TagsRow t={t} appName={appName} businessType={pv.businessType} travelRadiusKm={pv.travelRadiusKm} spotAddress={pv.spotAddress} />
    </>
  );
}
