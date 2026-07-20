import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useFavoritesQuery } from '../../api/hooks';
import { toIntlLocale } from '../../i18n';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { AvatarTile } from '../../components/ui';
import { BRICO } from '../../lib/format';
import { useToast } from '../../state/ToastContext';
import { providerMeta } from '../shared';
import { clickable } from '../../lib/a11y';

export default function Favorites() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isDesktop = useIsDesktop();
  const { data, isSuccess, error } = useFavoritesQuery();
  const favs = data ?? [];
  const loaded = isSuccess;

  useEffect(() => {
    if (error) showToast(error instanceof Error ? error.message : t('common.error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <div className={clsx(isDesktop ? 'max-w-225 mx-auto pt-7 px-7 pb-12' : 'flex-1 overflow-auto pt-5 px-5 pb-4.5')}>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h1 style={{ fontFamily: BRICO }} className="text-2xl font-bold mx-0 mt-2 mb-4.5">
        {t('favorites.title')}
      </h1>
      <div className={clsx(isDesktop ? 'grid grid-cols-2 gap-3.5' : 'flex flex-col gap-2.5')}>
        {loaded && favs.length === 0 && <div className="text-[13px] text-muted">{t('favorites.empty')}</div>}
        {favs.map((p) => (
          <div key={p.id} className="flex gap-3 items-center bg-surface rounded-[20px] p-3 shadow-[var(--shadow)]">
            <AvatarTile init={p.init} size={52} radius={14} fontSize={16} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[14.5px]">{p.name}</div>
              <div className="text-[12.5px] text-muted">{providerMeta(p, locale)}</div>
            </div>
            <span
              {...clickable(() => navigate(`/provider/${p.id}`))}
              className="flex-none bg-accent text-onaccent rounded-[14px] py-1.75 px-3 text-xs font-bold cursor-pointer"
            >
              {t('favorites.bookCta')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
