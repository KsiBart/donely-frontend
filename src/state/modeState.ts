// Persisted "which app mode am I browsing as" flag — a pro user can hold a customer AND a
// provider hat; this remembers which one across reloads (login-choice screen, Profile switch).
// Deliberately NOT authorization: the backend still gates every provider-area endpoint on
// `me.isPro`/`providerProfile` — this only decides which UI the client renders.

export type AppMode = 'standard' | 'pro';

const MODE_KEY = 'donely_mode';

export function getStoredMode(): AppMode {
  try {
    return localStorage.getItem(MODE_KEY) === 'pro' ? 'pro' : 'standard';
  } catch {
    return 'standard';
  }
}

export function setStoredMode(mode: AppMode): void {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* storage unavailable */
  }
}

export function clearStoredMode(): void {
  try {
    localStorage.removeItem(MODE_KEY);
  } catch {
    /* storage unavailable */
  }
}
