// Typed model aliases (Phase 3, Task 3.5) — re-exports of the generated `components['schemas']`
// entities under the same names the hand-written `src/api/types.ts` used, so call sites need only
// change their import path (`../api/types` -> `../api/models`), not their code. Kept 1:1 with the
// backend OpenAPI spec; do not hand-edit shapes here — regenerate `schema.d.ts` instead.

import type { components } from './schema';

type Schemas = components['schemas'];

// ---------- Enum-ish literal unions (mirrors PLAN.md; backend fields are `String`, not native
// enums, but the generated schema narrows them via `@enum` — pull them out for reuse). ----------

export type BusinessType = Schemas['ProviderListItemEntity']['businessType'];
export type ProviderStatus = Schemas['AdminProviderEntity']['status'];
export type PriceType = Schemas['ServiceEntity']['priceType'];
export type ServiceLocation = Schemas['ServiceEntity']['location'];
export type BookingType = Schemas['BookingEntity']['type'];
export type BookingStatus = Schemas['BookingEntity']['status'];
export type QuoteStatus = NonNullable<Schemas['BookingEntity']['quoteStatus']>;
export type PaymentMethod = Schemas['PaymentEntity']['method'];
export type PaymentStatus = Schemas['PaymentEntity']['status'];
export type PayoutStatus = Schemas['PayoutEntity']['status'];
export type AdminCalendarCellStatus = Schemas['AdminCalendarCellEntity']['status'];

/** Not modeled as a schema enum — `AdminDocumentEntity.type`/`.status` are backend-formatted
 * Polish display strings (see `AdminDocument` below), not these underlying codes. Kept as a
 * hand-maintained literal union for any client-side document-type/status labeling. */
export type DocumentType = 'RACHUNEK' | 'FAKTURA_VAT';
export type DocumentStatus = 'ISSUED' | 'PAID_OUT';

// ---------- Auth ----------

export type SavedAddress = Schemas['SavedAddressEntity'];
export type Me = Schemas['MeEntity'];
export type RequestCodeResponse = Schemas['RequestCodeResponseEntity'];
export type VerifyResponse = Schemas['VerifyResponseEntity'];
export type UpdateMePayload = Schemas['UpdateMeDto'];

// ---------- Public ----------

export type Category = Schemas['CategoryEntity'];
export type ProviderListItem = Schemas['ProviderListItemEntity'];
export type Service = Schemas['ServiceEntity'];
export type ProviderReview = Schemas['ProviderReviewEntity'];
export type ProviderDetail = Schemas['ProviderDetailEntity'];
export type AiSearchMatch = Schemas['AiSearchMatchEntity'];
export type AiSearchResponse = Schemas['AiSearchResponseEntity'];
export type SlotsResponse = Schemas['SlotsResponseEntity'];

// ---------- Customer ----------

export type Payment = Schemas['PaymentEntity'];
export type Booking = Schemas['BookingEntity'];
export type BookingsSplit = Schemas['BookingsSplitEntity'];
export type CreateBookingPayload = Schemas['CreateBookingDto'];
export type CheckoutResponse = Schemas['CheckoutResponseEntity'];
export type Payout = Schemas['PayoutEntity'];

// ---------- White-label config ----------

export type BrandConfigResponse = Schemas['BrandConfigResponseEntity'];

// ---------- Admin ----------

export type AdminStats = Schemas['AdminStatsEntity'];
export type EventLogItem = Schemas['EventLogItemEntity'];
export type AdminUser = Schemas['AdminUserEntity'];
export type AdminProvider = Schemas['AdminProviderEntity'];
export type AdminBookingRow = Schemas['AdminBookingRowEntity'];
export type AdminCalendarCell = Schemas['AdminCalendarCellEntity'];
export type AdminCalendarRow = Schemas['AdminCalendarRowEntity'];
export type AdminCalendarResponse = Schemas['AdminCalendarResponseEntity'];
export type AdminDocument = Schemas['AdminDocumentEntity'];
export type AdminBilling = Schemas['AdminBillingEntity'];
export type AdminPaymentRow = Schemas['AdminPaymentRowEntity'];
export type AdminPayoutRow = Schemas['AdminPayoutRowEntity'];
export type RunPayoutBatchResponse = Schemas['RunPayoutBatchResponseEntity'];
