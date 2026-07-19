import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 8 single-digit OTP boxes — auto-advance on input, backspace moves to the previous box when
 * empty, paste fills across boxes. Ported 1:1 from donely-landing.dc.html's otpBoxes
 * onInput/onKeyDown/onPaste logic (React uses onChange in place of onInput — same native
 * `input` event under the hood for text inputs, identical behavior).
 */
export function OtpBoxes({ digits, setDigits }: { digits: string[]; setDigits: (d: string[]) => void }) {
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
