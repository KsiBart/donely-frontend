import type { DocItem } from './types';

export function DocBlock({ items }: { items: DocItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      {items.map((it) => (
        <div key={it.h}>
          <div className="font-['Bricolage_Grotesque',sans-serif] text-[19px] font-bold text-[var(--ink)]">{it.h}</div>
          <div className="text-[14.5px] text-muted leading-[1.65] mt-2 max-w-180">{it.p}</div>
        </div>
      ))}
    </div>
  );
}
