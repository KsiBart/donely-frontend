import { useQuery } from '@tanstack/react-query';
import { apiClient, unwrap } from '../client';
import { qk } from '../keys';
import type { BrandConfigResponse } from '../models';

/** `GET /config` — white-label economic values (see `src/brand.ts`). Not authenticated. */
export function useConfigQuery() {
  return useQuery({
    queryKey: qk.config(),
    queryFn: () => unwrap<BrandConfigResponse>(apiClient.GET('/config')),
    retry: false,
  });
}
