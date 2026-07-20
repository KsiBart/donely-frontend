import type { TFunction } from 'i18next';
import clsx from 'clsx';
import { stripes } from '../../../components/ui';
import { clickable } from '../../../lib/a11y';
import { photoCaptionCls, roundBtnBase } from './constants';

interface MobilePhotoHeaderProps {
  t: TFunction;
  fav: boolean;
  onBack: () => void;
  onToggleFav: () => void;
}

/** Mobile ProviderProfile: the photo strip with the back + favorite round buttons overlaid on top. */
export default function MobilePhotoHeader({ t, fav, onBack, onToggleFav }: MobilePhotoHeaderProps) {
  return (
    <div className="relative h-50 flex gap-1.5 pt-5 px-1.5 pb-1.5 bg-[var(--map)]">
      <div
        className="flex-[2] rounded-2xl flex items-end p-2.5"
        style={{ background: stripes(45, 8) }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
      >
        <span className={photoCaptionCls}>{t('providerProfile.photoBefore')}</span>
      </div>
      <div className="flex-1 flex flex-col gap-1.5">
        <div
          className="flex-1 rounded-2xl"
          style={{ background: stripes(-45, 8) }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
        />
        <div
          className="flex-1 rounded-2xl flex items-center justify-center"
          style={{ background: stripes(45, 8) }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
        >
          <span className="text-xs font-bold text-white">{t('providerProfile.morePhotosCount')}</span>
        </div>
      </div>
      <span {...clickable(onBack, { label: t('a11y.back', 'Wstecz') })} className={clsx(roundBtnBase, 'left-3.5 text-base')}>
        ‹
      </span>
      <span {...clickable(onToggleFav, { pressed: fav, label: t('a11y.favorite', 'Ulubione') })} className={clsx(roundBtnBase, 'right-3.5 text-accent text-[17px]')}>
        {fav ? '♥' : '♡'}
      </span>
    </div>
  );
}
