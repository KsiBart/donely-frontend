import type { TFunction } from 'i18next';
import clsx from 'clsx';
import { clickable } from '../../../lib/a11y';

interface SegToggleProps {
  t: TFunction;
  mapOn: boolean;
  setMapOn: (v: boolean) => void;
}

const segCls = (on: boolean) =>
  clsx('py-1.5 px-3 rounded-[11px] text-xs font-bold cursor-pointer', on ? 'bg-surface text-accent shadow-[var(--shadow)]' : 'bg-transparent text-muted shadow-none');

/** List/Map segmented toggle — shared between the desktop and mobile Home layouts. */
export default function SegToggle({ t, mapOn, setMapOn }: SegToggleProps) {
  return (
    <div className={clsx('flex-none flex rounded-[14px] p-[3px]', mapOn ? 'bg-surface shadow-[var(--shadow)]' : 'bg-surface2 shadow-none')}>
      <span {...clickable(() => setMapOn(false), { pressed: !mapOn })} className={segCls(!mapOn)}>
        {t('home.listToggle')}
      </span>
      <span {...clickable(() => setMapOn(true), { pressed: mapOn })} className={segCls(mapOn)}>
        {t('home.mapToggle')}
      </span>
    </div>
  );
}
