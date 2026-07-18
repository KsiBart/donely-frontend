import { useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Real interactive map (Leaflet + OpenStreetMap raster tiles — free, no API key, no account, so it
 * stays plug&play for the white-label boilerplate). Replaces the old stylized-div fake map. Pins
 * are theme-colored price labels at each provider's real lat/lng; the customer's own position shows
 * as a blue dot. Everything is a `divIcon` (raw HTML in the document), so pins inherit the live CSS
 * theme vars (--accent/--surface/--onaccent) and recolor with the accent/dark theme for free — and
 * we sidestep Leaflet's broken default-marker-image bundler issue entirely.
 */
export interface MapPoint {
  id: number;
  lat: number;
  lng: number;
  priceFromLabel: string;
  name: string;
}

const WARSAW: [number, number] = [52.2297, 21.0122];

function priceIcon(label: string, active: boolean): L.DivIcon {
  return L.divIcon({
    className: 'map-pin-wrap',
    html: `<span class="map-pin${active ? ' map-pin-active' : ''}">${label}</span>`,
    iconSize: [0, 0], // let the span size itself; anchor at its center-bottom
    iconAnchor: [0, 0],
  });
}

const userIcon: L.DivIcon = L.divIcon({
  className: 'map-user-wrap',
  html: '<span class="map-user-dot"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/** Fit the viewport to every point (providers + user). Re-runs whenever the point set changes. */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(',')).join('|');
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14, { animate: true });
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15, animate: true });
    // key intentionally drives re-fit; map is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

/** Leaflet mis-measures its container when it mounts inside a flexbox/animated panel — nudge it. */
function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 60);
    return () => clearTimeout(id);
  }, [map]);
  return null;
}

export default function MapView({
  providers,
  user,
  activeId,
  onSelect,
  style,
  dark,
  showZoom = true,
}: {
  providers: MapPoint[];
  user?: { lat: number; lng: number } | null;
  activeId?: number | null;
  onSelect?: (id: number) => void;
  style?: CSSProperties;
  /** Apply a dark tile filter (defaults to reading the app's `data-app-dark` flag). */
  dark?: boolean;
  /** Show Leaflet's +/- zoom control. Off on mobile (pinch/double-tap zoom + a search overlay
   * would otherwise collide with the top-left buttons). */
  showZoom?: boolean;
}) {
  const pts = useMemo(() => providers.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)), [providers]);
  const allPoints: [number, number][] = useMemo(() => {
    const list: [number, number][] = pts.map((p) => [p.lat, p.lng]);
    if (user) list.push([user.lat, user.lng]);
    return list;
  }, [pts, user]);

  const isDark =
    dark ??
    (typeof document !== 'undefined' && document.documentElement.getAttribute('data-app-dark') === '1');

  return (
    <MapContainer
      center={user ? [user.lat, user.lng] : WARSAW}
      zoom={13}
      scrollWheelZoom
      zoomControl={showZoom}
      className={isDark ? 'donely-map donely-map-dark' : 'donely-map'}
      style={{ height: '100%', width: '100%', ...style }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <InvalidateOnMount />
      <FitBounds points={allPoints} />
      {pts.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={priceIcon(p.priceFromLabel, p.id === activeId)}
          eventHandlers={onSelect ? { click: () => onSelect(p.id) } : undefined}
        />
      ))}
      {user && <Marker position={[user.lat, user.lng]} icon={userIcon} interactive={false} />}
    </MapContainer>
  );
}
