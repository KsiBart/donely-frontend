import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { clickable } from '../../lib/a11y';

/** Contact form (kontakt/contact page) — client-only per CLAUDE.md build brief §3: no backend
 * endpoint exists for this, so submitting just flips local `sent` state (matches design's
 * `formSent` behavior 1:1 — no persistence, no API call). */
export function ContactForm() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const ok = email.trim().length > 2 && msg.trim().length > 2;

  if (sent) {
    return (
      <div className="flex items-center gap-2.5 bg-[var(--okbg)] text-[var(--okfg)] rounded-2xl p-[16px_18px] text-[14.5px] font-bold max-w-140">
        <span aria-hidden="true">✓</span> {t('landing.form.thanks')}
      </div>
    );
  }

  const fieldBase =
    "w-full box-border rounded-[14px] border-[1.5px] border-border bg-bg text-[var(--ink)] p-[13px_14px] font-['Figtree',sans-serif] text-sm outline-none";
  const inputClass = clsx(fieldBase, 'font-semibold');
  const textareaClass = clsx(fieldBase, 'font-medium h-27.5 resize-none');

  return (
    <div className="bg-surface border border-border rounded-[20px] p-6 max-w-140 flex flex-col gap-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('landing.form.name')} aria-label={t('landing.form.name')} className={inputClass} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t('landing.form.email')} aria-label={t('landing.form.email')} className={inputClass} />
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder={t('landing.form.msg')}
        aria-label={t('landing.form.msg')}
        className={textareaClass}
      />
      <div
        {...clickable(() => setSent(true), { disabled: !ok })}
        className="text-center rounded-[14px] p-3.25 text-[14.5px] font-extrabold cursor-pointer"
        // eslint-disable-next-line react/no-inline-styles -- dynamic: enabled/disabled visual state depends on form validity
        style={{ background: ok ? 'var(--acc)' : 'var(--surface2)', color: ok ? 'var(--onacc)' : 'var(--soft)' }}
      >
        {t('landing.form.send')}
      </div>
    </div>
  );
}
