import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/ui';
import { useBrand } from '../brand';
import { BRICO } from '../lib/format';
import { clickable } from '../lib/a11y';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';

const INPUT_CLASS =
  'w-full box-border rounded-[14px] border-[1.5px] border-accent bg-surface p-3.5 text-text outline-none';

const CTA_CLASS = 'mt-3.5 cursor-pointer rounded-[14px] p-[13px] text-center text-[14px] font-bold';

const BRICO_STYLE = { fontFamily: BRICO };

/** Same passwordless OTP login as the app, styled for the desktop CRM (admin@donely.app). */
export default function AdminLogin() {
  const { t } = useTranslation();
  const brand = useBrand();
  const { requestCode, verify } = useAuth();
  const { toast, showToast } = useToast();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const emailOk = /.+@.+\..+/.test(email);
  const codeOk = code.replace(/\D/g, '').length === 8;

  const sendCode = async () => {
    if (!emailOk) {
      showToast(t('admin.login.invalidEmail'));
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const res = await requestCode(email);
      setDevCode(res.devCode ?? null);
      setStep('code');
      showToast(t('admin.login.codeSentToast', { email }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('admin.login.sendFailed'));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    if (!codeOk) {
      showToast(t('admin.login.invalidCode'));
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      await verify(email, code);
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('admin.login.wrongCode'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="w-[400px] rounded-[20px] bg-surface px-9 py-8 shadow-[var(--shadow)]">
        <div className="mb-[22px] flex items-center gap-[9px]">
          <Logo size={34} />
          <div>
            {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO_STYLE is a shared font-family constant with no Tailwind token mapping */}
            <div className="text-[15px] font-bold" style={BRICO_STYLE}>
              {brand.appName}
            </div>
            <div className="text-[10.5px] font-semibold text-muted">{t('admin.common.panelLabel')}</div>
          </div>
        </div>
        {step === 'email' ? (
          <>
            {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO_STYLE is a shared font-family constant with no Tailwind token mapping */}
            <h1 className="mb-2 text-[22px] font-bold" style={BRICO_STYLE}>
              {t('admin.login.emailTitle')}
            </h1>
            <div className="mb-5 text-[13.5px] leading-[1.5] text-muted">{t('admin.login.emailSubtitle')}</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void sendCode();
              }}
              placeholder={t('admin.login.emailPlaceholder') ?? ''}
              aria-label={t('admin.login.emailTitle') ?? ''}
              type="email"
              autoFocus
              className={clsx(INPUT_CLASS, 'font-[Figtree,sans-serif] text-[15px] font-semibold')}
            />
            <div
              {...clickable(() => void sendCode())}
              className={clsx(CTA_CLASS, emailOk ? 'bg-accent text-white' : 'bg-surface2 text-[var(--navmuted)]')}
            >
              {t('admin.login.sendCode')}
            </div>
          </>
        ) : (
          <>
            {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO_STYLE is a shared font-family constant with no Tailwind token mapping */}
            <h1 className="mb-2 text-[22px] font-bold" style={BRICO_STYLE}>
              {t('admin.login.codeTitle')}
            </h1>
            <div className="mb-5 text-[13.5px] leading-[1.5] text-muted">
              {t('admin.login.codeSubtitle')} <b className="text-text">{email}</b>
            </div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void verifyCode();
              }}
              placeholder="────────"
              aria-label={t('admin.login.codeTitle') ?? ''}
              inputMode="numeric"
              autoFocus
              className={clsx(INPUT_CLASS, 'font-[Figtree,sans-serif] text-center text-[22px] font-bold tracking-[.35em]')}
            />
            <div
              {...clickable(() => void verifyCode())}
              className={clsx(CTA_CLASS, codeOk ? 'bg-accent text-white' : 'bg-surface2 text-[var(--navmuted)]')}
            >
              {t('admin.login.loginCta')}
            </div>
            <div className="mt-3.5 text-center text-[12.5px] text-muted">
              {t('admin.login.resendPrompt')}{' '}
              <b className="cursor-pointer text-accent" {...clickable(() => void sendCode())}>
                {t('admin.login.resend')}
              </b>
              {devCode ? t('admin.login.devCode', { code: devCode }) : ''}
            </div>
          </>
        )}
        {toast && (
          <div className="fixed bottom-7 left-1/2 z-20 -translate-x-1/2 animate-[crmfade_.25s_ease] rounded-[14px] bg-[#2a2430] px-5 py-3 text-[13px] font-semibold text-[#faf7f2]">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
