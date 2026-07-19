import type { TFunction } from 'i18next';
import clsx from 'clsx';
import { clickable } from '../../../lib/a11y';

interface SettingsRow {
  label: string;
  val: string;
  onClick?: () => void;
}

interface SettingsRowsProps {
  t: TFunction;
  rows: SettingsRow[];
  logout: () => void;
}

/** The account settings card (location / addresses / payment methods / notifications / language)
 * plus the logout row. */
export default function SettingsRows({ t, rows, logout }: SettingsRowsProps) {
  return (
    <div className="bg-surface rounded-[20px] shadow-[var(--shadow)] overflow-hidden mb-3.5">
      {rows.map((r) => (
        <div
          key={r.label}
          {...(r.onClick ? clickable(r.onClick) : {})}
          className={clsx('flex justify-between items-center py-3.5 px-4 border-b border-border', r.onClick ? 'cursor-pointer' : 'cursor-default')}
        >
          <span className="text-sm font-semibold">{r.label}</span>
          <span className="text-[12.5px] text-muted">
            {r.val} <span aria-hidden="true">›</span>
          </span>
        </div>
      ))}
      <div {...clickable(logout)} className="py-3.5 px-4 cursor-pointer">
        <span className="text-sm font-semibold text-danger">{t('profile.logout')}</span>
      </div>
    </div>
  );
}
