import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { Category, ProviderListItem } from '../../api/types';
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

function shortCatLabel(name: string): string {
  return name.split(/ \/ | nad /)[0];
}

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
  const [cats, setCats] = useState<Category[]>([]);
  const [catSel, setCatSel] = useState(0); // 0 = Wszystkie
  const [allProviders, setAllProviders] = useState<ProviderListItem[]>([]);
  const [catProviders, setCatProviders] = useState<ProviderListItem[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.categories().then(setCats).catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when the user's stored location changes — the backend sorts/measures distance from the
  // profile's lat/lng (JWT), so a relocate must re-order the list from the new origin.
  useEffect(() => {
    api
      .providers()
      .then(setAllProviders)
      .catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.lat, me?.lng]);

  useEffect(() => {
    if (catSel === 0) return;
    const slug = cats[catSel - 1]?.slug;
    if (!slug) return;
    api
      .providers({ category: slug })
      .then(setCatProviders)
      .catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catSel, me?.lat, me?.lng]);

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

  const seg = (on: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    borderRadius: 11,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    background: on ? 'var(--surface)' : 'transparent',
    color: on ? 'var(--accent)' : 'var(--muted)',
    boxShadow: on ? 'var(--shadow)' : 'none',
  });

  const segToggle = (
    <div style={{ flex: 'none', display: 'flex', background: mapOn ? 'var(--surface)' : 'var(--surface2)', borderRadius: 14, padding: 3, boxShadow: mapOn ? 'var(--shadow)' : 'none' }}>
      <span {...clickable(() => setMapOn(false), { pressed: !mapOn })} style={seg(!mapOn)}>
        {t('home.listToggle')}
      </span>
      <span {...clickable(() => setMapOn(true), { pressed: mapOn })} style={seg(mapOn)}>
        {t('home.mapToggle')}
      </span>
    </div>
  );

  if (isDesktop) {
    const desktopHeader = (
      <>
        <div
          style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--accent)',
            borderRadius: 22,
            padding: '5px 5px 5px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            boxShadow: 'var(--shadow)',
          }}
        >
          <SparkleIcon size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runAI();
            }}
            placeholder={t('home.searchPlaceholder')}
            aria-label={t('home.searchPlaceholder')}
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              background: 'transparent',
              color: 'var(--text)',
              font: "600 14.5px 'Figtree', sans-serif",
              outline: 'none',
              padding: '10px 0',
            }}
          />
          <span
            {...clickable(runAI)}
            style={{
              flex: 'none',
              height: 42,
              borderRadius: 17,
              background: 'var(--accent)',
              color: 'var(--onaccent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              fontWeight: 700,
              fontSize: 13.5,
              padding: '0 18px',
              cursor: 'pointer',
            }}
          >
            {t('home.searchCta')} <span aria-hidden="true">→</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {[t('home.categoriesAll'), ...cats.map((c) => shortCatLabel(c.name))].map((label, i) => {
            const active = i === catSel;
            return (
              <span
                key={label}
                {...clickable(() => setCatSel(i), { pressed: active })}
                style={{
                  flex: 'none',
                  background: active ? 'var(--accent)' : 'var(--surface)',
                  color: active ? 'var(--onaccent)' : 'var(--muted2)',
                  borderRadius: 16,
                  padding: '7px 14px',
                  fontSize: 12.5,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {label}
              </span>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '26px 0 14px' }}>
          <h1 style={{ fontFamily: BRICO, fontSize: 20, fontWeight: 700, margin: 0 }}>{t('home.providersCount', { count: providers.length })}</h1>
          <span
            {...clickable(relocate)}
            title={t('home.changeLocation')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--muted)', cursor: 'pointer' }}
          >
            <span aria-hidden="true">◉</span> {myLocation}
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>· {locating ? t('home.locating') : t('home.changeLocation')}</span>
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
            {!mapOn && <span style={{ fontSize: 12.5, color: 'var(--muted)', cursor: 'pointer' }}>{t('home.sortNearest')}</span>}
            {segToggle}
          </span>
        </div>
      </>
    );

    if (mapOn) {
      return (
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 28px 40px' }}>
          {desktopHeader}

          <div style={{ display: 'flex', gap: 18, alignItems: 'stretch', height: 560 }}>
            <div style={{ flex: 1, minWidth: 0, borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              <MapView providers={providers} user={userPoint} activeId={providers[0]?.id} onSelect={openProvider} />
            </div>

            <div
              className="hide-scroll"
              style={{ width: 340, flex: 'none', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 2 }}
            >
              {providers.map((p) => (
                <div
                  key={p.id}
                  {...clickable(() => openProvider(p.id))}
                  className="dw-card-hover"
                  style={{ display: 'flex', gap: 12, background: 'var(--surface)', borderRadius: 18, padding: 12, boxShadow: 'var(--shadow)', cursor: 'pointer' }}
                >
                  <AvatarTile init={p.init} size={52} radius={14} fontSize={15} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                      {p.verified && (
                        <span aria-hidden="true" style={{ background: 'var(--ver-bg)', color: 'var(--ver-fg)', borderRadius: 10, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>
                          {t('common.verifiedShort')}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{providerMeta(p, locale)}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 7 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted2)' }}>
                        {t('home.priceFromPrefix')} <b style={{ color: 'var(--text)' }}>{p.priceFromLabel}</b>
                      </span>
                      <span style={{ background: 'var(--accent)', color: 'var(--onaccent)', borderRadius: 12, padding: '5px 10px', fontSize: 11, fontWeight: 700 }}>
                        {p.nextSlotLabel}
                      </span>
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
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 28px 40px' }}>
        {desktopHeader}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {providers.map((p) => (
            <div
              key={p.id}
              {...clickable(() => openProvider(p.id))}
              className="dw-card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 11,
                background: 'var(--surface)',
                borderRadius: 20,
                padding: 14,
                boxShadow: 'var(--shadow)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <AvatarTile init={p.init} size={52} radius={15} fontSize={15} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </span>
                    {p.verified && (
                      <span
                        aria-hidden="true"
                        style={{
                          background: 'var(--ver-bg)',
                          color: 'var(--ver-fg)',
                          borderRadius: 10,
                          padding: '2px 7px',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {t('common.verifiedShort')}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{providerMeta(p, locale)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, color: 'var(--muted2)' }}>
                  {t('home.priceFromPrefix')} <b style={{ color: 'var(--text)' }}>{p.priceFromLabel}</b>
                </span>
                <span style={{ background: 'var(--accent)', color: 'var(--onaccent)', borderRadius: 13, padding: '6px 12px', fontSize: 11.5, fontWeight: 700 }}>
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
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative', background: 'var(--map)', overflow: 'hidden' }}>
          <MapView providers={providers} user={userPoint} activeId={providers[0]?.id} onSelect={openProvider} showZoom={false} style={{ position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', left: '8%', top: '4%', right: '8%', display: 'flex', alignItems: 'center', gap: 10, zIndex: 1000 }}>
            <div
              {...clickable(() => setMapOn(false))}
              style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: 'var(--surface)', borderRadius: 20, padding: '11px 14px', boxShadow: 'var(--shadow)', cursor: 'pointer' }}
            >
              <SparkleIcon size={15} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted2)' }}>{query || t('home.mapSearchPlaceholder')}</span>
            </div>
            {segToggle}
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: '26px 26px 0 0',
            marginTop: -24,
            position: 'relative',
            padding: '10px 20px 6px',
            boxShadow: 'var(--shadow)',
            maxHeight: '40%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 12px', flex: 'none' }} />
          <div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 10 }}>
            {providers.map((p) => (
              <div key={p.id} {...clickable(() => openProvider(p.id))} style={{ display: 'flex', gap: 12, background: 'var(--surface2)', borderRadius: 20, padding: 12, cursor: 'pointer' }}>
                <AvatarTile init={p.init} size={52} radius={14} fontSize={15} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{providerMeta(p, locale)}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted2)', marginTop: 2 }}>{p.locLine}</div>
                </div>
                <span
                  style={{
                    alignSelf: 'center',
                    flex: 'none',
                    background: 'var(--accent)',
                    color: 'var(--onaccent)',
                    borderRadius: 14,
                    padding: '6px 11px',
                    fontSize: 11.5,
                    fontWeight: 700,
                  }}
                >
                  {p.nextSlotLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '18px 0 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 20px 0' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: BRICO, fontSize: 20, fontWeight: 700, margin: 0 }}>
            {firstName ? t('home.greetingNamed', { name: firstName }) : t('home.greetingPlain')}
          </h1>
          <div
            {...clickable(relocate)}
            title={t('home.changeLocation')}
            style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <span aria-hidden="true">◉</span> {myLocation}
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>· {locating ? t('home.locating') : t('home.changeLocation')}</span>
          </div>
        </div>
        {segToggle}
      </div>

      <div
        style={{
          margin: '14px 20px 0',
          background: 'var(--surface)',
          border: '1.5px solid var(--accent)',
          borderRadius: 20,
          padding: '4px 4px 4px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          boxShadow: 'var(--shadow)',
        }}
      >
        <SparkleIcon size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') runAI();
          }}
          placeholder={t('home.searchPlaceholder')}
          aria-label={t('home.searchPlaceholder')}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            background: 'transparent',
            color: 'var(--text)',
            font: "600 13.5px 'Figtree', sans-serif",
            outline: 'none',
            padding: '10px 0',
          }}
        />
        <span
          {...clickable(runAI, { label: t('home.searchCta') })}
          style={{
            flex: 'none',
            width: 38,
            height: 38,
            borderRadius: 16,
            background: 'var(--accent)',
            color: 'var(--onaccent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          →
        </span>
      </div>

      <div style={{ display: 'flex', gap: 7, margin: '10px 20px 0', flexWrap: 'wrap' }}>
        {suggestions.map((s) => (
          <span
            key={s}
            {...clickable(() => setQuery(s))}
            style={{
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              borderRadius: 13,
              padding: '6px 11px',
              fontSize: 11.5,
              fontWeight: 600,
              color: 'var(--muted2)',
              cursor: 'pointer',
            }}
          >
            {s}
          </span>
        ))}
      </div>

      {featured.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '22px 20px 10px' }}>
            <h2 style={{ fontFamily: BRICO, fontSize: 16, fontWeight: 700, margin: 0 }}>{t('home.featuredTitle')}</h2>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'var(--surface2)', borderRadius: 9, padding: '3px 8px' }}>
              {t('home.featuredBadge')}
            </span>
          </div>
          <div className="hide-scroll" style={{ display: 'flex', gap: 10, overflow: 'auto', padding: '2px 20px 6px' }}>
            {featured.map((p) => (
              <div
                key={p.id}
                {...clickable(() => openProvider(p.id))}
                style={{ flex: 'none', width: 200, background: 'var(--surface)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow)', cursor: 'pointer' }}
              >
                <div style={{ height: 96, background: stripes(45, 8), display: 'flex', alignItems: 'flex-end', padding: 8 }}>
                  <span style={{ font: '600 9px ui-monospace, monospace', background: 'rgba(0,0,0,.5)', color: '#fff', borderRadius: 7, padding: '2px 7px' }}>
                    {t('home.workPhoto')}
                  </span>
                </div>
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                    {p.categoryName} · <span aria-hidden="true">★</span> {formatRating(p.rating, locale)} · {formatKm(p.distanceKm, locale)}
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent)', marginTop: 5 }}>{p.nextSlotLabel} <span aria-hidden="true">→</span></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="hide-scroll" style={{ display: 'flex', gap: 8, overflow: 'auto', margin: '16px 0 0', padding: '0 20px 4px' }}>
        {[t('home.categoriesAll'), ...cats.map((c) => shortCatLabel(c.name))].map((label, i) => {
          const active = i === catSel;
          return (
            <span
              key={label}
              {...clickable(() => setCatSel(i), { pressed: active })}
              style={{
                flex: 'none',
                background: active ? 'var(--accent)' : 'var(--surface)',
                color: active ? 'var(--onaccent)' : 'var(--muted2)',
                borderRadius: 18,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: active ? 'var(--glow)' : 'var(--shadow)',
              }}
            >
              {label}
            </span>
          );
        })}
      </div>

      <h2 style={{ fontFamily: BRICO, fontSize: 16, fontWeight: 700, margin: '16px 20px 10px' }}>
        {t('home.providersCount', { count: providers.length })}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
        {providers.map((p) => (
          <div
            key={p.id}
            {...clickable(() => openProvider(p.id))}
            style={{ display: 'flex', gap: 12, background: 'var(--surface)', borderRadius: 20, padding: 12, cursor: 'pointer', boxShadow: 'var(--shadow)' }}
          >
            <AvatarTile init={p.init} size={64} radius={16} fontSize={18} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                {p.verified && (
                  <span
                    style={{
                      display: 'inline-flex',
                      background: 'var(--ver-bg)',
                      color: 'var(--ver-fg)',
                      borderRadius: 10,
                      padding: '2px 7px',
                      fontSize: 10.5,
                      fontWeight: 700,
                    }}
                  >
                    {t('common.verifiedFull')}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{providerMeta(p, locale)}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted2)', marginTop: 3 }}>{p.locLine}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 7 }}>
                <span style={{ fontSize: 13, color: 'var(--muted2)' }}>
                  {t('home.priceFromPrefix')} <b style={{ color: 'var(--text)' }}>{p.priceFromLabel}</b>
                </span>
                <span style={{ background: 'var(--accent)', color: 'var(--onaccent)', borderRadius: 14, padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>
                  {p.nextSlotLabel} <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        <StoreCard />
      </div>
    </div>
  );
}
