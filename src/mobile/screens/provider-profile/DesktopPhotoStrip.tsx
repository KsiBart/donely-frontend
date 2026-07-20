import type { TFunction } from 'i18next';
import { stripes } from '../../../components/ui';
import { photoCaptionCls } from './constants';

interface DesktopPhotoStripProps {
  t: TFunction;
}

/** Desktop ProviderProfile: the 3-photo "before/after" hero strip (placeholder stripe art — no
 * real photo assets in this mock data set). */
export default function DesktopPhotoStrip({ t }: DesktopPhotoStripProps) {
  return (
    <div className="h-57.5 flex gap-2">
      <div
        className="flex-[2] rounded-[18px] flex items-end p-3"
        style={{ background: stripes(45, 8) }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
      >
        <span className={photoCaptionCls}>{t('providerProfile.photoBefore')}</span>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div
          className="flex-1 rounded-[18px]"
          style={{ background: stripes(-45, 8) }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
        />
        <div
          className="flex-1 rounded-[18px] flex items-center justify-center"
          style={{ background: stripes(45, 8) }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
        >
          <span className="text-[13px] font-bold text-white">{t('providerProfile.morePhotosCount')}</span>
        </div>
      </div>
    </div>
  );
}
