import clsx from 'clsx';
import { AvatarTile } from '../../components/ui';
import { BRICO, initials } from '../../lib/format';
import { useInstallAction } from '../AppPromo';
import { clickable } from '../../lib/a11y';
import { useProfileData } from './profile/useProfileData';
import { ctaCls } from './profile/constants';
import SettingsRows from './profile/SettingsRows';
import ProSection from './profile/ProSection';
import PanelOverlay from './profile/PanelOverlay';
import LocationPanelBody from './profile/LocationPanelBody';
import AddressesPanelBody from './profile/AddressesPanelBody';
import PaymentsPanelBody from './profile/PaymentsPanelBody';
import ProTermsPanelBody from './profile/ProTermsPanelBody';

export default function ProfileTab() {
  const { t, brand, me, logout, isPro, mode, isDesktop, panel, setPanel, rows, startBecomePro, proTermsAccepted, enterProMode, enterStandardMode } = useProfileData();
  const install = useInstallAction();

  return (
    <div className={clsx(isDesktop ? 'max-w-[560px] mx-auto pt-7 px-7 pb-12' : 'flex-1 overflow-auto pt-5 px-5 pb-[18px]')}>
      <div className="flex items-center gap-3.5 mx-0 mt-2 mb-[22px]">
        <AvatarTile init={initials(me?.name)} size={60} fontSize={20} round />
        <div>
          {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
          <h1 style={{ fontFamily: BRICO }} className="text-xl font-bold m-0">
            {me?.name ?? ''}
          </h1>
          <div className="text-[12.5px] text-muted">{me?.email ?? ''}</div>
        </div>
      </div>

      <SettingsRows t={t} rows={rows} logout={logout} />

      {isDesktop && (
        <div className="bg-[var(--app-tint)] rounded-[20px] pt-4 pb-4 px-[18px] mb-3.5">
          <div className="font-bold text-sm mb-1">{t('profile.pushPromoTitle')}</div>
          <div className="text-[12.5px] text-muted2 leading-[1.45] mb-3">{t('profile.pushPromoBody')}</div>
          <div {...clickable(install)} className={ctaCls}>
            {t('promo.installAppCta')}
          </div>
        </div>
      )}

      <ProSection t={t} brand={brand} isPro={isPro} mode={mode} onStartBecomePro={startBecomePro} onEnterPro={enterProMode} onEnterStandard={enterStandardMode} />

      {panel === 'location' && (
        <PanelOverlay title={t('profile.locationPanel.title')} onClose={() => setPanel(null)}>
          <LocationPanelBody onDone={() => setPanel(null)} />
        </PanelOverlay>
      )}
      {panel === 'addresses' && (
        <PanelOverlay title={t('profile.addressesPanel.title')} onClose={() => setPanel(null)}>
          <AddressesPanelBody />
        </PanelOverlay>
      )}
      {panel === 'payments' && (
        <PanelOverlay title={t('profile.paymentsPanel.title')} onClose={() => setPanel(null)}>
          <PaymentsPanelBody />
        </PanelOverlay>
      )}
      {panel === 'proTerms' && (
        <PanelOverlay title={t('proTerms.title')} onClose={() => setPanel(null)}>
          <ProTermsPanelBody onAccepted={proTermsAccepted} onCancel={() => setPanel(null)} />
        </PanelOverlay>
      )}
    </div>
  );
}
