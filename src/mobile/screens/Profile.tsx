import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { AvatarTile } from '../../components/ui';
import { useBrand } from '../../brand';
import { useConfigQuery } from '../../api/hooks';
import type { SavedAddress } from '../../api/models';
import { SUPPORTED_LANGS, type Lang } from '../../i18n';
import { useIsDesktop } from '../../lib/useIsDesktop';
import { useLocate } from '../../lib/useLocate';
import { BRICO, initials, paymentMethodLabel } from '../../lib/format';
import { useAuth } from '../../state/AuthContext';
import { useToast } from '../../state/ToastContext';
import { useInstallAction } from '../AppPromo';
import { clickable } from '../../lib/a11y';

// Profile.tsx becomeProvider / push-promo CTAs: uniform 10px padding (all sides) — not the same
// shape as buttonVariants('md') which pairs 16px horizontal with 10px vertical, so built by hand
// here to keep the pixel-exact match to the design.
const ctaCls = 'text-center bg-accent text-onaccent rounded-[14px] p-2.5 text-[13px] font-bold cursor-pointer';

type PanelKind = 'location' | 'addresses' | 'payments' | 'proTerms' | null;

/** Shared overlay chrome for the 3 settings panels below — centered card on desktop, bottom
 * sheet-ish full-width card on mobile. Click-outside / the × both close. */
function PanelOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-5"
      // Only the backdrop itself closes on click — a click landing on the card (or bubbling up
      // from it) must not, hence the target===currentTarget guard instead of stopPropagation on
      // the card (stopPropagation would also swallow bubbling keydown submits from inputs inside).
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-[440px] max-h-[85vh] overflow-auto bg-surface rounded-t-[24px] sm:rounded-[24px] p-5 shadow-[var(--shadow)]">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-bold m-0">{title}</h2>
          <span {...clickable(onClose, { label: t('a11y.dismiss') })} className="text-muted2 text-2xl leading-none cursor-pointer px-1">
            ×
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function LocationPanelBody({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const { busy, useCurrent, useManual } = useLocate();
  const [addr, setAddr] = useState('');

  const submitCurrent = async () => {
    if (await useCurrent()) onDone();
  };
  const submitManual = async () => {
    if (await useManual(addr)) onDone();
  };

  return (
    <div>
      <div
        {...clickable(() => void submitCurrent(), { disabled: busy })}
        className={clsx('text-center bg-accent text-onaccent rounded-[14px] p-3 text-[13.5px] font-bold cursor-pointer', busy && 'opacity-70 cursor-default')}
      >
        {busy ? t('auth.location.locating') : t('auth.location.share')}
      </div>
      <div className="mt-3.5">
        <input
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void submitManual();
          }}
          placeholder={t('auth.location.manualPlaceholder')}
          aria-label={t('auth.location.manualPlaceholder')}
          className="w-full box-border border-[1.5px] border-border bg-surface2 text-text rounded-[14px] py-[13px] px-3.5 text-[14.5px] outline-none"
        />
        <div
          {...clickable(() => void submitManual(), { disabled: busy })}
          className={clsx('text-center mt-2.5 bg-surface2 text-accent border-[1.5px] border-accent rounded-[14px] p-3 text-sm font-bold', busy && 'opacity-70 cursor-default')}
        >
          {busy ? t('auth.location.locating') : t('auth.location.manualConfirm')}
        </div>
      </div>
    </div>
  );
}

function AddressesPanelBody() {
  const { t } = useTranslation();
  const { me, updateMe } = useAuth();
  const { showToast } = useToast();
  const [label, setLabel] = useState('');
  const [addr, setAddr] = useState('');
  const [saving, setSaving] = useState(false);
  const addresses = me?.savedAddresses ?? [];

  const persist = async (next: SavedAddress[]) => {
    setSaving(true);
    try {
      await updateMe({ savedAddresses: next });
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const add = async () => {
    if (!label.trim() || !addr.trim()) {
      showToast(t('profile.addressesPanel.incomplete'));
      return;
    }
    await persist([...addresses, { label: label.trim(), addr: addr.trim() }]);
    setLabel('');
    setAddr('');
    showToast(t('profile.addressesPanel.savedToast'));
  };

  const remove = async (i: number) => {
    await persist(addresses.filter((_, idx) => idx !== i));
    showToast(t('profile.addressesPanel.removedToast'));
  };

  return (
    <div>
      {addresses.length === 0 && <div className="text-[12.5px] text-muted mb-3.5">{t('profile.addressesPanel.empty')}</div>}
      {addresses.length > 0 && (
        <div className="flex flex-col gap-2 mb-3.5">
          {addresses.map((a, i) => (
            <div key={`${a.label}-${a.addr}-${i}`} className="flex items-center justify-between gap-2.5 bg-surface2 rounded-[14px] py-2.5 px-3.5">
              <div className="min-w-0">
                <div className="font-bold text-[13px] truncate">{a.label}</div>
                <div className="text-[12px] text-muted truncate">{a.addr}</div>
              </div>
              <span
                {...clickable(() => void remove(i), { label: t('profile.addressesPanel.removeLabel', { label: a.label }), disabled: saving })}
                className="flex-none text-danger text-xl leading-none cursor-pointer px-1"
              >
                ×
              </span>
            </div>
          ))}
        </div>
      )}
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder={t('profile.addressesPanel.labelPlaceholder')}
        aria-label={t('profile.addressesPanel.labelPlaceholder')}
        className="w-full box-border border-[1.5px] border-border bg-surface2 text-text rounded-[14px] py-[11px] px-3.5 text-[13.5px] outline-none mb-2"
      />
      <input
        value={addr}
        onChange={(e) => setAddr(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void add();
        }}
        placeholder={t('profile.addressesPanel.addrPlaceholder')}
        aria-label={t('profile.addressesPanel.addrPlaceholder')}
        className="w-full box-border border-[1.5px] border-border bg-surface2 text-text rounded-[14px] py-[11px] px-3.5 text-[13.5px] outline-none"
      />
      <div
        {...clickable(() => void add(), { disabled: saving })}
        className={clsx('text-center mt-2.5 bg-accent text-onaccent rounded-[14px] p-3 text-sm font-bold cursor-pointer', saving && 'opacity-70 cursor-default')}
      >
        {t('profile.addressesPanel.addCta')}
      </div>
    </div>
  );
}

function PaymentsPanelBody() {
  const { t } = useTranslation();
  const { data } = useConfigQuery();
  const methods = data?.paymentMethods ?? [];
  return (
    <div>
      <div className="text-[12.5px] text-muted mb-3.5">{t('profile.paymentsPanel.note')}</div>
      {methods.length === 0 && <div className="text-[12.5px] text-muted">{t('profile.paymentsPanel.empty')}</div>}
      {methods.length > 0 && (
        <div className="flex flex-col gap-2">
          {methods.map((m) => (
            <div key={m} className="flex items-center bg-surface2 rounded-[14px] py-3 px-3.5 font-bold text-[13.5px]">
              {paymentMethodLabel(m, t)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProTermsPanelBody({ onAccepted, onCancel }: { onAccepted: () => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const { becomePro } = useAuth();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const accept = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await becomePro();
      onAccepted();
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="text-[13.5px] text-muted leading-[1.6] whitespace-pre-line mb-4">{t('proTerms.body')}</p>
      <div
        {...clickable(() => void accept(), { disabled: busy })}
        className={clsx('text-center bg-accent text-onaccent rounded-[14px] p-3 text-[13.5px] font-bold cursor-pointer', busy && 'opacity-70 cursor-default')}
      >
        {busy ? t('proTerms.accepting') : t('proTerms.accept')}
      </div>
      <div {...clickable(onCancel, { disabled: busy })} className="text-center mt-2.5 text-sm font-bold text-muted2 cursor-pointer">
        {t('proTerms.cancel')}
      </div>
    </div>
  );
}

export default function ProfileTab() {
  const { t, i18n } = useTranslation();
  const brand = useBrand();
  const { me, logout, isPro, mode, enterMode, updateMe } = useAuth();
  const { showToast } = useToast();
  const install = useInstallAction();
  const isDesktop = useIsDesktop();
  const [panel, setPanel] = useState<PanelKind>(null);

  const lang = (i18n.language as Lang) ?? 'pl';
  const langName = (l: Lang) => (l === 'pl' ? t('profile.langNamePl') : t('profile.langNameEn'));
  const toggleLang = () => {
    const next = SUPPORTED_LANGS[(SUPPORTED_LANGS.indexOf(lang) + 1) % SUPPORTED_LANGS.length];
    void i18n.changeLanguage(next);
  };

  const toggleEmailNotifications = async () => {
    try {
      await updateMe({ emailNotifications: !me?.emailNotifications });
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const rows: { label: string; val: string; onClick?: () => void }[] = [
    { label: t('profile.rows.location'), val: me?.locationLabel || t('profile.defaultLocation'), onClick: () => setPanel('location') },
    { label: t('profile.rows.savedAddresses'), val: String((me?.savedAddresses ?? []).length), onClick: () => setPanel('addresses') },
    { label: t('profile.rows.paymentMethods'), val: t('profile.paymentMethodsVal'), onClick: () => setPanel('payments') },
    {
      label: isDesktop ? t('profile.rows.notificationsEmail') : t('profile.rows.notifications'),
      val: me?.emailNotifications ? t('profile.notificationsOn') : t('profile.notificationsOff'),
      onClick: () => void toggleEmailNotifications(),
    },
    { label: t('profile.rows.language'), val: langName(lang), onClick: toggleLang },
  ];

  const startBecomePro = () => setPanel('proTerms');
  const proTermsAccepted = () => {
    setPanel(null);
    enterMode('pro');
    showToast(t('profile.proSection.becameProToast'));
  };
  const enterProMode = () => {
    enterMode('pro');
    showToast(t('profile.proSection.enteredProToast'));
  };
  const enterStandardMode = () => {
    enterMode('standard');
    showToast(t('profile.proSection.enteredStandardToast'));
  };

  return (
    <div className={clsx(isDesktop ? 'max-w-[560px] mx-auto pt-7 px-7 pb-12' : 'flex-1 overflow-auto pt-5 px-5 pb-[18px]')}>
      <div className="flex items-center gap-3.5 mx-0 mt-2 mb-[22px]">
        <AvatarTile init={initials(me?.name)} size={60} fontSize={20} round />
        <div>
          {/* eslint-disable-next-line react/no-inline-styles -- dynamic: BRICO is a shared font-family constant with no Tailwind token mapping */}
          <h1 style={{ fontFamily: BRICO }} className="text-xl font-bold m-0">
            {me?.name ?? ''}
          </h1>
          <div className="text-[12.5px] text-muted">{me?.email ?? ''}</div>
        </div>
      </div>

      <div className="bg-surface rounded-[20px] shadow-[var(--shadow)] overflow-hidden mb-3.5">
        {rows.map((r) => (
          <div
            key={r.label}
            {...(r.onClick ? clickable(r.onClick) : {})}
            className={clsx('flex justify-between items-center py-3.5 px-4 border-b border-border', r.onClick ? 'cursor-pointer' : 'cursor-default')}
          >
            <span className="text-sm font-semibold">{r.label}</span>
            <span className="text-[12.5px] text-muted">
              {r.val} <span aria-hidden="true">›</span>
            </span>
          </div>
        ))}
        <div {...clickable(logout)} className="py-3.5 px-4 cursor-pointer">
          <span className="text-sm font-semibold text-danger">{t('profile.logout')}</span>
        </div>
      </div>

      {isDesktop && (
        <div className="bg-[var(--app-tint)] rounded-[20px] pt-4 pb-4 px-[18px] mb-3.5">
          <div className="font-bold text-sm mb-1">{t('profile.pushPromoTitle')}</div>
          <div className="text-[12.5px] text-muted2 leading-[1.45] mb-3">{t('profile.pushPromoBody')}</div>
          <div {...clickable(install)} className={ctaCls}>
            {t('promo.installAppCta')}
          </div>
        </div>
      )}

      <div className="bg-surface2 rounded-[20px] p-4">
        {!isPro && (
          <>
            <div className="font-bold text-sm mb-1">{t('profile.proSection.becomeTitle')}</div>
            <div className="text-[12.5px] text-muted mb-3">{t('profile.proSection.becomeBody', { appName: brand.appName })}</div>
            <div {...clickable(startBecomePro)} className={ctaCls}>
              {t('profile.proSection.becomeCta')}
            </div>
          </>
        )}
        {isPro && mode !== 'pro' && (
          <>
            <div className="font-bold text-sm mb-1">{t('profile.proSection.activeTitle', { appName: brand.appName })}</div>
            <div className="text-[12.5px] text-muted mb-3">{t('profile.proSection.enterProBody')}</div>
            <div {...clickable(enterProMode)} className={ctaCls}>
              {t('profile.proSection.enterProCta')}
            </div>
          </>
        )}
        {isPro && mode === 'pro' && (
          <>
            <div className="font-bold text-sm mb-1">{t('profile.proSection.inProTitle')}</div>
            <div className="text-[12.5px] text-muted mb-3">{t('profile.proSection.inProBody')}</div>
            <div {...clickable(enterStandardMode)} className={ctaCls}>
              {t('profile.proSection.switchStandardCta')}
            </div>
          </>
        )}
      </div>

      {panel === 'location' && (
        <PanelOverlay title={t('profile.locationPanel.title')} onClose={() => setPanel(null)}>
          <LocationPanelBody onDone={() => setPanel(null)} />
        </PanelOverlay>
      )}
      {panel === 'addresses' && (
        <PanelOverlay title={t('profile.addressesPanel.title')} onClose={() => setPanel(null)}>
          <AddressesPanelBody />
        </PanelOverlay>
      )}
      {panel === 'payments' && (
        <PanelOverlay title={t('profile.paymentsPanel.title')} onClose={() => setPanel(null)}>
          <PaymentsPanelBody />
        </PanelOverlay>
      )}
      {panel === 'proTerms' && (
        <PanelOverlay title={t('proTerms.title')} onClose={() => setPanel(null)}>
          <ProTermsPanelBody onAccepted={proTermsAccepted} onCancel={() => setPanel(null)} />
        </PanelOverlay>
      )}
    </div>
  );
}
