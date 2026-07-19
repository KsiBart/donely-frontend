import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SparkleIcon } from '../components/ui';
import { clickable } from '../lib/a11y';
import { useToast } from '../state/ToastContext';
import { useSiteTheme } from '../state/SiteThemeContext';
import { useInstallAction } from '../mobile/AppPromo';
import { SiteFooter, SiteHeader } from './SiteChrome';
import { useParallax, useScrollReveal } from './effects';
import { AVATAR_COLORS, CAT_GRADIENTS } from './palette';
import { ToastBubble } from './shared';

interface ScenarioPro {
  init: string;
  name: string;
  cat: string;
  meta: string;
  slot: string;
  verified: boolean;
}
interface Scenario {
  q: string;
  kw: string[];
  pros: ScenarioPro[];
}
interface StatItem {
  v: string;
  k: string;
}
interface CatItem {
  icon: string;
  name: string;
  ex: string;
  from: string;
}
interface StepItem {
  n: string;
  t: string;
  d: string;
}
interface ValueItem {
  icon: string;
  bg: string;
  fg: string;
  t: string;
  d: string;
}

const REVEAL_DIRS = ['left', 'up', 'right'] as const;

const kicker = 'text-[13px] font-extrabold tracking-[.14em] uppercase text-[var(--soft)]';
const sectionTitle =
  "font-['Bricolage_Grotesque',sans-serif] text-[clamp(30px,4vw,44px)] font-extrabold text-[var(--ink)] m-[10px_0_0] tracking-[-0.01em]";

/**
 * Marketing landing page (donely-landing.dc.html `isLanding` branch). Rendered at `/` for
 * unauthenticated visitors — full-bleed, outside the app's .mobile-shell/.desktop-shell chrome.
 * Shares header/footer with the 9 subpages (SiteChrome), supports the `.dt` dark-mode token set,
 * and ports the design's vanilla-JS effects (scroll-reveal, hero-blob parallax, floating card,
 * cycling "matched by AI" scenarios) into React hooks/refs.
 */
export default function Landing() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { dark } = useSiteTheme();
  const install = useInstallAction();

  const [query, setQuery] = useState('');
  const [scene, setScene] = useState(0);
  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!queryRef.current.trim()) setScene((s) => s + 1);
    }, 3800);
    return () => window.clearInterval(id);
  }, []);

  // Deep-link from a subpage's header/footer nav (SiteChrome's useAnchorNav navigates here with
  // `state.scrollTo` when the anchor section isn't on the current page).
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      const id = state.scrollTo;
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }));
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useParallax();
  useScrollReveal([t]);

  const scenarios = t('landing.scenarios', { returnObjects: true }) as Scenario[];
  const searchChips = t('landing.searchChips', { returnObjects: true }) as string[];
  const stats = t('landing.stats', { returnObjects: true }) as StatItem[];
  const catItems = t('landing.cats.items', { returnObjects: true }) as CatItem[];
  const steps = t('landing.how.steps', { returnObjects: true }) as StepItem[];
  const values = t('landing.values', { returnObjects: true }) as ValueItem[];
  const prosBullets = t('landing.pros.bullets', { returnObjects: true }) as string[];

  const goLogin = () => navigate('/login');

  const qraw = query.trim().toLowerCase();
  let idx = qraw ? scenarios.findIndex((sc) => sc.kw.some((k) => qraw.includes(k))) : -1;
  if (idx < 0) idx = ((scene % scenarios.length) + scenarios.length) % scenarios.length;
  const activeScenario = scenarios[idx];
  const heroMatched = activeScenario.pros.map((p, i) => ({ ...p, bg: AVATAR_COLORS[i % AVATAR_COLORS.length], delay: i * 90 }));
  const heroQueryShown = query.trim() || activeScenario.q;
  const sceneKey = `sc${idx}${qraw ? '-q' : '-c'}`;

  const cats = catItems.map((c, i) => ({
    ...c,
    sA: CAT_GRADIENTS[i % CAT_GRADIENTS.length][0],
    sB: CAT_GRADIENTS[i % CAT_GRADIENTS.length][1],
    // Slide in from alternating sides so the grid converges/aligns as it reveals (even cards from
    // the left, odd from the right). Reversal on scroll-out is handled globally by useScrollReveal.
    dir: i % 2 === 0 ? 'left' : 'right',
  }));

  return (
    <div className="dt min-h-screen flex flex-col bg-[var(--bgGrad)]" data-dk={dark ? '1' : '0'}>
      <SiteHeader />

      {/* HERO */}
      {/* No `overflow: hidden` here: the card's soft glow + the corner blobs must bleed past
          the 1200px column onto the full-width page bg instead of being clipped into a visible
          rectangle. Horizontal scroll from the bleed is contained by `.dt { overflow-x: hidden }`. */}
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

      {/* TRUST STRIP (dark band, matches design in both themes) */}
      <section className="bg-[var(--band)]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[2px_24px] p-[26px_22px]">
          {stats.map((s) => (
            <div key={s.k} className="text-center p-[8px_6px]">
              <div className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(24px,3vw,32px)] font-extrabold text-[var(--bandAcc)]">{s.v}</div>
              <div className="text-[13px] text-[var(--bandMuted)] mt-0.5">{s.k}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="cats" className="max-w-[1200px] mx-auto w-full box-border p-[clamp(48px,6vw,80px)_22px]">
        <div className="text-center max-w-[640px] mx-auto">
          <div className={kicker}>{t('landing.cats.kicker')}</div>
          <h2 className={sectionTitle}>{t('landing.cats.title')}</h2>
          <p className="text-[17px] text-muted leading-[1.5] m-[14px_0_0]">{t('landing.cats.sub')}</p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-[38px]">
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
                className="h-[120px] relative overflow-hidden flex items-center justify-center"
                // eslint-disable-next-line react/no-inline-styles -- dynamic: per-category gradient stops (CAT_GRADIENTS[i])
                style={{ background: `linear-gradient(135deg,${c.sA},${c.sB})` }}
              >
                <div className="absolute -right-[30px] -top-[30px] w-[110px] h-[110px] rounded-full bg-white/[0.16]" />
                <div className="absolute -left-[24px] -bottom-[24px] w-20 h-20 rounded-full bg-white/[0.12]" />
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

      {/* HOW IT WORKS (dark, matches design's --howGrad) */}
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

      {/* VALUE PROPS */}
      <section className="max-w-[1200px] mx-auto w-full box-border p-[clamp(48px,6vw,80px)_22px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[18px]">
          {values.map((v, i) => (
            <div key={v.t} data-reveal={REVEAL_DIRS[i % 3]} className="bg-surface border border-border rounded-[22px] p-[26px]">
              <div
                aria-hidden="true"
                className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px]"
                // eslint-disable-next-line react/no-inline-styles -- dynamic: per-value icon tint comes from i18n data (v.bg/v.fg)
                style={{ background: v.bg, color: v.fg }}
              >
                {v.icon}
              </div>
              <div className="font-['Bricolage_Grotesque',sans-serif] text-xl font-bold text-[var(--ink)] mt-4">{v.t}</div>
              <div className="text-[15px] text-muted leading-[1.55] mt-2">{v.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOR PROS (dark) */}
      <section id="pros" className="relative overflow-hidden bg-[var(--prosGrad)]">
        <div className="relative max-w-[1200px] mx-auto w-full box-border p-[clamp(48px,6vw,88px)_22px]">
          <div className="flex flex-wrap gap-12 items-center">
            <div data-reveal="left" className="flex-[1_1_440px] min-w-0">
              <div className="text-[13px] font-extrabold tracking-[.14em] uppercase text-[var(--bandKicker)]">{t('landing.pros.kicker')}</div>
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(32px,4.6vw,52px)] font-extrabold text-[var(--bandInk)] m-[12px_0_0] leading-[1.04] tracking-[-0.01em]">
                {t('landing.pros.title')}
              </h2>
              <p className="text-[clamp(16px,1.8vw,19px)] text-[var(--bandMuted)] leading-[1.55] m-[18px_0_0]">{t('landing.pros.sub')}</p>
              <div className="flex flex-wrap gap-[10px] mt-6">
                {prosBullets.map((b) => (
                  <span key={b} className="bg-[var(--bandChip)] text-[var(--bandChipFg)] rounded-xl p-[10px_14px] text-sm font-bold">
                    {b}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-[30px] items-center">
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
              <div className="bg-surface rounded-3xl p-[22px] shadow-[0_30px_70px_rgba(0,0,0,.42)]">
                <div className="flex items-center gap-3">
                  <div className="relative w-[52px] h-[52px] flex-none">
                    <div className="w-[52px] h-[52px] rounded-[15px] overflow-hidden bg-[var(--acc)]">
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
                <div className="mt-[18px] bg-[var(--tint)] rounded-[18px] p-[16px_18px]">
                  <div className="text-[11px] font-extrabold text-[var(--accInk)] tracking-[.06em]">{t('landing.pros.card.earnLabel')}</div>
                  <div className="font-['Bricolage_Grotesque',sans-serif] text-[34px] font-extrabold text-[var(--ink)] mt-0.5">{t('landing.pros.card.earn')}</div>
                  <div className="text-xs text-muted2 mt-0.5">{t('landing.pros.card.earnNote')}</div>
                </div>
                <div className="flex gap-[10px] mt-3">
                  <div className="flex-1 bg-bg border border-border rounded-[14px] p-[12px_14px]">
                    <div className="font-['Bricolage_Grotesque',sans-serif] text-xl font-extrabold text-[var(--ink)]">{t('landing.pros.card.jobs')}</div>
                    <div className="text-[11.5px] text-muted2 mt-px">{t('landing.pros.card.jobsLabel')}</div>
                  </div>
                  <div className="flex-1 bg-bg border border-border rounded-[14px] p-[12px_14px]">
                    <div className="font-['Bricolage_Grotesque',sans-serif] text-xl font-extrabold text-[var(--ink)]">★ {t('landing.pros.card.rating')}</div>
                    <div className="text-[11.5px] text-muted2 mt-px">{t('landing.pros.card.ratingLabel')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-[9px] bg-[var(--okbg)] rounded-[14px] p-[11px_14px] mt-3">
                  <span aria-hidden="true" className="w-6 h-6 rounded-full bg-white text-[var(--okfg)] flex items-center justify-center text-[13px] font-extrabold flex-none">✓</span>
                  <span className="text-[12.5px] text-[var(--okfg)] font-bold">{t('landing.pros.card.tax')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section id="app" className="max-w-[1200px] mx-auto w-full box-border p-[clamp(48px,6vw,84px)_22px]">
        <div className="bg-[linear-gradient(135deg,var(--tint),var(--bg))] border border-[var(--tintBd)] rounded-[28px] p-[clamp(28px,4vw,52px)] flex flex-wrap gap-8 items-center justify-between">
          <div data-reveal="left" className="flex-[1_1_380px] min-w-0">
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(28px,3.6vw,40px)] font-extrabold text-[var(--ink)] m-0 tracking-[-0.01em]">{t('landing.app.title')}</h2>
            <p className="text-[16.5px] text-muted leading-[1.55] m-[14px_0_0] max-w-[480px]">{t('landing.app.sub')}</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <div {...clickable(install)} className="bg-[#17141c] text-white rounded-[14px] p-[11px_20px] cursor-pointer">
                <div className="text-[10px] text-[#a89fb8]">{t('landing.app.dlOn')}</div>
                <div className="text-lg font-extrabold">App Store</div>
              </div>
              <div {...clickable(install)} className="bg-[#17141c] text-white rounded-[14px] p-[11px_20px] cursor-pointer">
                <div className="text-[10px] text-[#a89fb8]">{t('landing.app.dlFrom')}</div>
                <div className="text-lg font-extrabold">Google Play</div>
              </div>
            </div>
          </div>
          <div
            data-reveal="right"
            className="flex-none w-[150px] h-[150px] rounded-[32px] bg-[linear-gradient(135deg,var(--acc),#9d6fd6)] flex items-center justify-center shadow-[0_20px_44px_rgba(74,52,102,.3)]"
          >
            <svg aria-hidden="true" viewBox="0 0 48 48" className="w-16 text-white">
              <circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="4.5" />
              <path d="M15 24.5l6.5 6.5L34 18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M40 2l1.7 5.3L47 9l-5.3 1.7L40 16l-1.7-5.3L34 9l5.3-1.7z" fill="currentColor" opacity=".85" />
            </svg>
          </div>
        </div>
      </section>

      <SiteFooter />
      <ToastBubble toast={toast} />
    </div>
  );
}
