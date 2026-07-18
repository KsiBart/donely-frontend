import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo, Wordmark } from '../components/ui';
import { BRICO } from '../lib/format';
import { useAuth } from '../state/AuthContext';
import { useSiteTheme } from '../state/SiteThemeContext';
import { useToast } from '../state/ToastContext';
import { DarkModeToggle, LangToggle, ToastBubble } from './shared';

type Step = 'email' | 'code' | 'done';
const EMPTY_DIGITS = () => Array(8).fill('');

/**
 * 8 single-digit OTP boxes — auto-advance on input, backspace moves to the previous box when
 * empty, paste fills across boxes. Ported 1:1 from donely-landing.dc.html's otpBoxes
 * onInput/onKeyDown/onPaste logic (React uses onChange in place of onInput — same native
 * `input` event under the hood for text inputs, identical behavior).
 */
function OtpBoxes({ digits, setDigits }: { digits: string[]; setDigits: (d: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focusBox = (i: number) => {
    const el = refs.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 'clamp(5px,1.4vw,10px)', marginTop: 26, justifyContent: 'space-between' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          inputMode="numeric"
          maxLength={1}
          onChange={(e) => {
            const v = (e.target.value || '').replace(/[^0-9]/g, '');
            const next = [...digits];
            if (v.length > 1) {
              for (let k = 0; k < v.length && i + k < 8; k++) next[i + k] = v[k];
              setDigits(next);
              setTimeout(() => focusBox(Math.min(i + v.length, 7)), 0);
              return;
            }
            next[i] = v;
            setDigits(next);
            if (v && i < 7) setTimeout(() => focusBox(i + 1), 0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i] && i > 0) {
              e.preventDefault();
              const next = [...digits];
              next[i - 1] = '';
              setDigits(next);
              setTimeout(() => focusBox(i - 1), 0);
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const txt = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '');
            if (!txt) return;
            const next = [...digits];
            for (let k = 0; k < txt.length && i + k < 8; k++) next[i + k] = txt[k];
            setDigits(next);
            setTimeout(() => focusBox(Math.min(i + txt.length, 7)), 0);
          }}
          style={{
            width: '100%',
            minWidth: 0,
            aspectRatio: '3/4',
            boxSizing: 'border-box',
            textAlign: 'center',
            borderRadius: 14,
            border: `1.5px solid ${d ? 'var(--acc)' : 'var(--border2)'}`,
            background: 'var(--surface)',
            color: 'var(--ink)',
            font: "800 clamp(20px,3vw,26px) 'Figtree', sans-serif",
            outline: 'none',
            padding: 0,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Split-panel auth flow (donely-landing.dc.html `isAuth` branch) — REPLACES the old
 * mobile/AuthFlow.tsx centered-card login. Mounted at `/login`; fully responsive on its own
 * (flex-wrap, matching the design) rather than the app's .mobile-shell/.desktop-shell chrome.
 * Steps: email -> 8-box OTP -> success, wired to the real `POST /api/auth/request-code` /
 * `POST /api/auth/verify` via useAuth(); token storage is the existing AuthContext mechanism.
 */
export default function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { me, requestCode, verify } = useAuth();
  const { toast, showToast } = useToast();
  const { dark } = useSiteTheme();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState<string[]>(EMPTY_DIGITS);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Bounce away if a session already exists when this page is first shown (e.g. a direct nav
  // to /login while already logged in). Guarded by `step === 'email'` so a FRESH verify() within
  // this same mount — which also sets `me` — never triggers this: by the time it resolves,
  // `step` has already moved to 'done' in the same batched update, so the success screen shows.
  useEffect(() => {
    if (me && step === 'email') navigate('/', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const codeFilled = digits.join('').length === 8;
  const authChips = t('landing.auth.chips', { returnObjects: true }) as string[];

  const backToSite = () => navigate('/');

  const sendCode = async () => {
    if (!emailOk || busy) return;
    setBusy(true);
    try {
      const res = await requestCode(email.trim());
      setDevCode(res.devCode ?? null);
      setDigits(EMPTY_DIGITS());
      setStep('code');
      showToast(t('landing.auth.code.codeSentToast', { email: email.trim() }));
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('landing.auth.email.sendFailed'));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    if (!codeFilled || busy) return;
    setBusy(true);
    try {
      await verify(email.trim(), digits.join(''));
      setStep('done');
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('landing.auth.code.wrongCode'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dt" data-dk={dark ? '1' : '0'} style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', background: 'var(--bg)' }}>
      {/* BRAND PANEL — second (right on desktop) via order; dark orange↔purple gradient. */}
      <div
        style={{
          order: 2,
          flex: '1 1 440px',
          minHeight: 'clamp(200px,32vh,100vh)',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(140deg,#14101a 0%,#2f1c30 38%,#6b3348 70%,var(--acc) 118%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(28px,4vw,56px)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, background: 'repeating-linear-gradient(45deg,#c3a7e6,#c3a7e6 7px,#b599dc 7px,#b599dc 14px)' }} />
        <div style={{ position: 'absolute', right: -120, bottom: -140, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,77,.28), transparent 68%)' }} />
        <div style={{ position: 'absolute', right: -90, top: -90, width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,255,255,.12)' }} />
        <span
          onClick={backToSite}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', width: 'fit-content' }}
        >
          <Logo size={36} />
          <Wordmark size={24} variant="onDark" />
        </span>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: BRICO, fontSize: 'clamp(26px,3.4vw,40px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-.01em' }}>
            {t('landing.auth.brandTitle')}
          </div>
          <div style={{ fontSize: 'clamp(15px,1.6vw,18px)', color: 'rgba(255,255,255,.9)', lineHeight: 1.5, marginTop: 14, maxWidth: 420 }}>
            {t('landing.auth.brandSub')}
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {authChips.map((c) => (
            <span key={c} style={{ background: 'rgba(255,255,255,.18)', color: '#fff', borderRadius: 11, padding: '8px 12px', fontSize: 13, fontWeight: 700 }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* FORM PANEL — first (left on desktop) via order. */}
      <div style={{ order: 1, flex: '1 1 440px', display: 'flex', flexDirection: 'column', padding: 'clamp(24px,4vw,48px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span onClick={backToSite} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 700, color: 'var(--acc)', cursor: 'pointer' }}>
            ‹ {t('landing.backHome')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <DarkModeToggle />
            <LangToggle />
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 460, width: '100%', margin: '0 auto', padding: '24px 0' }}>
          {step === 'email' && (
            <div style={{ animation: 'dfade .3s ease' }}>
              <h1 style={{ fontFamily: BRICO, fontSize: 'clamp(28px,3.4vw,36px)', fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-.01em' }}>
                {t('landing.auth.email.title')}
              </h1>
              <p style={{ fontSize: 15.5, color: 'var(--muted)', lineHeight: 1.5, margin: '12px 0 0' }}>{t('landing.auth.email.sub')}</p>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted2)', margin: '28px 0 8px' }}>
                {t('landing.auth.email.label')}
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void sendCode();
                }}
                type="email"
                autoFocus
                placeholder={t('landing.auth.email.placeholder')}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: 16,
                  border: '1.5px solid var(--acc)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
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
                  background: emailOk ? 'var(--accGrad)' : 'var(--surface2)',
                  color: emailOk ? 'var(--onacc)' : 'var(--soft)',
                  borderRadius: 16,
                  padding: 16,
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: emailOk ? '0 8px 22px rgba(122,79,192,.32)' : 'none',
                }}
              >
                {t('landing.auth.email.cta')}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--soft)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>{t('landing.auth.email.legal')}</div>
            </div>
          )}

          {step === 'code' && (
            <div style={{ animation: 'dfade .3s ease' }}>
              <span
                onClick={() => setStep('email')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: 'var(--acc)', cursor: 'pointer', marginBottom: 18 }}
              >
                ‹ {t('landing.auth.code.changeEmail')}
              </span>
              <h1 style={{ fontFamily: BRICO, fontSize: 'clamp(28px,3.4vw,36px)', fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-.01em' }}>
                {t('landing.auth.code.title')}
              </h1>
              <p style={{ fontSize: 15.5, color: 'var(--muted)', lineHeight: 1.5, margin: '12px 0 0' }}>
                {t('landing.auth.code.subA')} <b style={{ color: 'var(--ink)' }}>{email.trim()}</b>
              </p>
              <OtpBoxes digits={digits} setDigits={setDigits} />
              <div
                onClick={() => void verifyCode()}
                style={{
                  marginTop: 22,
                  textAlign: 'center',
                  background: codeFilled ? 'var(--accGrad)' : 'var(--surface2)',
                  color: codeFilled ? 'var(--onacc)' : 'var(--soft)',
                  borderRadius: 16,
                  padding: 16,
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: codeFilled ? '0 8px 22px rgba(122,79,192,.32)' : 'none',
                }}
              >
                {t('landing.auth.code.cta')}
              </div>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted2)', marginTop: 16 }}>
                {t('landing.auth.code.resendA')}{' '}
                <span onClick={() => void sendCode()} style={{ color: 'var(--acc)', fontWeight: 800, cursor: 'pointer' }}>
                  {t('landing.auth.code.resend')}
                </span>
              </div>
              {devCode && <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--bandMuted)', marginTop: 6 }}>{t('landing.auth.code.devHint', { code: devCode })}</div>}
            </div>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', animation: 'dfade .4s ease' }}>
              <div
                style={{
                  width: 88,
                  height: 88,
                  margin: '0 auto',
                  borderRadius: '50%',
                  background: 'var(--okbg)',
                  color: 'var(--okfg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 42,
                  fontWeight: 800,
                }}
              >
                ✓
              </div>
              <h1 style={{ fontFamily: BRICO, fontSize: 'clamp(28px,3.4vw,36px)', fontWeight: 800, color: 'var(--ink)', margin: '22px 0 0' }}>
                {t('landing.auth.done.title')}
              </h1>
              <p style={{ fontSize: 15.5, color: 'var(--muted)', lineHeight: 1.55, margin: '12px 0 26px' }}>{t('landing.auth.done.sub')}</p>
              <div
                onClick={() => navigate('/')}
                style={{ textAlign: 'center', background: 'var(--accGrad)', color: 'var(--onacc)', borderRadius: 16, padding: 16, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 22px rgba(122,79,192,.32)' }}
              >
                {t('landing.auth.done.cta')} →
              </div>
              <div onClick={() => navigate('/')} style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: 'var(--acc)', cursor: 'pointer' }}>
                {t('landing.auth.done.back')}
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastBubble toast={toast} />
    </div>
  );
}
