import { useTranslation } from 'react-i18next';
import { clickable } from '../../lib/a11y';

/** "For pros" dark band section — extracted verbatim from Landing.tsx. */
export function ForPros({ goLogin, dark }: { goLogin: () => void; dark: boolean }) {
  const { t } = useTranslation();
  const prosBullets = t('landing.pros.bullets', { returnObjects: true }) as string[];

  return (
    <section id="pros" className="relative overflow-hidden bg-[var(--prosGrad)]">
      <div className="relative max-w-300 mx-auto w-full box-border p-[clamp(48px,6vw,88px)_22px]">
        <div className="flex flex-wrap gap-12 items-center">
          <div data-reveal="left" className="flex-[1_1_440px] min-w-0">
            <div className="text-[13px] font-extrabold tracking-[.14em] uppercase text-[var(--bandKicker)]">{t('landing.pros.kicker')}</div>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(32px,4.6vw,52px)] font-extrabold text-[var(--bandInk)] m-[12px_0_0] leading-[1.04] tracking-[-0.01em]">
              {t('landing.pros.title')}
            </h2>
            <p className="text-[clamp(16px,1.8vw,19px)] text-[var(--bandMuted)] leading-[1.55] m-[18px_0_0]">{t('landing.pros.sub')}</p>
            <div className="flex flex-wrap gap-2.5 mt-6">
              {prosBullets.map((b) => (
                <span key={b} className="bg-[var(--bandChip)] text-[var(--bandChipFg)] rounded-xl p-[10px_14px] text-sm font-bold">
                  {b}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-7.5 items-center">
              {/* This white/dark-text pill (not `var(--acc)`-based like the other CTAs) always sits on
                  the dark `--prosGrad` band regardless of the site's own light/dark mode, so it's kept
                  unchanged in light mode; only in dark mode does it pick up the theme's gradient CTA
                  fill (with the theme's dark on-accent ink for contrast) to match the other primary CTAs. */}
              <span
                {...clickable(goLogin)}
                className="dt-btn-ghost rounded-[15px] p-[15px_26px] text-base font-extrabold cursor-pointer"
                // eslint-disable-next-line react/no-inline-styles -- dynamic: swaps per site dark/light mode (see comment above)
                style={{ background: dark ? 'var(--accGrad)' : '#fff', color: dark ? 'var(--onacc)' : '#2a2430' }}
              >
                {t('landing.pros.cta')} <span aria-hidden="true">→</span>
              </span>
              <span className="text-[var(--bandSoft)] text-sm">{t('landing.pros.note')}</span>
            </div>
          </div>
          <div data-reveal="right" className="flex-[1_1_340px] min-w-0">
            <div className="bg-surface rounded-3xl p-5.5 shadow-[0_30px_70px_rgba(0,0,0,.42)]">
              <div className="flex items-center gap-3">
                <div className="relative w-13 h-13 flex-none">
                  <div className="w-13 h-13 rounded-[15px] overflow-hidden bg-[var(--acc)]">
                    <svg aria-hidden="true" viewBox="0 0 64 64" className="w-full h-full block">
                      <circle cx="32" cy="25" r="12" fill="rgba(255,255,255,.92)" />
                      <path d="M11 60c1-13 10-20 21-20s20 7 21 20z" fill="rgba(255,255,255,.92)" />
                    </svg>
                  </div>
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-[var(--okbg)] text-[var(--okfg)] border-2 border-surface flex items-center justify-center text-[11px] font-extrabold"
                  >
                    ✓
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15.5px] font-extrabold text-[var(--ink)]">{t('landing.pros.card.name')}</div>
                  <div className="text-[12.5px] text-muted2">{t('landing.pros.card.role')}</div>
                </div>
              </div>
              <div className="mt-4.5 bg-[var(--tint)] rounded-[18px] p-[16px_18px]">
                <div className="text-[11px] font-extrabold text-[var(--accInk)] tracking-[.06em]">{t('landing.pros.card.earnLabel')}</div>
                <div className="font-['Bricolage_Grotesque',sans-serif] text-[34px] font-extrabold text-[var(--ink)] mt-0.5">{t('landing.pros.card.earn')}</div>
                <div className="text-xs text-muted2 mt-0.5">{t('landing.pros.card.earnNote')}</div>
              </div>
              <div className="flex gap-2.5 mt-3">
                <div className="flex-1 bg-bg border border-border rounded-[14px] p-[12px_14px]">
                  <div className="font-['Bricolage_Grotesque',sans-serif] text-xl font-extrabold text-[var(--ink)]">{t('landing.pros.card.jobs')}</div>
                  <div className="text-[11.5px] text-muted2 mt-px">{t('landing.pros.card.jobsLabel')}</div>
                </div>
                <div className="flex-1 bg-bg border border-border rounded-[14px] p-[12px_14px]">
                  <div className="font-['Bricolage_Grotesque',sans-serif] text-xl font-extrabold text-[var(--ink)]">★ {t('landing.pros.card.rating')}</div>
                  <div className="text-[11.5px] text-muted2 mt-px">{t('landing.pros.card.ratingLabel')}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.25 bg-[var(--okbg)] rounded-[14px] p-[11px_14px] mt-3">
                <span aria-hidden="true" className="w-6 h-6 rounded-full bg-white text-[var(--okfg)] flex items-center justify-center text-[13px] font-extrabold flex-none">✓</span>
                <span className="text-[12.5px] text-[var(--okfg)] font-bold">{t('landing.pros.card.tax')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
