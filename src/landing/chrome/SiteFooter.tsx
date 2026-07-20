import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Wordmark } from '../../components/ui';
import { useAnchorNav } from './useAnchorNav';

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
      <div className="max-w-300 mx-auto w-full box-border p-[44px_22px_30px] flex flex-wrap items-start gap-10">
        <div className="flex-[1_1_230px] min-w-0">
          <div className="flex items-center gap-2.25">
            <svg aria-hidden="true" width="26" height="26" viewBox="0 0 48 48" className="text-[var(--bandKicker)] flex-none">
              <circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="4.5" />
              <path d="M15 24.5l6.5 6.5L34 18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M40 2l1.7 5.3L47 9l-5.3 1.7L40 16l-1.7-5.3L34 9l5.3-1.7z" fill="currentColor" opacity=".85" />
            </svg>
            <Wordmark size={19} variant="onDark" />
          </div>
          <p className="text-sm text-[var(--bandSoft)] leading-[1.55] m-[12px_0_0] max-w-70">{t('landing.footer.tag')}</p>
        </div>
        <div className="flex-[2_1_460px] grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[26px_28px]">
          {footCols.map((col, ci) => (
            <div key={col.h} className="min-w-0">
              <div className="text-[13px] font-extrabold text-[var(--bandInk)] mb-3">{col.h}</div>
            <div className="flex flex-col gap-2.25">
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
        <div className="max-w-300 mx-auto p-[18px_22px] text-[13px] text-[var(--bandSoft)]">{t('landing.footer.copyright')}</div>
      </div>
    </footer>
  );
}
