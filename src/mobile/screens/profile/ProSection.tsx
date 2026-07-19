import type { TFunction } from 'i18next';
import type { BrandConfig } from '../../../brand';
import type { AppMode } from '../../../state/modeState';
import { clickable } from '../../../lib/a11y';
import { ctaCls } from './constants';

interface ProSectionProps {
  t: TFunction;
  brand: BrandConfig;
  isPro: boolean;
  mode: AppMode;
  onStartBecomePro: () => void;
  onEnterPro: () => void;
  onEnterStandard: () => void;
}

/** The become-provider / pro-mode-switch card at the bottom of the Profile tab. Exactly one of
 * its three states renders, matching the original inline `!isPro` / `isPro && mode !== 'pro'` /
 * `isPro && mode === 'pro'` branches. */
export default function ProSection({ t, brand, isPro, mode, onStartBecomePro, onEnterPro, onEnterStandard }: ProSectionProps) {
  return (
    <div className="bg-surface2 rounded-[20px] p-4">
      {!isPro && (
        <>
          <div className="font-bold text-sm mb-1">{t('profile.proSection.becomeTitle')}</div>
          <div className="text-[12.5px] text-muted mb-3">{t('profile.proSection.becomeBody', { appName: brand.appName })}</div>
          <div {...clickable(onStartBecomePro)} className={ctaCls}>
            {t('profile.proSection.becomeCta')}
          </div>
        </>
      )}
      {isPro && mode !== 'pro' && (
        <>
          <div className="font-bold text-sm mb-1">{t('profile.proSection.activeTitle', { appName: brand.appName })}</div>
          <div className="text-[12.5px] text-muted mb-3">{t('profile.proSection.enterProBody')}</div>
          <div {...clickable(onEnterPro)} className={ctaCls}>
            {t('profile.proSection.enterProCta')}
          </div>
        </>
      )}
      {isPro && mode === 'pro' && (
        <>
          <div className="font-bold text-sm mb-1">{t('profile.proSection.inProTitle')}</div>
          <div className="text-[12.5px] text-muted mb-3">{t('profile.proSection.inProBody')}</div>
          <div {...clickable(onEnterStandard)} className={ctaCls}>
            {t('profile.proSection.switchStandardCta')}
          </div>
        </>
      )}
    </div>
  );
}
