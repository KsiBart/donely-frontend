import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBrand } from '../brand';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { Logo } from '../components/ui';
import { BRICO } from '../lib/format';

type Step = 'welcome' | 'email' | 'code';

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: 'var(--surface2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 700,
        cursor: 'pointer',
        marginBottom: 26,
      }}
    >
      ‹
    </span>
  );
}

function MapBackdrop({ pinTop }: { pinTop?: boolean }) {
  const { t } = useTranslation();
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--map)' }}>
      <div
        style={{
          position: 'absolute',
          left: '-20%',
          top: '26%',
          width: '140%',
          height: 26,
          background: 'var(--road)',
          transform: 'rotate(-8deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '55%',
          top: '-10%',
          width: 22,
          height: '120%',
          background: 'var(--road)',
          transform: 'rotate(12deg)',
        }}
      />
      {pinTop && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '48%',
            transform: 'translate(-50%,-100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              background: 'var(--accent)',
              color: 'var(--onaccent)',
              borderRadius: 14,
              padding: '6px 12px',
              fontSize: 12.5,
              fontWeight: 700,
              boxShadow: 'var(--glow)',
            }}
          >
            {t('auth.location.pin')}
          </span>
          <span style={{ width: 3, height: 14, background: 'var(--accent)' }} />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'var(--accent)',
              animation: 'ptpulse 1.6s infinite',
            }}
          />
        </div>
      )}
      {!pinTop && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 20%, var(--bg) 62%)',
          }}
        />
      )}
    </div>
  );
}

export default function AuthFlow() {
  const { t } = useTranslation();
  const brand = useBrand();
  const { requestCode, verify } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>('welcome');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const emailOk = /.+@.+\..+/.test(email);
  const codeOk = code.replace(/\D/g, '').length === 8;

  const sendCode = async () => {
    if (!emailOk) {
      showToast(t('auth.email.invalid'));
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const res = await requestCode(email);
      setDevCode(res.devCode ?? null);
      setStep('code');
      showToast(t('auth.codeSentToast', { email }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('auth.email.sendFailed'));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    if (!codeOk) {
      showToast(t('auth.code.invalid'));
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      await verify(email, code);
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('auth.code.wrongCode'));
    } finally {
      setBusy(false);
    }
  };

  if (step === 'welcome') {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 28px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <MapBackdrop />
        <div style={{ position: 'relative', animation: 'dwfade .4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Logo size={44} />
            <span style={{ fontFamily: BRICO, fontSize: 26, fontWeight: 700 }}>{brand.appName}</span>
          </div>
          <div style={{ fontFamily: BRICO, fontSize: 30, fontWeight: 700, lineHeight: 1.15, marginBottom: 10 }}>
            {t('auth.welcome.titleLine1')}
            <br />
            {t('auth.welcome.titleLine2')}
          </div>
          <div style={{ fontSize: 14.5, color: 'var(--muted2)', lineHeight: 1.55, marginBottom: 26 }}>
            {t('auth.welcome.subtitle')}
          </div>
          <div
            onClick={() => setStep('email')}
            style={{
              textAlign: 'center',
              background: 'var(--accent)',
              color: 'var(--onaccent)',
              borderRadius: 18,
              padding: 15,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--glow)',
            }}
          >
            {t('auth.welcome.cta')}
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 14 }}>
            {t('auth.welcome.passwordless')}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'email') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '38px 28px 40px', animation: 'dwfade .3s ease' }}>
        <BackButton onClick={() => setStep('welcome')} />
        <div style={{ fontFamily: BRICO, fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{t('auth.email.title')}</div>
        <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 24 }}>
          {t('auth.email.subtitle')}
        </div>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void sendCode();
          }}
          placeholder={t('auth.email.placeholder')}
          type="email"
          autoFocus
          style={{
            width: '100%',
            boxSizing: 'border-box',
            borderRadius: 18,
            border: '1.5px solid var(--accent)',
            background: 'var(--surface)',
            color: 'var(--text)',
            padding: 16,
            font: "600 16px 'Figtree', sans-serif",
            outline: 'none',
          }}
        />
        <div
          onClick={() => void sendCode()}
          style={{
            marginTop: 14,
            textAlign: 'center',
            background: emailOk ? 'var(--accent)' : 'var(--surface2)',
            color: emailOk ? 'var(--onaccent)' : 'var(--navmuted)',
            borderRadius: 18,
            padding: 15,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {t('auth.email.cta')}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '38px 28px 40px', animation: 'dwfade .3s ease' }}>
      <BackButton onClick={() => setStep('email')} />
      <div style={{ fontFamily: BRICO, fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{t('auth.code.title')}</div>
      <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 24 }}>
        {t('auth.code.subtitle')} <b style={{ color: 'var(--text)' }}>{email || t('auth.code.placeholderEmail')}</b>
      </div>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void verifyCode();
        }}
        placeholder="────────"
        inputMode="numeric"
        autoFocus
        style={{
          width: '100%',
          boxSizing: 'border-box',
          borderRadius: 18,
          border: '1.5px solid var(--accent)',
          background: 'var(--surface)',
          color: 'var(--text)',
          padding: 16,
          font: "700 24px 'Figtree', sans-serif",
          letterSpacing: '.35em',
          textAlign: 'center',
          outline: 'none',
        }}
      />
      <div
        onClick={() => void verifyCode()}
        style={{
          marginTop: 14,
          textAlign: 'center',
          background: codeOk ? 'var(--accent)' : 'var(--surface2)',
          color: codeOk ? 'var(--onaccent)' : 'var(--navmuted)',
          borderRadius: 18,
          padding: 15,
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {t('auth.code.cta')}
      </div>
      <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--muted)', marginTop: 16 }}>
        {t('auth.code.resendPrompt')}{' '}
        <b style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => void sendCode()}>
          {t('auth.code.resend')}
        </b>
        {devCode ? t('auth.code.devCode', { code: devCode }) : ''}
      </div>
    </div>
  );
}

/** Post-login location ask ("Gdzie jesteś?") — shown until the profile has a location. */
export function LocationScreen() {
  const { t } = useTranslation();
  const { updateMe } = useAuth();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const shareLocation = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await updateMe({ locationLabel: 'Mokotów, Warszawa', lat: 52.1935, lng: 21.0355 });
      showToast(t('auth.location.setToast', { place: 'Mokotów' }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('auth.location.saveFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', animation: 'dwfade .3s ease' }}>
      <div style={{ flex: 1, position: 'relative', background: 'var(--map)', overflow: 'hidden' }}>
        <MapBackdrop pinTop />
      </div>
      <div
        style={{
          flex: 'none',
          padding: '22px 28px 44px',
          background: 'var(--surface)',
          borderRadius: '26px 26px 0 0',
          marginTop: -24,
          position: 'relative',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ fontFamily: BRICO, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{t('auth.location.title')}</div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 18 }}>
          {t('auth.location.subtitle')}
        </div>
        <div
          onClick={() => void shareLocation()}
          style={{
            textAlign: 'center',
            background: 'var(--accent)',
            color: 'var(--onaccent)',
            borderRadius: 18,
            padding: 14,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--glow)',
          }}
        >
          {t('auth.location.share')}
        </div>
        <div
          onClick={() => void shareLocation()}
          style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginTop: 12, cursor: 'pointer' }}
        >
          {t('auth.location.manual')}
        </div>
      </div>
    </div>
  );
}
