import type { PaymentMethod } from '../../../api/models';

export const METHOD_KEY: Record<PaymentMethod, string> = {
  P24_BLIK: 'p24',
  PAYPAL: 'paypal',
};

// Small-caps section eyebrow ("ADRES" / "METODA PŁATNOŚCI" / …) — margin varies per call site so
// it's applied via clsx at each usage rather than baked into this base string.
export const uppercaseLabelCls = 'text-xs font-bold text-muted tracking-[0.06em] uppercase';
