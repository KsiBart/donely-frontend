// Donely API contract types — mirrors PLAN.md (`/api` prefix, JWT Bearer,
// errors `{statusCode, message}`). Optional fields are defensive: the UI
// renders whichever enrichment the backend provides.

export type BusinessType = 'PRIVATE' | 'JDG';
export type ProviderStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type PriceType = 'FIXED' | 'HOURLY' | 'QUOTE';
export type ServiceLocation = 'CLIENT' | 'SPOT';
export type BookingType = 'INSTANT' | 'QUOTE';
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'AWAITING_APPROVAL'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DECLINED';
export type QuoteStatus = 'AWAITING' | 'QUOTED' | 'ACCEPTED';
export type DocumentType = 'RACHUNEK' | 'FAKTURA_VAT';
export type DocumentStatus = 'ISSUED' | 'PAID_OUT';

// ---------- Phase 2 — Payments & Escrow ----------

export type PaymentMethod = 'P24_BLIK' | 'PAYPAL';
export type PaymentStatus = 'PENDING' | 'HELD' | 'CAPTURED' | 'RELEASED' | 'REFUNDED' | 'FAILED';
export type PayoutStatus = 'PENDING' | 'PAID';

// ---------- Auth ----------

export interface SavedAddress {
  label: string;
  addr: string;
}

export interface Me {
  id: number;
  email: string;
  name: string;
  isCustomer: boolean;
  isProvider: boolean;
  isAdmin: boolean;
  locationLabel?: string | null;
  lat?: number | null;
  lng?: number | null;
  savedAddresses?: SavedAddress[] | null;
  providerProfileId?: number | null;
}

export interface RequestCodeResponse {
  ok: boolean;
  devCode?: string;
}

export interface VerifyResponse {
  accessToken: string;
  user: Me;
}

// ---------- Public ----------

export interface Category {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  providerCount?: number;
  count?: number;
}

export interface ProviderListItem {
  id: number;
  userId: number;
  name: string;
  init: string;
  categorySlug: string;
  categoryName: string;
  rating: number;
  reviewCount: number;
  priceFromLabel: string;
  distanceKm: number;
  nextSlotLabel: string;
  verified: boolean;
  featured: boolean;
  locLine: string;
  spotAddress?: string | null;
  businessType: BusinessType;
}

export interface Service {
  id: number;
  providerProfileId?: number;
  title: string;
  durationLabel: string;
  priceType: PriceType;
  priceLabel: string;
  priceAmount?: number | null;
  location: ServiceLocation;
  sort?: number;
}

export interface ProviderReview {
  id: number;
  rating: number;
  text: string;
  createdAt?: string;
  customerName?: string;
  authorName?: string;
  name?: string;
}

export interface ProviderDetail extends ProviderListItem {
  bio: string;
  travelRadiusKm?: number;
  responseMinutes?: number;
  docsNote?: string;
  workHours?: Record<string, [number, number]> | null;
  services: Service[];
  reviews: ProviderReview[];
}

export interface AiSearchMatch extends ProviderListItem {
  why: string;
}

export interface AiSearchResponse {
  response: string;
  matches: AiSearchMatch[];
}

export interface SlotsResponse {
  times: { label: string; available: boolean }[];
}

// ---------- Customer ----------

export interface Payment {
  id: number;
  bookingId: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  externalId?: string | null;
  redirectUrl?: string | null;
  heldAt?: string | null;
  capturedAt?: string | null;
  releasedAt?: string | null;
  refundedAt?: string | null;
  createdAt: string;
}

export interface Booking {
  id: number;
  displayId?: string;
  type: BookingType;
  status: BookingStatus;
  statusLabel?: string;
  quoteStatus?: QuoteStatus | null;
  quotedAmount?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  preferredWindow?: string | null;
  atSpot: boolean;
  address: string;
  notes?: string | null;
  priceLabel: string;
  createdAt: string;
  customerId?: number;
  providerProfileId: number;
  serviceId: number;
  acknowledged?: boolean;
  // enrichment (whichever shape the backend returns)
  providerName?: string;
  providerInit?: string;
  serviceTitle?: string;
  customerName?: string;
  hasReview?: boolean;
  provider?: { id: number; name: string; init?: string; spotAddress?: string | null } | null;
  service?: { id: number; title: string; priceLabel?: string } | null;
  review?: { id: number; rating: number } | null;
  // Phase 2 — payments & escrow
  paymentRequired?: boolean;
  payment?: Payment | null;
  canCancel?: boolean;
  canApprove?: boolean;
  canReview?: boolean;
  awaitingApprovalAt?: string | null;
}

/** `GET /api/bookings` — backend splits into buckets server-side (CANCELLED lands in `completed`, never `upcoming`). */
export interface BookingsSplit {
  upcoming: Booking[];
  completed: Booking[];
}

export interface CreateBookingPayload {
  providerProfileId: number;
  serviceId: number;
  startAt?: string;
  preferredWindow?: string;
  notes?: string;
  address?: string;
  atSpot: boolean;
}

export interface CheckoutResponse {
  paymentId: number;
  redirectUrl: string | null;
}

export interface Payout {
  id: number;
  providerProfileId?: number;
  paymentId: number;
  bookingId?: number;
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
  status: PayoutStatus;
  statusLabel?: string;
  batchDate?: string | null;
  createdAt: string;
}

// ---------- White-label config ----------

/**
 * `GET /api/config` — a read-only mirror of backend-authoritative ECONOMIC values only. Brand
 * presentation (app name, store links) is frontend-owned via `VITE_*` env — see `src/brand.ts` —
 * and is deliberately NOT part of this response's shape, even if the backend sends extra fields.
 */
export interface BrandConfigResponse {
  currency: string;
  supportedLocales: string[];
  taxRatePrivate: number;
  paymentMethods: PaymentMethod[];
}

// ---------- Admin ----------

export interface AdminStats {
  users: number;
  usersWeekDelta: number;
  providers: number;
  pendingProviders: number;
  bookingsToday: number;
  cancelledToday: number;
  revenueMonthLabel: string;
  taxMonthLabel: string;
}

export interface EventLogItem {
  id: number;
  text: string;
  dotColor: string;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  blocked: boolean;
  roles?: string;
  isCustomer?: boolean;
  isProvider?: boolean;
  isAdmin?: boolean;
  bookingsCount?: number;
  bookingCount?: number;
  count?: number;
}

export interface AdminProvider {
  id: number;
  userId?: number;
  name: string;
  init?: string;
  categoryName?: string;
  category?: { name: string } | null;
  businessType: BusinessType;
  status: ProviderStatus;
  docsNote?: string;
  rating?: number;
  reviewCount?: number;
}

export interface AdminBookingRow {
  id: number;
  status: BookingStatus;
  customerName?: string;
  customer?: { name: string } | null;
  providerName?: string;
  provider?: { name: string } | null;
  serviceTitle?: string;
  service?: { title: string } | null;
  startAt?: string | null;
  preferredWindow?: string | null;
  whenLabel?: string;
  priceLabel?: string;
}

export type AdminCalendarCellStatus = 'booked' | 'blocked' | 'free' | 'off';

export interface AdminCalendarCell {
  status: AdminCalendarCellStatus;
  label?: string | null;
  blockId?: number | null;
}

export interface AdminCalendarRow {
  hour?: number;
  label?: string;
  cells: (AdminCalendarCell | AdminCalendarCellStatus)[];
}

export interface AdminCalendarResponse {
  weekStart?: string;
  days?: string[];
  rows?: AdminCalendarRow[];
  grid?: AdminCalendarRow[];
}

/** `GET /api/admin/billing` documents — backend-owned Polish display strings (PLAN.md
 * "Phase 2b": backend-originated display copy is out of scope for i18n — `type`/`status`/
 * `amount`/`tax` come pre-formatted, e.g. 'Rachunek (os. pryw.)' / 'Wystawiona' / '350 zł').
 * Render as-is; do not re-translate. No stable `id` — key lists by `number`. */
export interface AdminDocument {
  number: string;
  who?: string;
  providerName?: string;
  provider?: { name: string } | null;
  type: string;
  status: string;
  amount?: string;
  tax?: string;
}

export interface AdminBilling {
  docsCount: number;
  taxTotalLabel: string;
  payoutTotalLabel: string;
  nextPayoutLabel: string;
  privatePersonsCount?: number;
  documents: AdminDocument[];
}

// ---------- Admin — Phase 2 payments & payouts ----------

export interface AdminPaymentRow {
  id: number;
  bookingId: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  amountLabel?: string;
  currency?: string;
  customerName?: string;
  customer?: { name: string } | null;
  providerName?: string;
  provider?: { name: string } | null;
  createdAt?: string;
  heldAt?: string | null;
  releasedAt?: string | null;
}

export interface AdminPayoutRow {
  id: number;
  providerProfileId?: number;
  bookingId?: number;
  providerName?: string;
  provider?: { name: string } | null;
  grossAmount?: number;
  grossAmountLabel?: string;
  taxAmount?: number;
  taxAmountLabel?: string;
  netAmount?: number;
  netAmountLabel?: string;
  status: PayoutStatus;
  statusLabel?: string;
  batchDate?: string | null;
  createdAt?: string;
}

/** `POST /api/admin/payouts/run-batch` — accept either field name until the backend route ships. */
export interface RunPayoutBatchResponse {
  batched?: number;
  count?: number;
}
