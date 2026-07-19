import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, getToken, unwrap } from '../client';
import { qk } from '../keys';
import type { Payout } from '../models';

// ---------------------------------------------------------------------------
// Response shapes for the provider-area endpoints. `schema.d.ts` doesn't type these bodies
// (the backend controller methods lack `@ApiOkResponse` — only `/provider/payouts` does, hence
// `Payout[]` below coming straight from the generated schema instead). Hand-mirrored 1:1 from
// `donely-backend/src/provider-area/provider-area.service.ts` return shapes; keep in sync if that
// service's return shape changes.
// ---------------------------------------------------------------------------

export interface ProviderAgendaRow {
  isBuffer?: boolean;
  isJob?: boolean;
  isBlock?: boolean;
  isFree?: boolean;
  /** Only present on `isBlock` rows — the `TimeBlock.id`, needed for `DELETE /provider/blocks/:id`
   * (unblock). Absent/undefined on every other row kind. */
  id?: number;
  time?: string;
  label?: string;
  title?: string;
  sub?: string;
  price?: string;
  status?: string;
}

export interface ProviderDashboard {
  monthBookings: number;
  monthRevenueLabel: string;
  rating: number;
  reviewCount: number;
  docsCount: number;
  taxLabel: string;
  netLabel: string;
  newRequestsCount: number;
  todayAgenda: ProviderAgendaRow[];
}

export interface ProviderRequestItem {
  id: number;
  type: 'INSTANT' | 'QUOTE';
  typeLabel: string;
  service: string;
  customer: string;
  addr: string;
  desc: string | null;
  when: string;
  price: string;
  ago: string;
  status: 'new' | 'accepted' | 'quoted' | 'declined';
  acceptLabel: string;
  quotedAmount: number | null;
}

export interface ProviderCalendarResponse {
  day: string;
  rows: ProviderAgendaRow[];
}

export interface ProviderBillingDocument {
  number: string;
  type: string;
  typeLabel: string;
  amountLabel: string;
  taxLabel: string;
  status: string;
  statusLabel: string;
  createdAt: string;
}

export interface ProviderBilling {
  docsCount: number;
  taxLabel: string;
  netLabel: string;
  documents: ProviderBillingDocument[];
}

export function useProviderDashboardQuery(enabled = true) {
  return useQuery({
    queryKey: qk.provider.dashboard(),
    queryFn: () => unwrap<ProviderDashboard>(apiClient.GET('/provider/dashboard')),
    enabled: enabled && !!getToken(),
  });
}

export function useProviderRequestsQuery(enabled = true) {
  return useQuery({
    queryKey: qk.provider.requests.list(),
    queryFn: () => unwrap<ProviderRequestItem[]>(apiClient.GET('/provider/requests')),
    enabled: enabled && !!getToken(),
  });
}

function invalidateProviderRequests(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: qk.provider.requests.all });
  void queryClient.invalidateQueries({ queryKey: qk.provider.dashboard() });
}

export function useAcceptRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap<unknown>(apiClient.POST('/provider/requests/{id}/accept', { params: { path: { id } } })),
    onSuccess: () => invalidateProviderRequests(queryClient),
  });
}

export function useDeclineRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap<unknown>(apiClient.POST('/provider/requests/{id}/decline', { params: { path: { id } } })),
    onSuccess: () => invalidateProviderRequests(queryClient),
  });
}

export function useQuoteRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      unwrap<unknown>(
        apiClient.POST('/provider/requests/{id}/quote', { params: { path: { id } }, body: { amount } }),
      ),
    onSuccess: () => invalidateProviderRequests(queryClient),
  });
}

export function useCompleteRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap<unknown>(apiClient.POST('/provider/requests/{id}/complete', { params: { path: { id } } })),
    onSuccess: () => invalidateProviderRequests(queryClient),
  });
}

export function useProviderCalendarQuery(day: string, enabled = true) {
  return useQuery({
    queryKey: qk.provider.calendar.detail(day),
    queryFn: () =>
      unwrap<ProviderCalendarResponse>(apiClient.GET('/provider/calendar', { params: { query: { day } } })),
    enabled: enabled && !!day && !!getToken(),
  });
}

export function useCreateBlockMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ startAt, endAt }: { startAt: string; endAt: string }) =>
      unwrap<unknown>(apiClient.POST('/provider/blocks', { body: { startAt, endAt } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.provider.calendar.all });
    },
  });
}

export function useDeleteBlockMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unwrap<{ ok: boolean }>(apiClient.DELETE('/provider/blocks/{id}', { params: { path: { id } } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.provider.calendar.all });
    },
  });
}

export function useProviderBillingQuery(enabled = true) {
  return useQuery({
    queryKey: qk.provider.billing.detail(),
    queryFn: () => unwrap<ProviderBilling>(apiClient.GET('/provider/billing')),
    enabled: enabled && !!getToken(),
  });
}

export function useProviderPayoutsQuery(enabled = true) {
  return useQuery({
    queryKey: qk.provider.payouts.list(),
    queryFn: () => unwrap<Payout[]>(apiClient.GET('/provider/payouts')),
    enabled: enabled && !!getToken(),
  });
}
