import { useTranslation } from 'react-i18next';
import { clickable } from '../../lib/a11y';

interface ChoiceStepProps {
  enterAsStandard: () => void;
  enterAsPro: () => void;
  onBack: () => void;
}

/** Auth flow: post-verify success + customer/pro choice step — extracted verbatim from AuthPage.tsx. */
export function ChoiceStep({ enterAsStandard, enterAsPro, onBack }: ChoiceStepProps) {
  const { t } = useTranslation();
  return (
    <div className="text-center animate-[dfade_0.4s_ease]">
      <div
        aria-hidden="true"
        className="w-[88px] h-[88px] mx-auto rounded-full bg-[var(--okbg)] text-[var(--okfg)] flex items-center justify-center text-[42px] font-extrabold"
      >
        ✓
      </div>
      <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(28px,3.4vw,36px)] font-extrabold text-[var(--ink)] m-[22px_0_0]">
        {t('landing.auth.done.title')}
      </h1>
      <p className="text-[15.5px] text-muted leading-[1.55] m-[12px_0_18px]">{t('landing.auth.done.sub')}</p>
      <p className="text-[12.5px] font-extrabold tracking-[.03em] uppercase text-[var(--soft)] mb-2.5">
        {t('landing.auth.done.chooseTitle')}
      </p>
      <div
        {...clickable(enterAsStandard)}
        className="text-center bg-[var(--accGrad)] text-[var(--onacc)] rounded-2xl p-4 text-base font-extrabold cursor-pointer shadow-[0_8px_22px_rgba(122,79,192,.32)]"
      >
        {t('landing.auth.done.standardCta')} <span aria-hidden="true">→</span>
      </div>
      <div
        {...clickable(enterAsPro)}
        className="mt-2.5 text-center bg-surface text-[var(--ink)] border-[1.5px] border-[var(--acc)] rounded-2xl p-4 text-base font-extrabold cursor-pointer"
      >
        {t('landing.auth.done.proCta')}
      </div>
      <div {...clickable(onBack)} className="mt-[14px] text-sm font-bold text-[var(--acc)] cursor-pointer">
        {t('landing.auth.done.back')}
      </div>
    </div>
  );
}
