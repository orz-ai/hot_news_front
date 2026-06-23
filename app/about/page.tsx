"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <>
      <div className="mb-8">
        <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm flex items-center gap-1"></Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

        <div className="prose dark:prose-invert max-w-none">
          <p className="lead text-lg text-gray-600 dark:text-gray-300 mb-8">{t('lead')}</p>
          <h2>{t('missionTitle')}</h2>
          <p>{t('mission')}</p>
          <h2>{t('platformsTitle')}</h2>
          <p>{t('platforms')}</p>
          <h2>{t('apiTitle')}</h2>
          <p>{t('api')}</p>
          <h2>{t('privacyTitle')}</h2>
          <p>{t('privacy')}</p>
          <h2>{t('contactTitle')}</h2>
          <p>{t('contact')}</p>
          <ul>
            <li>{t('email')}</li>
            <li>GitHub：<a href="https://github.com/orz-ai/hot_news" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">{t('github')}</a></li>
          </ul>
          <h2>{t('disclaimerTitle')}</h2>
          <p>{t('disclaimer')}</p>
        </div>
      </motion.div>
    </>
  );
}
