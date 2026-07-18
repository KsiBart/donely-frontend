import type { KeyboardEvent, SyntheticEvent } from 'react';

/**
 * Retrofit an accessible button onto a non-<button> element. Spread the returned props onto an
 * existing `<span onClick>` / `<div onClick>` control to add `role="button"`, keyboard focusability
 * (tabIndex) and Enter/Space activation — WITHOUT changing the tag, so the element's inline-styled
 * layout is preserved 1:1 (zero visual regression). Satisfies WCAG 2.1.1 (Keyboard) + 4.1.2
 * (Name/Role/Value). The global `:focus-visible` ring (styles/global.css) covers 2.4.7 for free.
 *
 * Usage:  <span {...clickable(() => openThing())} style={...}>…</span>
 *         <span {...clickable(toggle, { label: 'Menu', expanded: open })}>☰</span>
 *
 * For brand-new controls prefer a real `<button className="dl-btn-reset">`; use this to convert the
 * app's many pre-existing click-div patterns in place.
 */
interface ClickableOpts {
  /** Accessible name — required when the control's text is an icon/glyph only. */
  label?: string;
  disabled?: boolean;
  /** Toggle buttons (aria-pressed). */
  pressed?: boolean;
  /** Disclosure/menu controls (aria-expanded). */
  expanded?: boolean;
}

export function clickable(onActivate?: (e: SyntheticEvent) => void, opts: ClickableOpts = {}) {
  return {
    role: 'button' as const,
    tabIndex: opts.disabled ? -1 : 0,
    'aria-label': opts.label,
    'aria-disabled': opts.disabled || undefined,
    'aria-pressed': opts.pressed,
    'aria-expanded': opts.expanded,
    onClick: opts.disabled ? undefined : onActivate,
    onKeyDown: (e: KeyboardEvent) => {
      if (opts.disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate?.(e);
      }
    },
  };
}
