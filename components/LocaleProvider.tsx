"use client";

import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, isSupportedLocale, LOCALE_STORAGE_KEY, Locale } from '@/lib/i18n';
import zhCNMessages from '@/messages/zh-CN.json';
import enMessages from '@/messages/en.json';
import jaMessages from '@/messages/ja.json';
import koMessages from '@/messages/ko.json';
import frMessages from '@/messages/fr.json';
import deMessages from '@/messages/de.json';

interface LocaleProviderProps {
  children: React.ReactNode;
}

const LOCALE_MESSAGES: Record<Locale, AbstractIntlMessages> = {
  'zh-CN': zhCNMessages,
  en: enMessages,
  ja: jaMessages,
  ko: koMessages,
  fr: frMessages,
  de: deMessages,
};

export default function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const savedLocale = typeof window !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE_KEY) : null;
    if (savedLocale && isSupportedLocale(savedLocale)) {
      setLocale(savedLocale);
      document.documentElement.lang = savedLocale;
      return;
    }

    const browserLocales = navigator.languages ?? [navigator.language];
    const matchedLocale = browserLocales.find((item) => isSupportedLocale(item));
    if (matchedLocale) {
      setLocale(matchedLocale);
      document.documentElement.lang = matchedLocale;
      localStorage.setItem(LOCALE_STORAGE_KEY, matchedLocale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const messages = useMemo(() => LOCALE_MESSAGES[locale] ?? LOCALE_MESSAGES[DEFAULT_LOCALE], [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Shanghai">
      {children}
    </NextIntlClientProvider>
  );
}
