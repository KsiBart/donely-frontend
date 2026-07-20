import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Logo, stripes } from '../components/ui';
import { BRICO } from '../lib/format';
import { clickable } from '../lib/a11y';
import type { Lang } from '../i18n';

const BRICO_STYLE = { fontFamily: BRICO };

export interface AdminSection {
  path: string;
  label: string;
}

interface AdminSidebarProps {
  brandAppName: string;
  sections: AdminSection[];
  activePath: string;
  pendingCount: number;
  onNavigate: (path: string) => void;
  lang: Lang;
  onToggleLang: () => void;
  email: string;
  onLogout: () => void;
}

/** Admin left nav: brand lockup, section links (with the pending-verification badge on
 * Wykonawcy), language toggle and account/logout footer. Pure presentational — all state lives
 * in AdminApp. */
export default function AdminSidebar({
  brandAppName,
  sections,
  activePath,
  pendingCount,
  onNavigate,
  lang,
  onToggleLang,
  email,
  onLogout,
}: AdminSidebarProps) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('a11y.adminNav', 'Menu administratora')}
      className="flex flex-none w-56 flex-col border-r border-border bg-surface px-3 py-5"
    >
      <div className="flex items-center gap-2.25 px-2.5 pb-5">
        <Logo size={34} />
        <div>
          {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO_STYLE is a shared font-family constant with no Tailwind token mapping */}
          <div className="text-[15px] font-bold" style={BRICO_STYLE}>
            {brandAppName}
          </div>
          <div className="text-[10.5px] font-semibold text-muted">{t('admin.common.panelLabel')}</div>
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        {sections.map((s) => {
          const active = activePath === s.path;
          const badge = s.path === 'providers' && pendingCount > 0;
          return (
            <div
              key={s.path || 'dashboard'}
              {...clickable(() => onNavigate(s.path), { pressed: active })}
              className={clsx(
                'flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5',
                active ? 'bg-accent text-white' : 'bg-transparent text-muted2',
              )}
            >
              <span className={clsx('flex-1 text-[13.5px]', active ? 'font-bold' : 'font-semibold')}>{s.label}</span>
              {badge && (
                <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-[9px] bg-[#d64550] px-1.25 text-[10.5px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-auto">
        <div
          {...clickable(onToggleLang)}
          title={t('admin.common.language') ?? ''}
          className="flex cursor-pointer items-center justify-between gap-2.25 rounded-xl px-3 py-2.25"
        >
          <span className="text-[12.5px] font-semibold text-muted2">{t('admin.common.language')}</span>
          <span className="rounded-[9px] bg-surface2 px-2 py-0.75 text-[11.5px] font-bold text-accent">{lang.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2.25 border-t border-border px-3 py-2.5">
          <span
            className="flex h-7.5 w-7.5 flex-none items-center justify-center rounded-full text-[11px] font-bold text-white"
            // eslint-disable-next-line react/no-inline-styles -- dynamic: stripes() generates a per-avatar gradient string at runtime
            style={{ background: stripes(45, 5) }}
          >
            AD
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-bold">Admin</div>
            <div className="overflow-hidden text-ellipsis text-[10.5px] text-muted">{email}</div>
          </div>
          <span
            {...clickable(onLogout, { label: t('admin.common.logout') })}
            title={t('admin.common.logout') ?? ''}
            className="cursor-pointer text-[11px] font-bold text-[#d64550]"
          >
            <span aria-hidden="true">⎋</span>
          </span>
        </div>
      </div>
    </nav>
  );
}
