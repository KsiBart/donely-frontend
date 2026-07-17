import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api/client';
import type { BrandConfigResponse, PaymentMethod } from './api/types';

// White-label single import site (PLAN.md "Phase 2b"): every product-crucial value
// templated here, defaults = design content. Components must not scatter literal
// 'Donely' strings — import `useBrand()` (or `BRAND` for non-reactive contexts like
// module-level constants) instead.

export interface StoreLinks {
  appStore: string;
  googlePlay: string;
}

export interface BrandConfig {
  appName: string;
  country: string;
  currency: string;
  defaultLocale: string;
  supportedLocales: string[];
  taxRatePrivate: number;
  paymentMethods: PaymentMethod[];
  storeLinks: StoreLinks;
}

/** Defaults mirror the design content exactly — used until (or if) `GET /api/config` responds. */
export const DEFAULT_BRAND: BrandConfig = {
  appName: 'Donely',
  country: 'PL',
  currency: 'PLN',
  defaultLocale: 'pl',
  supportedLocales: ['pl', 'en'],
  taxRatePrivate: 0.12,
  paymentMethods: ['P24_BLIK', 'PAYPAL'],
  storeLinks: {
    appStore: '#',
    googlePlay: '#',
  },
};

/** Mutable snapshot for non-React call sites (e.g. lib/format.ts helpers). */
export const BRAND: BrandConfig = { ...DEFAULT_BRAND };

const BrandCtx = createContext<BrandConfig>(DEFAULT_BRAND);

/** Fetches `GET /api/config` once at boot and merges it over the design defaults. */
export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND);

  useEffect(() => {
    let alive = true;
    api
      .config()
      .then((cfg: BrandConfigResponse) => {
        if (!alive) return;
        const merged: BrandConfig = { ...DEFAULT_BRAND, ...cfg, storeLinks: DEFAULT_BRAND.storeLinks };
        setBrand(merged);
        Object.assign(BRAND, merged);
      })
      .catch(() => {
        /* /api/config not available yet — keep design defaults */
      });
    return () => {
      alive = false;
    };
  }, []);

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
