import { useTranslation } from 'react-i18next';

interface StatItem {
  v: string;
  k: string;
}

/** Trust strip (dark band with stats) — extracted verbatim from Landing.tsx. */
export function TrustStrip() {
  const { t } = useTranslation();
  const stats = t('landing.stats', { returnObjects: true }) as StatItem[];

  return (
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
  );
}
