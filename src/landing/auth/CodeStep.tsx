import { useTranslation } from 'react-i18next';
import { clickable } from '../../lib/a11y';
import { OtpBoxes } from './OtpBoxes';

interface CodeStepProps {
  email: string;
  digits: string[];
  setDigits: (d: string[]) => void;
  codeFilled: boolean;
  busy: boolean;
  devCode: string | null;
  verifyCode: () => void | Promise<void>;
  sendCode: () => void | Promise<void>;
  onChangeEmail: () => void;
}

/** Auth flow: OTP code entry step — extracted verbatim from AuthPage.tsx. */
export function CodeStep({ email, digits, setDigits, codeFilled, busy, devCode, verifyCode, sendCode, onChangeEmail }: CodeStepProps) {
  const { t } = useTranslation();
  return (
    <div className="animate-[dfade_0.3s_ease]">
      <span
        {...clickable(onChangeEmail)}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--acc)] cursor-pointer mb-[18px]"
      >
        <span aria-hidden="true">‹</span> {t('landing.auth.code.changeEmail')}
      </span>
      <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(28px,3.4vw,36px)] font-extrabold text-[var(--ink)] m-0 tracking-[-0.01em]">
        {t('landing.auth.code.title')}
      </h1>
      <p className="text-[15.5px] text-muted leading-[1.5] m-[12px_0_0]">
        {t('landing.auth.code.subA')} <b className="text-[var(--ink)]">{email.trim()}</b>
      </p>
      <OtpBoxes digits={digits} setDigits={setDigits} />
      <div
        {...clickable(() => void verifyCode(), { disabled: !codeFilled || busy })}
        className="mt-[22px] text-center rounded-2xl p-4 text-base font-extrabold cursor-pointer"
        // eslint-disable-next-line react/no-inline-styles -- dynamic: enabled/disabled visual state depends on codeFilled
        style={{
          background: codeFilled ? 'var(--accGrad)' : 'var(--surface2)',
          color: codeFilled ? 'var(--onacc)' : 'var(--soft)',
          boxShadow: codeFilled ? '0 8px 22px rgba(122,79,192,.32)' : 'none',
        }}
      >
        {t('landing.auth.code.cta')}
      </div>
      <div className="text-center text-[13px] text-muted2 mt-4">
        {t('landing.auth.code.resendA')}{' '}
        <span {...clickable(() => void sendCode())} className="text-[var(--acc)] font-extrabold cursor-pointer">
          {t('landing.auth.code.resend')}
        </span>
      </div>
      {devCode && <div className="text-center text-xs text-[var(--bandMuted)] mt-1.5">{t('landing.auth.code.devHint', { code: devCode })}</div>}
    </div>
  );
}
