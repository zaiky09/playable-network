import en from './en.json';
import sw from './sw.json';

export const locales = ['en', 'sw'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  sw: 'Kiswahili',
};

export const rtlLocales: readonly Locale[] = [] as const;

export function isRTL(_locale: Locale): boolean {
  return false;
}

const strings = { en, sw } as const;

export function useTranslations(locale: Locale) {
  return strings[locale];
}
