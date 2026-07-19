import type { TFunction } from 'i18next';
import { BRICO } from '../../../lib/format';
import { clickable } from '../../../lib/a11y';
import SegToggle from './SegToggle';

interface MobileHeaderProps {
  t: TFunction;
  firstName: string;
  myLocation: string;
  locating: boolean;
  relocate: () => void;
  mapOn: boolean;
  setMapOn: (v: boolean) => void;
}

/** Mobile Home, map-off branch: greeting + location row with the list/map toggle. */
export default function MobileHeader({ t, firstName, myLocation, locating, relocate, mapOn, setMapOn }: MobileHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 pt-1.5 px-5">
      <div className="flex-1 min-w-0">
        {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
        <h1 style={{ fontFamily: BRICO }} className="text-xl font-bold m-0">
          {firstName ? t('home.greetingNamed', { name: firstName }) : t('home.greetingPlain')}
        </h1>
        <div {...clickable(relocate)} title={t('home.changeLocation')} className="text-xs text-muted mt-px cursor-pointer inline-flex items-center gap-[5px]">
          <span aria-hidden="true">◉</span> {myLocation}
          <span className="text-accent font-bold">· {locating ? t('home.locating') : t('home.changeLocation')}</span>
        </div>
      </div>
      <SegToggle t={t} mapOn={mapOn} setMapOn={setMapOn} />
    </div>
  );
}
