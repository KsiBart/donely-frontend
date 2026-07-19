import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAuth } from '../../../state/AuthContext';
import { useToast } from '../../../state/ToastContext';
import { clickable } from '../../../lib/a11y';

export default function ProTermsPanelBody({ onAccepted, onCancel }: { onAccepted: () => void; onCancel: () => void }) {
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
