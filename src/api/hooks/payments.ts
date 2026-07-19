import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, unwrap } from '../client';
import { qk } from '../keys';
import type { CheckoutResponse, Payment, PaymentMethod } from '../models';

export function useCheckoutMutation() {
  return useMutation({
    mutationFn: ({ bookingId, method }: { bookingId: number; method: PaymentMethod }) =>
      unwrap<CheckoutResponse>(apiClient.POST('/payments/checkout', { body: { bookingId, method } })),
  });
}

export function useMockCompletePaymentMutation() {
  return useMutation({
    mutationFn: (paymentId: number) =>
      unwrap<Payment>(apiClient.POST('/payments/mock/complete', { body: { paymentId } })),
  });
}

export function usePaymentQuery(id: number | undefined) {
  return useQuery({
    queryKey: qk.payment.detail(id ?? ''),
    queryFn: () => unwrap<Payment>(apiClient.GET('/payments/{id}', { params: { path: { id: id as number } } })),
    enabled: id !== undefined && !Number.isNaN(id),
  });
}

