import React, { useState, useEffect } from 'react';
import { t, type I18nKey } from '@/i18n';

interface PageHeaderProps {
  type: 'posts' | 'moments';
  count: number;
  countsByLocale?: Record<string, number>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ type, count, countsByLocale }) => {
  const [lang, setLang] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('naph130_lang');
      return saved === 'en' || saved === 'en-US' ? 'en' : 'zh';
    }
    return 'zh';
  });

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const code = customEvent.detail;
      setLang(code === 'en' || code === 'en-US' ? 'en' : 'zh');
    };

    window.addEventListener('naph130:lang-change', handleLangChange);
    return () => {
      window.removeEventListener('naph130:lang-change', handleLangChange);
    };
  }, []);

  const isEnglish = lang === 'en' || lang === 'en_us';
  const targetLocale = isEnglish ? 'en_us' : 'zh_cn';

  const titleKey = type === 'posts' ? 'pages.postsTitle' : 'pages.momentsTitle';
  const suffixKey = type === 'posts' ? 'pages.postsTotalSuffix' : 'pages.momentsTotalSuffix';
  const prefix = t('pages.totalPrefix' as I18nKey, targetLocale);
  const suffix = t(suffixKey as I18nKey, targetLocale);
  const title = t(titleKey as I18nKey, targetLocale);
  const currentCount = countsByLocale?.[targetLocale] ?? count;

  return (
    <div className="flex items-baseline justify-between pb-6 border-b border-neutral-300/60 select-none">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 font-['Comfortaa']">
        {title}
      </h1>
      <div className="text-sm font-mono text-neutral-600 font-medium">
        {prefix}
        <span className="text-xl font-bold text-neutral-900 mx-1">{currentCount}</span>
        {suffix}
      </div>
    </div>
  );
};
export default PageHeader;
