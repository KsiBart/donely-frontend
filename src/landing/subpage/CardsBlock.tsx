import type { CardItem } from './types';

export function CardsBlock({ items }: { items: CardItem[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
      {items.map((it) => (
        <div key={it.t} className="bg-surface border border-border rounded-[20px] p-6">
          <div aria-hidden="true" className="w-11.5 h-11.5 rounded-[13px] bg-[var(--tint)] text-[var(--acc)] flex items-center justify-center text-[22px]">
            {it.icon}
          </div>
          <div className="font-['Bricolage_Grotesque',sans-serif] text-lg font-bold text-[var(--ink)] mt-3.5">{it.t}</div>
          <div className="text-sm text-muted leading-[1.55] mt-1.5">{it.d}</div>
        </div>
      ))}
    </div>
  );
}
