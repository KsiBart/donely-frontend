// Query-key factory (Phase 3, Task 3.2). Centralizes every `queryKey` used by
// `src/api/hooks/*` so invalidation after a mutation is a `queryClient.invalidateQueries({
// queryKey: qk.<group>.all })` — react-query partial-matches by key-array prefix, so
// invalidating `qk.bookings.all` (`['bookings']`) also invalidates `qk.bookings.list()`
// (`['bookings', 'list']`), etc. Each leaf builder returns a readonly tuple so it's usable
// both as a `queryKey` and as a dependency array.

export const qk = {
  me: () => ['me'] as const,
  config: () => ['config'] as const,

  categories: {
    all: ['categories'] as const,
    list: (all = false) => ['categories', 'list', all] as const,
  },

  providers: {
    all: ['providers'] as const,
    list: (filter: { category?: string; q?: string } = {}) =>
      ['providers', 'list', filter.category ?? '', filter.q ?? ''] as const,
    detail: (id: number | string) => ['providers', 'detail', String(id)] as const,
    slots: (id: number | string, day: string, serviceId?: number | string) =>
      ['providers', 'slots', String(id), day, serviceId === undefined ? '' : String(serviceId)] as const,
  },

  bookings: {
    all: ['bookings'] as const,
    list: () => ['bookings', 'list'] as const,
  },

  favorites: {
    all: ['favorites'] as const,
    list: () => ['favorites', 'list'] as const,
  },

  payment: {
    all: ['payment'] as const,
    detail: (id: number | string) => ['payment', 'detail', String(id)] as const,
  },

  providerPayouts: {
    all: ['providerPayouts'] as const,
    list: () => ['providerPayouts', 'list'] as const,
  },

  admin: {
    stats: () => ['admin', 'stats'] as const,
    feed: () => ['admin', 'feed'] as const,

    users: {
      all: ['admin', 'users'] as const,
      list: (q = '') => ['admin', 'users', 'list', q] as const,
    },
    providers: {
      all: ['admin', 'providers'] as const,
      list: (status?: string) => ['admin', 'providers', 'list', status ?? ''] as const,
    },
    bookings: {
      all: ['admin', 'bookings'] as const,
      list: (status?: string) => ['admin', 'bookings', 'list', status ?? ''] as const,
    },
    calendar: {
      all: ['admin', 'calendar'] as const,
      detail: (providerProfileId: number | string, weekStart: string) =>
        ['admin', 'calendar', 'detail', String(providerProfileId), weekStart] as const,
    },
    categories: {
      all: ['admin', 'categories'] as const,
      list: () => ['admin', 'categories', 'list'] as const,
    },
    billing: {
      all: ['admin', 'billing'] as const,
      detail: () => ['admin', 'billing', 'detail'] as const,
    },
    payments: {
      all: ['admin', 'payments'] as const,
      list: () => ['admin', 'payments', 'list'] as const,
    },
    payouts: {
      all: ['admin', 'payouts'] as const,
      list: () => ['admin', 'payouts', 'list'] as const,
    },
  },
} as const;
