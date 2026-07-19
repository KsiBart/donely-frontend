import { useTranslation } from 'react-i18next';
import { SparkleIcon } from '../../components/ui';
import { clickable } from '../../lib/a11y';
import { useHeroSearch, type Scenario } from './useHeroSearch';

/**
 * Landing page hero section — search box + cycling "matched by AI" scenario card. Extracted
 * verbatim from Landing.tsx (see useHeroSearch for the query/scenario-cycling state).
 */
export function Hero({ goLogin }: { goLogin: () => void }) {
  const { t } = useTranslation();
  const scenarios = t('landing.scenarios', { returnObjects: true }) as Scenario[];
  const searchChips = t('landing.searchChips', { returnObjects: true }) as string[];
  const { query, setQuery, heroMatched, heroQueryShown, sceneKey } = useHeroSearch(scenarios);

  return (
    <section
      id="top"
      className="relative max-w-[1200px] mx-auto w-full box-border p-[clamp(36px,6vw,80px)_22px_clamp(30px,5vw,56px)] flex flex-wrap gap-[44px] items-center"
    >
      <div
        data-plx="0.12"
        className="absolute -top-[120px] -left-[90px] w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle_at_40%_40%,var(--blob1),transparent_70%)] opacity-75 pointer-events-none z-0"
        // eslint-disable-next-line react/no-inline-styles -- dynamic: --plx is written at runtime by useParallax()
        style={{ transform: 'translate3d(0,var(--plx,0px),0)' }}
      />
      <div
        data-plx="-0.08"
        className="absolute -bottom-[140px] -right-[70px] w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle_at_60%_60%,var(--blob2),transparent_70%)] opacity-75 pointer-events-none z-0"
        // eslint-disable-next-line react/no-inline-styles -- dynamic: --plx is written at runtime by useParallax()
        style={{ transform: 'translate3d(0,var(--plx,0px),0)' }}
      />

      <div className="flex-[1_1_440px] min-w-0 relative z-[1] animate-[dfade_0.5s_ease]">
        <div className="inline-flex items-center gap-2 bg-[var(--tint)] text-[var(--accInk)] rounded-[99px] p-[7px_14px] text-[13px] font-bold">
          <span aria-hidden="true" className="bg-[var(--okbg)] text-[var(--okfg)] rounded-[7px] p-[2px_7px] text-[11px] font-extrabold">✓</span>
          {t('landing.hero.badge')}
        </div>
        <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(40px,6.2vw,74px)] font-extrabold leading-[1.02] tracking-[-0.02em] text-[var(--ink)] m-[20px_0_0]">
          {t('landing.hero.title')}
        </h1>
        <p className="text-[clamp(16px,1.7vw,20px)] text-muted leading-[1.5] m-[20px_0_0] max-w-[560px]">{t('landing.hero.sub')}</p>

        <div className="mt-[26px] max-w-[560px]">
          <div className="inline-flex items-center gap-1.5 bg-[var(--band)] text-[var(--bandInk)] rounded-[99px] p-[5px_12px] text-[11.5px] font-extrabold tracking-[.02em] mb-[10px]">
            <span aria-hidden="true">✨</span> {t('landing.hero.aiBadge')}
          </div>
          <div className="bg-surface border-[1.5px] border-[var(--acc)] rounded-[20px] p-[7px_7px_7px_16px] flex items-center gap-[10px] shadow-[0_12px_30px_rgba(74,52,102,.15)]">
            <SparkleIcon size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') goLogin();
              }}
              placeholder={t('landing.hero.searchPlaceholder')}
              className="flex-1 min-w-0 border-none bg-transparent text-[var(--ink)] font-semibold text-[15px] font-['Figtree',sans-serif] outline-none py-[9px]"
            />
            <span {...clickable(goLogin)} className="dt-btn-accent flex-none bg-[var(--accGrad)] text-[var(--onacc)] rounded-[14px] p-[12px_20px] text-[15px] font-extrabold cursor-pointer">
              {t('landing.hero.searchBtn')} <span aria-hidden="true">→</span>
            </span>
          </div>
          <div className="text-[13.5px] text-[var(--soft)] leading-[1.5] mt-[10px]">{t('landing.hero.aiHint')}</div>
          <div className="flex flex-wrap gap-2 mt-3">
            {searchChips.map((c) => (
              <span
                key={c}
                {...clickable(() => setQuery(c.split(' ').slice(1).join(' ')))}
                className="dt-chip bg-surface border border-[var(--border2)] rounded-[99px] p-[8px_13px] text-[13px] font-semibold text-muted cursor-pointer"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <span {...clickable(() => document.getElementById('pros')?.scrollIntoView({ behavior: 'smooth' }))} className="text-[15px] font-extrabold text-[var(--acc)] cursor-pointer">
            {t('landing.hero.cta2')} <span aria-hidden="true">→</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-[18px] mt-[26px] text-sm text-[var(--soft)]">
          <span className="inline-flex items-center gap-[7px]">
            <span aria-hidden="true" className="text-[#e8a13c] tracking-[1px]">★★★★★</span> {t('landing.hero.rating')}
          </span>
          <span className="inline-flex items-center gap-[7px]">
            <span aria-hidden="true" className="text-[var(--okfg)]">✓</span> {t('landing.hero.trust2')}
          </span>
        </div>
      </div>

      <div className="flex-[1_1_380px] min-w-0 relative z-[1] flex justify-center">
        <div className="relative w-full max-w-[460px]">
          <div className="absolute -inset-[26px] rounded-[44px] bg-[linear-gradient(135deg,var(--acc),var(--accHover))] opacity-[.38] blur-[46px]" />
          <div className="relative bg-surface rounded-[28px] p-5 shadow-[0_30px_70px_rgba(74,52,102,.26)] animate-[dfloat_6s_ease-in-out_infinite]">
            <div className="flex items-center gap-[9px] flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-[var(--tint)] text-[var(--accInk)] rounded-[99px] p-[6px_12px] text-[12.5px] font-extrabold">
                <span aria-hidden="true">✨</span> {t('landing.hero.matchedTitle')}
              </span>
              <span className="text-xs text-[var(--soft)]">{t('landing.hero.matchedNote')}</span>
            </div>
            <div className="flex items-center gap-2 bg-bg border border-border rounded-[14px] p-[11px_13px] mt-[14px]">
              <SparkleIcon size={15} />
              <span className="text-[13.5px] text-muted font-semibold whitespace-nowrap overflow-hidden text-ellipsis">„{heroQueryShown}"</span>
            </div>
            <div key={sceneKey} className="flex flex-col gap-[9px] mt-[14px]">
              {heroMatched.map((p, i) => (
                <div
                  key={p.init + p.slot}
                  className="flex items-center gap-3 bg-surface border border-border rounded-2xl p-[10px_12px] animate-[dfade_0.5s_ease_both]"
                  // eslint-disable-next-line react/no-inline-styles -- dynamic: per-item stagger delay computed from array index
                  style={{ animationDelay: `${p.delay}ms` }}
                >
                  <div className="relative w-12 h-12 flex-none">
                    <div
                      className="w-12 h-12 rounded-[14px] overflow-hidden"
                      // eslint-disable-next-line react/no-inline-styles -- dynamic: avatar color varies per matched pro (AVATAR_COLORS[i])
                      style={{ background: p.bg }}
                    >
                      <svg aria-hidden="true" viewBox="0 0 64 64" className="w-full h-full block">
                        <circle cx="32" cy="25" r="12" fill="rgba(255,255,255,.92)" />
                        <path d="M11 60c1-13 10-20 21-20s20 7 21 20z" fill="rgba(255,255,255,.92)" />
                      </svg>
                    </div>
                    {p.verified && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-[var(--okbg)] text-[var(--okfg)] border-2 border-surface flex items-center justify-center text-[11px] font-extrabold"
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-extrabold text-[var(--ink)]">
                      {p.name} · {p.cat}
                    </div>
                    <div className="text-[12.5px] text-muted2 mt-px">{p.meta}</div>
                  </div>
                  <span className="flex-none bg-[var(--acc)] text-[var(--onacc)] rounded-xl p-[7px_12px] text-xs font-extrabold whitespace-nowrap">{p.slot}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
