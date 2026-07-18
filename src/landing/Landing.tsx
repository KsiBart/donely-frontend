import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SparkleIcon } from '../components/ui';
import { BRICO } from '../lib/format';
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

const kicker: CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: 'var(--soft)',
};
const sectionTitle: CSSProperties = {
  fontFamily: BRICO,
  fontSize: 'clamp(30px,4vw,44px)',
  fontWeight: 800,
  color: 'var(--ink)',
  margin: '10px 0 0',
  letterSpacing: '-.01em',
};

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
    <div className="dt" data-dk={dark ? '1' : '0'} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bgGrad)' }}>
      <SiteHeader />

      {/* HERO */}
      <section
        id="top"
        style={{
          position: 'relative',
          // No `overflow: hidden` here: the card's soft glow + the corner blobs must bleed past
          // the 1200px column onto the full-width page bg instead of being clipped into a visible
          // rectangle. Horizontal scroll from the bleed is contained by `.dt { overflow-x: hidden }`.
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          padding: 'clamp(36px,6vw,80px) 22px clamp(30px,5vw,56px)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 44,
          alignItems: 'center',
        }}
      >
        <div
          data-plx="0.12"
          style={{
            position: 'absolute',
            top: -120,
            left: -90,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%,var(--blob1),transparent 70%)',
            opacity: 0.75,
            pointerEvents: 'none',
            zIndex: 0,
            transform: 'translate3d(0,var(--plx,0px),0)',
          }}
        />
        <div
          data-plx="-0.08"
          style={{
            position: 'absolute',
            bottom: -140,
            right: -70,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 60% 60%,var(--blob2),transparent 70%)',
            opacity: 0.75,
            pointerEvents: 'none',
            zIndex: 0,
            transform: 'translate3d(0,var(--plx,0px),0)',
          }}
        />

        <div style={{ flex: '1 1 440px', minWidth: 0, position: 'relative', zIndex: 1, animation: 'dfade .5s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--tint)', color: 'var(--accInk)', borderRadius: 99, padding: '7px 14px', fontSize: 13, fontWeight: 700 }}>
            <span aria-hidden="true" style={{ background: 'var(--okbg)', color: 'var(--okfg)', borderRadius: 7, padding: '2px 7px', fontSize: 11, fontWeight: 800 }}>✓</span>
            {t('landing.hero.badge')}
          </div>
          <h1 style={{ fontFamily: BRICO, fontSize: 'clamp(40px,6.2vw,74px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-.02em', color: 'var(--ink)', margin: '20px 0 0' }}>
            {t('landing.hero.title')}
          </h1>
          <p style={{ fontSize: 'clamp(16px,1.7vw,20px)', color: 'var(--muted)', lineHeight: 1.5, margin: '20px 0 0', maxWidth: 560 }}>{t('landing.hero.sub')}</p>

          <div style={{ marginTop: 26, maxWidth: 560 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--band)',
                color: 'var(--bandInk)',
                borderRadius: 99,
                padding: '5px 12px',
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: '.02em',
                marginBottom: 10,
              }}
            >
              <span aria-hidden="true">✨</span> {t('landing.hero.aiBadge')}
            </div>
            <div style={{ background: 'var(--surface)', border: '1.5px solid var(--acc)', borderRadius: 20, padding: '7px 7px 7px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 12px 30px rgba(74,52,102,.15)' }}>
              <SparkleIcon size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') goLogin();
                }}
                placeholder={t('landing.hero.searchPlaceholder')}
                style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', color: 'var(--ink)', font: "600 15px 'Figtree', sans-serif", outline: 'none', padding: '9px 0' }}
              />
              <span {...clickable(goLogin)} className="dt-btn-accent" style={{ flex: 'none', background: 'var(--accGrad)', color: 'var(--onacc)', borderRadius: 14, padding: '12px 20px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
                {t('landing.hero.searchBtn')} <span aria-hidden="true">→</span>
              </span>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--soft)', lineHeight: 1.5, marginTop: 10 }}>{t('landing.hero.aiHint')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {searchChips.map((c) => (
                <span
                  key={c}
                  {...clickable(() => setQuery(c.split(' ').slice(1).join(' ')))}
                  className="dt-chip"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 99, padding: '8px 13px', fontSize: 13, fontWeight: 600, color: 'var(--muted)', cursor: 'pointer' }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <span {...clickable(() => document.getElementById('pros')?.scrollIntoView({ behavior: 'smooth' }))} style={{ fontSize: 15, fontWeight: 800, color: 'var(--acc)', cursor: 'pointer' }}>
              {t('landing.hero.cta2')} <span aria-hidden="true">→</span>
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18, marginTop: 26, fontSize: 14, color: 'var(--soft)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span aria-hidden="true" style={{ color: '#e8a13c', letterSpacing: 1 }}>★★★★★</span> {t('landing.hero.rating')}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span aria-hidden="true" style={{ color: 'var(--okfg)' }}>✓</span> {t('landing.hero.trust2')}
            </span>
          </div>
        </div>

        <div style={{ flex: '1 1 380px', minWidth: 0, position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 460 }}>
            <div style={{ position: 'absolute', inset: '-26px', borderRadius: 44, background: 'linear-gradient(135deg,var(--acc),var(--accHover))', opacity: 0.38, filter: 'blur(46px)' }} />
            <div style={{ position: 'relative', background: 'var(--surface)', borderRadius: 28, padding: 20, boxShadow: '0 30px 70px rgba(74,52,102,.26)', animation: 'dfloat 6s ease-in-out infinite' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--tint)', color: 'var(--accInk)', borderRadius: 99, padding: '6px 12px', fontSize: 12.5, fontWeight: 800 }}>
                  <span aria-hidden="true">✨</span> {t('landing.hero.matchedTitle')}
                </span>
                <span style={{ fontSize: 12, color: 'var(--soft)' }}>{t('landing.hero.matchedNote')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '11px 13px', marginTop: 14 }}>
                <SparkleIcon size={15} />
                <span style={{ fontSize: 13.5, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>„{heroQueryShown}"</span>
              </div>
              <div key={sceneKey} style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
                {heroMatched.map((p, i) => (
                  <div
                    key={p.init + p.slot}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: '10px 12px',
                      animation: 'dfade .5s ease both',
                      animationDelay: `${p.delay}ms`,
                    }}
                  >
                    <div style={{ position: 'relative', width: 48, height: 48, flex: 'none' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, overflow: 'hidden', background: p.bg }}>
                        <svg aria-hidden="true" viewBox="0 0 64 64" style={{ width: '100%', height: '100%', display: 'block' }}>
                          <circle cx="32" cy="25" r="12" fill="rgba(255,255,255,.92)" />
                          <path d="M11 60c1-13 10-20 21-20s20 7 21 20z" fill="rgba(255,255,255,.92)" />
                        </svg>
                      </div>
                      {p.verified && (
                        <span
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            right: -4,
                            bottom: -4,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'var(--okbg)',
                            color: 'var(--okfg)',
                            border: '2px solid var(--surface)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)' }}>
                        {p.name} · {p.cat}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--muted2)', marginTop: 1 }}>{p.meta}</div>
                    </div>
                    <span style={{ flex: 'none', background: 'var(--acc)', color: 'var(--onacc)', borderRadius: 12, padding: '7px 12px', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>{p.slot}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP (dark band, matches design in both themes) */}
      <section style={{ background: 'var(--band)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '2px 24px', padding: '26px 22px' }}>
          {stats.map((s) => (
            <div key={s.k} style={{ textAlign: 'center', padding: '8px 6px' }}>
              <div style={{ fontFamily: BRICO, fontSize: 'clamp(24px,3vw,32px)', fontWeight: 800, color: 'var(--bandAcc)' }}>{s.v}</div>
              <div style={{ fontSize: 13, color: 'var(--bandMuted)', marginTop: 2 }}>{s.k}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="cats" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: 'clamp(48px,6vw,80px) 22px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div style={kicker}>{t('landing.cats.kicker')}</div>
          <h2 style={sectionTitle}>{t('landing.cats.title')}</h2>
          <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.5, margin: '14px 0 0' }}>{t('landing.cats.sub')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginTop: 38 }}>
          {cats.map((c) => (
            <div
              key={c.name}
              {...clickable(goLogin)}
              data-reveal={c.dir}
              className="dt-card"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 22,
                overflow: 'hidden',
                cursor: 'pointer',
                // Must include opacity+transform here (inline overrides the [data-reveal] stylesheet
                // transition): without them the reveal snapped instead of sliding.
                transition:
                  'opacity .55s ease, transform .7s cubic-bezier(.2,.75,.3,1), box-shadow .25s ease, border-color .25s ease',
              }}
            >
              <div
                style={{
                  height: 120,
                  position: 'relative',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg,${c.sA},${c.sB})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ position: 'absolute', right: -30, top: -30, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,.16)' }} />
                <div style={{ position: 'absolute', left: -24, bottom: -24, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.12)' }} />
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'repeating-linear-gradient(45deg,#fff,#fff 6px,transparent 6px,transparent 14px)' }} />
                <span aria-hidden="true" style={{ position: 'relative', fontSize: 46, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.18))' }}>{c.icon}</span>
              </div>
              <div style={{ padding: '16px 20px 20px' }}>
                <div style={{ fontFamily: BRICO, fontSize: 19, fontWeight: 700, color: 'var(--ink)' }}>{c.name}</div>
                <div style={{ fontSize: 13.5, color: 'var(--muted2)', marginTop: 4 }}>{c.ex}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--acc)', marginTop: 12 }}>{c.from}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS (dark, matches design's --howGrad) */}
      <section id="how" style={{ position: 'relative', overflow: 'hidden', background: 'var(--howGrad)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: 'clamp(48px,6vw,84px) 22px' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--bandKicker)' }}>{t('landing.how.kicker')}</div>
            <h2 style={{ fontFamily: BRICO, fontSize: 'clamp(30px,4vw,44px)', fontWeight: 800, color: 'var(--bandInk)', margin: '10px 0 0', letterSpacing: '-.01em' }}>{t('landing.how.title')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24, marginTop: 44 }}>
            {steps.map((s, i) => (
              <div key={s.n} data-reveal={REVEAL_DIRS[i % 3]} style={{ textAlign: 'center', padding: 8 }}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    margin: '0 auto',
                    borderRadius: '50%',
                    background: 'var(--acc)',
                    color: 'var(--onacc)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: BRICO,
                    fontSize: 24,
                    fontWeight: 800,
                    boxShadow: '0 8px 20px rgba(122,79,192,.3)',
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontFamily: BRICO, fontSize: 21, fontWeight: 700, color: 'var(--bandInk)', marginTop: 18 }}>{s.t}</div>
                <div style={{ fontSize: 15, color: 'var(--bandMuted)', lineHeight: 1.55, marginTop: 8, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section style={{ maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: 'clamp(48px,6vw,80px) 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
          {values.map((v, i) => (
            <div key={v.t} data-reveal={REVEAL_DIRS[i % 3]} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 22, padding: 26 }}>
              <div aria-hidden="true" style={{ width: 48, height: 48, borderRadius: 14, background: v.bg, color: v.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{v.icon}</div>
              <div style={{ fontFamily: BRICO, fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginTop: 16 }}>{v.t}</div>
              <div style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.55, marginTop: 8 }}>{v.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOR PROS (dark) */}
      <section id="pros" style={{ background: 'var(--prosGrad)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: 'clamp(48px,6vw,88px) 22px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center' }}>
            <div data-reveal="left" style={{ flex: '1 1 440px', minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--bandKicker)' }}>{t('landing.pros.kicker')}</div>
              <h2 style={{ fontFamily: BRICO, fontSize: 'clamp(32px,4.6vw,52px)', fontWeight: 800, color: 'var(--bandInk)', margin: '12px 0 0', lineHeight: 1.04, letterSpacing: '-.01em' }}>
                {t('landing.pros.title')}
              </h2>
              <p style={{ fontSize: 'clamp(16px,1.8vw,19px)', color: 'var(--bandMuted)', lineHeight: 1.55, margin: '18px 0 0' }}>{t('landing.pros.sub')}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
                {prosBullets.map((b) => (
                  <span key={b} style={{ background: 'var(--bandChip)', color: 'var(--bandChipFg)', borderRadius: 12, padding: '10px 14px', fontSize: 14, fontWeight: 700 }}>
                    {b}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30, alignItems: 'center' }}>
                {/* This white/dark-text pill (not `var(--acc)`-based like the other CTAs) always sits on
                    the dark `--prosGrad` band regardless of the site's own light/dark mode, so it's kept
                    unchanged in light mode; only in dark mode does it pick up the theme's gradient CTA
                    fill (with the theme's dark on-accent ink for contrast) to match the other primary CTAs. */}
                <span
                  {...clickable(goLogin)}
                  className="dt-btn-ghost"
                  style={{ background: dark ? 'var(--accGrad)' : '#fff', color: dark ? 'var(--onacc)' : '#2a2430', borderRadius: 15, padding: '15px 26px', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}
                >
                  {t('landing.pros.cta')} <span aria-hidden="true">→</span>
                </span>
                <span style={{ color: 'var(--bandSoft)', fontSize: 14 }}>{t('landing.pros.note')}</span>
              </div>
            </div>
            <div data-reveal="right" style={{ flex: '1 1 340px', minWidth: 0 }}>
              <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 22, boxShadow: '0 30px 70px rgba(0,0,0,.42)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative', width: 52, height: 52, flex: 'none' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, overflow: 'hidden', background: 'var(--acc)' }}>
                      <svg aria-hidden="true" viewBox="0 0 64 64" style={{ width: '100%', height: '100%', display: 'block' }}>
                        <circle cx="32" cy="25" r="12" fill="rgba(255,255,255,.92)" />
                        <path d="M11 60c1-13 10-20 21-20s20 7 21 20z" fill="rgba(255,255,255,.92)" />
                      </svg>
                    </div>
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        right: -4,
                        bottom: -4,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'var(--okbg)',
                        color: 'var(--okfg)',
                        border: '2px solid var(--surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      ✓
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>{t('landing.pros.card.name')}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted2)' }}>{t('landing.pros.card.role')}</div>
                  </div>
                </div>
                <div style={{ marginTop: 18, background: 'var(--tint)', borderRadius: 18, padding: '16px 18px' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accInk)', letterSpacing: '.06em' }}>{t('landing.pros.card.earnLabel')}</div>
                  <div style={{ fontFamily: BRICO, fontSize: 34, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>{t('landing.pros.card.earn')}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 2 }}>{t('landing.pros.card.earnNote')}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <div style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px' }}>
                    <div style={{ fontFamily: BRICO, fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>{t('landing.pros.card.jobs')}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted2)', marginTop: 1 }}>{t('landing.pros.card.jobsLabel')}</div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px' }}>
                    <div style={{ fontFamily: BRICO, fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>★ {t('landing.pros.card.rating')}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted2)', marginTop: 1 }}>{t('landing.pros.card.ratingLabel')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--okbg)', borderRadius: 14, padding: '11px 14px', marginTop: 12 }}>
                  <span aria-hidden="true" style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', color: 'var(--okfg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flex: 'none' }}>✓</span>
                  <span style={{ fontSize: 12.5, color: 'var(--okfg)', fontWeight: 700 }}>{t('landing.pros.card.tax')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section id="app" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: 'clamp(48px,6vw,84px) 22px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg,var(--tint),var(--bg))',
            border: '1px solid var(--tintBd)',
            borderRadius: 28,
            padding: 'clamp(28px,4vw,52px)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 32,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div data-reveal="left" style={{ flex: '1 1 380px', minWidth: 0 }}>
            <h2 style={{ fontFamily: BRICO, fontSize: 'clamp(28px,3.6vw,40px)', fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-.01em' }}>{t('landing.app.title')}</h2>
            <p style={{ fontSize: 16.5, color: 'var(--muted)', lineHeight: 1.55, margin: '14px 0 0', maxWidth: 480 }}>{t('landing.app.sub')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
              <div {...clickable(install)} style={{ background: '#17141c', color: '#fff', borderRadius: 14, padding: '11px 20px', cursor: 'pointer' }}>
                <div style={{ fontSize: 10, color: '#a89fb8' }}>{t('landing.app.dlOn')}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>App Store</div>
              </div>
              <div {...clickable(install)} style={{ background: '#17141c', color: '#fff', borderRadius: 14, padding: '11px 20px', cursor: 'pointer' }}>
                <div style={{ fontSize: 10, color: '#a89fb8' }}>{t('landing.app.dlFrom')}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Google Play</div>
              </div>
            </div>
          </div>
          <div
            data-reveal="right"
            style={{
              flex: 'none',
              width: 150,
              height: 150,
              borderRadius: 32,
              background: 'linear-gradient(135deg,var(--acc),#9d6fd6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 44px rgba(74,52,102,.3)',
            }}
          >
            <svg aria-hidden="true" viewBox="0 0 48 48" style={{ width: 64, color: '#fff' }}>
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
