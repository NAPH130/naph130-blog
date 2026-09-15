import React, { useState, useEffect, useMemo } from 'react';
import { ListCollapse } from 'lucide-react';
import { t, type I18nKey } from '@/i18n';

export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

interface TableOfContentsProps {
  headings: TocHeading[];
  locale?: string;
}

interface NumberedTocItem extends TocHeading {
  numberStr: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ headings, locale }) => {
  const [activeSlug, setActiveSlug] = useState<string>('');
  const [lang, setLang] = useState<string>(() => {
    if (locale) {
      return locale.startsWith('en') ? 'en' : 'zh';
    }
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/en_us/') || path.startsWith('/en/')) return 'en';
      if (path.includes('/zh_cn/') || path.startsWith('/zh/')) return 'zh';
      const saved = localStorage.getItem('naph130_lang');
      return saved === 'en' || saved === 'en_us' ? 'en' : 'zh';
    }
    return 'zh';
  });

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const code = customEvent.detail;
      setLang(code === 'en' || code === 'en_us' ? 'en' : 'zh');
    };

    window.addEventListener('naph130:lang-change', handleLangChange);
    return () => {
      window.removeEventListener('naph130:lang-change', handleLangChange);
    };
  }, []);

  const targetLocale = lang === 'en' ? 'en_us' : 'zh_cn';
  const isEnglish = targetLocale === 'en_us';
  const tocTitle = t('post.tableOfContents' as I18nKey, targetLocale) || (isEnglish ? 'Table of Contents' : '目录');
  const progressText = isEnglish ? 'Progress' : '当前进度';

  // 仅纳入 h1 ~ h4 层级的小节标题
  const filteredHeadings = useMemo(() => {
    return headings.filter((h) => h.depth >= 1 && h.depth <= 4);
  }, [headings]);

  // 为各级标题自动构建层级编号 (例如 1, 1.1, 2, 2.1)
  const numberedItems = useMemo<NumberedTocItem[]>(() => {
    const counters: number[] = [0, 0, 0, 0];
    const minDepth = filteredHeadings.length > 0
      ? Math.min(...filteredHeadings.map((h) => h.depth))
      : 1;

    return filteredHeadings.map((h) => {
      const level = Math.max(0, h.depth - minDepth);
      counters[level]++;
      // 清空下级计数器
      for (let i = level + 1; i < counters.length; i++) {
        counters[i] = 0;
      }
      const parts = counters.slice(0, level + 1).filter((c) => c > 0);
      // 清除正文中已存在的手工数字标号，避免如 1 1. 标题的重复显示
      const cleanText = h.text.replace(/^\d+(\.\d+)*[、.\s]+/, '').trim();
      return {
        ...h,
        text: cleanText || h.text,
        numberStr: parts.join('.'),
      };
    });
  }, [filteredHeadings]);

  const sectionUnit = isEnglish ? (numberedItems.length === 1 ? 'section' : 'sections') : '节';

  // 挂载时若存在 URL Hash 则自动定位
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashSlug = decodeURIComponent(window.location.hash.replace(/^#/, ''));
      const target = document.getElementById(hashSlug);
      if (target) {
        setActiveSlug(hashSlug);
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    }
  }, []);

  // 监听正文小节滚动位置，实时对当前阅读位置进行蓝色高亮
  useEffect(() => {
    if (numberedItems.length === 0) return;

    // 默认激活第一项
    if (!window.location.hash) {
      setActiveSlug(numberedItems[0].slug);
    }

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // 找出当前进入阅读视口中部的有效标题
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        // 取位于视口最上方的可见小节
        const topVisible = visibleEntries.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        )[0];
        setActiveSlug(topVisible.target.id);
      }
    };

    const scrollContainer = document.getElementById('post-scroll-container');
    const observer = new IntersectionObserver(observerCallback, {
      root: scrollContainer || null,
      rootMargin: '-20px 0px -65% 0px',
      threshold: 0,
    });

    numberedItems.forEach((item) => {
      const el = document.getElementById(item.slug);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [numberedItems]);

  const handleItemClick = (slug: string) => {
    const target = document.getElementById(slug);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSlug(slug);
      if (typeof window !== 'undefined' && window.history.replaceState) {
        window.history.replaceState(null, '', `#${slug}`);
      }
    }
  };

  if (numberedItems.length === 0) {
    return null;
  }

  const activeIndex = numberedItems.findIndex((i) => i.slug === activeSlug);

  return (
    <div className="w-full h-[520px] max-h-[calc(100vh-8rem)] min-h-[460px] rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] p-5 sm:p-6 flex flex-col select-none">
      {/* 目录标头：标题 + 章节计数徽章 */}
      <div className="flex items-center justify-between pb-4 border-b border-white/30 shrink-0">
        <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-wider text-neutral-900 font-['Comfortaa']">
          <ListCollapse className="w-5 h-5 text-neutral-800" />
          <span>{tocTitle}</span>
        </div>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/35 text-neutral-900 font-bold border border-white/50 shadow-2xs">
          {numberedItems.length} {sectionUnit}
        </span>
      </div>

      {/* 目录列表：高对比度深色文字，辨识清晰 */}
      <nav className="mt-4 flex-1 overflow-y-auto custom-slidebar pr-2 space-y-2 text-sm">
        {numberedItems.map((item) => {
          const isActive = activeSlug === item.slug;
          const indentClass =
            item.depth === 1
              ? 'pl-2.5'
              : item.depth === 2
                ? 'pl-4'
                : item.depth === 3
                  ? 'pl-7'
                  : 'pl-10';

          return (
            <button
              key={item.slug}
              type="button"
              title={item.text}
              onClick={() => handleItemClick(item.slug)}
              className={`w-full text-left py-2 px-2.5 rounded-xl flex items-start gap-2.5 transition-all duration-200 cursor-pointer group ${indentClass} ${
                isActive
                  ? 'text-sky-600 font-bold bg-transparent'
                  : 'text-neutral-900 hover:text-black hover:bg-white/15 font-semibold bg-transparent'
              }`}
            >
              {/* 层级编号：高对比度清晰呈现 */}
              <span
                className={`font-mono text-sm shrink-0 transition-colors ${
                  isActive ? 'text-sky-600 font-bold' : 'text-neutral-600 group-hover:text-black font-semibold'
                }`}
              >
                {item.numberStr}
              </span>

              {/* 标题文本：清晰加深 */}
              <span className={`truncate leading-relaxed text-sm sm:text-[14.5px] transition-colors ${
                isActive ? 'text-sky-600 font-bold' : 'text-neutral-900 group-hover:text-black font-semibold'
              }`} title={item.text}>
                {item.text}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 底部阅读进度指示 */}
      <div className="pt-3.5 mt-auto border-t border-white/25 flex items-center justify-between text-xs text-neutral-800 font-mono font-semibold shrink-0 select-none">
        <span>{progressText}</span>
        <span className="text-sky-600 font-bold">
          {activeIndex >= 0 ? `${activeIndex + 1} / ${numberedItems.length}` : `1 / ${numberedItems.length}`}
        </span>
      </div>
    </div>
  );
};

export default TableOfContents;
