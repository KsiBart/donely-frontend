import type { TFunction } from 'i18next';
import type { ProviderDetail } from '../../../api/models';
import { BRICO, formatKm, formatRating } from '../../../lib/format';
import { clickable } from '../../../lib/a11y';
import TagsRow from './TagsRow';

interface DesktopHeaderProps {
  t: TFunction;
  locale: string;
  appName: string;
  pv: ProviderDetail;
  fav: boolean;
  onToggleFav: () => void;
}

/** Desktop ProviderProfile: name + verified badge + favorite toggle, meta line, bio, and tags row. */
export default function DesktopHeader({ t, locale, appName, pv, fav, onToggleFav }: DesktopHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-2.5 mt-[18px]">
        {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
        <h1 style={{ fontFamily: BRICO }} className="text-[26px] font-bold m-0">
          {pv.name}
        </h1>
        {pv.verified && <span className="bg-ver-bg text-ver-fg rounded-[10px] py-[3px] px-[9px] text-[11px] font-bold">{t('common.verifiedFull')}</span>}
        <span
          {...clickable(onToggleFav, { pressed: fav, label: t('a11y.favorite', 'Ulubione') })}
          className="w-[30px] h-[30px] rounded-full bg-surface shadow-[var(--shadow)] flex items-center justify-center text-accent text-[15px] cursor-pointer"
        >
          {fav ? '♥' : '♡'}
        </span>
      </div>
      <div className="text-[13.5px] text-muted mt-1">
        {pv.categoryName} · {formatKm(pv.distanceKm, locale)} · <span aria-hidden="true">★</span> {formatRating(pv.rating, locale)} ({pv.reviewCount}) ·{' '}
        {t('providerProfile.respondsIn', { minutes: pv.responseMinutes ?? 15 })}
      </div>
      <div className="text-sm text-muted2 leading-[1.55] mt-3 max-w-[620px]">{pv.bio}</div>
      <TagsRow t={t} appName={appName} businessType={pv.businessType} travelRadiusKm={pv.travelRadiusKm} spotAddress={pv.spotAddress} />
    </>
  );
}
