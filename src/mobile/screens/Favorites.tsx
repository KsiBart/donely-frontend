import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { ProviderListItem } from '../../api/types';
import { toIntlLocale } from '../../i18n';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { AvatarTile } from '../../components/ui';
import { BRICO } from '../../lib/format';
import { useToast } from '../../state/ToastContext';
import { providerMeta } from '../shared';

export default function Favorites() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isDesktop = useIsDesktop();
  const [favs, setFavs] = useState<ProviderListItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .favorites()
      .then((list) => {
        setFavs(list);
        setLoaded(true);
      })
      .catch((e) => showToast(e instanceof Error ? e.message : t('common.error')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={
        isDesktop
          ? { maxWidth: 900, margin: '0 auto', padding: '28px 28px 48px' }
          : { flex: 1, overflow: 'auto', padding: '20px 20px 18px' }
      }
    >
      <div style={{ fontFamily: BRICO, fontSize: 24, fontWeight: 700, margin: '8px 0 18px' }}>{t('favorites.title')}</div>
      <div style={isDesktop ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } : { display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loaded && favs.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{t('favorites.empty')}</div>
        )}
        {favs.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              gap: 12,
              background: 'var(--surface)',
              borderRadius: 20,
              padding: 12,
              boxShadow: 'var(--shadow)',
              alignItems: 'center',
            }}
          >
            <AvatarTile init={p.init} size={52} radius={14} fontSize={16} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{p.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{providerMeta(p, locale)}</div>
            </div>
            <span
              onClick={() => navigate(`/provider/${p.id}`)}
              style={{
                flex: 'none',
                background: 'var(--accent)',
                color: 'var(--onaccent)',
                borderRadius: 14,
                padding: '7px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t('favorites.bookCta')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
