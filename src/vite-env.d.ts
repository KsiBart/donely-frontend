/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute backend base URL, e.g. https://donely-backend.vercel.app/api. Unset locally (falls back to /api + dev proxy). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
