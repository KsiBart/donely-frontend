import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { useInstallAction } from '../AppPromo';
import { Logo } from '../../components/ui';
import { BRICO } from '../../lib/format';
import { clickable } from '../../lib/a11y';

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
      className={clsx(
        'flex flex-col items-center text-center animate-[dwfade_.4s_ease]',
        isDesktop ? 'max-w-[460px] mx-auto pt-[70px] px-7 pb-12' : 'flex-1 justify-center px-9',
      )}
    >
      <div aria-hidden="true" className="w-[84px] h-[84px] rounded-full bg-ver-bg text-ver-fg flex items-center justify-center text-[38px] font-bold mb-[22px]">
        ✓
      </div>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h1 style={{ fontFamily: BRICO }} className="text-2xl font-bold mt-0 mb-2">
        {title}
      </h1>
      <div className={clsx('text-sm text-muted leading-[1.55]', state.isQuote ? 'mb-7' : 'mb-2.5')}>{sub}</div>
      {!state.isQuote && (
        <div className="inline-flex items-center gap-[7px] bg-surface2 text-accent rounded-[13px] py-[7px] px-[13px] text-[12.5px] font-bold mb-[22px]">
          <span aria-hidden="true">🔒</span> {t('success.frozenNote')}
        </div>
      )}
      {isDesktop && (
        <div className="flex gap-[9px] items-center text-left bg-[var(--app-tint)] rounded-2xl py-[11px] px-3.5 mb-6">
          <Logo size={24} />
          <span className="text-[11.5px] text-muted2 leading-[1.4]">
            <Trans i18nKey="success.desktopPromoText">
              Status śledzisz tu na donely.app — a z aplikacją dostaniesz też <b>push</b> o zmianach.
            </Trans>{' '}
            <span {...clickable(install)} className="text-accent font-bold cursor-pointer">
              {t('promo.download')}
            </span>
          </span>
        </div>
      )}
      <div
        {...clickable(() => navigate('/bookings'))}
        className="w-full text-center bg-accent text-onaccent rounded-[18px] p-3.5 text-[15px] font-bold cursor-pointer shadow-[var(--glow)]"
      >
        {t('success.viewBookings')}
      </div>
      <div {...clickable(() => navigate('/'))} className="mt-3 text-[13.5px] font-bold text-accent cursor-pointer">
        {t('success.backToSearch')}
      </div>
    </div>
  );
}
