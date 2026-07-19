import { useTranslation } from 'react-i18next';
import { REVEAL_DIRS } from './constants';

interface ValueItem {
  icon: string;
  bg: string;
  fg: string;
  t: string;
  d: string;
}

/** Value props grid section — extracted verbatim from Landing.tsx. */
export function ValueProps() {
  const { t } = useTranslation();
  const values = t('landing.values', { returnObjects: true }) as ValueItem[];

  return (
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
  );
}
