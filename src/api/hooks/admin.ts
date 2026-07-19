import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, unwrap } from '../client';
import { qk } from '../keys';
import type {
  AdminBilling,
  AdminBookingRow,
  AdminCalendarResponse,
  AdminPaymentRow,
  AdminPayoutRow,
  AdminProvider,
  AdminStats,
  AdminUser,
  Booking,
  Category,
  EventLogItem,
  RunPayoutBatchResponse,
} from '../models';

export function useAdminStatsQuery() {
  return useQuery({
    queryKey: qk.admin.stats(),
    queryFn: () => unwrap<AdminStats>(apiClient.GET('/admin/stats')),
  });
}

export function useAdminFeedQuery() {
  return useQuery({
    queryKey: qk.admin.feed(),
    queryFn: () => unwrap<EventLogItem[]>(apiClient.GET('/admin/feed')),
  });
}

export function useAdminUsersQuery(q = '') {
  return useQuery({
    queryKey: qk.admin.users.list(q),
    queryFn: () => unwrap<AdminUser[]>(apiClient.GET('/admin/users', { params: { query: { q } } })),
  });
}

export function useAdminBlockUserMutation() {
  return useMutation({
    mutationFn: (id: number) => unwrap<unknown>(apiClient.POST('/admin/users/{id}/block', { params: { path: { id } } })),
  });
}

export function useAdminUnblockUserMutation() {
  return useMutation({
    mutationFn: (id: number) => unwrap<unknown>(apiClient.POST('/admin/users/{id}/unblock', { params: { path: { id } } })),
  });
}

export function useAdminProvidersQuery(status?: string, enabled = true) {
  return useQuery({
    queryKey: qk.admin.providers.list(status),
    queryFn: () =>
      unwrap<AdminProvider[]>(apiClient.GET('/admin/providers', { params: { query: { status: status ?? '' } } })),
    enabled,
  });
}

export function useAdminVerifyProviderMutation() {
  return useMutation({
    mutationFn: (id: number) => unwrap<unknown>(apiClient.POST('/admin/providers/{id}/verify', { params: { path: { id } } })),
  });
}

export function useAdminRejectProviderMutation() {
  return useMutation({
    mutationFn: (id: number) => unwrap<unknown>(apiClient.POST('/admin/providers/{id}/reject', { params: { path: { id } } })),
  });
}

export function useAdminBookingsQuery(status?: string) {
  return useQuery({
    queryKey: qk.admin.bookings.list(status),
    queryFn: () =>
      unwrap<AdminBookingRow[]>(apiClient.GET('/admin/bookings', { params: { query: { status: status ?? '' } } })),
  });
}

export function useAdminCancelBookingMutation() {
  return useMutation({
    mutationFn: (id: number) => unwrap<Booking>(apiClient.POST('/admin/bookings/{id}/cancel', { params: { path: { id } } })),
  });
}

export function useAdminCalendarQuery(providerProfileId: number | undefined, weekStart: string) {
  return useQuery({
    queryKey: qk.admin.calendar.detail(providerProfileId ?? '', weekStart),
    queryFn: () =>
      unwrap<AdminCalendarResponse>(
        apiClient.GET('/admin/calendar/{providerProfileId}', {
          params: { path: { providerProfileId: providerProfileId as number }, query: { weekStart } },
        }),
      ),
    enabled: providerProfileId !== undefined,
  });
}

export function useAdminCreateBlockMutation() {
  return useMutation({
    mutationFn: ({ providerProfileId, startAt, endAt }: { providerProfileId: number; startAt: string; endAt: string }) =>
      unwrap<{ id: number }>(apiClient.POST('/admin/blocks', { body: { providerProfileId, startAt, endAt } })),
  });
}

export function useAdminDeleteBlockMutation() {
  return useMutation({
    mutationFn: (id: number) => unwrap<unknown>(apiClient.DELETE('/admin/blocks/{id}', { params: { path: { id } } })),
  });
}

export function useAdminCategoriesQuery() {
  return useQuery({
    queryKey: qk.admin.categories.list(),
    queryFn: () => unwrap<Category[]>(apiClient.GET('/admin/categories')),
  });
}

export function useAdminAddCategoryMutation() {
  return useMutation({
    mutationFn: (name: string) => unwrap<Category>(apiClient.POST('/admin/categories', { body: { name } })),
  });
}

export function useAdminPatchCategoryMutation() {
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      unwrap<Category>(apiClient.PATCH('/admin/categories/{id}', { params: { path: { id } }, body: { active } })),
  });
}

export function useAdminBillingQuery() {
  return useQuery({
    queryKey: qk.admin.billing.detail(),
    queryFn: () => unwrap<AdminBilling>(apiClient.GET('/admin/billing')),
  });
}

export function useAdminPaymentsQuery() {
  return useQuery({
    queryKey: qk.admin.payments.list(),
    queryFn: () => unwrap<AdminPaymentRow[]>(apiClient.GET('/admin/payments')),
  });
}

export function useAdminPayoutsQuery() {
  return useQuery({
    queryKey: qk.admin.payouts.list(),
    queryFn: () => unwrap<AdminPayoutRow[]>(apiClient.GET('/admin/payouts')),
  });
}

export function useAdminRunPayoutBatchMutation() {
  return useMutation({
    mutationFn: () => unwrap<RunPayoutBatchResponse>(apiClient.POST('/admin/payouts/run-batch')),
  });
}
