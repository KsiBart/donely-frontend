import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { currentPosition, forwardGeocode, reverseGeocode } from './geocode';

/**
 * Shared "set my location" logic used by the post-login LocationScreen AND the in-app relocate
 * control on Home. Persists real coordinates (+ a reverse-geocoded label) to the profile via
 * `updateMe`, which is what the backend distance-sort keys off. GPS and manual-address paths both
 * end in the same PATCH /me; failures toast and return false without wiping the existing location.
 */
export function useLocate() {
  const { t } = useTranslation();
  const { updateMe } = useAuth();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  /** Browser GPS → reverse-geocoded label → profile. Returns true on success. */
  const useCurrent = async (): Promise<boolean> => {
    if (busy) return false;
    setBusy(true);
    try {
      const { lat, lng } = await currentPosition();
      const label = (await reverseGeocode(lat, lng)) ?? t('auth.location.yourLocation');
      await updateMe({ lat, lng, locationLabel: label });
      showToast(t('auth.location.setToast', { place: label }));
      return true;
    } catch (e) {
      const denied = !!e && typeof e === 'object' && 'code' in e && (e as GeolocationPositionError).code === 1;
      showToast(denied ? t('auth.location.denied') : t('auth.location.geoFailed'));
      return false;
    } finally {
      setBusy(false);
    }
  };

  /** Typed address/place → forward-geocoded coords → profile. Returns true on success. */
  const useManual = async (query: string): Promise<boolean> => {
    if (busy || !query.trim()) return false;
    setBusy(true);
    try {
      const r = await forwardGeocode(query);
      if (!r) {
        showToast(t('auth.location.notFound'));
        return false;
      }
      await updateMe({ lat: r.lat, lng: r.lng, locationLabel: r.label });
      showToast(t('auth.location.setToast', { place: r.label }));
      return true;
    } catch {
      showToast(t('auth.location.geoFailed'));
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { busy, useCurrent, useManual };
}
