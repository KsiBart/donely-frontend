import { useTranslation } from 'react-i18next';
import { Logo, Wordmark } from '../components/ui';
import { useSiteTheme } from '../state/SiteThemeContext';
import { useToast } from '../state/ToastContext';
import { clickable } from '../lib/a11y';
import { DarkModeToggle, LangToggle, ToastBubble } from './shared';
import { useAuthFlow } from './auth/useAuthFlow';
import { EmailStep } from './auth/EmailStep';
import { CodeStep } from './auth/CodeStep';
import { ChoiceStep } from './auth/ChoiceStep';
import { TermsStep } from './auth/TermsStep';

/**
 * Split-panel auth flow (donely-landing.dc.html `isAuth` branch) — REPLACES the old
 * mobile/AuthFlow.tsx centered-card login. Mounted at `/login`; fully responsive on its own
 * (flex-wrap, matching the design) rather than the app's .mobile-shell/.desktop-shell chrome.
 * Steps: email -> 8-box OTP -> success, wired to the real `POST /api/auth/request-code` /
 * `POST /api/auth/verify` via useAuth(); token storage is the existing AuthContext mechanism.
 *
 * Step state/handlers live in `./auth/useAuthFlow`; each step's markup is its own component in
 * `./auth/` (EmailStep, CodeStep, ChoiceStep, TermsStep) — this file only composes the brand
 * panel + form panel shell around the active step.
 */
export default function AuthPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { dark } = useSiteTheme();
  const flow = useAuthFlow();

  const authChips = t('landing.auth.chips', { returnObjects: true }) as string[];

  return (
    <div className="dt min-h-screen flex flex-wrap bg-bg" data-dk={dark ? '1' : '0'}>
      {/* BRAND PANEL — second (right on desktop) via order; dark orange↔purple gradient. */}
      <div className="order-2 flex-[1_1_440px] min-h-[clamp(200px,32vh,100vh)] relative overflow-hidden bg-[linear-gradient(140deg,#14101a_0%,#2f1c30_38%,#6b3348_70%,var(--acc)_118%)] flex flex-col justify-between p-[clamp(28px,4vw,56px)]">
        <div className="absolute inset-0 opacity-[.08] bg-[repeating-linear-gradient(45deg,#c3a7e6,#c3a7e6_7px,#b599dc_7px,#b599dc_14px)]" />
        <div className="absolute -right-30 -bottom-35 w-90 h-90 rounded-full bg-[radial-gradient(circle,rgba(255,140,77,.28),transparent_68%)]" />
        <div className="absolute -right-22.5 -top-22.5 w-85 h-85 rounded-full bg-white/12" />
        <span
          {...clickable(flow.backToSite, { label: t('landing.backHome') })}
          className="relative flex items-center gap-2.75 cursor-pointer w-fit"
        >
          <Logo size={36} />
          <Wordmark size={24} variant="onDark" />
        </span>
        <div className="relative">
          <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[clamp(26px,3.4vw,40px)] font-extrabold text-white leading-[1.1] tracking-[-0.01em] m-0">
            {t('landing.auth.brandTitle')}
          </h2>
          <div className="text-[clamp(15px,1.6vw,18px)] text-white/90 leading-[1.5] mt-3.5 max-w-105">
            {t('landing.auth.brandSub')}
          </div>
        </div>
        <div className="relative flex flex-wrap gap-2">
          {authChips.map((c) => (
            <span key={c} className="bg-white/18 text-white rounded-[11px] p-[8px_12px] text-[13px] font-bold">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* FORM PANEL — first (left on desktop) via order. */}
      <div className="order-1 flex-[1_1_440px] flex flex-col p-[clamp(24px,4vw,48px)]">
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <span {...clickable(flow.backToSite)} className="inline-flex items-center gap-1.75 text-sm font-bold text-[var(--acc)] cursor-pointer">
            <span aria-hidden="true">‹</span> {t('landing.backHome')}
          </span>
          <div className="flex items-center gap-2.5">
            <DarkModeToggle />
            <LangToggle />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-115 w-full mx-auto p-[24px_0]">
          {flow.step === 'email' && (
            <EmailStep email={flow.email} setEmail={flow.setEmail} emailOk={flow.emailOk} busy={flow.busy} sendCode={flow.sendCode} />
          )}

          {flow.step === 'code' && (
            <CodeStep
              email={flow.email}
              digits={flow.digits}
              setDigits={flow.setDigits}
              codeFilled={flow.codeFilled}
              busy={flow.busy}
              devCode={flow.devCode}
              verifyCode={flow.verifyCode}
              sendCode={flow.sendCode}
              onChangeEmail={() => flow.setStep('email')}
            />
          )}

          {flow.step === 'done' && flow.doneView === 'choice' && (
            <ChoiceStep enterAsStandard={flow.enterAsStandard} enterAsPro={flow.enterAsPro} onBack={flow.backToSite} />
          )}

          {flow.step === 'done' && flow.doneView === 'terms' && (
            <TermsStep setDoneView={flow.setDoneView} acceptProTerms={flow.acceptProTerms} busy={flow.busy} />
          )}
        </div>
      </div>

      <ToastBubble toast={toast} />
    </div>
  );
}
