import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAddFavoriteMutation, useFavoritesQuery, useProviderQuery, useRemoveFavoriteMutation } from '../../../api/hooks';
import type { Service } from '../../../api/models';
import { toIntlLocale } from '../../../i18n';
import { useIsDesktop } from '../../../lib/useIsDesktop';
import { useBrand } from '../../../brand';
import { useToast } from '../../../state/ToastContext';

/** All data-fetching, state, and handlers for the ProviderProfile screen. Extracted verbatim from
 * ProviderProfile.tsx so the component files only hold layout/JSX. */
export function useProviderProfileData() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const brand = useBrand();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isDesktop = useIsDesktop();
  const { data: pv, error: pvError } = useProviderQuery(id);
  const { data: favList } = useFavoritesQuery();
  const [favOverride, setFavOverride] = useState<boolean | null>(null);
  const fav = favOverride ?? !!favList?.some((p) => String(p.id) === id);
  const addFavoriteMutation = useAddFavoriteMutation();
  const removeFavoriteMutation = useRemoveFavoriteMutation();

  useEffect(() => {
    if (pvError) showToast(pvError instanceof Error ? pvError.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pvError]);

  // Once the invalidated favorites list refetches (post add/remove), it's the source of truth again.
  useEffect(() => {
    setFavOverride(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favList]);

  const toggleFav = async () => {
    if (!pv) return;
    const wasFav = fav;
    setFavOverride(!wasFav);
    try {
      if (wasFav) {
        await removeFavoriteMutation.mutateAsync(pv.id);
        showToast(t('providerProfile.removedFavToast'));
      } else {
        await addFavoriteMutation.mutateAsync(pv.id);
        showToast(t('providerProfile.addedFavToast'));
      }
    } catch (e) {
      setFavOverride(wasFav);
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const book = (s: Service) => {
    if (!pv) return;
    navigate(`/book/${pv.id}/${s.id}`, { state: { provider: pv, service: s } });
  };

  const goBack = () => navigate(-1);

  return {
    t,
    locale,
    brand,
    isDesktop,
    pv,
    fav,
    toggleFav,
    book,
    goBack,
  };
}
