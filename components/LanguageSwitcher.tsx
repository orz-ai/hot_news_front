"use client";

import { useLocale, useTranslations } from 'next-intl';
import { localeLabels, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('languageSwitcher');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    window.location.reload();
  };

  return (
    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
      <span className="sr-only">{t('label')}</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm4.464-11.535A6.978 6.978 0 0116.93 10h-2.07a11.032 11.032 0 00-.396-2.489zM10 4.07c.566.764 1.03 1.76 1.337 2.93H8.663C8.97 5.83 9.434 4.834 10 4.07zM7.207 7a9.54 9.54 0 011.035-2.092A7.03 7.03 0 006.05 7h1.157zm0 6H6.05a7.03 7.03 0 002.192 2.092A9.54 9.54 0 017.207 13zm1.456 0h2.674c-.307 1.17-.77 2.166-1.337 2.93-.566-.764-1.03-1.76-1.337-2.93zm3.13 0h1.157a7.03 7.03 0 01-2.192 2.092A9.54 9.54 0 0011.793 13zm1.036-2a9.047 9.047 0 000-2H11.57a9.047 9.047 0 010 2h1.259zM8.43 9a9.047 9.047 0 000 2H7.171a9.047 9.047 0 010-2H8.43zm1.57 0h.001-.001zm0 2h.001-.001z" clipRule="evenodd" />
      </svg>
      <select
        value={locale}
        onChange={handleChange}
        aria-label={t('label')}
        className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {SUPPORTED_LOCALES.map((item) => (
          <option key={item} value={item}>
            {localeLabels[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
