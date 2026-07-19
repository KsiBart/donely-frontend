import { useTranslation } from 'react-i18next';
import type { ListItem } from './types';

export function ListBlock({ action, items }: { action: string; items: ListItem[] }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-[10px]">
      {items.map((it) => (
        <div
          key={it.t}
          className="flex items-center gap-[14px] flex-wrap bg-surface border border-border rounded-[18px] p-[16px_18px]"
        >
          <div className="flex-1 min-w-[200px]">
            <div className="text-[15.5px] font-extrabold text-[var(--ink)]">{it.t}</div>
            <div className="text-[13px] text-muted2 mt-[3px]">{it.meta}</div>
          </div>
          <span className="bg-[var(--tint)] text-[var(--accInk)] rounded-[10px] p-[5px_10px] text-[11.5px] font-extrabold">{it.tag}</span>
          <a href={`mailto:${t('landing.applyEmail')}`} className="bg-[var(--acc)] text-[var(--onacc)] rounded-xl p-[9px_16px] text-[13px] font-extrabold">
            {action}
          </a>
        </div>
      ))}
    </div>
  );
}
