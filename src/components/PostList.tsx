import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import type { PostItem } from '@/utils/posts';
import { t, type I18nKey } from '@/i18n';

interface PostListProps {
  postsByLocale: Record<string, PostItem[]>;
}

export const PostList: React.FC<PostListProps> = ({ postsByLocale }) => {
  const [currentLocale, setCurrentLocale] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('naph130_lang');
      return saved === 'en' || saved === 'en_us' ? 'en_us' : 'zh_cn';
    }
    return 'zh_cn';
  });

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const code = customEvent.detail;
      setCurrentLocale(code === 'en' || code === 'en_us' ? 'en_us' : 'zh_cn');
    };

    window.addEventListener('naph130:lang-change', handleLangChange);
    return () => {
      window.removeEventListener('naph130:lang-change', handleLangChange);
    };
  }, []);

  const posts = postsByLocale[currentLocale] || postsByLocale['zh_cn'] || [];

  if (posts.length === 0) {
    const emptyTitle = t('pages.postsEmptyTitle' as I18nKey, currentLocale);
    return (
      <div className="h-full min-h-[300px] flex items-center justify-center p-8 text-neutral-600 font-mono select-none">
        <p className="text-sm sm:text-base text-neutral-700 font-medium tracking-wide">
          {emptyTitle}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post) => {
        return (
          <article
            key={post.id}
            className="group relative flex flex-col md:flex-row items-stretch justify-between rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 hover:border-white/40 shadow-sm hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.25)] transition-all duration-300 overflow-hidden select-none"
          >
            {/* 左侧正文与元数据区 */}
            <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between min-w-0 z-10">
              <div>
                {/* 标题 */}
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 group-hover:text-black transition-colors leading-snug">
                  <a href={`/posts/${post.slug}`} className="focus:outline-none">
                    {post.title}
                  </a>
                </h2>

                {/* 发布时间与预估阅读时间栏 */}
                <div className="flex flex-wrap items-center gap-3.5 mt-2.5 text-xs text-neutral-600 font-mono">
                  {post.date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-700" />
                      <span>{post.date}</span>
                    </div>
                  )}
                  {post.readingTime !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-700" />
                      <span>
                        {currentLocale === 'en_us'
                          ? `~${post.readingTime} min`
                          : `约${post.readingTime}分钟`}
                      </span>
                    </div>
                  )}
                </div>
                {/* 简介正文 */}
                {post.description && (
                  <p className="text-sm text-neutral-700 mt-3 leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                )}
              </div>

              {/* 标签徽章 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/20 text-neutral-700 border border-neutral-300/70 group-hover:border-neutral-400/80 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧封面图：自适应渐变淡出消融遮罩（桌面端向右消融，移动端向下消融） */}
            {post.coverSrc && (
              <a
                href={`/posts/${post.slug}`}
                tabIndex={-1}
                aria-hidden="true"
                className="w-full md:w-[42%] lg:w-[40%] shrink-0 h-44 md:h-auto min-h-[170px] sm:min-h-[190px] relative overflow-hidden post-cover-mask block cursor-pointer"
              >
                <img
                  src={post.coverSrc}
                  alt={post.title}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
                />
              </a>
            )}
          </article>
        );
      })}
    </div>
  );
};
export default PostList;
