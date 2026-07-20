import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../state/ToastContext';
import { useSiteTheme } from '../state/SiteThemeContext';
import { useInstallAction } from '../components/AppPromo';
import { SiteFooter, SiteHeader } from './chrome';
import { useParallax, useScrollReveal } from './effects';
import { ToastBubble } from './shared';
import { Hero } from './sections/Hero';
import { TrustStrip } from './sections/TrustStrip';
import { Categories } from './sections/Categories';
import { HowItWorks } from './sections/HowItWorks';
import { ValueProps } from './sections/ValueProps';
import { ForPros } from './sections/ForPros';
import { AppDownload } from './sections/AppDownload';

/**
 * Marketing landing page (donely-landing.dc.html `isLanding` branch). Rendered at `/` for
 * unauthenticated visitors — full-bleed, outside the app's .mobile-shell/.desktop-shell chrome.
 * Shares header/footer with the 9 subpages (SiteChrome), supports the `.dt` dark-mode token set,
 * and ports the design's vanilla-JS effects (scroll-reveal, hero-blob parallax, floating card,
 * cycling "matched by AI" scenarios) into React hooks/refs.
 *
 * Composed from section components in `./sections/` (Hero, TrustStrip, Categories, HowItWorks,
 * ValueProps, ForPros, AppDownload) — each section owns its own i18n data + markup; this file only
 * owns the page-level effects (deep-link scroll, parallax, scroll-reveal) and shared callbacks.
 */
export default function Landing() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { dark } = useSiteTheme();
  const install = useInstallAction();

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

  const goLogin = () => navigate('/login');

  return (
    <div className="dt min-h-screen flex flex-col bg-[var(--bgGrad)]" data-dk={dark ? '1' : '0'}>
      <SiteHeader />

      <Hero goLogin={goLogin} />
      <TrustStrip />
      <Categories goLogin={goLogin} />
      <HowItWorks />
      <ValueProps />
      <ForPros goLogin={goLogin} dark={dark} />
      <AppDownload install={install} />

      <SiteFooter />
      <ToastBubble toast={toast} />
    </div>
  );
}
