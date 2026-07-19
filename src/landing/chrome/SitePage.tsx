import { useSiteTheme } from '../../state/SiteThemeContext';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

function useSiteDk(): '0' | '1' {
  const { dark } = useSiteTheme();
  return dark ? '1' : '0';
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
