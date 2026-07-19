import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useCategoriesQuery, useProvidersQuery } from '../../api/hooks';
import type { Category, ProviderListItem } from '../../api/models';
import { toIntlLocale } from '../../i18n';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { useLocate } from '../../lib/useLocate';
import { AvatarTile, SparkleIcon, stripes } from '../../components/ui';
import MapView from '../../components/MapView';
import { BRICO, formatKm, formatRating } from '../../lib/format';
import { useAuth } from '../../state/AuthContext';
import { useToast } from '../../state/ToastContext';
import { StoreCard } from '../AppPromo';
import { providerMeta } from '../shared';
import { clickable } from '../../lib/a11y';
import { chipVariants } from '../../components/ui/variants';

function shortCatLabel(name: string): string {
  return name.split(/ \/ | nad /)[0];
}

// Verified badge (short form) — Home.tsx list/grid/map rows share this exact pill shape.
const verifiedShortCls = 'bg-ver-bg text-ver-fg rounded-[10px] py-0.5 px-[7px] text-[10px] font-bold';

export default function Home() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const { me } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { busy: locating, useCurrent } = useLocate();
  const suggestions = t('home.suggestions', { returnObjects: true }) as unknown as string[];

  const [mapOn, setMapOn] = useState(false);
  const [catSel, setCatSel] = useState(0); // 0 = Wszystkie
  const [query, setQuery] = useState('');

  const { data: catsData, error: catsError } = useCategoriesQuery();
  const cats = useMemo<Category[]>(() => catsData ?? [], [catsData]);

  const {
    data: allProvidersData,
    error: allProvidersError,
    refetch: refetchAllProviders,
  } = useProvidersQuery({});
  const allProviders = useMemo<ProviderListItem[]>(() => allProvidersData ?? [], [allProvidersData]);

  const catSlug = catSel === 0 ? undefined : cats[catSel - 1]?.slug;
  const {
    data: catProvidersData,
    error: catProvidersError,
    refetch: refetchCatProviders,
  } = useProvidersQuery({ category: catSlug }, catSel !== 0 && !!catSlug);
  const catProviders = useMemo<ProviderListItem[]>(() => catProvidersData ?? [], [catProvidersData]);

  useEffect(() => {
    if (catsError) showToast(catsError instanceof Error ? catsError.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catsError]);

  // Refetch when the user's stored location changes — the backend sorts/measures distance from the
  // profile's lat/lng (JWT), so a relocate must re-order the list from the new origin.
  useEffect(() => {
    void refetchAllProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.lat, me?.lng]);

  useEffect(() => {
    if (allProvidersError) showToast(allProvidersError instanceof Error ? allProvidersError.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProvidersError]);

  useEffect(() => {
    if (catSel === 0 || !catSlug) return;
    void refetchCatProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catSel, catSlug, me?.lat, me?.lng]);

  useEffect(() => {
    if (catProvidersError) showToast(catProvidersError instanceof Error ? catProvidersError.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catProvidersError]);

  const providers = catSel === 0 ? allProviders : catProviders;
  const featured = useMemo(() => allProviders.filter((p) => p.featured), [allProviders]);
  const firstName = (me?.name ?? '').split(' ')[0];
  const myLocation = me?.locationLabel || 'Mokotów, Warszawa';
  const userPoint = me?.lat != null && me?.lng != null ? { lat: me.lat, lng: me.lng } : null;
  const relocate = () => void useCurrent();

  const openProvider = (id: number) => navigate(`/provider/${id}`);

  const runAI = () => {
    if (!query.trim()) {
      showToast(t('home.searchEmptyToast'));
      return;
    }
    navigate(`/ai?q=${encodeURIComponent(query.trim())}`);
  };

  const segCls = (on: boolean) =>
    clsx('py-1.5 px-3 rounded-[11px] text-xs font-bold cursor-pointer', on ? 'bg-surface text-accent shadow-[var(--shadow)]' : 'bg-transparent text-muted shadow-none');

  const segToggle = (
    <div className={clsx('flex-none flex rounded-[14px] p-[3px]', mapOn ? 'bg-surface shadow-[var(--shadow)]' : 'bg-surface2 shadow-none')}>
      <span {...clickable(() => setMapOn(false), { pressed: !mapOn })} className={segCls(!mapOn)}>
        {t('home.listToggle')}
      </span>
      <span {...clickable(() => setMapOn(true), { pressed: mapOn })} className={segCls(mapOn)}>
        {t('home.mapToggle')}
      </span>
    </div>
  );

  if (isDesktop) {
    const desktopHeader = (
      <>
        <div className="bg-surface border-[1.5px] border-accent rounded-[22px] py-[5px] pr-[5px] pl-[18px] flex items-center gap-[11px] shadow-[var(--shadow)]">
          <SparkleIcon size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runAI();
            }}
            placeholder={t('home.searchPlaceholder')}
            aria-label={t('home.searchPlaceholder')}
            className="flex-1 min-w-0 border-none bg-transparent text-text outline-none py-2.5 px-0 font-semibold text-[14.5px] font-['Figtree',sans-serif]"
          />
          <span {...clickable(runAI)} className="flex-none h-[42px] rounded-[17px] bg-accent text-onaccent flex items-center justify-center gap-[7px] font-bold text-[13.5px] px-[18px] cursor-pointer">
            {t('home.searchCta')} <span aria-hidden="true">→</span>
          </span>
        </div>

        <div className="flex gap-2 mt-3.5 flex-wrap">
          {[t('home.categoriesAll'), ...cats.map((c) => shortCatLabel(c.name))].map((label, i) => {
            const active = i === catSel;
            return (
              <span
                key={label}
                {...clickable(() => setCatSel(i), { pressed: active })}
                className={clsx(
                  'flex-none rounded-2xl py-[7px] px-3.5 text-[12.5px] cursor-pointer',
                  active ? 'bg-accent text-onaccent font-bold' : 'bg-surface text-muted2 font-medium',
                )}
              >
                {label}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-3 mx-0 mt-[26px] mb-3.5">
          {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
          <h1 style={{ fontFamily: BRICO }} className="text-xl font-bold m-0">
            {t('home.providersCount', { count: providers.length })}
          </h1>
          <span {...clickable(relocate)} title={t('home.changeLocation')} className="inline-flex items-center gap-1.5 text-[12.5px] text-muted cursor-pointer">
            <span aria-hidden="true">◉</span> {myLocation}
            <span className="text-accent font-bold">· {locating ? t('home.locating') : t('home.changeLocation')}</span>
          </span>
          <span className="ml-auto flex items-center gap-3.5">
            {!mapOn && <span className="text-[12.5px] text-muted cursor-pointer">{t('home.sortNearest')}</span>}
            {segToggle}
          </span>
        </div>
      </>
    );

    if (mapOn) {
      return (
        <div className="max-w-[1120px] mx-auto pt-7 px-7 pb-10">
          {desktopHeader}

          <div className="flex gap-[18px] items-stretch h-[560px]">
            <div className="flex-1 min-w-0 rounded-3xl overflow-hidden shadow-[var(--shadow)]">
              <MapView providers={providers} user={userPoint} activeId={providers[0]?.id} onSelect={openProvider} />
            </div>

            <div className="hide-scroll w-[340px] flex-none overflow-auto flex flex-col gap-2.5 pr-0.5">
              {providers.map((p) => (
                <div key={p.id} {...clickable(() => openProvider(p.id))} className="dw-card-hover flex gap-3 bg-surface rounded-[18px] p-3 shadow-[var(--shadow)] cursor-pointer">
                  <AvatarTile init={p.init} size={52} radius={14} fontSize={15} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-bold text-sm">{p.name}</span>
                      {p.verified && (
                        <span aria-hidden="true" className={verifiedShortCls}>
                          {t('common.verifiedShort')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted mt-0.5">{providerMeta(p, locale)}</div>
                    <div className="flex justify-between items-center mt-[7px]">
                      <span className="text-xs text-muted2">
                        {t('home.priceFromPrefix')} <b className="text-text">{p.priceFromLabel}</b>
                      </span>
                      <span className="bg-accent text-onaccent rounded-xl py-[5px] px-2.5 text-[11px] font-bold">{p.nextSlotLabel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <StoreCard />
        </div>
      );
    }

    return (
      <div className="max-w-[1120px] mx-auto pt-7 px-7 pb-10">
        {desktopHeader}

        <div className="grid grid-cols-3 gap-3.5">
          {providers.map((p) => (
            <div key={p.id} {...clickable(() => openProvider(p.id))} className="dw-card-hover flex flex-col gap-[11px] bg-surface rounded-[20px] p-3.5 shadow-[var(--shadow)] cursor-pointer">
              <div className="flex gap-3 items-center">
                <AvatarTile init={p.init} size={52} radius={15} fontSize={15} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-bold text-[14.5px]">{p.name}</span>
                    {p.verified && (
                      <span aria-hidden="true" className={verifiedShortCls}>
                        {t('common.verifiedShort')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted mt-0.5">{providerMeta(p, locale)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12.5px] text-muted2">
                  {t('home.priceFromPrefix')} <b className="text-text">{p.priceFromLabel}</b>
                </span>
                <span className="bg-accent text-onaccent rounded-[13px] py-1.5 px-3 text-[11.5px] font-bold">
                  {p.nextSlotLabel} <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <StoreCard />
      </div>
    );
  }

  if (mapOn) {
    return (
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 relative bg-[var(--map)] overflow-hidden">
          <MapView
            providers={providers}
            user={userPoint}
            activeId={providers[0]?.id}
            onSelect={openProvider}
            showZoom={false}
            // eslint-disable-next-line react/no-inline-styles -- dynamic: MapView only accepts a `style` prop (no `className`) — kept inline, see components/MapView.tsx
            style={{ position: 'absolute', inset: 0 }}
          />
          <div className="absolute left-[8%] top-[4%] right-[8%] flex items-center gap-2.5 z-[1000]">
            <div
              {...clickable(() => setMapOn(false))}
              className="flex-1 flex items-center gap-[9px] bg-surface rounded-[20px] py-[11px] px-3.5 shadow-[var(--shadow)] cursor-pointer"
            >
              <SparkleIcon size={15} />
              <span className="text-[13.5px] font-semibold text-muted2">{query || t('home.mapSearchPlaceholder')}</span>
            </div>
            {segToggle}
          </div>
        </div>
        <div className="bg-surface rounded-t-[26px] -mt-6 relative pt-2.5 px-5 pb-1.5 shadow-[var(--shadow)] max-h-[40%] flex flex-col">
          <div className="w-10 h-1 rounded-sm bg-border mx-auto mb-3 flex-none" />
          <div className="overflow-auto flex flex-col gap-2.5 pb-2.5">
            {providers.map((p) => (
              <div key={p.id} {...clickable(() => openProvider(p.id))} className="flex gap-3 bg-surface2 rounded-[20px] p-3 cursor-pointer">
                <AvatarTile init={p.init} size={52} radius={14} fontSize={15} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{p.name}</div>
                  <div className="text-xs text-muted mt-0.5">{providerMeta(p, locale)}</div>
                  <div className="text-[11.5px] text-muted2 mt-0.5">{p.locLine}</div>
                </div>
                <span className="self-center flex-none bg-accent text-onaccent rounded-[14px] py-1.5 px-[11px] text-[11.5px] font-bold">{p.nextSlotLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto pt-[18px] pb-3">
      <div className="flex items-center gap-2.5 pt-1.5 px-5">
        <div className="flex-1 min-w-0">
          {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
          <h1 style={{ fontFamily: BRICO }} className="text-xl font-bold m-0">
            {firstName ? t('home.greetingNamed', { name: firstName }) : t('home.greetingPlain')}
          </h1>
          <div {...clickable(relocate)} title={t('home.changeLocation')} className="text-xs text-muted mt-px cursor-pointer inline-flex items-center gap-[5px]">
            <span aria-hidden="true">◉</span> {myLocation}
            <span className="text-accent font-bold">· {locating ? t('home.locating') : t('home.changeLocation')}</span>
          </div>
        </div>
        {segToggle}
      </div>

      <div className="mt-3.5 mx-5 bg-surface border-[1.5px] border-accent rounded-[20px] p-1 pl-3.5 flex items-center gap-[9px] shadow-[var(--shadow)]">
        <SparkleIcon size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') runAI();
          }}
          placeholder={t('home.searchPlaceholder')}
          aria-label={t('home.searchPlaceholder')}
          className="flex-1 min-w-0 border-none bg-transparent text-text outline-none py-2.5 px-0 font-semibold text-[13.5px] font-['Figtree',sans-serif]"
        />
        <span {...clickable(runAI, { label: t('home.searchCta') })} className="flex-none w-[38px] h-[38px] rounded-2xl bg-accent text-onaccent flex items-center justify-center font-bold cursor-pointer">
          →
        </span>
      </div>

      <div className="flex gap-[7px] mt-2.5 mx-5 flex-wrap">
        {suggestions.map((s) => (
          <span
            key={s}
            {...clickable(() => setQuery(s))}
            className="border border-border-strong bg-surface rounded-[13px] py-1.5 px-[11px] text-[11.5px] font-semibold text-muted2 cursor-pointer"
          >
            {s}
          </span>
        ))}
      </div>

      {featured.length > 0 && (
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
      )}

      <div className="hide-scroll flex gap-2 overflow-auto mt-4 px-5 pb-1">
        {[t('home.categoriesAll'), ...cats.map((c) => shortCatLabel(c.name))].map((label, i) => {
          const active = i === catSel;
          return (
            <span key={label} {...clickable(() => setCatSel(i), { pressed: active })} className={clsx('flex-none', chipVariants({ active }))}>
              {label}
            </span>
          );
        })}
      </div>

      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h2 style={{ fontFamily: BRICO }} className="text-base font-bold mt-4 mx-5 mb-2.5">
        {t('home.providersCount', { count: providers.length })}
      </h2>
      <div className="flex flex-col gap-2.5 px-5">
        {providers.map((p) => (
          <div key={p.id} {...clickable(() => openProvider(p.id))} className="flex gap-3 bg-surface rounded-[20px] p-3 cursor-pointer shadow-[var(--shadow)]">
            <AvatarTile init={p.init} size={64} radius={16} fontSize={18} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[15px]">{p.name}</span>
                {p.verified && (
                  <span className="inline-flex bg-ver-bg text-ver-fg rounded-[10px] py-0.5 px-[7px] text-[10.5px] font-bold">{t('common.verifiedFull')}</span>
                )}
              </div>
              <div className="text-[12.5px] text-muted mt-0.5">{providerMeta(p, locale)}</div>
              <div className="text-[11.5px] text-muted2 mt-[3px]">{p.locLine}</div>
              <div className="flex justify-between items-center mt-[7px]">
                <span className="text-[13px] text-muted2">
                  {t('home.priceFromPrefix')} <b className="text-text">{p.priceFromLabel}</b>
                </span>
                <span className="bg-accent text-onaccent rounded-[14px] py-1.5 px-3 text-xs font-bold">
                  {p.nextSlotLabel} <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5">
        <StoreCard />
      </div>
    </div>
  );
}
