import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBrand } from '../../../brand';
import { SUPPORTED_LANGS, type Lang } from '../../../i18n';
import { useIsDesktop } from '../../../lib/useIsDesktop';
import { useAuth } from '../../../state/AuthContext';
import { useToast } from '../../../state/ToastContext';
import type { PanelKind } from './constants';

/** All state and handlers for the Profile tab. Extracted verbatim from Profile.tsx so the
 * component files only hold layout/JSX. */
export function useProfileData() {
  const { t, i18n } = useTranslation();
  const brand = useBrand();
  const { me, logout, isPro, mode, enterMode, updateMe } = useAuth();
  const { showToast } = useToast();
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

  return {
    t,
    brand,
    me,
    logout,
    isPro,
    mode,
    isDesktop,
    panel,
    setPanel,
    rows,
    startBecomePro,
    proTermsAccepted,
    enterProMode,
    enterStandardMode,
  };
}
