import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import type { AiSearchResponse } from '../../api/types';
import { useBrand } from '../../brand';
import { toIntlLocale } from '../../i18n';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { AvatarTile, Logo } from '../../components/ui';
import { useToast } from '../../state/ToastContext';
import { providerMeta } from '../shared';
import { clickable } from '../../lib/a11y';

export default function AiResults() {
  const { t, i18n } = useTranslation();
  const locale = toIntlLocale(i18n.language);
  const brand = useBrand();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isDesktop = useIsDesktop();
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const [res, setRes] = useState<AiSearchResponse | null>(null);

  useEffect(() => {
    if (!q) return;
    setRes(null);
    api
      .aiSearch(q)
      .then(setRes)
      .catch((e) => showToast(e instanceof Error ? e.message : t('aiResults.searchError')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div
      style={
        isDesktop
          ? { maxWidth: 720, margin: '0 auto', padding: '28px 28px 48px', animation: 'dwfade .3s ease' }
          : { flex: 1, overflow: 'auto', padding: '20px 20px 20px', animation: 'dwfade .3s ease' }
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span
          {...clickable(() => navigate('/'), { label: t('a11y.back', 'Wstecz') })}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'var(--surface2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ‹
        </span>
        <h1 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{t('aiResults.title', { appName: brand.appName })}</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <span
          style={{
            maxWidth: '78%',
            background: 'var(--accent)',
            color: 'var(--onaccent)',
            borderRadius: '18px 18px 4px 18px',
            padding: '11px 14px',
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          {q}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 9, marginBottom: 16 }}>
        <span style={{ animation: res ? undefined : 'ptpulse 1.6s infinite' }}>
          <Logo size={30} />
        </span>
        <span
          style={{
            maxWidth: '82%',
            background: 'var(--surface)',
            borderRadius: '4px 18px 18px 18px',
            padding: '11px 14px',
            fontSize: 13.5,
            color: 'var(--muted2)',
            lineHeight: 1.5,
            boxShadow: 'var(--shadow)',
          }}
        >
          {res ? res.response : '…'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(res?.matches ?? []).map((p) => (
          <div
            key={p.id}
            {...clickable(() => navigate(`/provider/${p.id}`))}
            style={{ background: 'var(--surface)', borderRadius: 20, padding: 12, cursor: 'pointer', boxShadow: 'var(--shadow)' }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <AvatarTile init={p.init} size={56} radius={14} fontSize={16} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>{p.name}</span>
                  {p.verified && (
                    <span aria-hidden="true" style={{ background: 'var(--ver-bg)', color: 'var(--ver-fg)', borderRadius: 10, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>
                      {t('common.verifiedShort')}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{providerMeta(p, locale)}</div>
                <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 2 }}>{p.locLine}</div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent)', background: 'var(--surface2)', borderRadius: 10, padding: '4px 9px' }}>
                <span aria-hidden="true">✦</span> {p.why}
              </span>
              <span style={{ background: 'var(--accent)', color: 'var(--onaccent)', borderRadius: 14, padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>
                {p.nextSlotLabel} <span aria-hidden="true">→</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
