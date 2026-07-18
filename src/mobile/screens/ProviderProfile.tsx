import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { ProviderDetail, Service } from '../../api/types';
import { toIntlLocale } from '../../i18n';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { stripes } from '../../components/ui';
import { BRICO, bizLong, formatKm, formatRating } from '../../lib/format';
import { useBrand } from '../../brand';
import { useToast } from '../../state/ToastContext';
import { clickable } from '../../lib/a11y';

export default function ProviderProfile() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const brand = useBrand();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isDesktop = useIsDesktop();
  const [pv, setPv] = useState<ProviderDetail | null>(null);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .provider(id)
      .then(setPv)
      .catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    api
      .favorites()
      .then((list) => setFav(list.some((p) => String(p.id) === id)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleFav = async () => {
    if (!pv) return;
    try {
      if (fav) {
        await api.removeFavorite(pv.id);
        setFav(false);
        showToast(t('providerProfile.removedFavToast'));
      } else {
        await api.addFavorite(pv.id);
        setFav(true);
        showToast(t('providerProfile.addedFavToast'));
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const book = (s: Service) => {
    if (!pv) return;
    navigate(`/book/${pv.id}/${s.id}`, { state: { provider: pv, service: s } });
  };

  if (!pv) {
    return <div style={{ flex: 1 }} />;
  }

  if (isDesktop) {
    const tagsRow = (
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <span style={{ background: 'var(--ver-bg)', color: 'var(--ver-fg)', borderRadius: 12, padding: '6px 11px', fontSize: 12, fontWeight: 700 }}>
          {bizLong(pv.businessType, t, brand.appName)}
        </span>
        <span style={{ background: 'var(--surface2)', borderRadius: 12, padding: '6px 11px', fontSize: 12, fontWeight: 600, color: 'var(--muted2)' }}>
          {t('providerProfile.travelRadius', { km: pv.travelRadiusKm ?? 10 })}
        </span>
        {pv.spotAddress && (
          <span style={{ background: 'var(--surface2)', borderRadius: 12, padding: '6px 11px', fontSize: 12, fontWeight: 600, color: 'var(--muted2)' }}>
            <span aria-hidden="true">📍</span> {pv.spotAddress}
          </span>
        )}
        <span style={{ background: 'var(--surface2)', borderRadius: 12, padding: '6px 11px', fontSize: 12, fontWeight: 600, color: 'var(--muted2)' }}>
          {t('providerProfile.workHours')}
        </span>
      </div>
    );

    return (
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '22px 28px 48px', animation: 'dwfade .3s ease' }}>
        <span
          {...clickable(() => navigate(-1))}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: 'var(--accent)', cursor: 'pointer' }}
        >
          <span aria-hidden="true">‹</span> {t('providerProfile.backToResults')}
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 26, alignItems: 'start', marginTop: 16 }}>
          <div>
            <div style={{ height: 230, display: 'flex', gap: 8 }}>
              <div style={{ flex: 2, borderRadius: 18, background: stripes(45, 8), display: 'flex', alignItems: 'flex-end', padding: 12 }}>
                <span style={{ font: "600 10px ui-monospace, monospace", background: 'rgba(0,0,0,.5)', color: '#fff', borderRadius: 8, padding: '3px 8px' }}>
                  {t('providerProfile.photoBefore')}
                </span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ flex: 1, borderRadius: 18, background: stripes(-45, 8) }} />
                <div style={{ flex: 1, borderRadius: 18, background: stripes(45, 8), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{t('providerProfile.morePhotosCount')}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
              <h1 style={{ fontFamily: BRICO, fontSize: 26, fontWeight: 700, margin: 0 }}>{pv.name}</h1>
              {pv.verified && (
                <span style={{ background: 'var(--ver-bg)', color: 'var(--ver-fg)', borderRadius: 10, padding: '3px 9px', fontSize: 11, fontWeight: 700 }}>
                  {t('common.verifiedFull')}
                </span>
              )}
              <span
                {...clickable(() => void toggleFav(), { pressed: fav, label: t('a11y.favorite', 'Ulubione') })}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'var(--surface)',
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                {fav ? '♥' : '♡'}
              </span>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 4 }}>
              {pv.categoryName} · {formatKm(pv.distanceKm, locale)} · <span aria-hidden="true">★</span> {formatRating(pv.rating, locale)} ({pv.reviewCount}) ·{' '}
              {t('providerProfile.respondsIn', { minutes: pv.responseMinutes ?? 15 })}
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted2)', lineHeight: 1.55, marginTop: 12, maxWidth: 620 }}>{pv.bio}</div>
            {tagsRow}

            <h2 style={{ fontFamily: BRICO, fontSize: 18, fontWeight: 700, margin: '26px 0 10px' }}>
              {t('providerProfile.reviewsTitle')}{' '}
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
                <span aria-hidden="true">★</span> {formatRating(pv.rating, locale)} ({pv.reviewCount})
              </span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pv.reviews.map((r) => (
                <div key={r.id} style={{ background: 'var(--surface)', borderRadius: 18, padding: '14px 16px', boxShadow: 'var(--shadow)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.customerName ?? r.authorName ?? r.name ?? t('providerProfile.defaultCustomerName')}</span>
                    <span aria-hidden="true" style={{ color: '#e8a13c', fontSize: 12, letterSpacing: 1 }}>
                      {'★★★★★'.slice(0, Math.max(1, Math.min(5, r.rating)))}
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--muted2)', lineHeight: 1.5, marginTop: 5 }}>{r.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'sticky', top: 20, background: 'var(--surface)', borderRadius: 22, padding: 18, boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontFamily: BRICO, fontSize: 17, fontWeight: 700, margin: 0, marginBottom: 12 }}>{t('providerProfile.servicesTitle')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {pv.services.map((s) => {
                const instant = s.priceType !== 'QUOTE';
                const atClient = s.location === 'CLIENT';
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)', borderRadius: 16, padding: '12px 13px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                        {s.durationLabel} · {s.priceLabel}
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          fontSize: 10.5,
                          fontWeight: 700,
                          marginTop: 5,
                          borderRadius: 9,
                          padding: '3px 8px',
                          background: atClient ? 'var(--ver-bg)' : 'var(--surface2)',
                          color: atClient ? 'var(--ver-fg)' : 'var(--accent)',
                        }}
                      >
                        {atClient ? t('providerProfile.atClientTag') : t('providerProfile.atSpotTag', { address: pv.spotAddress ?? '' })}
                      </div>
                    </div>
                    <span
                      {...clickable(() => book(s))}
                      style={{
                        flex: 'none',
                        background: instant ? 'var(--accent)' : 'transparent',
                        color: instant ? 'var(--onaccent)' : 'var(--accent)',
                        border: instant ? 'none' : '1.5px solid var(--accent)',
                        borderRadius: 13,
                        padding: '7px 12px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {instant ? t('providerProfile.bookInstant') : t('providerProfile.bookQuote')}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 12 }}>{t('providerProfile.paymentNoteDesktop')}</div>
          </div>
        </div>
      </div>
    );
  }

  const roundBtn: CSSProperties = {
    position: 'absolute',
    top: 26,
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'var(--surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: 'var(--shadow)',
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
      <div style={{ position: 'relative', height: 200, display: 'flex', gap: 6, padding: '20px 6px 6px', background: 'var(--map)' }}>
        <div style={{ flex: 2, borderRadius: 16, background: stripes(45, 8), display: 'flex', alignItems: 'flex-end', padding: 10 }}>
          <span style={{ font: '600 10px ui-monospace, monospace', background: 'rgba(0,0,0,.5)', color: '#fff', borderRadius: 8, padding: '3px 8px' }}>
            {t('providerProfile.photoBefore')}
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ flex: 1, borderRadius: 16, background: stripes(-45, 8) }} />
          <div style={{ flex: 1, borderRadius: 16, background: stripes(45, 8), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{t('providerProfile.morePhotosCount')}</span>
          </div>
        </div>
        <span {...clickable(() => navigate(-1), { label: t('a11y.back', 'Wstecz') })} style={{ ...roundBtn, left: 14 }}>
          ‹
        </span>
        <span
          {...clickable(() => void toggleFav(), { pressed: fav, label: t('a11y.favorite', 'Ulubione') })}
          style={{ ...roundBtn, right: 14, color: 'var(--accent)', fontSize: 17 }}
        >
          {fav ? '♥' : '♡'}
        </span>
      </div>

      <div style={{ padding: '16px 20px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{ fontFamily: BRICO, fontSize: 22, fontWeight: 700, margin: 0 }}>{pv.name}</h1>
          {pv.verified && (
            <span style={{ background: 'var(--ver-bg)', color: 'var(--ver-fg)', borderRadius: 10, padding: '2px 8px', fontSize: 10.5, fontWeight: 700 }}>
              {t('common.verifiedFull')}
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
          {pv.categoryName} · {formatKm(pv.distanceKm, locale)} · <span aria-hidden="true">★</span> {formatRating(pv.rating, locale)} ({pv.reviewCount}) ·{' '}
          {t('providerProfile.respondsIn', { minutes: pv.responseMinutes ?? 15 })}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--muted2)', lineHeight: 1.5, marginTop: 10 }}>{pv.bio}</div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <span style={{ background: 'var(--ver-bg)', color: 'var(--ver-fg)', borderRadius: 12, padding: '6px 11px', fontSize: 12, fontWeight: 700 }}>
            {bizLong(pv.businessType, t, brand.appName)}
          </span>
          <span style={{ background: 'var(--surface2)', borderRadius: 12, padding: '6px 11px', fontSize: 12, fontWeight: 600, color: 'var(--muted2)' }}>
            {t('providerProfile.travelRadius', { km: pv.travelRadiusKm ?? 10 })}
          </span>
          {pv.spotAddress && (
            <span style={{ background: 'var(--surface2)', borderRadius: 12, padding: '6px 11px', fontSize: 12, fontWeight: 600, color: 'var(--muted2)' }}>
              <span aria-hidden="true">📍</span> {pv.spotAddress}
            </span>
          )}
          <span style={{ background: 'var(--surface2)', borderRadius: 12, padding: '6px 11px', fontSize: 12, fontWeight: 600, color: 'var(--muted2)' }}>
            {t('providerProfile.workHours')}
          </span>
        </div>

        <h2 style={{ fontFamily: BRICO, fontSize: 17, fontWeight: 700, margin: '22px 0 10px' }}>{t('providerProfile.servicesTitle')}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {pv.services.map((s) => {
            const instant = s.priceType !== 'QUOTE';
            const atClient = s.location === 'CLIENT';
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderRadius: 18, padding: '13px 14px', boxShadow: 'var(--shadow)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
                    {s.durationLabel} · {s.priceLabel}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      fontSize: 10.5,
                      fontWeight: 700,
                      marginTop: 5,
                      borderRadius: 9,
                      padding: '3px 8px',
                      background: atClient ? 'var(--ver-bg)' : 'var(--surface2)',
                      color: atClient ? 'var(--ver-fg)' : 'var(--accent)',
                    }}
                  >
                    {atClient ? t('providerProfile.atClientTag') : t('providerProfile.atSpotTag', { address: pv.spotAddress ?? '' })}
                  </div>
                </div>
                <span
                  {...clickable(() => book(s))}
                  style={{
                    flex: 'none',
                    background: instant ? 'var(--accent)' : 'transparent',
                    color: instant ? 'var(--onaccent)' : 'var(--accent)',
                    border: instant ? 'none' : '1.5px solid var(--accent)',
                    borderRadius: 14,
                    padding: '7px 13px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {instant ? t('providerProfile.bookInstant') : t('providerProfile.bookQuote')}
                </span>
              </div>
            );
          })}
        </div>

        <h2 style={{ fontFamily: BRICO, fontSize: 17, fontWeight: 700, margin: '22px 0 10px' }}>
          {t('providerProfile.reviewsTitle')}{' '}
          <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
            <span aria-hidden="true">★</span> {formatRating(pv.rating, locale)} ({pv.reviewCount})
          </span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {pv.reviews.map((r) => (
            <div key={r.id} style={{ background: 'var(--surface)', borderRadius: 18, padding: '13px 14px', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.customerName ?? r.authorName ?? r.name ?? t('providerProfile.defaultCustomerName')}</span>
                <span aria-hidden="true" style={{ color: '#e8a13c', fontSize: 12, letterSpacing: 1 }}>
                  {'★★★★★'.slice(0, Math.max(1, Math.min(5, r.rating)))}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.5, marginTop: 5 }}>{r.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
