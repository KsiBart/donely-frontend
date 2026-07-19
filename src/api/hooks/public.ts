import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, unwrap } from '../client';
import { qk } from '../keys';
import type { AiSearchResponse, Category, ProviderDetail, ProviderListItem, SlotsResponse } from '../models';

export function useCategoriesQuery(all = false) {
  return useQuery({
    queryKey: qk.categories.list(all),
    queryFn: () =>
      unwrap<Category[]>(apiClient.GET('/categories', { params: { query: { all: all ? 'true' : '' } } })),
  });
}

export function useProvidersQuery(filter: { category?: string; q?: string } = {}, enabled = true) {
  return useQuery({
    queryKey: qk.providers.list(filter),
    queryFn: () =>
      unwrap<ProviderListItem[]>(
        apiClient.GET('/providers', { params: { query: { category: filter.category ?? '', q: filter.q ?? '' } } }),
      ),
    enabled,
  });
}

export function useProviderQuery(id: number | string | undefined) {
  return useQuery({
    queryKey: qk.providers.detail(id ?? ''),
    queryFn: () => unwrap<ProviderDetail>(apiClient.GET('/providers/{id}', { params: { path: { id: Number(id) } } })),
    enabled: id !== undefined && id !== null && id !== '',
  });
}

export function useSlotsQuery(id: number | string | undefined, day: string, enabled = true) {
  return useQuery({
    queryKey: qk.providers.slots(id ?? '', day),
    queryFn: () =>
      unwrap<SlotsResponse>(
        apiClient.GET('/providers/{id}/slots', { params: { path: { id: Number(id) }, query: { day, serviceId: '' } } }),
      ),
    enabled: enabled && id !== undefined && id !== null && id !== '' && !!day,
  });
}

export function useAiSearchMutation() {
  return useMutation({
    mutationFn: (query: string) =>
      unwrap<AiSearchResponse>(apiClient.POST('/search/ai', { body: { query } })),
  });
}
