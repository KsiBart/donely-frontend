import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import type { SavedAddress } from '../../../api/models';
import { useAuth } from '../../../state/AuthContext';
import { useToast } from '../../../state/ToastContext';
import { clickable } from '../../../lib/a11y';

export default function AddressesPanelBody() {
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
