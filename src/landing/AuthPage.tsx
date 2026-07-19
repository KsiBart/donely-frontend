import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo, Wordmark } from '../components/ui';
import { useAuth } from '../state/AuthContext';
import { useSiteTheme } from '../state/SiteThemeContext';
import { useToast } from '../state/ToastContext';
import { clickable } from '../lib/a11y';
import { DarkModeToggle, LangToggle, ToastBubble } from './shared';

type Step = 'email' | 'code' | 'done';
type DoneView = 'choice' | 'terms';
const EMPTY_DIGITS = () => Array(8).fill('');

/**
 * 8 single-digit OTP boxes — auto-advance on input, backspace moves to the previous box when
 * empty, paste fills across boxes. Ported 1:1 from donely-landing.dc.html's otpBoxes
 * onInput/onKeyDown/onPaste logic (React uses onChange in place of onInput — same native
 * `input` event under the hood for text inputs, identical behavior).
 */
function OtpBoxes({ digits, setDigits }: { digits: string[]; setDigits: (d: string[]) => void }) {
  const { t } = useTranslation();
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focusBox = (i: number) => {
    const el = refs.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  };

  return (
    <div className="flex gap-[clamp(5px,1.4vw,10px)] mt-[26px] justify-between">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          inputMode="numeric"
          maxLength={1}
          aria-label={t('a11y.otpDigit', 'Cyfra kodu {{n}}', { n: i + 1 })}
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
          className="w-full min-w-0 aspect-[3/4] box-border text-center rounded-[14px] bg-surface text-[var(--ink)] font-extrabold text-[clamp(20px,3vw,26px)] font-['Figtree',sans-serif] outline-none p-0"
          // eslint-disable-next-line react/no-inline-styles -- dynamic: border highlights the box once its digit is filled
          style={{ border: `1.5px solid ${d ? 'var(--acc)' : 'var(--border2)'}` }}
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
  const { me, requestCode, verify, becomePro, enterMode } = useAuth();
  const { toast, showToast } = useToast();
  const { dark } = useSiteTheme();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState<string[]>(EMPTY_DIGITS);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Post-verify: choose customer vs pro entry, with a terms gate the first time a user goes pro.
  const [doneView, setDoneView] = useState<DoneView>('choice');

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
      setDoneView('choice');
      setStep('done');
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('landing.auth.code.wrongCode'));
    } finally {
      setBusy(false);
    }
  };

  const enterAsStandard = () => {
    enterMode('standard');
    navigate('/');
  };

  const enterAsPro = () => {
    // Terms already accepted on a previous become-pro (or seeded pro user) — skip straight in.
    if (me?.proTermsAcceptedAt) {
      enterMode('pro');
      navigate('/');
      return;
    }
    setDoneView('terms');
  };

  const acceptProTerms = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await becomePro();
      enterMode('pro');
      navigate('/');
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dt min-h-screen flex flex-wrap bg-bg" data-dk={dark ? '1' : '0'}>
      {/* BRAND PANEL — second (right on desktop) via order; dark orange↔purple gradient. */}
      <div className="order-2 flex-[1_1_440px] min-h-[clamp(200px,32vh,100vh)] relative overflow-hidden bg-[linear-gradient(140deg,#14101a_0%,#2f1c30_38%,#6b3348_70%,var(--acc)_118%)] flex flex-col justify-between p-[clamp(28px,4vw,56px)]">
        <div className="absolute inset-0 opacity-[.08] bg-[repeating-linear-gradient(45deg,#c3a7e6,#c3a7e6_7px,#b599dc_7px,#b599dc_14px)]" />
        <div className="absolute -right-[120px] -bottom-[140px] w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(255,140,77,.28),transparent_68%)]" />
        <div className="absolute -right-[90px] -top-[90px] w-[340px] h-[340px] rounded-full bg-white/[0.12]" />
        <span
          {...clickable(backToSite, { label: t('landing.backHome') })}
          className="relative flex items-center gap-[11px] cursor-pointer w-fit"
        >
          <Logo size={36} />
          <Wordmark size={24} variant="onDark" />
        </span>
        <div className="relative">
          <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(26px,3.4vw,40px)] font-extrabold text-white leading-[1.1] tracking-[-0.01em] m-0">
            {t('landing.auth.brandTitle')}
          </h2>
          <div className="text-[clamp(15px,1.6vw,18px)] text-white/90 leading-[1.5] mt-[14px] max-w-[420px]">
            {t('landing.auth.brandSub')}
          </div>
        </div>
        <div className="relative flex flex-wrap gap-2">
          {authChips.map((c) => (
            <span key={c} className="bg-white/[0.18] text-white rounded-[11px] p-[8px_12px] text-[13px] font-bold">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* FORM PANEL — first (left on desktop) via order. */}
      <div className="order-1 flex-[1_1_440px] flex flex-col p-[clamp(24px,4vw,48px)]">
        <div className="flex items-center justify-between gap-[10px] flex-wrap">
          <span {...clickable(backToSite)} className="inline-flex items-center gap-[7px] text-sm font-bold text-[var(--acc)] cursor-pointer">
            <span aria-hidden="true">‹</span> {t('landing.backHome')}
          </span>
          <div className="flex items-center gap-[10px]">
            <DarkModeToggle />
            <LangToggle />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-[460px] w-full mx-auto p-[24px_0]">
          {step === 'email' && (
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
          )}

          {step === 'code' && (
            <div className="animate-[dfade_0.3s_ease]">
              <span
                {...clickable(() => setStep('email'))}
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
          )}

          {step === 'done' && doneView === 'choice' && (
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
              <div {...clickable(() => navigate('/'))} className="mt-[14px] text-sm font-bold text-[var(--acc)] cursor-pointer">
                {t('landing.auth.done.back')}
              </div>
            </div>
          )}

          {step === 'done' && doneView === 'terms' && (
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
          )}
        </div>
      </div>

      <ToastBubble toast={toast} />
    </div>
  );
}
