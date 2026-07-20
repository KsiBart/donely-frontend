import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useLocate } from '../../../lib/useLocate';
import { clickable } from '../../../lib/a11y';

export default function LocationPanelBody({ onDone }: { onDone: () => void }) {
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
          className="w-full box-border border-[1.5px] border-border bg-surface2 text-text rounded-[14px] py-3.25 px-3.5 text-[14.5px] outline-none"
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
