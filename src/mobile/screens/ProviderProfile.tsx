import { clickable } from '../../lib/a11y';
import { useProviderProfileData } from './provider-profile/useProviderProfileData';
import DesktopPhotoStrip from './provider-profile/DesktopPhotoStrip';
import DesktopHeader from './provider-profile/DesktopHeader';
import DesktopReviewsSection from './provider-profile/DesktopReviewsSection';
import DesktopServicesPanel from './provider-profile/DesktopServicesPanel';
import MobilePhotoHeader from './provider-profile/MobilePhotoHeader';
import MobileHeader from './provider-profile/MobileHeader';
import MobileServicesSection from './provider-profile/MobileServicesSection';
import MobileReviewsSection from './provider-profile/MobileReviewsSection';

export default function ProviderProfile() {
  const { t, locale, brand, isDesktop, pv, fav, toggleFav, book, goBack } = useProviderProfileData();

  if (!pv) {
    return <div className="flex-1" />;
  }

  if (isDesktop) {
    return (
      <div className="max-w-[1120px] mx-auto pt-[22px] px-7 pb-12 animate-[dwfade_.3s_ease]">
        <span {...clickable(goBack)} className="inline-flex items-center gap-[7px] text-[13px] font-bold text-accent cursor-pointer">
          <span aria-hidden="true">‹</span> {t('providerProfile.backToResults')}
        </span>
        <div className="grid grid-cols-[1fr_380px] gap-[26px] items-start mt-4">
          <div>
            <DesktopPhotoStrip t={t} />
            <DesktopHeader t={t} locale={locale} appName={brand.appName} pv={pv} fav={fav} onToggleFav={() => void toggleFav()} />
            <DesktopReviewsSection t={t} locale={locale} rating={pv.rating} reviewCount={pv.reviewCount} reviews={pv.reviews} />
          </div>

          <DesktopServicesPanel t={t} services={pv.services} spotAddress={pv.spotAddress} onBook={book} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative">
      <MobilePhotoHeader t={t} fav={fav} onBack={goBack} onToggleFav={() => void toggleFav()} />

      <div className="pt-4 px-5 pb-10">
        <MobileHeader t={t} locale={locale} appName={brand.appName} pv={pv} />
        <MobileServicesSection t={t} services={pv.services} spotAddress={pv.spotAddress} onBook={book} />
        <MobileReviewsSection t={t} locale={locale} rating={pv.rating} reviewCount={pv.reviewCount} reviews={pv.reviews} />
      </div>
    </div>
  );
}
