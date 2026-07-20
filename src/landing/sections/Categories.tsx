import { useTranslation } from 'react-i18next';
import { clickable } from '../../lib/a11y';
import { CAT_GRADIENTS } from '../palette';
import { kicker, sectionTitle } from './constants';

interface CatItem {
  icon: string;
  name: string;
  ex: string;
  from: string;
}

/** Category grid section — extracted verbatim from Landing.tsx. */
export function Categories({ goLogin }: { goLogin: () => void }) {
  const { t } = useTranslation();
  const catItems = t('landing.cats.items', { returnObjects: true }) as CatItem[];

  const cats = catItems.map((c, i) => ({
    ...c,
    sA: CAT_GRADIENTS[i % CAT_GRADIENTS.length][0],
    sB: CAT_GRADIENTS[i % CAT_GRADIENTS.length][1],
    // Slide in from alternating sides so the grid converges/aligns as it reveals (even cards from
    // the left, odd from the right). Reversal on scroll-out is handled globally by useScrollReveal.
    dir: i % 2 === 0 ? 'left' : 'right',
  }));

  return (
    <section id="cats" className="max-w-300 mx-auto w-full box-border p-[clamp(48px,6vw,80px)_22px]">
      <div className="text-center max-w-160 mx-auto">
        <div className={kicker}>{t('landing.cats.kicker')}</div>
        <h2 className={sectionTitle}>{t('landing.cats.title')}</h2>
        <p className="text-[17px] text-muted leading-[1.5] m-[14px_0_0]">{t('landing.cats.sub')}</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-9.5">
        {cats.map((c) => (
          <div
            key={c.name}
            {...clickable(goLogin)}
            data-reveal={c.dir}
            className="dt-card bg-surface border border-border rounded-[22px] overflow-hidden cursor-pointer"
            // Must include opacity+transform here (inline overrides the [data-reveal] stylesheet
            // transition): without them the reveal snapped instead of sliding.
            // eslint-disable-next-line react/no-inline-styles -- css-cascade: must stay inline to out-prioritize the .dt [data-reveal] stylesheet transition (inline always wins over stylesheet regardless of specificity)
            style={{
              transition:
                'opacity .55s ease, transform .7s cubic-bezier(.2,.75,.3,1), box-shadow .25s ease, border-color .25s ease',
            }}
          >
            <div
              className="h-30 relative overflow-hidden flex items-center justify-center"
              // eslint-disable-next-line react/no-inline-styles -- dynamic: per-category gradient stops (CAT_GRADIENTS[i])
              style={{ background: `linear-gradient(135deg,${c.sA},${c.sB})` }}
            >
              <div className="absolute -right-7.5 -top-7.5 w-27.5 h-27.5 rounded-full bg-white/16" />
              <div className="absolute -left-6 -bottom-6 w-20 h-20 rounded-full bg-white/12" />
              <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#fff,#fff_6px,transparent_6px,transparent_14px)]" />
              <span aria-hidden="true" className="relative text-[46px] drop-shadow-[0_4px_8px_rgba(0,0,0,.18)]">{c.icon}</span>
            </div>
            <div className="p-[16px_20px_20px]">
              <div className="font-['Bricolage_Grotesque',sans-serif] text-[19px] font-bold text-[var(--ink)]">{c.name}</div>
              <div className="text-[13.5px] text-muted2 mt-1">{c.ex}</div>
              <div className="text-[13px] font-extrabold text-[var(--acc)] mt-3">{c.from}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
