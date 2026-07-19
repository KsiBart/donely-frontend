import createFetchClient from 'openapi-fetch';
import type { Middleware } from 'openapi-fetch';
import createQueryClient from 'openapi-react-query';
import i18n from '../i18n';
import type { paths } from './schema';

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

// ---------------------------------------------------------------------------
// Typed layer (Phase 3) — call sites use `apiClient` (raw openapi-fetch, for one-off calls) or
// the `src/api/hooks/*` react-query hooks, which wrap `apiClient` + `unwrap`.
// ---------------------------------------------------------------------------

/** Injects the Bearer token on every request; on 401 clears the session (dispatches
 * `UNAUTHORIZED_EVENT`, calls `clearToken()`). */
const authMiddleware: Middleware = {
  onRequest({ request: req }) {
    const token = getToken();
    if (token) req.headers.set('Authorization', `Bearer ${token}`);
    return req;
  },
  onResponse({ response }) {
    if (response.status === 401) {
      clearToken();
      try {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      } catch {
        /* no window (SSR/tests) */
      }
    }
    return response;
  },
};

/** Typed openapi-fetch client — `paths` comes from the generated `schema.d.ts`. */
export const apiClient = createFetchClient<paths>({ baseUrl: API_BASE });
apiClient.use(authMiddleware);

/** openapi-react-query bindings over `apiClient` — typed `useQuery`/`useMutation`/`queryOptions`
 * keyed by `[method, path, init]`. Hooks in `src/api/hooks/*` use their own `qk` keys instead
 * (so query invalidation stays centralized in `src/api/keys.ts`), but `$api` is exported for
 * call sites that want the openapi-react-query key scheme directly. */
export const $api = createQueryClient<paths>(apiClient);

type UnwrapResult<T> = { data?: T; error?: unknown; response: Response };

/** Turns an openapi-fetch `{data,error,response}` result (or the rejected promise a network
 * failure produces) into data-or-throw `ApiError` — same error shape/messages as the legacy
 * `request()` helper: `i18n.t('common.noConnection')` on network fail; `{statusCode,message}`
 * or array `message` mapped from the error body; 401 already handled by `authMiddleware` above. */
export async function unwrap<T>(resultPromise: Promise<UnwrapResult<T>>): Promise<T> {
  let result: UnwrapResult<T>;
  try {
    result = await resultPromise;
  } catch {
    throw new ApiError(i18n.t('common.noConnection'), 0);
  }
  const { data, error, response } = result;
  if (error !== undefined) {
    let message = response.statusText || i18n.t('common.errorWithStatus', { status: response.status });
    if (error && typeof error === 'object' && 'message' in error) {
      const m = (error as { message: unknown }).message;
      if (typeof m === 'string' && m) message = m;
      else if (Array.isArray(m)) message = m.join(', ');
    }
    throw new ApiError(message, response.status);
  }
  return data as T;
}
