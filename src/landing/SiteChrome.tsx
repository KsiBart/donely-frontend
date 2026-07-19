import type { MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Logo, Wordmark } from '../components/ui';
import { DarkModeToggle, LangToggle } from './shared';
import { useSiteTheme } from '../state/SiteThemeContext';
import { clickable } from '../lib/a11y';

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

const navLink = 'py-2 px-3 rounded-[11px] text-sm font-semibold text-muted cursor-pointer';

/** Sticky blurred header — shared by the landing page AND every subpage (CLAUDE.md build brief
 * §1 "shared chrome"). Logo/Wordmark go home; nav anchors jump to the landing sections; PL/EN +
 * dark-mode toggles persist app-wide; "Sign in" always routes to the unified `/login`. */
const signinBtn =
  'bg-[var(--accGrad)] text-[var(--onacc)] rounded-[13px] p-[10px_18px] text-sm font-extrabold cursor-pointer shadow-[0_4px_14px_rgba(122,79,192,.32)] text-center';

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
  // Useful subpages surfaced in the mobile menu (from the footer's link set).
  const pageItems: { key: string; path: string }[] = [
    { key: 'landing.nav.pricing', path: '/pricing' },
    { key: 'landing.nav.about', path: '/about' },
    { key: 'landing.nav.help', path: '/help' },
    { key: 'landing.nav.contact', path: '/contact' },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 bg-[var(--headbg)] border-b border-[var(--headbd)]"
        // eslint-disable-next-line react/no-inline-styles -- vendor-prefix: keeps explicit -webkit-backdrop-filter for older Safari; not guaranteed emitted by the Tailwind backdrop-blur utility under this build's target
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-[1200px] mx-auto flex items-center gap-[18px] p-[14px_22px]">
        <a href="/#top" onClick={goAnchor('top')} className="flex items-center gap-[10px] flex-none">
          <Logo size={32} />
          <Wordmark size={23} />
        </a>
        {/* Desktop: inline nav + controls. Hidden below the hamburger breakpoint (landing.css). */}
        <nav className="dt-nav-desktop flex items-center gap-1 flex-wrap ml-2">
          {navItems.map((n) => (
            <a key={n.anchor} href={`/#${n.anchor}`} onClick={goAnchor(n.anchor)} className={clsx('dt-nav-pill', navLink)}>
              {t(n.key)}
            </a>
          ))}
        </nav>
        <div className="dt-nav-desktop ml-auto flex items-center gap-[10px]">
          <DarkModeToggle />
          <LangToggle />
          <span {...clickable(() => navigate('/login'))} className={clsx('dt-btn-accent', signinBtn)}>
            {t('landing.signin')}
          </span>
        </div>

        {/* Mobile: hamburger toggle (accent-tinted). Hidden at/above the breakpoint (landing.css). */}
        <button
          type="button"
          className="dt-hamburger ml-auto bg-transparent border-none p-1 text-[var(--acc)] w-11 h-11 items-center justify-center cursor-pointer flex-none"
          aria-label={t('landing.nav.menu', 'Menu')}
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          {menuOpen ? (
            <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
        </div>
      </header>

      {/* Mobile dropdown menu — a viewport-anchored FIXED overlay rendered OUTSIDE <header> so it
          can't widen it (which was shifting the header) and isn't offset by its layout. */}
      {menuOpen && (
        <div
          className="dt-mobile-menu"
          // eslint-disable-next-line react/no-inline-styles -- dynamic: measured from the header's DOM position when the menu opens
          style={{ top: menuTop }}
        >
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
          {pageItems.map((p) => (
            <a
              key={p.path}
              href={p.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(p.path);
                setMenuOpen(false);
              }}
              className="dt-mobile-menu-link"
            >
              {t(p.key)}
            </a>
          ))}
          <div className="h-px bg-border m-[6px_0]" />
          <div className="flex items-center gap-3 p-[4px_2px]">
            <DarkModeToggle />
            <LangToggle />
          </div>
          <span {...clickable(() => navigate('/login'))} className={clsx('dt-btn-accent', signinBtn, 'block mt-1.5')}>
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
    <footer className="bg-[var(--band2)] border-t border-[var(--bandBd)] mt-auto">
      <div className="max-w-[1200px] mx-auto w-full box-border p-[44px_22px_30px] flex flex-wrap items-start gap-10">
        <div className="flex-[1_1_230px] min-w-0">
          <div className="flex items-center gap-[9px]">
            <svg aria-hidden="true" width="26" height="26" viewBox="0 0 48 48" className="text-[var(--bandKicker)] flex-none">
              <circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="4.5" />
              <path d="M15 24.5l6.5 6.5L34 18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M40 2l1.7 5.3L47 9l-5.3 1.7L40 16l-1.7-5.3L34 9l5.3-1.7z" fill="currentColor" opacity=".85" />
            </svg>
            <Wordmark size={19} variant="onDark" />
          </div>
          <p className="text-sm text-[var(--bandSoft)] leading-[1.55] m-[12px_0_0] max-w-[280px]">{t('landing.footer.tag')}</p>
        </div>
        <div className="flex-[2_1_460px] grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[26px_28px]">
          {footCols.map((col, ci) => (
            <div key={col.h} className="min-w-0">
              <div className="text-[13px] font-extrabold text-[var(--bandInk)] mb-3">{col.h}</div>
            <div className="flex flex-col gap-[9px]">
              {col.links.map((label, li) => {
                const target = FOOT_LINK_TARGETS[ci]?.[li] ?? {};
                const href = target.path ?? (target.anchor ? `/#${target.anchor}` : '/');
                return (
                  <a
                    key={label}
                    href={href}
                    className="dt-footer-link text-sm text-[var(--bandMuted)]"
                    onClick={(e) => {
                      if (target.path) {
                        e.preventDefault();
                        navigate(target.path);
                      } else if (target.anchor) {
                        goAnchor(target.anchor)(e);
                      }
                    }}
                  >
                    {label}
                  </a>
                );
              })}
            </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-[var(--bandBd)]">
        <div className="max-w-[1200px] mx-auto p-[18px_22px] text-[13px] text-[var(--bandSoft)]">{t('landing.footer.copyright')}</div>
      </div>
    </footer>
  );
}

/** Shared page shell: `.dt` theme scope + gradient background + header/footer, min-height 100vh
 * flex column so the footer sticks to the bottom on short pages (subpages use this directly;
 * Landing.tsx composes the same pieces around its own hero/sections). */
export function SitePage({ children }: { children: React.ReactNode }) {
  return (
    <div className="dt min-h-screen flex flex-col bg-[var(--bgGrad)]" data-dk={useSiteDk()}>
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
