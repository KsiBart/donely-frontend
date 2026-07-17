import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import pl from './pl.json';

export const LANG_KEY = 'donely_lang';
export const SUPPORTED_LANGS = ['pl', 'en'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

/** Maps the app's i18n language to a BCP-47 locale for Intl.* formatting. */
export const INTL_LOCALE: Record<Lang, string> = {
  pl: 'pl-PL',
  en: 'en-US',
};

export function toIntlLocale(lang: string | undefined): string {
  return INTL_LOCALE[(lang as Lang) ?? 'pl'] ?? 'pl-PL';
}

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'pl' || stored === 'en') return stored;
  } catch {
    /* storage unavailable */
  }
  return 'pl';
}

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      pl: { translation: pl },
      en: { translation: en },
    },
    lng: readStoredLang(),
    fallbackLng: 'pl',
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    interpolation: { escapeValue: false },
    returnObjects: true,
    initImmediate: false,
  });

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LANG_KEY, lng);
  } catch {
    /* storage unavailable */
  }
});

export default i18n;
