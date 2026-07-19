import { useMutation, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, getToken, unwrap } from '../client';
import { qk } from '../keys';
import type { Me, RequestCodeResponse, UpdateMePayload, VerifyResponse } from '../models';

/** `GET /me` — only meaningful once a token exists; caller controls `enabled` (AuthContext gates
 * on `getToken()` at boot, same as the legacy imperative fetch). */
export function useMeQuery(options?: Partial<UseQueryOptions<Me>>) {
  return useQuery({
    queryKey: qk.me(),
    queryFn: () => unwrap(apiClient.GET('/me')),
    enabled: !!getToken(),
    ...options,
  });
}

export function useRequestCodeMutation() {
  return useMutation({
    mutationFn: (email: string) =>
      unwrap<RequestCodeResponse>(apiClient.POST('/auth/request-code', { body: { email } })),
  });
}

export function useVerifyMutation() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      unwrap<VerifyResponse>(apiClient.POST('/auth/verify', { body: { email, code } })),
  });
}

export function useUpdateMeMutation() {
  return useMutation({
    mutationFn: (patch: UpdateMePayload) => unwrap<Me>(apiClient.PATCH('/me', { body: patch })),
  });
}
