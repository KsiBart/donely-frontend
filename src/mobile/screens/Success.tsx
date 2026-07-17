import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { useInstallAction } from '../AppPromo';
import { Logo } from '../../components/ui';
import { BRICO } from '../../lib/format';

interface SuccessState {
  isQuote: boolean;
  atSpot: boolean;
  providerName: string;
  spotAddr: string;
  address: string;
  slotLabel: string;
}

export default function Success() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const install = useInstallAction();
  const state = location.state as SuccessState | null;

  if (!state) return <Navigate to="/" replace />;

  const title = state.isQuote ? t('success.quoteTitle') : t('success.instantTitle');
  const sub = state.isQuote
    ? t('success.quoteSub', { providerName: state.providerName })
    : state.atSpot
      ? t('success.atSpotSub', { providerName: state.providerName, when: state.slotLabel.toLowerCase(), address: state.spotAddr })
      : t('success.atClientSub', { providerName: state.providerName, when: state.slotLabel.toLowerCase(), address: state.address });

  return (
    <div
      style={
        isDesktop
          ? {
              maxWidth: 460,
              margin: '0 auto',
              padding: '70px 28px 48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              animation: 'dwfade .4s ease',
            }
          : {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 36px',
              textAlign: 'center',
              animation: 'dwfade .4s ease',
            }
      }
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: '50%',
          background: 'var(--ver-bg)',
          color: 'var(--ver-fg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 38,
          fontWeight: 700,
          marginBottom: 22,
        }}
      >
        ✓
      </div>
      <div style={{ fontFamily: BRICO, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.55, marginBottom: state.isQuote ? 28 : 10 }}>{sub}</div>
      {!state.isQuote && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: 'var(--surface2)',
            color: 'var(--accent)',
            borderRadius: 13,
            padding: '7px 13px',
            fontSize: 12.5,
            fontWeight: 700,
            marginBottom: 22,
          }}
        >
          🔒 {t('success.frozenNote')}
        </div>
      )}
      {isDesktop && (
        <div
          style={{
            display: 'flex',
            gap: 9,
            background: '#f1ebf7',
            borderRadius: 16,
            padding: '11px 14px',
            marginBottom: 24,
            alignItems: 'center',
            textAlign: 'left',
          }}
        >
          <Logo size={24} />
          <span style={{ fontSize: 11.5, color: '#544963', lineHeight: 1.4 }}>
            <Trans i18nKey="success.desktopPromoText">
              Status śledzisz tu na donely.app — a z aplikacją dostaniesz też <b>push</b> o zmianach.
            </Trans>{' '}
            <span onClick={install} style={{ color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }}>
              {t('promo.download')}
            </span>
          </span>
        </div>
      )}
      <div
        onClick={() => navigate('/bookings')}
        style={{
          width: '100%',
          textAlign: 'center',
          background: 'var(--accent)',
          color: 'var(--onaccent)',
          borderRadius: 18,
          padding: 14,
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: 'var(--glow)',
        }}
      >
        {t('success.viewBookings')}
      </div>
      <div
        onClick={() => navigate('/')}
        style={{ marginTop: 12, fontSize: 13.5, fontWeight: 700, color: 'var(--accent)', cursor: 'pointer' }}
      >
        {t('success.backToSearch')}
      </div>
    </div>
  );
}
