import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileText, Hash, Clock, Sparkles } from 'lucide-react';
import { t, type I18nKey } from '@/i18n';

interface BlogSidebarProps {
  postCount?: number;
  tagCount?: number;
  momentCount?: number;
  statsByLocale?: Record<string, { postCount: number; tagCount: number; momentCount?: number }>;
  showStats?: boolean;
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({
  postCount = 1,
  tagCount = 3,
  momentCount = 0,
  statsByLocale,
  showStats = true,
}) => {
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

  // 日历状态
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = 周日
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const weekdaysZh = ['日', '一', '二', '三', '四', '五', '六'];
  const weekdaysEn = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const weekdays = isEnglish ? weekdaysEn : weekdaysZh;

  const englishMonthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // 生成日历网格单元 (严格固定 42 格 = 6 周行，无论月份天数多少高度绝对恒定)
  const calendarCells = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      isToday: isCurrentMonth && d === todayDate,
    });
  }

  // 严格固定 42 格
  const totalSlots = 42;
  const remaining = totalSlots - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const textPosts = t('sidebar.posts' as I18nKey, targetLocale);
  const textTags = t('sidebar.tags' as I18nKey, targetLocale);
  const textMoments = t('sidebar.moments' as I18nKey, targetLocale);
  const textRunning = t('sidebar.running' as I18nKey, targetLocale);
  const textSiteStats = t('sidebar.siteStats' as I18nKey, targetLocale);
  const textDaysUnit = t('sidebar.daysUnit' as I18nKey, targetLocale);

  const currentPostCount = statsByLocale?.[targetLocale]?.postCount ?? postCount;
  const currentTagCount = statsByLocale?.[targetLocale]?.tagCount ?? tagCount;
  const currentMomentCount = statsByLocale?.[targetLocale]?.momentCount ?? momentCount;

  return (
    <aside className="w-full h-full min-h-0 flex flex-col gap-3.5 select-none font-sans">
      {/* 1. 个人简介卡片：与右侧面板完全对齐的磨砂质感，色调生动不发灰 */}
      <div
        className={`frosted-glass-card rounded-2xl p-4 sm:p-5 text-center relative flex flex-col justify-between ${
          showStats ? 'flex-1 min-h-[190px]' : 'flex-[0.9] min-h-[220px]'
        }`}
      >
        {/* 圆形头像 */}
        <div className="mx-auto w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full border-2 border-white/80 shadow-sm overflow-hidden relative group">
          <img
            src="/avatar.jpg"
            alt="NAPH130"
            className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* 名字 */}
        <h3 className="mt-2 text-lg sm:text-xl font-bold font-['Comfortaa'] tracking-normal text-neutral-900">
          NAPH130
        </h3>

        {/* 核心指标统计 */}
        <div className="grid grid-cols-3 gap-2 mt-auto pt-3 border-t border-white/30">
          <div className="flex flex-col items-center">
            <span className="text-base sm:text-lg font-bold font-mono text-neutral-900">
              {currentPostCount}
            </span>
            <span className="text-[11px] font-medium text-neutral-700 mt-0.5">
              {textPosts}
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-white/25">
            <span className="text-base sm:text-lg font-bold font-mono text-neutral-900">
              {currentTagCount}
            </span>
            <span className="text-[11px] font-medium text-neutral-700 mt-0.5">
              {textTags}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base sm:text-lg font-bold font-mono text-neutral-900">
              {currentMomentCount}
            </span>
            <span className="text-[11px] font-medium text-neutral-700 mt-0.5">
              {textMoments}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 站点统计数据卡片：与右侧面板完全对齐的磨砂质感 (可选) */}
      {showStats && (
        <div className="flex-[0.85] min-h-[150px] frosted-glass-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-2 border-b border-white/30 text-sm font-bold tracking-wider text-neutral-900 shrink-0">
            <BarChart3 className="w-4 h-4 text-neutral-800" />
            <span>{textSiteStats}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto">
            <div className="flex items-center gap-2.5 p-2 rounded-xl border border-white/25 hover:bg-white/10 transition-colors">
              <FileText className="w-4 h-4 text-neutral-700 shrink-0" />
              <div>
                <div className="text-sm sm:text-base font-bold font-mono text-neutral-900 leading-tight">
                  {currentPostCount}
                </div>
                <div className="text-[10px] font-medium text-neutral-700 mt-0.5">
                  {textPosts}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl border border-white/25 hover:bg-white/10 transition-colors">
              <Hash className="w-4 h-4 text-neutral-700 shrink-0" />
              <div>
                <div className="text-sm sm:text-base font-bold font-mono text-neutral-900 leading-tight">
                  {currentTagCount}
                </div>
                <div className="text-[10px] font-medium text-neutral-700 mt-0.5">
                  {textTags}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl border border-white/25 hover:bg-white/10 transition-colors">
              <Sparkles className="w-4 h-4 text-neutral-700 shrink-0" />
              <div>
                <div className="text-sm sm:text-base font-bold font-mono text-neutral-900 leading-tight">
                  {currentMomentCount}
                </div>
                <div className="text-[10px] font-medium text-neutral-700 mt-0.5">
                  {textMoments}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl border border-white/25 hover:bg-white/10 transition-colors">
              <Clock className="w-4 h-4 text-neutral-700 shrink-0" />
              <div>
                <div className="text-sm sm:text-base font-bold font-mono text-neutral-900 leading-tight">
                  1 {textDaysUnit}
                </div>
                <div className="text-[10px] font-medium text-neutral-700 mt-0.5">
                  {textRunning}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 磨砂玻璃实时日历卡片：与右侧面板完全对齐的磨砂质感 (固定 42 格无堆叠) */}
      <div
        className={`frosted-glass-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between ${
          showStats ? 'flex-[1.3] min-h-[250px]' : 'flex-[1.1] min-h-[260px]'
        }`}
      >
        {/* 日历头部 */}
        <div className="flex items-center justify-between pb-2 border-b border-white/30 shrink-0">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-neutral-800" />
            <span className="text-xs sm:text-sm font-bold font-mono tracking-wide text-neutral-900">
              {isEnglish
                ? `${englishMonthNames[month]} ${year}`
                : `${year}年 ${month + 1}月`}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="上个月"
              onClick={handlePrevMonth}
              className="p-1 rounded-md hover:bg-black/5 active:scale-95 transition-all text-neutral-700 hover:text-neutral-950"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="下个月"
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-black/5 active:scale-95 transition-all text-neutral-700 hover:text-neutral-950"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 星期行 */}
        <div className="grid grid-cols-7 gap-1 mt-1.5 text-center text-[10px] sm:text-[11px] font-bold text-neutral-700 shrink-0">
          {weekdays.map((w, idx) => (
            <div key={idx} className="py-0.5">
              {w}
            </div>
          ))}
        </div>

        {/* 严格固定 6 行日期网格：单层 CSS Grid，7 列 6 行精确均分，绝无堆叠与溢出 */}
        <div
          className="grid grid-cols-7 gap-1 mt-2 text-center font-mono text-[11px] sm:text-xs flex-1 items-stretch"
          style={{ gridTemplateRows: 'repeat(6, minmax(0, 1fr))' }}
        >
          {calendarCells.map((cell, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-center rounded-md transition-all ${
                cell.isToday
                  ? 'bg-neutral-900 text-white font-bold shadow-sm scale-105'
                  : cell.isCurrentMonth
                    ? 'text-neutral-800 font-semibold hover:bg-black/5'
                    : 'text-neutral-400/50'
              }`}
            >
              {cell.day}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
export default BlogSidebar;
