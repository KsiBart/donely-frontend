import { useTranslation } from 'react-i18next';
import { clickable } from '../../../lib/a11y';

/** Shared overlay chrome for the 3 settings panels below — centered card on desktop, bottom
 * sheet-ish full-width card on mobile. Click-outside / the × both close. */
export default function PanelOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
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
