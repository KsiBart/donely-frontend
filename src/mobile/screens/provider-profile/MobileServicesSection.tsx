import type { TFunction } from 'i18next';
import clsx from 'clsx';
import type { Service } from '../../../api/models';
import { BRICO } from '../../../lib/format';
import { clickable } from '../../../lib/a11y';
import { svcTagCls } from './constants';

interface MobileServicesSectionProps {
  t: TFunction;
  services: Service[];
  spotAddress?: string | null;
  onBook: (s: Service) => void;
}

/** Mobile ProviderProfile: services title + list, inline in the page flow. */
export default function MobileServicesSection({ t, services, spotAddress, onBook }: MobileServicesSectionProps) {
  return (
    <>
      {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
      <h2 style={{ fontFamily: BRICO }} className="text-[17px] font-bold mx-0 mt-[22px] mb-2.5">
        {t('providerProfile.servicesTitle')}
      </h2>
      <div className="flex flex-col gap-[9px]">
        {services.map((s) => {
          const instant = s.priceType !== 'QUOTE';
          const atClient = s.location === 'CLIENT';
          return (
            <div key={s.id} className="flex items-center gap-2.5 bg-surface rounded-[18px] py-[13px] px-3.5 shadow-[var(--shadow)]">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{s.title}</div>
                <div className="text-[12.5px] text-muted mt-0.5">
                  {s.durationLabel} · {s.priceLabel}
                </div>
                <div className={svcTagCls(atClient)}>{atClient ? t('providerProfile.atClientTag') : t('providerProfile.atSpotTag', { address: spotAddress ?? '' })}</div>
              </div>
              <span
                {...clickable(() => onBook(s))}
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
    </>
  );
}
