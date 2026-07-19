import { cva, type VariantProps } from 'class-variance-authority';

/**
 * cva() primitives for Donely's repeated inline-styled UI patterns (buttons, cards, chips, status
 * pills, fields). These emit Tailwind utility classNames that resolve through the existing
 * `@theme inline` token map in `src/styles/global.css` (--color-accent, --color-surface, etc.), so
 * they repaint correctly with the live theme (VITE_THEME / VITE_FORCE_DARK / applyTheme()) exactly
 * like the inline `style={{ background: 'var(--accent)' }}` they're modeled on.
 *
 * Pixel values are copied from the ACTUAL styles found across src/mobile/screens + src/landing
 * (not invented) — see call sites below each cva() for the screen it was lifted from. No screens
 * were converted to use these yet; this file only defines + exports them (Task 4.1).
 */

/** Primary CTA pattern — full-width accent button (BookingWizard.tsx nextStep, Success.tsx
 * viewBookings): bg-accent/text-onaccent + var(--glow) shadow, sizes from the smaller inline
 * per-row actions (Bookings.tsx accept/cancel row buttons) up to the big step-wizard CTA. */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 font-bold text-center cursor-pointer border-0 transition-shadow disabled:cursor-not-allowed disabled:opacity-70',
  {
    variants: {
      variant: {
        // Home.tsx searchCta / BookingWizard.tsx nextStep / Success.tsx viewBookings
        primary: 'bg-accent text-onaccent shadow-[var(--glow)]',
        // Success.tsx backToSearch — no bg, no border, just accent text
        ghost: 'bg-transparent text-accent shadow-none',
        // Bookings.tsx canReview CTA / Home.tsx desktop search bar border
        outline: 'bg-transparent text-accent border-[1.5px] border-accent',
      },
      size: {
        // Bookings.tsx accept/decline row actions (padding 9-10, fontSize 13, radius 14)
        sm: 'rounded-[14px] px-3.5 py-2 text-[13px]',
        // Profile.tsx becomeProvider CTA (padding 10, fontSize 13, radius 14)
        md: 'rounded-[14px] px-4 py-2.5 text-[13px]',
        // BookingWizard.tsx nextStep / Success.tsx viewBookings (padding 14, fontSize 15, radius 18)
        lg: 'rounded-[18px] px-4 py-3.5 text-[15px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'lg' },
  },
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;

/** Card pattern — two flavors actually in use:
 *  - `raised` (dominant, src/mobile/screens/*): bg-surface + var(--shadow), no border. Home.tsx
 *    provider rows, Bookings.tsx booking rows, Profile.tsx sections, ProviderProfile.tsx reviews.
 *  - `outlined` (src/landing/Subpage.tsx + Landing.tsx value/testimonial cards): bg-surface +
 *    1px border-border, no shadow. */
export const cardVariants = cva('bg-surface rounded-2xl', {
  variants: {
    elevation: {
      raised: 'shadow-[var(--shadow)]',
      outlined: 'border border-border',
    },
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4', // Bookings.tsx / Home.tsx row padding: 12-14px
      lg: 'p-6', // Subpage.tsx / Landing.tsx section-card padding: 24px
    },
  },
  defaultVariants: { elevation: 'raised', padding: 'md' },
});
export type CardVariants = VariantProps<typeof cardVariants>;

/** Category / filter chip pattern (Home.tsx category rail): active = accent fill + glow,
 * inactive = surface fill + shadow wash. Pill radius ~18px. */
export const chipVariants = cva(
  'inline-flex items-center justify-center rounded-[18px] px-3.5 py-2 text-[13px] font-semibold cursor-pointer transition-shadow whitespace-nowrap',
  {
    variants: {
      active: {
        true: 'bg-accent text-onaccent shadow-[var(--glow)]',
        false: 'bg-surface text-muted2 shadow-[var(--shadow)]',
      },
    },
    defaultVariants: { active: false },
  },
);
export type ChipVariants = VariantProps<typeof chipVariants>;

/** Status pill pattern (Bookings.tsx status badge + frozen-payment badge): small bold rounded
 * label, background/foreground pair per semantic tone. `ver` = confirmed/verified (green wash),
 * `danger` = blocked/cancelled (red wash), `warn` = needs-payment (amber text on neutral wash),
 * `accent` = featured/highlight (accent text on neutral wash), `neutral` = default/unknown state. */
export const statusPillVariants = cva('inline-flex items-center rounded-[10px] px-2.5 py-1 text-[11px] font-bold', {
  variants: {
    tone: {
      danger: 'bg-danger-bg text-danger',
      ver: 'bg-ver-bg text-ver-fg',
      warn: 'bg-surface2 text-warn',
      accent: 'bg-surface2 text-accent',
      neutral: 'bg-surface2 text-muted2',
    },
  },
  defaultVariants: { tone: 'neutral' },
});
export type StatusPillVariants = VariantProps<typeof statusPillVariants>;

/** Field pattern (BookingWizard.tsx address input / notes textarea): bg-surface, 1.5px border,
 * rounded-16, no native focus ring (app supplies its own via global.css :focus-visible). `error`
 * swaps the border to --danger for validation states (not yet used by any screen). */
export const fieldVariants = cva(
  'w-full box-border rounded-2xl border-[1.5px] bg-surface text-text px-3.5 py-3 text-sm outline-none',
  {
    variants: {
      state: {
        default: 'border-border',
        focus: 'border-accent',
        error: 'border-danger',
      },
    },
    defaultVariants: { state: 'default' },
  },
);
export type FieldVariants = VariantProps<typeof fieldVariants>;
