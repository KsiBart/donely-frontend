import type { TFunction } from 'i18next';
import clsx from 'clsx';
import type { Service } from '../../../api/models';
import { BRICO } from '../../../lib/format';
import { clickable } from '../../../lib/a11y';
import { svcTagCls } from './constants';

interface DesktopServicesPanelProps {
  t: TFunction;
  services: Service[];
  spotAddress?: string | null;
  onBook: (s: Service) => void;
}

/** Desktop ProviderProfile: sticky sidebar with the services list + booking CTAs + payment note. */
export default function DesktopServicesPanel({ t, services, spotAddress, onBook }: DesktopServicesPanelProps) {
  return (
    <div className="sticky top-5 bg-surface rounded-[22px] p-4.5 shadow-[var(--shadow)]">
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h2 style={{ fontFamily: BRICO }} className="text-[17px] font-bold m-0 mb-3">
        {t('providerProfile.servicesTitle')}
      </h2>
      <div className="flex flex-col gap-2.25">
        {services.map((s) => {
          const instant = s.priceType !== 'QUOTE';
          const atClient = s.location === 'CLIENT';
          return (
            <div key={s.id} className="flex items-center gap-2.5 bg-bg rounded-2xl py-3 px-3.25">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[13.5px]">{s.title}</div>
                <div className="text-xs text-muted mt-0.5">
                  {s.durationLabel} · {s.priceLabel}
                </div>
                <div className={svcTagCls(atClient)}>{atClient ? t('providerProfile.atClientTag') : t('providerProfile.atSpotTag', { address: spotAddress ?? '' })}</div>
              </div>
              <span
                {...clickable(() => onBook(s))}
                className={clsx(
                  'flex-none rounded-[13px] py-1.75 px-3 text-[11.5px] font-bold cursor-pointer',
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
  );
}
