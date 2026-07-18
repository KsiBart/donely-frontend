import type { CSSProperties, MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo, Wordmark } from '../components/ui';
import { BRICO } from '../lib/format';
import { DarkModeToggle, LangToggle } from './shared';
import { useSiteTheme } from '../state/SiteThemeContext';

/** Anchor sections live only on `/` (hero id="top", #how, #cats, #pros, #app). From a subpage,
 * "jump" there by navigating home first and letting `Landing` pick up `location.state.scrollTo`
 * (see Landing.tsx's own effect) — matches donely-landing.dc.html's `goNav()` (which always reset
 * to the landing view, then set `location.hash`). */
export function useAnchorNav() {
  const navigate = useNavigate();
  const location = useLocation();
  return (anchor: string) => (e?: MouseEvent) => {
    e?.preventDefault();
    if (location.pathname === '/') {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: anchor } });
    }
  };
}

const navLink: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 11,
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--muted)',
  cursor: 'pointer',
};

/** Sticky blurred header — shared by the landing page AND every subpage (CLAUDE.md build brief
 * §1 "shared chrome"). Logo/Wordmark go home; nav anchors jump to the landing sections; PL/EN +
 * dark-mode toggles persist app-wide; "Sign in" always routes to the unified `/login`. */
const signinBtn: CSSProperties = {
  background: 'var(--accGrad)',
  color: 'var(--onacc)',
  borderRadius: 13,
  padding: '10px 18px',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(122,79,192,.32)',
  textAlign: 'center',
};

export function SiteHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const goAnchor = useAnchorNav();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [menuTop, setMenuTop] = useState(64);

  // Close the mobile menu on route change (e.g. after tapping "Sign in" or a subpage link).
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // The menu is a viewport-anchored fixed overlay (rendered OUTSIDE <header> so it can't widen it
  // and isn't offset by the header's overflow-clipped/centered layout). Anchor it to the header's
  // measured bottom edge on open.
  const toggleMenu = () => {
    setMenuOpen((open) => {
      if (!open && headerRef.current) setMenuTop(Math.round(headerRef.current.getBoundingClientRect().bottom));
      return !open;
    });
  };

  const navItems: { key: string; anchor: string }[] = [
    { key: 'landing.nav.how', anchor: 'how' },
    { key: 'landing.nav.cats', anchor: 'cats' },
    { key: 'landing.nav.pros', anchor: 'pros' },
  ];

  return (
    <>
      <header
        ref={headerRef}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--headbg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--headbd)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 18, padding: '14px 22px' }}>
        <a href="/#top" onClick={goAnchor('top')} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
          <Logo size={32} />
          <Wordmark size={23} />
        </a>
        {/* Desktop: inline nav + controls. Hidden below the hamburger breakpoint (landing.css). */}
        <nav className="dt-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginLeft: 8 }}>
          {navItems.map((n) => (
            <a key={n.anchor} href={`/#${n.anchor}`} onClick={goAnchor(n.anchor)} className="dt-nav-pill" style={navLink}>
              {t(n.key)}
            </a>
          ))}
        </nav>
        <div className="dt-nav-desktop" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <DarkModeToggle />
          <LangToggle />
          <span onClick={() => navigate('/login')} className="dt-btn-accent" style={signinBtn}>
            {t('landing.signin')}
          </span>
        </div>

        {/* Mobile: hamburger toggle (accent-tinted). Hidden at/above the breakpoint (landing.css). */}
        <button
          type="button"
          className="dt-hamburger"
          aria-label={t('landing.nav.menu', 'Menu')}
          aria-expanded={menuOpen}
          onClick={toggleMenu}
          style={{
            marginLeft: 'auto',
            background: 'var(--tint)',
            border: '1px solid var(--tintBd)',
            color: 'var(--acc)',
            borderRadius: 12,
            width: 42,
            height: 42,
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flex: 'none',
          }}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
        </div>
      </header>

      {/* Mobile dropdown menu — a viewport-anchored FIXED overlay rendered OUTSIDE <header> so it
          can't widen it (which was shifting the header) and isn't offset by its layout. */}
      {menuOpen && (
        <div className="dt-mobile-menu" style={{ top: menuTop }}>
          {navItems.map((n) => (
            <a
              key={n.anchor}
              href={`/#${n.anchor}`}
              onClick={(e) => {
                goAnchor(n.anchor)(e);
                setMenuOpen(false);
              }}
              className="dt-mobile-menu-link"
            >
              {t(n.key)}
            </a>
          ))}
          <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 2px' }}>
            <DarkModeToggle />
            <LangToggle />
          </div>
          <span onClick={() => navigate('/login')} className="dt-btn-accent" style={{ ...signinBtn, display: 'block', marginTop: 6 }}>
            {t('landing.signin')}
          </span>
        </div>
      )}
    </>
  );
}

/** Footer link targets — structural routing data (not copy), mirrors donely-landing.dc.html's
 * `footCols[].links[].{anchor|page}`. i18n only carries the visible `label` text; order must
 * stay in lockstep with `landing.footer.cols` in pl.json/en.json. */
const FOOT_LINK_TARGETS: { anchor?: string; path?: string }[][] = [
  [{ anchor: 'how' }, { anchor: 'cats' }, { path: '/pricing' }, { anchor: 'app' }],
  [{ path: '/about' }, { path: '/careers' }, { path: '/contact' }, { path: '/blog' }],
  [{ path: '/help' }, { path: '/safety' }, { path: '/terms' }, { path: '/privacy' }],
];

interface FootCol {
  h: string;
  links: string[];
}

/** Footer — 3 link columns + brand blurb + copyright, shared by landing AND every subpage. */
export function SiteFooter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const goAnchor = useAnchorNav();
  const footCols = t('landing.footer.cols', { returnObjects: true }) as FootCol[];

  return (
    <footer style={{ background: 'var(--band2)', borderTop: '1px solid var(--bandBd)', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box', padding: '44px 22px 30px', display: 'flex', flexWrap: 'wrap', gap: 30, justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <svg width="26" height="26" viewBox="0 0 48 48" style={{ color: 'var(--bandKicker)', flex: 'none' }}>
              <circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="4.5" />
              <path d="M15 24.5l6.5 6.5L34 18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M40 2l1.7 5.3L47 9l-5.3 1.7L40 16l-1.7-5.3L34 9l5.3-1.7z" fill="currentColor" opacity=".85" />
            </svg>
            <span style={{ fontFamily: BRICO, fontSize: 19, fontWeight: 800, color: 'var(--bandInk)' }}>
              Done<span style={{ color: 'var(--bandKicker)' }}>Ly</span>
              <span style={{ color: 'rgba(255,255,255,.45)', fontWeight: 700 }}>.app</span>
            </span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--bandSoft)', lineHeight: 1.55, margin: '12px 0 0', maxWidth: 280 }}>{t('landing.footer.tag')}</p>
        </div>
        {footCols.map((col, ci) => (
          <div key={col.h} style={{ flex: '1 1 160px', minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--bandInk)', marginBottom: 12 }}>{col.h}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {col.links.map((label, li) => {
                const target = FOOT_LINK_TARGETS[ci]?.[li] ?? {};
                const href = target.path ?? (target.anchor ? `/#${target.anchor}` : '/');
                return (
                  <a
                    key={label}
                    href={href}
                    className="dt-footer-link"
                    onClick={(e) => {
                      if (target.path) {
                        e.preventDefault();
                        navigate(target.path);
                      } else if (target.anchor) {
                        goAnchor(target.anchor)(e);
                      }
                    }}
                    style={{ fontSize: 14, color: 'var(--bandMuted)' }}
                  >
                    {label}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--bandBd)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 22px', fontSize: 13, color: 'var(--bandSoft)' }}>{t('landing.footer.copyright')}</div>
      </div>
    </footer>
  );
}

/** Shared page shell: `.dt` theme scope + gradient background + header/footer, min-height 100vh
 * flex column so the footer sticks to the bottom on short pages (subpages use this directly;
 * Landing.tsx composes the same pieces around its own hero/sections). */
export function SitePage({ children }: { children: React.ReactNode }) {
  return (
    <div className="dt" data-dk={useSiteDk()} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bgGrad)' }}>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

function useSiteDk(): '0' | '1' {
  const { dark } = useSiteTheme();
  return dark ? '1' : '0';
}
