import { useState } from 'react';
import { clickable } from '../../lib/a11y';
import type { FaqItem } from './types';

export function FaqBlock({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-[10px]">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div
              {...clickable(() => setOpen(isOpen ? null : i), { expanded: isOpen })}
              id={`faq-q-${i}`}
              aria-controls={`faq-a-${i}`}
              className="flex items-center gap-3 p-[15px_18px] cursor-pointer"
            >
              <span className="flex-1 text-[15px] font-bold text-[var(--ink)]">{it.q}</span>
              <span aria-hidden="true" className="text-[var(--acc)] text-[18px] font-extrabold w-5 text-center">{isOpen ? '−' : '+'}</span>
            </div>
            {isOpen && (
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="p-[0_18px_16px] text-sm text-muted leading-[1.6] animate-[dfade_0.25s_ease]">
                {it.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
