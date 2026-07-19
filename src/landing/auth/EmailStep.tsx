import { useTranslation } from 'react-i18next';
import { clickable } from '../../lib/a11y';

interface EmailStepProps {
  email: string;
  setEmail: (v: string) => void;
  emailOk: boolean;
  busy: boolean;
  sendCode: () => void | Promise<void>;
}

/** Auth flow: email entry step — extracted verbatim from AuthPage.tsx. */
export function EmailStep({ email, setEmail, emailOk, busy, sendCode }: EmailStepProps) {
  const { t } = useTranslation();
  return (
    <div className="animate-[dfade_0.3s_ease]">
      <h1 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(28px,3.4vw,36px)] font-extrabold text-[var(--ink)] m-0 tracking-[-0.01em]">
        {t('landing.auth.email.title')}
      </h1>
      <p className="text-[15.5px] text-muted leading-[1.5] m-[12px_0_0]">{t('landing.auth.email.sub')}</p>
      <label htmlFor="auth-email-input" className="block text-[12.5px] font-extrabold tracking-[.05em] uppercase text-muted2 m-[28px_0_8px]">
        {t('landing.auth.email.label')}
      </label>
      <input
        id="auth-email-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void sendCode();
        }}
        type="email"
        autoFocus
        placeholder={t('landing.auth.email.placeholder')}
        className="w-full box-border rounded-2xl border-[1.5px] border-[var(--acc)] bg-surface text-[var(--ink)] p-4 font-semibold text-base font-['Figtree',sans-serif] outline-none"
      />
      <div
        {...clickable(() => void sendCode(), { disabled: !emailOk || busy })}
        className="mt-[14px] text-center rounded-2xl p-4 text-base font-extrabold cursor-pointer"
        // eslint-disable-next-line react/no-inline-styles -- dynamic: enabled/disabled visual state depends on emailOk
        style={{
          background: emailOk ? 'var(--accGrad)' : 'var(--surface2)',
          color: emailOk ? 'var(--onacc)' : 'var(--soft)',
          boxShadow: emailOk ? '0 8px 22px rgba(122,79,192,.32)' : 'none',
        }}
      >
        {t('landing.auth.email.cta')}
      </div>
      <div className="text-[12.5px] text-[var(--soft)] text-center mt-4 leading-[1.5]">{t('landing.auth.email.legal')}</div>
    </div>
  );
}
