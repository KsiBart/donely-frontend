import type { TFunction } from 'i18next';
import type { BusinessType } from '../../../api/models';
import { bizLong } from '../../../lib/format';
import { tagVerCls, tagNeutralCls } from './constants';

interface TagsRowProps {
  t: TFunction;
  appName: string;
  businessType?: BusinessType;
  travelRadiusKm?: number | null;
  spotAddress?: string | null;
}

/** Business type / travel radius / spot address / work-hours pill row — identical markup on both
 * the desktop and mobile ProviderProfile layouts. */
export default function TagsRow({ t, appName, businessType, travelRadiusKm, spotAddress }: TagsRowProps) {
  return (
    <div className="flex gap-2 mt-3 flex-wrap">
      <span className={tagVerCls}>{bizLong(businessType, t, appName)}</span>
      <span className={tagNeutralCls}>{t('providerProfile.travelRadius', { km: travelRadiusKm ?? 10 })}</span>
      {spotAddress && (
        <span className={tagNeutralCls}>
          <span aria-hidden="true">📍</span> {spotAddress}
        </span>
      )}
      <span className={tagNeutralCls}>{t('providerProfile.workHours')}</span>
    </div>
  );
}
