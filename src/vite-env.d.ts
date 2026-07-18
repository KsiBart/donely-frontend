/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute backend base URL, e.g. https://donely-backend.vercel.app/api. Unset locally (falls back to /api + dev proxy). */
  readonly VITE_API_URL?: string;

  // ---- Frontend-owned brand (see src/brand.ts) ----
  /** Brand/app display name. Default 'Donely' (design content). */
  readonly VITE_APP_NAME?: string;
  /** App Store link for the wordmark/store badges. Default '#'. */
  readonly VITE_APP_STORE_URL?: string;
  /** Google Play link for the wordmark/store badges. Default '#'. */
  readonly VITE_GOOGLE_PLAY_URL?: string;

  // ---- Frontend-owned theme accent (see src/theme.ts) ----
  /** Named accent palette: violet | teal | blue | rose | emerald | amber | orange. Default 'violet'. */
  readonly VITE_THEME?: string;
  /** Optional hex override for just the resolved palette's accent color. */
  readonly VITE_ACCENT?: string;
  /** When 'true', forces the marketing site into dark mode and hides its toggle (see
   * src/state/SiteThemeContext.tsx). Reversible — unset to restore the light/dark toggle. */
  readonly VITE_FORCE_DARK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
