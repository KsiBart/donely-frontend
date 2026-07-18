import { useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/ui';
import { useBrand } from '../brand';
import { BRICO } from '../lib/format';
import { clickable } from '../lib/a11y';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';

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

  const inputStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 14,
    border: '1.5px solid var(--accent)',
    background: 'var(--surface)',
    color: 'var(--text)',
    padding: 14,
    outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 400, background: 'var(--surface)', borderRadius: 20, boxShadow: 'var(--shadow)', padding: '32px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22 }}>
          <Logo size={34} />
          <div>
            <div style={{ fontFamily: BRICO, fontSize: 15, fontWeight: 700 }}>{brand.appName}</div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 600 }}>{t('admin.common.panelLabel')}</div>
          </div>
        </div>
        {step === 'email' ? (
          <>
            <h1 style={{ fontFamily: BRICO, fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>{t('admin.login.emailTitle')}</h1>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 20 }}>
              {t('admin.login.emailSubtitle')}
            </div>
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
              style={{ ...inputStyle, font: "600 15px 'Figtree', sans-serif" }}
            />
            <div
              {...clickable(() => void sendCode())}
              style={{
                marginTop: 14,
                textAlign: 'center',
                background: emailOk ? 'var(--accent)' : 'var(--surface2)',
                color: emailOk ? '#fff' : 'var(--navmuted)',
                borderRadius: 14,
                padding: 13,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t('admin.login.sendCode')}
            </div>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: BRICO, fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>{t('admin.login.codeTitle')}</h1>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 20 }}>
              {t('admin.login.codeSubtitle')} <b style={{ color: 'var(--text)' }}>{email}</b>
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
              style={{ ...inputStyle, font: "700 22px 'Figtree', sans-serif", letterSpacing: '.35em', textAlign: 'center' }}
            />
            <div
              {...clickable(() => void verifyCode())}
              style={{
                marginTop: 14,
                textAlign: 'center',
                background: codeOk ? 'var(--accent)' : 'var(--surface2)',
                color: codeOk ? '#fff' : 'var(--navmuted)',
                borderRadius: 14,
                padding: 13,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t('admin.login.loginCta')}
            </div>
            <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--muted)', marginTop: 14 }}>
              {t('admin.login.resendPrompt')}{' '}
              <b style={{ color: 'var(--accent)', cursor: 'pointer' }} {...clickable(() => void sendCode())}>
                {t('admin.login.resend')}
              </b>
              {devCode ? t('admin.login.devCode', { code: devCode }) : ''}
            </div>
          </>
        )}
        {toast && (
          <div
            style={{
              position: 'fixed',
              left: '50%',
              bottom: 28,
              transform: 'translateX(-50%)',
              background: '#2a2430',
              color: '#faf7f2',
              borderRadius: 14,
              padding: '12px 20px',
              fontSize: 13,
              fontWeight: 600,
              animation: 'crmfade .25s ease',
              zIndex: 20,
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
