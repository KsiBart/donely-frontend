import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, getToken, unwrap } from '../client';
import { qk } from '../keys';
import type { ProviderListItem } from '../models';

export function useFavoritesQuery(enabled = true) {
  return useQuery({
    queryKey: qk.favorites.list(),
    queryFn: () => unwrap<ProviderListItem[]>(apiClient.GET('/favorites')),
    enabled: enabled && !!getToken(),
  });
}

export function useAddFavoriteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (providerProfileId: number | string) =>
      unwrap<unknown>(apiClient.POST('/favorites/{providerProfileId}', { params: { path: { providerProfileId: Number(providerProfileId) } } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.favorites.all });
    },
  });
}

export function useRemoveFavoriteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (providerProfileId: number | string) =>
      unwrap<unknown>(apiClient.DELETE('/favorites/{providerProfileId}', { params: { path: { providerProfileId: Number(providerProfileId) } } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.favorites.all });
    },
  });
}
