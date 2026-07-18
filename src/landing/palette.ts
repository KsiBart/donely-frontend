// Cosmetic palette cycling for category-card top-strips, hero "matched" avatar tints, and blog
// post-card top-strips — same values as donely-landing.dc.html's `CS`/`AV` arrays. Not
// user-facing copy, so no i18n needed; shared here so Landing.tsx and Subpage.tsx stay in sync.
// First entry is `var(--accent)` (not a hardcoded hex) so it follows a VITE_THEME/VITE_ACCENT
// swap like every other accent-colored element; the remaining 5 are fixed decorative hues,
// unrelated to the theme accent (see src/theme.ts).
export const CAT_GRADIENTS: [string, string][] = [
  ['var(--accent)', '#9d6fd6'],
  ['#3e9a8f', '#5cbdae'],
  ['#d6608a', '#e88bac'],
  ['#4a6fd9', '#6f90e6'],
  ['#e0913c', '#eeb15f'],
  ['#4a9a5e', '#6fbd7f'],
];

export const AVATAR_COLORS = ['var(--accent)', '#3e9a8f', '#d6608a', '#4a6fd9', '#e0913c'];
