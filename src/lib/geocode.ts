/**
 * Geolocation + geocoding helpers. Zero-key, zero-account (plug&play): browser Geolocation API for
 * "use my current location" and OpenStreetMap's public Nominatim service for reverse/forward
 * geocoding. Nominatim needs no API key — the browser's Referer satisfies its usage policy. All
 * network calls are best-effort: on failure the caller still keeps the raw coordinates (which is
 * all the distance-sort actually needs), so the feature degrades gracefully offline.
 */
export interface GeoResult {
  lat: number;
  lng: number;
  label: string;
}

const NOMINATIM = 'https://nominatim.openstreetmap.org';

/** First two comma-parts of a Nominatim display_name → a short human label. */
function shorten(displayName: string | undefined): string {
  if (!displayName) return '';
  return displayName.split(',').slice(0, 2).join(',').trim();
}

/** Ask the browser for the device's current position. Rejects with a GeolocationPositionError
 * (`.code === 1` = permission denied) or a plain Error if the API is unavailable. */
export function currentPosition(opts?: PositionOptions): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('geolocation-unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000, ...opts },
    );
  });
}

/** Reverse-geocode coords → a short "Dzielnica, Miasto" label (PL). Returns null on any failure —
 * the caller keeps the coordinates regardless. */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(`${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&accept-language=pl`);
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address ?? {};
    const locality = a.suburb || a.city_district || a.neighbourhood || a.town || a.village || a.city || a.county;
    const city = a.city || a.town || a.village;
    if (locality && city && locality !== city) return `${locality}, ${city}`;
    return locality || city || shorten(data.display_name) || null;
  } catch {
    return null;
  }
}

/** Forward-geocode a typed address/place (biased to Poland) → coords + normalized label.
 * Returns null when nothing matches. */
export async function forwardGeocode(query: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `${NOMINATIM}/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1&accept-language=pl&countrycodes=pl`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const top = data[0];
    const lat = Number.parseFloat(top.lat);
    const lng = Number.parseFloat(top.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng, label: shorten(top.display_name) || query.trim() };
  } catch {
    return null;
  }
}
