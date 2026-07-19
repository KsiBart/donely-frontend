import { CAT_GRADIENTS } from '../palette';
import type { PostItem } from './types';

export function PostsBlock({ items }: { items: PostItem[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
      {items.map((it, i) => {
        const [sA, sB] = CAT_GRADIENTS[(it.hue ?? i) % CAT_GRADIENTS.length];
        return (
          <div key={it.t} className="dt-post-card bg-surface border border-border rounded-[20px] overflow-hidden cursor-pointer transition-shadow duration-[250ms]">
            <div
              className="h-[110px] relative overflow-hidden"
              // eslint-disable-next-line react/no-inline-styles -- dynamic: per-post gradient stops (CAT_GRADIENTS[hue])
              style={{ background: `linear-gradient(135deg,${sA},${sB})` }}
            >
              <div className="absolute inset-0 opacity-[.12] bg-[repeating-linear-gradient(45deg,#fff,#fff_6px,transparent_6px,transparent_14px)]" />
            </div>
            <div className="p-[14px_18px_18px]">
              <div className="text-xs text-[var(--soft)] font-semibold">{it.meta}</div>
              <div className="font-['Bricolage_Grotesque',sans-serif] text-[17px] font-bold text-[var(--ink)] mt-1.5 leading-[1.25]">{it.t}</div>
              <div className="text-[13.5px] text-muted leading-[1.5] mt-[7px]">{it.d}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
