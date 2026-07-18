/** Marketing subpage routes — slug per CLAUDE.md build brief §3, `key` = the i18n content key
 * under `landing.pages.*` (kept as the design's original Polish page ids: cennik/onas/kariera/…
 * so the JSON structure below mirrors donely-landing.dc.html's `STR.pl.pages`/`STR.en.pages` 1:1). */
export interface SubpageConfig {
  path: string;
  key: string;
}

export const SUBPAGES: SubpageConfig[] = [
  { path: '/pricing', key: 'cennik' },
  { path: '/about', key: 'onas' },
  { path: '/careers', key: 'kariera' },
  { path: '/contact', key: 'kontakt' },
  { path: '/blog', key: 'blog' },
  { path: '/help', key: 'pomoc' },
  { path: '/safety', key: 'bezpieczenstwo' },
  { path: '/terms', key: 'regulamin' },
  { path: '/privacy', key: 'prywatnosc' },
];
