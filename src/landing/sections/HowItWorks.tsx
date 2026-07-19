import { useTranslation } from 'react-i18next';
import { REVEAL_DIRS } from './constants';

interface StepItem {
  n: string;
  t: string;
  d: string;
}

/** "How it works" dark band section — extracted verbatim from Landing.tsx. */
export function HowItWorks() {
  const { t } = useTranslation();
  const steps = t('landing.how.steps', { returnObjects: true }) as StepItem[];

  return (
    <section id="how" className="relative overflow-hidden bg-[var(--howGrad)]">
      <div className="max-w-[1200px] mx-auto w-full box-border p-[clamp(48px,6vw,84px)_22px]">
        <div className="text-center max-w-[640px] mx-auto">
          <div className="text-[13px] font-extrabold tracking-[.14em] uppercase text-[var(--bandKicker)]">{t('landing.how.kicker')}</div>
          <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(30px,4vw,44px)] font-extrabold text-[var(--bandInk)] m-[10px_0_0] tracking-[-0.01em]">{t('landing.how.title')}</h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mt-[44px]">
          {steps.map((s, i) => (
            <div key={s.n} data-reveal={REVEAL_DIRS[i % 3]} className="text-center p-2">
              <div className="w-[58px] h-[58px] mx-auto rounded-full bg-[var(--acc)] text-[var(--onacc)] flex items-center justify-center font-['Bricolage_Grotesque',sans-serif] text-2xl font-extrabold shadow-[0_8px_20px_rgba(122,79,192,.3)]">
                {s.n}
              </div>
              <div className="font-['Bricolage_Grotesque',sans-serif] text-[21px] font-bold text-[var(--bandInk)] mt-[18px]">{s.t}</div>
              <div className="text-[15px] text-[var(--bandMuted)] leading-[1.55] mt-2 max-w-[320px] mx-auto">{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
