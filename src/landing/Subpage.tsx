import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clickable } from '../lib/a11y';
import { SiteFooter, SiteHeader } from './chrome';
import { useSiteTheme } from '../state/SiteThemeContext';
import type { PageData } from './subpage/types';
import { BlockRenderer } from './subpage/BlockRenderer';

/**
 * Generic subpage renderer (donely-landing.dc.html `isPage` branch) — one component drives all 9
 * marketing subpages, content-driven from `landing.pages.<key>` (i18n, both langs, identical
 * shape). Shares the same header/footer as the landing page (CLAUDE.md build brief §1) and stays
 * viewable whether the visitor is logged in or out (mounted as a top-level route in App.tsx, not
 * nested inside the authenticated app shell).
 *
 * Per-block markup lives in `./subpage/` (CardsBlock, ListBlock, PostsBlock, FaqBlock, DocBlock,
 * ContactForm) behind the shared `BlockRenderer` dispatcher.
 */
export default function Subpage({ pageKey }: { pageKey: string }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { dark } = useSiteTheme();
  const page = t(`landing.pages.${pageKey}`, { returnObjects: true }) as PageData;

  useEffect(() => {
    const se = document.scrollingElement || document.documentElement;
    if (se) se.scrollTop = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, i18n.language]);

  return (
    <div className="dt min-h-screen flex flex-col bg-[var(--bgGrad)]" data-dk={dark ? '1' : '0'}>
      <SiteHeader />

      <section className="bg-[var(--tint)] border-b border-border">
        <div className="max-w-[920px] mx-auto p-[clamp(36px,5vw,64px)_22px]">
          <span
            {...clickable(() => navigate('/'))}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--acc)] cursor-pointer"
          >
            <span aria-hidden="true">‹</span> {t('landing.backHome')}
          </span>
          <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(34px,5vw,52px)] font-extrabold text-[var(--ink)] m-[14px_0_0] tracking-[-0.01em]">
            {page.title}
          </h1>
          <p className="text-[16.5px] text-muted m-[12px_0_0] max-w-[640px] leading-[1.55]">{page.sub}</p>
        </div>
      </section>

      <section className="max-w-[920px] mx-auto w-full box-border p-[clamp(30px,4vw,48px)_22px_80px] flex flex-col gap-10 flex-1">
        {page.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </section>

      <SiteFooter />
    </div>
  );
}
