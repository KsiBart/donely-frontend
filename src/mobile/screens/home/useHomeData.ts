import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategoriesQuery, useProvidersQuery } from '../../../api/hooks';
import type { Category, ProviderListItem } from '../../../api/models';
import { toIntlLocale } from '../../../i18n';
import { useIsDesktop } from '../../../lib/useIsDesktop';
import { useLocate } from '../../../lib/useLocate';
import { useAuth } from '../../../state/AuthContext';
import { useToast } from '../../../state/ToastContext';

/** All data-fetching, state, and handlers for the Home screen. Extracted verbatim from Home.tsx so
 * the component files only hold layout/JSX. */
export function useHomeData() {
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

  return {
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
  };
}
