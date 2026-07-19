import { useTranslation } from 'react-i18next';
import { clickable } from '../../lib/a11y';

/** App download CTA section — extracted verbatim from Landing.tsx. */
export function AppDownload({ install }: { install: () => void }) {
  const { t } = useTranslation();

  return (
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
  );
}
