import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../state/AuthContext';
import { useToast } from '../../state/ToastContext';

export type Step = 'email' | 'code' | 'done';
export type DoneView = 'choice' | 'terms';
const EMPTY_DIGITS = () => Array(8).fill('');

/**
 * Auth flow state/handlers for AuthPage — extracted 1:1 from AuthPage.tsx. Steps:
 * email -> 8-box OTP -> success, wired to the real `POST /api/auth/request-code` /
 * `POST /api/auth/verify` via useAuth(); token storage is the existing AuthContext mechanism.
 */
export function useAuthFlow() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { me, requestCode, verify, becomePro, enterMode } = useAuth();
  const { showToast } = useToast();

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

  return {
    step,
    setStep,
    email,
    setEmail,
    digits,
    setDigits,
    devCode,
    busy,
    doneView,
    setDoneView,
    emailOk,
    codeFilled,
    backToSite,
    sendCode,
    verifyCode,
    enterAsStandard,
    enterAsPro,
    acceptProTerms,
  };
}
