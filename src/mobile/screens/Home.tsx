import { StoreCard } from '../AppPromo';
import { useHomeData } from './home/useHomeData';
import DesktopHeader from './home/DesktopHeader';
import DesktopMapPanel from './home/DesktopMapPanel';
import DesktopGrid from './home/DesktopGrid';
import MobileMapPanel from './home/MobileMapPanel';
import MobileHeader from './home/MobileHeader';
import MobileSearch from './home/MobileSearch';
import FeaturedCarousel from './home/FeaturedCarousel';
import MobileCategoryChips from './home/MobileCategoryChips';
import MobileProviderList from './home/MobileProviderList';

export default function Home() {
  const {
    t,
    locale,
    isDesktop,
    locating,
    suggestions,
    mapOn,
    setMapOn,
    catSel,
    setCatSel,
    query,
    setQuery,
    cats,
    providers,
    featured,
    firstName,
    myLocation,
    userPoint,
    relocate,
    openProvider,
    runAI,
  } = useHomeData();

  if (isDesktop) {
    if (mapOn) {
      return (
        <div className="max-w-[1120px] mx-auto pt-7 px-7 pb-10">
          <DesktopHeader
            t={t}
            query={query}
            setQuery={setQuery}
            runAI={runAI}
            cats={cats}
            catSel={catSel}
            setCatSel={setCatSel}
            providersCount={providers.length}
            relocate={relocate}
            myLocation={myLocation}
            locating={locating}
            mapOn={mapOn}
            setMapOn={setMapOn}
          />
          <DesktopMapPanel t={t} locale={locale} providers={providers} userPoint={userPoint} openProvider={openProvider} />
          <StoreCard />
        </div>
      );
    }

    return (
      <div className="max-w-[1120px] mx-auto pt-7 px-7 pb-10">
        <DesktopHeader
          t={t}
          query={query}
          setQuery={setQuery}
          runAI={runAI}
          cats={cats}
          catSel={catSel}
          setCatSel={setCatSel}
          providersCount={providers.length}
          relocate={relocate}
          myLocation={myLocation}
          locating={locating}
          mapOn={mapOn}
          setMapOn={setMapOn}
        />
        <DesktopGrid t={t} locale={locale} providers={providers} openProvider={openProvider} />
        <StoreCard />
      </div>
    );
  }

  if (mapOn) {
    return <MobileMapPanel t={t} locale={locale} providers={providers} userPoint={userPoint} openProvider={openProvider} query={query} mapOn={mapOn} setMapOn={setMapOn} />;
  }

  return (
    <div className="flex-1 overflow-auto pt-[18px] pb-3">
      <MobileHeader t={t} firstName={firstName} myLocation={myLocation} locating={locating} relocate={relocate} mapOn={mapOn} setMapOn={setMapOn} />
      <MobileSearch t={t} query={query} setQuery={setQuery} runAI={runAI} suggestions={suggestions} />
      <FeaturedCarousel t={t} locale={locale} featured={featured} openProvider={openProvider} />
      <MobileCategoryChips t={t} cats={cats} catSel={catSel} setCatSel={setCatSel} />
      <MobileProviderList t={t} locale={locale} providers={providers} openProvider={openProvider} />
      <div className="px-5">
        <StoreCard />
      </div>
    </div>
  );
}
