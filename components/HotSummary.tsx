"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import LoadingSpinner from './LoadingSpinner';
import { fetchHotSummary } from '@/utils/api';
import { HotSummaryResponse } from '@/types';
import { usePlatformI18n } from '@/lib/platform-i18n';

type ParsedBlock =
  | { type: 'heading1' | 'heading2' | 'paragraph'; text: string }
  | { type: 'orderedList' | 'unorderedList'; items: string[] };

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function parseSummary(summary: string): ParsedBlock[] {
  const lines = summary.replace(/\r/g, '').split('\n');
  const blocks: ParsedBlock[] = [];
  let paragraphBuffer: string[] = [];
  let listType: 'orderedList' | 'unorderedList' | null = null;
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    blocks.push({ type: 'paragraph', text: paragraphBuffer.join(' ') });
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!listType || listBuffer.length === 0) return;
    blocks.push({ type: listType, items: [...listBuffer] });
    listType = null;
    listBuffer = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const heading1 = trimmed.match(/^#\s+(.+)$/);
    if (heading1) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading1', text: heading1[1] });
      return;
    }

    const heading2 = trimmed.match(/^##\s+(.+)$/);
    if (heading2) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading2', text: heading2[1] });
      return;
    }

    const orderedItem = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedItem) {
      flushParagraph();
      if (listType !== 'orderedList') {
        flushList();
        listType = 'orderedList';
      }
      listBuffer.push(orderedItem[1]);
      return;
    }

    const unorderedItem = trimmed.match(/^-\s+(.+)$/);
    if (unorderedItem) {
      flushParagraph();
      if (listType !== 'unorderedList') {
        flushList();
        listType = 'unorderedList';
      }
      listBuffer.push(unorderedItem[1]);
      return;
    }

    flushList();
    paragraphBuffer.push(trimmed.replace(/\s{2,}$/g, ''));
  });

  flushParagraph();
  flushList();

  return blocks;
}

export default function HotSummary() {
  const t = useTranslations('home.hotSummary');
  const locale = useLocale();
  const { getPlatformInfoByCode } = usePlatformI18n();
  const [data, setData] = useState<HotSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    const response = await fetchHotSummary();
    if (response.status === 'success' && response.summary) {
      setData(response);
    } else {
      setData(null);
      setHasError(true);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const parsedBlocks = useMemo(() => parseSummary(data?.summary || ''), [data?.summary]);
  const platformNames = useMemo(() => {
    if (!data?.platforms?.length) return [];
    return data.platforms.map((code) => getPlatformInfoByCode(code)?.name || code);
  }, [data?.platforms, getPlatformInfoByCode]);

  const formattedGeneratedAt = useMemo(() => {
    if (!data?.generated_at) return '';
    const date = new Date(data.generated_at);
    if (Number.isNaN(date.getTime())) return data.generated_at;

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }, [data?.generated_at, locale]);

  return (
    <section className="mb-16">
      <div className="overflow-hidden rounded-3xl border border-primary-100/70 bg-gradient-to-br from-primary-50 via-white to-purple-50 shadow-card dark:border-primary-900/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="border-b border-primary-100/70 px-6 py-6 dark:border-gray-800 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">{t('title')}</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 md:text-base">{t('subtitle')}</p>
            </div>

            {!isLoading && data && (
              <div className="flex flex-wrap gap-2 md:max-w-md md:justify-end">
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                  {t('meta.date', { value: data.date })}
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                  {t('meta.newsCount', { value: data.news_count })}
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200">
                  {t('meta.platformCount', { value: data.platforms.length })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-6 md:px-8">
          {isLoading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl bg-white/70 px-6 py-12 text-center dark:bg-gray-800/60">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-lg font-medium text-gray-800 dark:text-gray-100">{t('loadingTitle')}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('loadingDesc')}</p>
            </div>
          ) : hasError ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl bg-white/70 px-6 py-12 text-center dark:bg-gray-800/60">
              <p className="text-lg font-medium text-gray-800 dark:text-gray-100">{t('errorTitle')}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('errorDesc')}</p>
              <button
                onClick={loadSummary}
                className="mt-5 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
              >
                {t('retry')}
              </button>
            </div>
          ) : !data ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-white/70 px-6 py-12 text-center text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
              {t('empty')}
            </div>
          ) : (
            <>
              <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-gray-800/70">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('cards.generatedAt')}</div>
                  <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{formattedGeneratedAt || data.generated_at}</div>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-gray-800/70">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('cards.platforms')}</div>
                  <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{platformNames.join(' · ') || t('notAvailable')}</div>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-gray-800/70">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('cards.previousVersion')}</div>
                  <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{data.previous_summary_date || t('noPrevious')}</div>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-gray-800/70">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('cards.promptVersion')}</div>
                  <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{data.prompt_version || t('notAvailable')}</div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-white/90 p-6 shadow-sm dark:bg-gray-800/70">
                <div className={!isExpanded ? 'max-h-[420px] overflow-hidden' : ''}>
                  <div className="space-y-5 text-gray-700 dark:text-gray-200">
                    {parsedBlocks.map((block, index) => {
                      if (block.type === 'heading1') {
                        return (
                          <h3 key={index} className="text-xl font-bold text-gray-900 dark:text-white">
                            {renderInlineMarkdown(block.text)}
                          </h3>
                        );
                      }

                      if (block.type === 'heading2') {
                        return (
                          <h4 key={index} className="text-lg font-semibold text-gray-900 dark:text-white">
                            {renderInlineMarkdown(block.text)}
                          </h4>
                        );
                      }

                      if (block.type === 'orderedList') {
                        return (
                          <ol key={index} className="space-y-3 pl-5 text-sm leading-7 marker:font-semibold md:text-base">
                            {block.items.map((item, itemIndex) => (
                              <li key={`${item}-${itemIndex}`} className="pl-1">
                                {renderInlineMarkdown(item)}
                              </li>
                            ))}
                          </ol>
                        );
                      }

                      if (block.type === 'unorderedList') {
                        return (
                          <ul key={index} className="space-y-3 pl-5 text-sm leading-7 marker:text-primary-500 md:text-base">
                            {block.items.map((item, itemIndex) => (
                              <li key={`${item}-${itemIndex}`} className="pl-1">
                                {renderInlineMarkdown(item)}
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      if (block.type === 'paragraph') {
                        return (
                          <p key={index} className="text-sm leading-7 text-gray-700 dark:text-gray-200 md:text-base">
                            {renderInlineMarkdown(block.text)}
                          </p>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>

                {!isExpanded && parsedBlocks.length > 6 && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-gray-800 dark:via-gray-800/95" />
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  {isExpanded ? t('collapse') : t('expand')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
