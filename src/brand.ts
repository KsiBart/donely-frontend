import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useConfigQuery } from './api/hooks';
import type { PaymentMethod } from './api/models';

/**
 * Frontend-owns-brand split (the single source of truth for a white-label re-skin — see
 * `src/theme.ts` for the equivalent split on the accent color):
 *
 *  - PRESENTATION (`appName`, `storeLinks`) is 100% frontend-owned, read from `VITE_*` build-time
 *    env with defaults = the original Donely design content. Swapping the brand for a new deploy
 *    is "set `VITE_APP_NAME` (+ optionally `VITE_APP_STORE_URL` / `VITE_GOOGLE_PLAY_URL`) and
 *    redeploy the frontend" — no backend involvement, no code edit.
 *  - ECONOMIC values (`currency`, `taxRatePrivate`, `paymentMethods`, `supportedLocales`) stay
 *    backend-authoritative — they're policy/legal values, not presentation. `BrandProvider`
 *    fetches `GET /api/config` once at boot and merges ONLY those fields over the env-derived
 *    defaults; `appName`/`storeLinks` are never touched by that response.
 *
 * Components must not scatter literal 'Donely' strings — import `useBrand()` (or `BRAND` for
 * non-reactive contexts like module-level constants) instead.
 */

export interface StoreLinks {
  appStore: string;
  googlePlay: string;
}

export interface BrandConfig {
  /** Frontend-owned (VITE_APP_NAME). Never overwritten by `/api/config`. */
  appName: string;
  /** Frontend-owned (VITE_APP_STORE_URL / VITE_GOOGLE_PLAY_URL). Never overwritten by `/api/config`. */
  storeLinks: StoreLinks;
  /** Backend-authoritative economic mirror — overwritten once `GET /api/config` resolves. */
  currency: string;
  supportedLocales: string[];
  taxRatePrivate: number;
  paymentMethods: PaymentMethod[];
}

/** Build-time env, defaults = current design content ('Donely', no store links yet). */
const ENV_APP_NAME = import.meta.env.VITE_APP_NAME?.trim() || 'Donely';
const ENV_APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL?.trim() || '#';
const ENV_GOOGLE_PLAY_URL = import.meta.env.VITE_GOOGLE_PLAY_URL?.trim() || '#';

/** Defaults mirror the design content exactly — used until (or if) `GET /api/config` responds. */
export const DEFAULT_BRAND: BrandConfig = {
  appName: ENV_APP_NAME,
  storeLinks: {
    appStore: ENV_APP_STORE_URL,
    googlePlay: ENV_GOOGLE_PLAY_URL,
  },
  currency: 'PLN',
  supportedLocales: ['pl', 'en'],
  taxRatePrivate: 0.12,
  paymentMethods: ['P24_BLIK', 'PAYPAL'],
};

/** Mutable snapshot for non-React call sites (e.g. lib/format.ts helpers). */
export const BRAND: BrandConfig = { ...DEFAULT_BRAND };

const BrandCtx = createContext<BrandConfig>(DEFAULT_BRAND);

/**
 * Fetches `GET /api/config` once at boot and merges its ECONOMIC fields over the env-derived
 * defaults. `appName` and `storeLinks` are frontend-owned and deliberately excluded from the
 * merge — see header comment.
 */
export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND);
  const { data: cfg } = useConfigQuery();

  useEffect(() => {
    if (!cfg) return; // /api/config not available yet — keep design defaults
    const merged: BrandConfig = {
      ...DEFAULT_BRAND,
      currency: cfg.currency,
      supportedLocales: cfg.supportedLocales,
      taxRatePrivate: cfg.taxRatePrivate,
      paymentMethods: cfg.paymentMethods,
    };
    setBrand(merged);
    Object.assign(BRAND, merged);
  }, [cfg]);

  return React.createElement(BrandCtx.Provider, { value: brand }, children);
}

export function useBrand(): BrandConfig {
  return useContext(BrandCtx);
}

/** `{{appName}}` interpolation value for i18next — keeps translated copy brand-agnostic. */
export function useBrandI18nValues(): { appName: string } {
  const brand = useBrand();
  return useMemo(() => ({ appName: brand.appName }), [brand.appName]);
}
