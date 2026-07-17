import { useTranslation } from 'react-i18next';
import { AvatarTile } from '../../components/ui';
import { useBrand } from '../../brand';
import { SUPPORTED_LANGS, type Lang } from '../../i18n';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { BRICO, initials } from '../../lib/format';
import { useAuth } from '../../state/AuthContext';
import { useInstallAction } from '../AppPromo';

export default function ProfileTab() {
  const { t, i18n } = useTranslation();
  const brand = useBrand();
  const { me, logout } = useAuth();
  const install = useInstallAction();
  const isDesktop = useIsDesktop();

  const lang = (i18n.language as Lang) ?? 'pl';
  const langName = (l: Lang) => (l === 'pl' ? t('profile.langNamePl') : t('profile.langNameEn'));
  const toggleLang = () => {
    const next = SUPPORTED_LANGS[(SUPPORTED_LANGS.indexOf(lang) + 1) % SUPPORTED_LANGS.length];
    void i18n.changeLanguage(next);
  };

  const rows: { label: string; val: string; onClick?: () => void }[] = [
    { label: t('profile.rows.location'), val: me?.locationLabel || t('profile.defaultLocation') },
    { label: t('profile.rows.savedAddresses'), val: String((me?.savedAddresses ?? []).length) },
    { label: t('profile.rows.paymentMethods'), val: t('profile.paymentMethodsVal') },
    { label: isDesktop ? t('profile.rows.notificationsEmail') : t('profile.rows.notifications'), val: t('profile.notificationsOn') },
    { label: t('profile.rows.language'), val: langName(lang), onClick: toggleLang },
  ];

  return (
    <div
      style={
        isDesktop
          ? { maxWidth: 560, margin: '0 auto', padding: '28px 28px 48px' }
          : { flex: 1, overflow: 'auto', padding: '20px 20px 18px' }
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '8px 0 22px' }}>
        <AvatarTile init={initials(me?.name)} size={60} fontSize={20} round />
        <div>
          <div style={{ fontFamily: BRICO, fontSize: 20, fontWeight: 700 }}>{me?.name ?? ''}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{me?.email ?? ''}</div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 20, boxShadow: 'var(--shadow)', overflow: 'hidden', marginBottom: 14 }}>
        {rows.map((r) => (
          <div
            key={r.label}
            onClick={r.onClick}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              cursor: r.onClick ? 'pointer' : 'default',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600 }}>{r.label}</span>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{r.val} ›</span>
          </div>
        ))}
        <div onClick={logout} style={{ padding: '14px 16px', cursor: 'pointer' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#d64550' }}>{t('profile.logout')}</span>
        </div>
      </div>

      {isDesktop && (
        <div style={{ background: '#f1ebf7', borderRadius: 20, padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t('profile.pushPromoTitle')}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted2)', lineHeight: 1.45, marginBottom: 12 }}>{t('profile.pushPromoBody')}</div>
          <div
            onClick={install}
            style={{ textAlign: 'center', background: 'var(--accent)', color: 'var(--onaccent)', borderRadius: 14, padding: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            {t('promo.installAppCta')}
          </div>
        </div>
      )}

      <div style={{ background: 'var(--surface2)', borderRadius: 20, padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t('profile.providerCardTitle')}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 12 }}>
          {t('profile.providerCardBody', { appName: brand.appName })}
        </div>
        <div
          onClick={install}
          style={{
            textAlign: 'center',
            background: 'var(--accent)',
            color: 'var(--onaccent)',
            borderRadius: 14,
            padding: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {t('profile.providerCardCta')}
        </div>
      </div>
    </div>
  );
}
