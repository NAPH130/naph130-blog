import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
} from 'lucide-react';
import type { LocaleMomentsData } from '@/utils/moments';
import { t, type I18nKey } from '@/i18n';

interface MomentsFeedProps {
  momentsByLocale: Record<string, LocaleMomentsData>;
}

// 智能行内富文本解析（识别代码块与超链接）
function renderFormattedContent(text: string) {
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`|https?:\/\/[^\s]+)/gu);

  return parts.map((part, idx) => {
    if (!part) return null;

    // 行内代码块
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const code = part.slice(1, -1);
      return (
        <code
          key={idx}
          className="mx-1 px-1.5 py-0.5 rounded-md bg-neutral-900/[0.07] text-sky-800 font-mono text-[13px] border border-neutral-900/10 select-text"
        >
          {code}
        </code>
      );
    }

    // 链接
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 hover:text-sky-800 underline underline-offset-2 break-all font-medium transition-colors select-text"
        >
          {part}
        </a>
      );
    }

    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

interface MomentLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

/**
 * 全局大图悬浮窗（React Portal 挂载至 document.body）：
 * 突破 .moment-card 的 backdrop-filter 与 overflow-hidden 包含块限制，
 * 呈现覆盖全视口的高级晶透磨砂悬浮窗（带顶栏、计数指示、直角原画展示与键盘导航）。
 */
export const MomentLightbox: React.FC<MomentLightboxProps> = ({
  images,
  initialIndex,
  onClose,
}) => {
  const [index, setIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = images.length;
  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  };
  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [total]);

  if (!mounted || typeof document === 'undefined') return null;

  const content = (
    <div
      className="fixed inset-0 z-[99999] bg-black/35 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 居中大尺寸浅色半透明晶透磨砂玻璃圆角悬浮窗容器 */}
      <div
        className="relative w-[96vw] max-w-[1380px] h-[92vh] sm:h-[94vh] flex flex-col rounded-3xl bg-white/45 dark:bg-white/35 backdrop-blur-3xl backdrop-saturate-150 border border-white/70 shadow-[0_30px_90px_rgba(0,0,0,0.2),inset_0_1px_2.5px_rgba(255,255,255,0.95)] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部晶透微高光反光镜面 */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none z-30" />

        {/* 悬浮窗顶栏（无任何横向分割线，浑然一体） */}
        <div className="relative h-12 sm:h-14 px-4 sm:px-6 flex items-center justify-end select-none shrink-0 z-20">
          {/* 居中计数指示胶囊 */}
          <div className="absolute left-1/2 -translate-x-1/2 font-mono text-xs sm:text-sm tracking-wider px-3.5 py-1 rounded-full bg-white/65 dark:bg-white/55 backdrop-blur-xl border border-white/80 text-neutral-800 dark:text-neutral-900 font-semibold shadow-xs pointer-events-none">
            {index + 1} / {total}
          </div>

          {/* 关闭按钮 */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="w-9 h-9 rounded-full bg-white/60 hover:bg-white/90 active:scale-95 text-neutral-700 hover:text-neutral-950 flex items-center justify-center transition-all cursor-pointer border border-white/80 shadow-xs hover:shadow-md"
            title="关闭 (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 悬浮窗主画布（纯粹通透、无暗色背景遮挡） */}
        <div className="relative flex-1 p-3 sm:p-6 flex items-center justify-center overflow-hidden">
          {/* 大图展示：圆角 rounded-2xl，超清无损渲染 */}
          <img
            src={images[index]}
            alt={`Preview image ${index + 1}`}
            className="max-w-[92vw] max-h-[80vh] sm:max-h-[84vh] w-auto h-auto object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.22),0_4px_12px_rgba(0,0,0,0.08)] border border-white/60 pointer-events-auto select-none transition-all duration-300"
          />

          {/* 左右悬浮翻页大圆钮 */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/70 hover:bg-white/95 active:scale-90 text-neutral-800 hover:text-neutral-950 backdrop-blur-xl flex items-center justify-center border border-white/80 shadow-lg cursor-pointer transition-all hover:scale-105"
                title="上一张 (←)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/70 hover:bg-white/95 active:scale-90 text-neutral-800 hover:text-neutral-950 backdrop-blur-xl flex items-center justify-center border border-white/80 shadow-lg cursor-pointer transition-all hover:scale-105"
                title="下一张 (→)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

interface MomentCarouselProps {
  images: string[];
}

/**
 * 3 张格栅层叠图片轮播组件（硬朗直角 + 紧凑尺寸 + 小红书居中指示器）：
 * 1. 严格直角无圆角（rounded-none）；
 * 2. 紧凑高度（h-[185px] sm:h-[215px]），避免过大影响文字阅读；
 * 3. 一次显示 3 张：中间图片在最顶层（z-20），左右两侧图片被中间图片遮挡（呈格栅状），且更透明模糊；
 * 4. 点击中间主图开启全屏大图预览（Lightbox），点击左右被遮挡图片可直接切换；
 * 5. 下方配备小红书同款高亮圆点严格居中指示器（最多 7 颗）。
 */
export const MomentCarousel: React.FC<MomentCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({});

  if (!images || images.length === 0) return null;

  const total = images.length;

  // 预载图片并感知原始宽高比（宽 / 高）
  useEffect(() => {
    images.forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          const ratio = img.naturalWidth / img.naturalHeight;
          setAspectRatios((prev) => (prev[src] === ratio ? prev : { ...prev, [src]: ratio }));
        }
      };
    });
  }, [images]);

  const handleImageLoad = (src: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const ratio = img.naturalWidth / img.naturalHeight;
      setAspectRatios((prev) => (prev[src] === ratio ? prev : { ...prev, [src]: ratio }));
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  };

  // 移动端轻扫手势监听
  const minSwipeDistance = 35;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
    } else if (distance < -minSwipeDistance) {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
    }
  };

  // 小红书算法：高亮圆点居中，左右两侧最多各 3 个点
  const leftCount = Math.min(3, currentIndex);
  const rightCount = Math.min(3, total - 1 - currentIndex);

  const leftIndices: number[] = [];
  for (let offset = leftCount; offset >= 1; offset--) {
    leftIndices.push(currentIndex - offset);
  }

  const rightIndices: number[] = [];
  for (let offset = 1; offset <= rightCount; offset++) {
    rightIndices.push(currentIndex + offset);
  }

  // 离中心高亮圆点越远，尺寸越小，微阶梯渐隐
  const getDotStyle = (distance: number) => {
    if (distance === 1) {
      return 'w-1.5 h-1.5 bg-neutral-400/80 hover:bg-neutral-600';
    }
    if (distance === 2) {
      return 'w-[5px] h-[5px] bg-neutral-400/50 hover:bg-neutral-600';
    }
    return 'w-1 h-1 bg-neutral-400/30 hover:bg-neutral-600';
  };

  // 左右窥视格栅索引
  const prevIndex = (currentIndex - 1 + total) % total;
  const nextIndex = (currentIndex + 1) % total;

  // 根据当前主图计算比例形态（竖图、方图、横图）
  const currRatio = aspectRatios[images[currentIndex]] ?? 1.5;
  const isPortrait = currRatio < 0.9;
  const isSquare = currRatio >= 0.9 && currRatio <= 1.18;

  // 动态视口高度：竖图自适应舒展为 ~260px，方图 ~225px，横图 ~200px
  const containerHeightClass = isPortrait
    ? 'h-[245px] sm:h-[280px]'
    : isSquare
    ? 'h-[210px] sm:h-[235px]'
    : 'h-[185px] sm:h-[215px]';

  // 中间主图卡片宽度：竖图时收紧（w-[44%] sm:w-[48%]），横图时扩展（w-[60%] sm:w-[64%]）
  const centerCardWidthClass = isPortrait
    ? 'w-[44%] sm:w-[48%]'
    : isSquare
    ? 'w-[52%] sm:w-[56%]'
    : 'w-[60%] sm:w-[64%]';

  // 侧边窥视卡片宽度
  const sideCardWidthClass = isPortrait
    ? 'w-[36%] sm:w-[38%]'
    : 'w-[42%] sm:w-[44%]';

  return (
    <div className="w-full mb-3 select-none">
      {/* 针对单张图片时的自适应纯净展示（竖图自然站立，横图自然铺展，绝不拉伸或被强制裁切） */}
      {total === 1 ? (
        <div className="w-full flex items-center justify-center py-0.5">
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="group/single relative inline-flex items-center justify-center max-h-[260px] sm:max-h-[300px] max-w-full overflow-hidden rounded-none bg-neutral-950/5 border border-white/80 shadow-md cursor-zoom-in transition-transform duration-300 hover:scale-[1.01]"
            title="点击查看全屏大图"
          >
            <img
              src={images[0]}
              alt="Moment image"
              onLoad={(e) => handleImageLoad(images[0], e)}
              className="max-h-[260px] sm:max-h-[300px] w-auto max-w-full object-contain rounded-none pointer-events-none select-none"
              loading="lazy"
            />
            <div className="absolute top-2 left-2 p-1 bg-black/45 backdrop-blur-md text-white/90 opacity-0 group-hover/single:opacity-100 transition-opacity duration-200 pointer-events-none">
              <ZoomIn className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      ) : (
        /* 多张图片时的格栅层叠视口容器：高度随主图画幅自适应过渡 */
        <div
          className={`group/carousel relative w-full ${containerHeightClass} overflow-hidden rounded-none bg-neutral-900/[0.03] border border-neutral-900/10 flex items-center justify-center transition-[height] duration-300 ease-out`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {total >= 3 ? (
            <>
              {/* 左侧被遮挡图片：部分被中间主图遮挡（格栅状），半透明与微模糊，点击切换至该图 */}
              <div
                onClick={() => setCurrentIndex(prevIndex)}
                className={`absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 ${sideCardWidthClass} h-[88%] z-10 opacity-40 hover:opacity-75 blur-[1.5px] hover:blur-none scale-[0.96] transition-all duration-300 cursor-pointer overflow-hidden rounded-none border border-white/40 shadow-xs`}
                title="切换至上一张"
              >
                <img
                  src={images[prevIndex]}
                  alt="Previous image"
                  className="w-full h-full object-cover rounded-none pointer-events-none select-none"
                  loading="lazy"
                />
              </div>

              {/* 右侧被遮挡图片：部分被中间主图遮挡（格栅状），半透明与微模糊，点击切换至该图 */}
              <div
                onClick={() => setCurrentIndex(nextIndex)}
                className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 ${sideCardWidthClass} h-[88%] z-10 opacity-40 hover:opacity-75 blur-[1.5px] hover:blur-none scale-[0.96] transition-all duration-300 cursor-pointer overflow-hidden rounded-none border border-white/40 shadow-xs`}
                title="切换至下一张"
              >
                <img
                  src={images[nextIndex]}
                  alt="Next image"
                  className="w-full h-full object-cover rounded-none pointer-events-none select-none"
                  loading="lazy"
                />
              </div>

              {/* 中间主图：顶层 z-20，双层结构（底层环境柔光高斯模糊 + 顶层完整比例无裁切 object-contain） */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                className={`group/center relative z-20 ${centerCardWidthClass} h-full overflow-hidden rounded-none bg-neutral-950/5 border border-white/80 shadow-md cursor-zoom-in transition-all duration-300 hover:scale-[1.01]`}
                title="点击查看全屏大图"
              >
                {/* 底层环境高斯模糊填色，使任何画幅都有契合原图色调的优雅微光 */}
                <img
                  src={images[currentIndex]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-lg opacity-35 scale-110 pointer-events-none select-none"
                />
                {/* 顶层原图：object-contain 保持完整宽高比，竖图构图与文字一览无余，绝不暴力剪裁 */}
                <img
                  src={images[currentIndex]}
                  alt={`Moment image ${currentIndex + 1} of ${total}`}
                  onLoad={(e) => handleImageLoad(images[currentIndex], e)}
                  className="relative z-10 w-full h-full object-contain rounded-none pointer-events-none select-none drop-shadow-sm"
                  loading="lazy"
                />
                {/* 悬浮放大提示微角标 */}
                <div className="absolute top-2 left-2 z-20 p-1 bg-black/45 backdrop-blur-md text-white/90 opacity-0 group-hover/center:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <ZoomIn className="w-3.5 h-3.5" />
                </div>
              </div>
            </>
          ) : (
            /* 2 张图时双画幅微叠 */
            <>
              <div
                onClick={() => setIsLightboxOpen(true)}
                className={`group/center relative z-20 ${centerCardWidthClass} h-full overflow-hidden rounded-none bg-neutral-950/5 border border-white/80 shadow-md cursor-zoom-in transition-all duration-300`}
                title="点击查看全屏大图"
              >
                <img
                  src={images[currentIndex]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-lg opacity-35 scale-110 pointer-events-none select-none"
                />
                <img
                  src={images[currentIndex]}
                  alt={`Moment image ${currentIndex + 1} of ${total}`}
                  onLoad={(e) => handleImageLoad(images[currentIndex], e)}
                  className="relative z-10 w-full h-full object-contain rounded-none pointer-events-none select-none drop-shadow-sm"
                  loading="lazy"
                />
              </div>
              <div
                onClick={() => setCurrentIndex((currentIndex + 1) % 2)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${sideCardWidthClass} h-[88%] z-10 opacity-40 hover:opacity-75 blur-[1.5px] hover:blur-none scale-[0.96] transition-all duration-300 cursor-pointer overflow-hidden rounded-none border border-white/40 shadow-xs`}
                title="切换图片"
              >
                <img
                  src={images[(currentIndex + 1) % 2]}
                  alt="Next image"
                  className="w-full h-full object-cover rounded-none pointer-events-none select-none"
                  loading="lazy"
                />
              </div>
            </>
          )}

          {/* 左右切换箭头按钮 (PC 悬浮展示) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-none bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 active:scale-90 shadow-md cursor-pointer border border-white/20"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-none bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 active:scale-90 shadow-md cursor-pointer border border-white/20"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* 悬浮角标 (例如 1/8) */}
          <div className="absolute top-2 right-2 z-30 px-1.5 py-0.5 rounded-none bg-black/45 backdrop-blur-md border border-white/20 text-white/95 text-[10px] font-mono tracking-wider shadow-xs pointer-events-none">
            {currentIndex + 1}/{total}
          </div>
        </div>
      )}

      {/* 小红书风格小圆点指示器：高亮圆点居中，最多 7 个圆点 */}
      {total > 1 && (
        <div className="flex items-center justify-center pt-2 pb-0.5">
          {/* 左侧槽位：flex-1 右对齐向中心靠拢 */}
          <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0 pr-1">
            {leftIndices.map((idx) => {
              const dist = currentIndex - idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${getDotStyle(dist)}`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* 中心高亮圆点：永远稳固锚定在 50% 几何中心 */}
          <div className="shrink-0 px-0.5">
            <span
              className="block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-sky-500 shadow-[0_0_6px_rgba(56,189,248,0.7)] transition-all duration-300 scale-110"
              aria-current="true"
            />
          </div>

          {/* 右侧槽位：flex-1 左对齐向中心靠拢 */}
          <div className="flex-1 flex items-center justify-start gap-1.5 min-w-0 pl-1">
            {rightIndices.map((idx) => {
              const dist = idx - currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${getDotStyle(dist)}`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 全屏大图灯箱预览 */}
      {isLightboxOpen && (
        <MomentLightbox
          images={images}
          initialIndex={currentIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export const MomentsFeed: React.FC<MomentsFeedProps> = ({ momentsByLocale }) => {
  const [locale, setLocale] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('naph130_lang');
      return saved === 'en' || saved === 'en_us' ? 'en_us' : 'zh_cn';
    }
    return 'zh_cn';
  });

  // 年份过滤器（'all' 或对应年份数字）
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const code = customEvent.detail;
      setLocale(code === 'en' || code === 'en_us' ? 'en_us' : 'zh_cn');
    };

    window.addEventListener('naph130:lang-change', handleLangChange);
    return () => {
      window.removeEventListener('naph130:lang-change', handleLangChange);
    };
  }, []);

  const currentData = momentsByLocale[locale] || momentsByLocale['zh_cn'] || { tree: [], totalCount: 0 };
  const allYearsTree = currentData.tree || [];

  // 获取所有可选年份
  const availableYears = useMemo(() => {
    return allYearsTree.map((y) => ({
      year: y.year,
      yearStr: y.yearStr,
      count: y.months.reduce((acc, m) => acc + m.days.reduce((dAcc, d) => dAcc + d.moments.length, 0), 0),
    }));
  }, [allYearsTree]);

  // 根据选中的年份过滤
  const filteredTree = useMemo(() => {
    if (selectedYear === 'all') return allYearsTree;
    return allYearsTree.filter((y) => y.year === selectedYear);
  }, [allYearsTree, selectedYear]);

  const isEn = locale.startsWith('en');

  if (allYearsTree.length === 0) {
    const emptyTitle = t('pages.momentsEmptyTitle' as I18nKey, locale);
    return (
      <div className="h-full min-h-[360px] flex flex-col items-center justify-center p-8 text-neutral-600 font-mono select-none">
        <div className="w-16 h-16 rounded-3xl bg-white/30 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow-sm mb-4">
          <Sparkles className="w-7 h-7 text-neutral-400" />
        </div>
        <p className="text-sm sm:text-base text-neutral-700 font-medium tracking-wide">
          {emptyTitle}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-2 sm:py-4 select-none font-sans">
      {/* 顶部胶囊年份过滤导航栏 */}
      {availableYears.length > 1 && (
        <div className="flex items-center gap-2 mb-8 pb-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/50 shadow-2xs">
            <button
              type="button"
              onClick={() => setSelectedYear('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-['Comfortaa'] text-xs font-bold transition-all duration-300 ${
                selectedYear === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs scale-[1.02]'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/30'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isEn ? 'All' : '全部'}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  selectedYear === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-black/5 text-neutral-600'
                }`}
              >
                {currentData.totalCount}
              </span>
            </button>

            {availableYears.map((item) => {
              const active = selectedYear === item.year;
              return (
                <button
                  key={item.year}
                  type="button"
                  onClick={() => setSelectedYear(item.year)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-['Comfortaa'] text-xs font-bold transition-all duration-300 ${
                    active
                      ? 'bg-neutral-900 text-white shadow-xs scale-[1.02]'
                      : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/30'
                  }`}
                >
                  <span>{item.yearStr}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-black/5 text-neutral-600'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 根主轴：流光时间轴容器 */}
      <div className="space-y-10 sm:space-y-12">
        {filteredTree.map((yearGroup) => {
          const totalYearMoments = yearGroup.months.reduce(
            (acc, m) => acc + m.days.reduce((dAcc, d) => dAcc + d.moments.length, 0),
            0
          );

          return (
            <section key={yearGroup.year} className="relative">
              {/* 年份主标头：晶透流光胶囊 */}
              <div className="flex items-center gap-3 relative z-10 mb-7">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 border border-white/60 shrink-0">
                  <Sparkles className="w-4 h-4 text-white drop-shadow-xs" />
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-['Comfortaa'] font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight">
                    {yearGroup.yearStr}
                  </span>
                  <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-white/50 backdrop-blur-md text-neutral-700 border border-white/70 shadow-2xs">
                    {totalYearMoments} {isEn ? 'moments' : '条记录'}
                  </span>
                </div>
              </div>

              {/* 年份下属流：左侧优雅流光时间轴垂直贯穿 (中轴线固定在 left: 16px) */}
              <div className="relative pl-8">
                {/* 垂直时间轴脊柱流光线 (中轴在 x = 16px, 故 left: 15px, 宽 2px) */}
                <div className="absolute left-[15px] top-2 bottom-3 w-[2px] bg-gradient-to-b from-sky-400/60 via-indigo-400/35 to-sky-300/10 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.25)]" />

                {/* 月份分组 */}
                <div className="space-y-8">
                  {yearGroup.months.map((monthGroup) => {
                    return (
                      <div
                        key={`${yearGroup.year}-${monthGroup.month}`}
                        className="relative"
                      >
                        {/* 月份轻盈标签与微节点 */}
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                          {/* 月份时间轴光环微节点 (宽 14px, left: -23px, 中心精准落在 16px) */}
                          <div className="absolute -left-[23px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          </div>

                          {/* 月份水平连接微引线 */}
                          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-sky-400/30" />

                          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-2xs text-neutral-800 font-['Comfortaa'] font-bold text-xs tracking-wide">
                            <Calendar className="w-3.5 h-3.5 text-sky-600" />
                            <span>{monthGroup.monthStr}</span>
                          </div>
                        </div>

                        {/* 日期与动态流 */}
                        <div className="space-y-5">
                          {monthGroup.days.map((dayGroup) => {
                            return (
                              <div
                                key={`${yearGroup.year}-${monthGroup.month}-${dayGroup.day}`}
                                className="relative flex flex-col sm:flex-row items-start gap-3.5 sm:gap-4 group/day"
                              >
                                {/* 日期徽章节点（带水平微引线衔接垂直时间轴） */}
                                <div className="relative shrink-0 pt-0.5">
                                  {/* 日期微节点 (宽 10px, left: -21px, 中心严格落在 16px 时间轴中线上) */}
                                  <div className="absolute -left-[21px] top-[14px] w-2.5 h-2.5 rounded-full bg-white border-2 border-sky-400/80 shadow-[0_0_6px_rgba(56,189,248,0.4)] group-hover/day:border-sky-500 group-hover/day:scale-125 group-hover/day:shadow-[0_0_8px_rgba(56,189,248,0.7)] transition-all duration-300 z-10" />

                                  {/* 水平分叉引线：无缝横贯从时间轴中轴线到日期胶囊 (宽 16px) */}
                                  <div className="absolute -left-4 top-[18px] w-4 h-[1px] bg-sky-400/40 group-hover/day:bg-sky-400/80 group-hover/day:shadow-[0_0_6px_rgba(56,189,248,0.5)] transition-all duration-300" />

                                  {/* 日期徽章胶囊（纯数字日期，触控悬浮联动） */}
                                  <div className="w-9 h-8 sm:w-10 sm:h-8 rounded-xl bg-white/65 backdrop-blur-md border border-white/80 shadow-2xs flex items-center justify-center text-neutral-800 group-hover/day:border-sky-300 group-hover/day:bg-white/90 group-hover/day:text-sky-950 group-hover/day:scale-105 group-hover/day:shadow-xs transition-all duration-300">
                                    <span className="font-mono font-bold text-sm text-neutral-900 leading-none tracking-tight">
                                      {dayGroup.dayStr}
                                    </span>
                                  </div>
                                </div>

                                {/* 同一天的动态卡片流 */}
                                <div className="flex-1 w-full min-w-0 space-y-3.5">
                                  {dayGroup.moments.map((moment) => {
                                    return (
                                      <article
                                        key={moment.id}
                                        className="moment-card group/card relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden"
                                      >
                                        {/* 顶部微高光反射线 */}
                                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

                                        {/* 图片在文字上方显示（小红书同款单图轮播与最多7个居中圆点） */}
                                        {moment.images && moment.images.length > 0 && (
                                          <MomentCarousel images={moment.images} />
                                        )}

                                        {/* 动态正文内容 */}
                                        <div className="text-[14px] sm:text-[14.5px] leading-relaxed text-neutral-800 font-sans tracking-normal select-text break-words whitespace-pre-wrap">
                                          {renderFormattedContent(moment.content)}
                                        </div>

                                        {/* 右下角时间展示（纯文本等宽排版，无 emoji / 图标） */}
                                        <div className="mt-2.5 pt-1 flex items-center justify-end select-none">
                                          <span className="text-xs font-mono text-neutral-500 font-medium tracking-tight">
                                            {moment.fullDateStr}
                                          </span>
                                        </div>
                                      </article>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default MomentsFeed;
