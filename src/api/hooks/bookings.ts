import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, getToken, unwrap } from '../client';
import { qk } from '../keys';
import type { Booking, BookingsSplit, CreateBookingPayload } from '../models';

export function useBookingsQuery() {
  return useQuery({
    queryKey: qk.bookings.list(),
    queryFn: () => unwrap<BookingsSplit>(apiClient.GET('/bookings')),
    enabled: !!getToken(),
  });
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
      unwrap<Booking>(apiClient.POST('/bookings', { body: payload })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.bookings.all });
    },
  });
}

export function useCancelBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unwrap<Booking>(apiClient.POST('/bookings/{id}/cancel', { params: { path: { id } } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.bookings.all });
    },
  });
}

export function useAcceptQuoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap<Booking>(apiClient.POST('/bookings/{id}/accept-quote', { params: { path: { id } } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.bookings.all });
    },
  });
}

export function useDeclineQuoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap<Booking>(apiClient.POST('/bookings/{id}/decline-quote', { params: { path: { id } } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.bookings.all });
    },
  });
}

export function usePostReviewMutation() {
  return useMutation({
    mutationFn: ({ id, rating, text }: { id: number; rating: 1 | 2 | 3 | 4 | 5; text: string }) =>
      unwrap<unknown>(apiClient.POST('/bookings/{id}/review', { params: { path: { id } }, body: { rating, text } })),
  });
}

export function useApproveCompletionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap<Booking>(apiClient.POST('/bookings/{id}/approve-completion', { params: { path: { id } } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.bookings.all });
    },
  });
}
