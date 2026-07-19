import { useTranslation } from 'react-i18next';
import { clickable } from '../../lib/a11y';
import type { DoneView } from './useAuthFlow';

interface TermsStepProps {
  setDoneView: (v: DoneView) => void;
  acceptProTerms: () => void | Promise<void>;
  busy: boolean;
}

/** Auth flow: become-pro terms gate — extracted verbatim from AuthPage.tsx. */
export function TermsStep({ setDoneView, acceptProTerms, busy }: TermsStepProps) {
  const { t } = useTranslation();
  return (
    <div className="text-left animate-[dfade_0.3s_ease]">
      <span
        {...clickable(() => setDoneView('choice'))}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--acc)] cursor-pointer mb-[18px]"
      >
        <span aria-hidden="true">‹</span> {t('proTerms.back')}
      </span>
      <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(24px,3vw,30px)] font-extrabold text-[var(--ink)] m-0 tracking-[-0.01em]">
        {t('proTerms.title')}
      </h1>
      <p className="text-[14px] text-muted leading-[1.6] m-[14px_0_0] whitespace-pre-line">
        {t('proTerms.body')}
      </p>
      <div
        {...clickable(() => void acceptProTerms(), { disabled: busy })}
        className="mt-[22px] text-center rounded-2xl p-4 text-base font-extrabold cursor-pointer bg-[var(--accGrad)] text-[var(--onacc)] shadow-[0_8px_22px_rgba(122,79,192,.32)]"
      >
        {busy ? t('proTerms.accepting') : t('proTerms.accept')}
      </div>
      <div
        {...clickable(() => setDoneView('choice'), { disabled: busy })}
        className="mt-2.5 text-center text-sm font-bold text-muted2 cursor-pointer"
      >
        {t('proTerms.cancel')}
      </div>
    </div>
  );
}
