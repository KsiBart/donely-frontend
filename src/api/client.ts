import i18n from '../i18n';
import type {
  AdminBilling,
  AdminBookingRow,
  AdminCalendarResponse,
  AdminPaymentRow,
  AdminPayoutRow,
  AdminProvider,
  AdminStats,
  AdminUser,
  AiSearchResponse,
  Booking,
  BookingsSplit,
  BrandConfigResponse,
  Category,
  CheckoutResponse,
  CreateBookingPayload,
  EventLogItem,
  Me,
  Payment,
  PaymentMethod,
  Payout,
  ProviderDetail,
  ProviderListItem,
  RequestCodeResponse,
  RunPayoutBatchResponse,
  SlotsResponse,
  VerifyResponse,
} from './types';

const TOKEN_KEY = 'donely_token';

/**
 * Build-time base URL for the backend. Set `VITE_API_URL` (absolute, e.g.
 * `https://donely-backend.vercel.app/api`) for Vercel/static deploys. Falls back to `/api`,
 * which the Vite dev proxy forwards to `VITE_API_PROXY_TARGET` (see vite.config.ts) locally,
 * or which a same-origin reverse proxy would need to serve in other setups.
 */
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

/** Dispatched whenever a request comes back 401 — listeners (AuthContext) clear session state. */
export const UNAUTHORIZED_EVENT = 'donely:unauthorized';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(i18n.t('common.noConnection'), 0);
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    let message = res.statusText || i18n.t('common.errorWithStatus', { status: res.status });
    if (data && typeof data === 'object' && 'message' in data) {
      const m = (data as { message: unknown }).message;
      if (typeof m === 'string' && m) message = m;
      else if (Array.isArray(m)) message = m.join(', ');
    }
    if (res.status === 401) {
      clearToken();
      try {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      } catch {
        /* no window (SSR/tests) */
      }
    }
    throw new ApiError(message, res.status);
  }
  return data as T;
}

function qs(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const api = {
  // ---- auth ----
  requestCode: (email: string) => request<RequestCodeResponse>('POST', '/auth/request-code', { email }),
  verify: (email: string, code: string) => request<VerifyResponse>('POST', '/auth/verify', { email, code }),
  me: () => request<Me>('GET', '/me'),
  updateMe: (patch: Partial<Pick<Me, 'name' | 'locationLabel' | 'lat' | 'lng'>>) =>
    request<Me>('PATCH', '/me', patch),

  // ---- public ----
  categories: (all = false) => request<Category[]>('GET', `/categories${all ? '?all=true' : ''}`),
  providers: (params: { category?: string; q?: string } = {}) =>
    request<ProviderListItem[]>('GET', `/providers${qs(params)}`),
  provider: (id: number | string) => request<ProviderDetail>('GET', `/providers/${id}`),
  aiSearch: (query: string) => request<AiSearchResponse>('POST', '/search/ai', { query }),
  slots: (id: number | string, day: string) =>
    request<SlotsResponse>('GET', `/providers/${id}/slots${qs({ day })}`),

  // ---- customer ----
  createBooking: (payload: CreateBookingPayload) => request<Booking>('POST', '/bookings', payload),
  /** Backend splits into buckets server-side (CANCELLED lands in `completed`, never `upcoming`). */
  bookings: () => request<BookingsSplit>('GET', '/bookings'),
  cancelBooking: (id: number) => request<Booking>('POST', `/bookings/${id}/cancel`),
  acceptQuote: (id: number) => request<Booking>('POST', `/bookings/${id}/accept-quote`),
  declineQuote: (id: number) => request<Booking>('POST', `/bookings/${id}/decline-quote`),
  postReview: (id: number, rating: number, text: string) =>
    request<unknown>('POST', `/bookings/${id}/review`, { rating, text }),
  favorites: () => request<ProviderListItem[]>('GET', '/favorites'),
  addFavorite: (providerProfileId: number | string) =>
    request<unknown>('POST', `/favorites/${providerProfileId}`),
  removeFavorite: (providerProfileId: number | string) =>
    request<unknown>('DELETE', `/favorites/${providerProfileId}`),

  // ---- customer — payments & escrow (Phase 2) ----
  checkout: (bookingId: number, method: PaymentMethod) =>
    request<CheckoutResponse>('POST', '/payments/checkout', { bookingId, method }),
  mockCompletePayment: (paymentId: number) =>
    request<Payment>('POST', '/payments/mock/complete', { paymentId }),
  payment: (id: number) => request<Payment>('GET', `/payments/${id}`),
  approveCompletion: (id: number) => request<Booking>('POST', `/bookings/${id}/approve-completion`),
  providerPayouts: () => request<Payout[]>('GET', '/provider/payouts'),

  // ---- white-label config ----
  config: () => request<BrandConfigResponse>('GET', '/config'),

  // ---- admin ----
  adminStats: () => request<AdminStats>('GET', '/admin/stats'),
  adminFeed: () => request<EventLogItem[]>('GET', '/admin/feed'),
  adminUsers: (q = '') => request<AdminUser[]>('GET', `/admin/users${qs({ q })}`),
  adminBlockUser: (id: number) => request<unknown>('POST', `/admin/users/${id}/block`),
  adminUnblockUser: (id: number) => request<unknown>('POST', `/admin/users/${id}/unblock`),
  adminProviders: (status?: string) => request<AdminProvider[]>('GET', `/admin/providers${qs({ status })}`),
  adminVerifyProvider: (id: number) => request<unknown>('POST', `/admin/providers/${id}/verify`),
  adminRejectProvider: (id: number) => request<unknown>('POST', `/admin/providers/${id}/reject`),
  adminBookings: (status?: string) => request<AdminBookingRow[]>('GET', `/admin/bookings${qs({ status })}`),
  adminCancelBooking: (id: number) => request<unknown>('POST', `/admin/bookings/${id}/cancel`),
  adminCalendar: (providerProfileId: number, weekStart: string) =>
    request<AdminCalendarResponse>('GET', `/admin/calendar/${providerProfileId}${qs({ weekStart })}`),
  adminCreateBlock: (providerProfileId: number, startAt: string, endAt: string) =>
    request<{ id: number }>('POST', '/admin/blocks', { providerProfileId, startAt, endAt }),
  adminDeleteBlock: (id: number) => request<unknown>('DELETE', `/admin/blocks/${id}`),
  adminCategories: () => request<Category[]>('GET', '/admin/categories'),
  adminAddCategory: (name: string) => request<Category>('POST', '/admin/categories', { name }),
  adminPatchCategory: (id: number, active: boolean) =>
    request<Category>('PATCH', `/admin/categories/${id}`, { active }),
  adminBilling: () => request<AdminBilling>('GET', '/admin/billing'),

  // ---- admin — Phase 2 payments & payouts ----
  adminPayments: () => request<AdminPaymentRow[]>('GET', '/admin/payments'),
  adminPayouts: () => request<AdminPayoutRow[]>('GET', '/admin/payouts'),
  adminRunPayoutBatch: () => request<RunPayoutBatchResponse>('POST', '/admin/payouts/run-batch'),
};
