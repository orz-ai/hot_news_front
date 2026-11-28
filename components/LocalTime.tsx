"use client";

import { useEffect, useState } from 'react';

// Backend timestamps without an offset are UTC; timestamps with an offset retain it.
export function formatLocalTime(value: string, timeOnly = false, locale?: string): string {
  const normalized = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value)
    ? `${value.replace(' ', 'T')}Z`
    : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, timeOnly
    ? { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
    : { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
  ).format(date);
}

export default function LocalTime({ value, timeOnly = false, locale }: { value: string; timeOnly?: boolean; locale?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? formatLocalTime(value, timeOnly, locale) : ''}</>;
}
