import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAddFavoriteMutation, useFavoritesQuery, useProviderQuery, useRemoveFavoriteMutation } from '../../api/hooks';
import type { Service } from '../../api/models';
import { toIntlLocale } from '../../i18n';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { stripes } from '../../components/ui';
import { BRICO, bizLong, formatKm, formatRating } from '../../lib/format';
import { useBrand } from '../../brand';
import { useToast } from '../../state/ToastContext';
import { clickable } from '../../lib/a11y';

// Photo-caption badge on both the desktop "before" hero photo and the mobile photo strip.
const photoCaptionCls = "font-semibold text-[10px] font-[ui-monospace,monospace] bg-[rgba(0,0,0,.5)] text-white rounded-lg py-[3px] px-2";
// Top-of-photo round icon buttons (back / favorite) — desktop and mobile share the shape,
// differing only in left/right placement and (favorite) color/size.
const roundBtnBase = 'absolute top-[26px] w-[34px] h-[34px] rounded-full bg-surface flex items-center justify-center font-bold cursor-pointer shadow-[var(--shadow)]';
// tagsRow pills (business type / travel radius / spot address / work hours) — identical shape on
// desktop and mobile.
const tagVerCls = 'bg-ver-bg text-ver-fg rounded-xl py-1.5 px-[11px] text-xs font-bold';
const tagNeutralCls = 'bg-surface2 rounded-xl py-1.5 px-[11px] text-xs font-semibold text-muted2';
// Service-location tag ("u Ciebie" / "w salonie") under each service row.
const svcTagCls = (atClient: boolean) => clsx('inline-block text-[10.5px] font-bold mt-[5px] rounded-[9px] py-[3px] px-2', atClient ? 'bg-ver-bg text-ver-fg' : 'bg-surface2 text-accent');
// Review card header (name + star rating).
const reviewNameCls = 'font-bold text-[13.5px]';
const reviewStarsCls = 'text-warn text-xs tracking-[1px]';

export default function ProviderProfile() {
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

  if (!pv) {
    return <div className="flex-1" />;
  }

  if (isDesktop) {
    const tagsRow = (
      <div className="flex gap-2 mt-3 flex-wrap">
        <span className={tagVerCls}>{bizLong(pv.businessType, t, brand.appName)}</span>
        <span className={tagNeutralCls}>{t('providerProfile.travelRadius', { km: pv.travelRadiusKm ?? 10 })}</span>
        {pv.spotAddress && (
          <span className={tagNeutralCls}>
            <span aria-hidden="true">📍</span> {pv.spotAddress}
          </span>
        )}
        <span className={tagNeutralCls}>{t('providerProfile.workHours')}</span>
      </div>
    );

    return (
      <div className="max-w-[1120px] mx-auto pt-[22px] px-7 pb-12 animate-[dwfade_.3s_ease]">
        <span {...clickable(() => navigate(-1))} className="inline-flex items-center gap-[7px] text-[13px] font-bold text-accent cursor-pointer">
          <span aria-hidden="true">‹</span> {t('providerProfile.backToResults')}
        </span>
        <div className="grid grid-cols-[1fr_380px] gap-[26px] items-start mt-4">
          <div>
            <div className="h-[230px] flex gap-2">
              <div
                className="flex-[2] rounded-[18px] flex items-end p-3"
                style={{ background: stripes(45, 8) }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
              >
                <span className={photoCaptionCls}>{t('providerProfile.photoBefore')}</span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div
                  className="flex-1 rounded-[18px]"
                  style={{ background: stripes(-45, 8) }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
                />
                <div
                  className="flex-1 rounded-[18px] flex items-center justify-center"
                  style={{ background: stripes(45, 8) }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
                >
                  <span className="text-[13px] font-bold text-white">{t('providerProfile.morePhotosCount')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 mt-[18px]">
              {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
              <h1 style={{ fontFamily: BRICO }} className="text-[26px] font-bold m-0">
                {pv.name}
              </h1>
              {pv.verified && <span className="bg-ver-bg text-ver-fg rounded-[10px] py-[3px] px-[9px] text-[11px] font-bold">{t('common.verifiedFull')}</span>}
              <span
                {...clickable(() => void toggleFav(), { pressed: fav, label: t('a11y.favorite', 'Ulubione') })}
                className="w-[30px] h-[30px] rounded-full bg-surface shadow-[var(--shadow)] flex items-center justify-center text-accent text-[15px] cursor-pointer"
              >
                {fav ? '♥' : '♡'}
              </span>
            </div>
            <div className="text-[13.5px] text-muted mt-1">
              {pv.categoryName} · {formatKm(pv.distanceKm, locale)} · <span aria-hidden="true">★</span> {formatRating(pv.rating, locale)} ({pv.reviewCount}) ·{' '}
              {t('providerProfile.respondsIn', { minutes: pv.responseMinutes ?? 15 })}
            </div>
            <div className="text-sm text-muted2 leading-[1.55] mt-3 max-w-[620px]">{pv.bio}</div>
            {tagsRow}

            {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
            <h2 style={{ fontFamily: BRICO }} className="text-lg font-bold mx-0 mt-[26px] mb-2.5">
              {t('providerProfile.reviewsTitle')}{' '}
              <span className="text-[13px] text-muted font-semibold">
                <span aria-hidden="true">★</span> {formatRating(pv.rating, locale)} ({pv.reviewCount})
              </span>
            </h2>
            <div className="flex flex-col gap-2.5">
              {pv.reviews.map((r) => (
                <div key={r.id} className="bg-surface rounded-[18px] py-3.5 px-4 shadow-[var(--shadow)]">
                  <div className="flex justify-between items-baseline">
                    <span className={reviewNameCls}>{r.customerName ?? r.authorName ?? r.name ?? t('providerProfile.defaultCustomerName')}</span>
                    <span aria-hidden="true" className={reviewStarsCls}>
                      {'★★★★★'.slice(0, Math.max(1, Math.min(5, r.rating)))}
                    </span>
                  </div>
                  <div className="text-[13.5px] text-muted2 leading-[1.5] mt-[5px]">{r.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky top-5 bg-surface rounded-[22px] p-[18px] shadow-[var(--shadow)]">
            {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
            <h2 style={{ fontFamily: BRICO }} className="text-[17px] font-bold m-0 mb-3">
              {t('providerProfile.servicesTitle')}
            </h2>
            <div className="flex flex-col gap-[9px]">
              {pv.services.map((s) => {
                const instant = s.priceType !== 'QUOTE';
                const atClient = s.location === 'CLIENT';
                return (
                  <div key={s.id} className="flex items-center gap-2.5 bg-bg rounded-2xl py-3 px-[13px]">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[13.5px]">{s.title}</div>
                      <div className="text-xs text-muted mt-0.5">
                        {s.durationLabel} · {s.priceLabel}
                      </div>
                      <div className={svcTagCls(atClient)}>{atClient ? t('providerProfile.atClientTag') : t('providerProfile.atSpotTag', { address: pv.spotAddress ?? '' })}</div>
                    </div>
                    <span
                      {...clickable(() => book(s))}
                      className={clsx(
                        'flex-none rounded-[13px] py-[7px] px-3 text-[11.5px] font-bold cursor-pointer',
                        instant ? 'bg-accent text-onaccent border-none' : 'bg-transparent text-accent border-[1.5px] border-accent',
                      )}
                    >
                      {instant ? t('providerProfile.bookInstant') : t('providerProfile.bookQuote')}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-[11.5px] text-muted leading-[1.5] mt-3">{t('providerProfile.paymentNoteDesktop')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative">
      <div className="relative h-[200px] flex gap-1.5 pt-5 px-1.5 pb-1.5 bg-[var(--map)]">
        <div
          className="flex-[2] rounded-2xl flex items-end p-2.5"
          style={{ background: stripes(45, 8) }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
        >
          <span className={photoCaptionCls}>{t('providerProfile.photoBefore')}</span>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <div
            className="flex-1 rounded-2xl"
            style={{ background: stripes(-45, 8) }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
          />
          <div
            className="flex-1 rounded-2xl flex items-center justify-center"
            style={{ background: stripes(45, 8) }} // eslint-disable-line react/no-inline-styles -- dynamic: computed stripe pattern from stripes()
          >
            <span className="text-xs font-bold text-white">{t('providerProfile.morePhotosCount')}</span>
          </div>
        </div>
        <span {...clickable(() => navigate(-1), { label: t('a11y.back', 'Wstecz') })} className={clsx(roundBtnBase, 'left-3.5 text-base')}>
          ‹
        </span>
        <span {...clickable(() => void toggleFav(), { pressed: fav, label: t('a11y.favorite', 'Ulubione') })} className={clsx(roundBtnBase, 'right-3.5 text-accent text-[17px]')}>
          {fav ? '♥' : '♡'}
        </span>
      </div>

      <div className="pt-4 px-5 pb-10">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
          <h1 style={{ fontFamily: BRICO }} className="text-[22px] font-bold m-0">
            {pv.name}
          </h1>
          {pv.verified && <span className="bg-ver-bg text-ver-fg rounded-[10px] py-0.5 px-2 text-[10.5px] font-bold">{t('common.verifiedFull')}</span>}
        </div>
        <div className="text-[13px] text-muted mt-1">
          {pv.categoryName} · {formatKm(pv.distanceKm, locale)} · <span aria-hidden="true">★</span> {formatRating(pv.rating, locale)} ({pv.reviewCount}) ·{' '}
          {t('providerProfile.respondsIn', { minutes: pv.responseMinutes ?? 15 })}
        </div>
        <div className="text-[13.5px] text-muted2 leading-[1.5] mt-2.5">{pv.bio}</div>

        <div className="flex gap-2 mt-3 flex-wrap">
          <span className={tagVerCls}>{bizLong(pv.businessType, t, brand.appName)}</span>
          <span className={tagNeutralCls}>{t('providerProfile.travelRadius', { km: pv.travelRadiusKm ?? 10 })}</span>
          {pv.spotAddress && (
            <span className={tagNeutralCls}>
              <span aria-hidden="true">📍</span> {pv.spotAddress}
            </span>
          )}
          <span className={tagNeutralCls}>{t('providerProfile.workHours')}</span>
        </div>

        {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
        <h2 style={{ fontFamily: BRICO }} className="text-[17px] font-bold mx-0 mt-[22px] mb-2.5">
          {t('providerProfile.servicesTitle')}
        </h2>
        <div className="flex flex-col gap-[9px]">
          {pv.services.map((s) => {
            const instant = s.priceType !== 'QUOTE';
            const atClient = s.location === 'CLIENT';
            return (
              <div key={s.id} className="flex items-center gap-2.5 bg-surface rounded-[18px] py-[13px] px-3.5 shadow-[var(--shadow)]">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{s.title}</div>
                  <div className="text-[12.5px] text-muted mt-0.5">
                    {s.durationLabel} · {s.priceLabel}
                  </div>
                  <div className={svcTagCls(atClient)}>{atClient ? t('providerProfile.atClientTag') : t('providerProfile.atSpotTag', { address: pv.spotAddress ?? '' })}</div>
                </div>
                <span
                  {...clickable(() => book(s))}
                  className={clsx(
                    'flex-none rounded-[14px] py-[7px] px-[13px] text-xs font-bold cursor-pointer',
                    instant ? 'bg-accent text-onaccent border-none' : 'bg-transparent text-accent border-[1.5px] border-accent',
                  )}
                >
                  {instant ? t('providerProfile.bookInstant') : t('providerProfile.bookQuote')}
                </span>
              </div>
            );
          })}
        </div>

        {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
        <h2 style={{ fontFamily: BRICO }} className="text-[17px] font-bold mx-0 mt-[22px] mb-2.5">
          {t('providerProfile.reviewsTitle')}{' '}
          <span className="text-[13px] text-muted font-semibold">
            <span aria-hidden="true">★</span> {formatRating(pv.rating, locale)} ({pv.reviewCount})
          </span>
        </h2>
        <div className="flex flex-col gap-[9px]">
          {pv.reviews.map((r) => (
            <div key={r.id} className="bg-surface rounded-[18px] py-[13px] px-3.5 shadow-[var(--shadow)]">
              <div className="flex justify-between items-baseline">
                <span className={reviewNameCls}>{r.customerName ?? r.authorName ?? r.name ?? t('providerProfile.defaultCustomerName')}</span>
                <span aria-hidden="true" className={reviewStarsCls}>
                  {'★★★★★'.slice(0, Math.max(1, Math.min(5, r.rating)))}
                </span>
              </div>
              <div className="text-[13px] text-muted2 leading-[1.5] mt-[5px]">{r.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
