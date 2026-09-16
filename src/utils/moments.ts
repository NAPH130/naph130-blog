import { getCollection } from 'astro:content';

export interface RawMomentItem {
  date?: string;
  year?: number;
  month?: number;
  day?: number;
  time?: string;
  content: string;
  tags?: string[];
  mood?: string;
  images?: string[];
}

export interface MomentItem {
  id: string;
  year: number;
  month: number;
  day: number;
  time: string; // "14:30"
  fullDateStr: string; // "2026-09-15 14:30"
  content: string;
  timestamp: number;
  tags: string[];
  mood?: string;
  images: string[];
}

export interface DayMoments {
  day: number;
  dayStr: string; // "15"
  moments: MomentItem[];
}

export interface MonthMoments {
  month: number;
  monthStr: string; // "9月" or "Sep"
  days: DayMoments[];
}

export interface YearMoments {
  year: number;
  yearStr: string; // "2026"
  months: MonthMoments[];
}

export interface LocaleMomentsData {
  raw: MomentItem[];
  tree: YearMoments[];
  totalCount: number;
}

const MONTH_NAMES_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * 格式化月份显示文案
 */
export function formatMonth(month: number, locale: string): string {
  const isEn = locale.startsWith('en');
  if (isEn) {
    return MONTH_NAMES_EN[month - 1] || `${month}`;
  }
  return `${month}月`;
}

/**
 * 格式化日期显示文案
 */
export function formatDay(day: number): string {
  return day < 10 ? `0${day}` : `${day}`;
}

// 动态解析 moments 目录下的图片文件
const momentImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/moments/**/*.{png,jpg,jpeg,webp,svg,gif,avif}',
  { eager: true }
);

/**
 * 解析动态图片资源文件路径
 * 映射目标：/src/content/moments/<locale>/images/<img>
 */
export function resolveMomentImages(locale: string, images?: string[]): string[] {
  if (!images || !Array.isArray(images) || images.length === 0) return [];

  return images
    .map((imgName) => {
      if (!imgName || typeof imgName !== 'string') return '';
      const trimmed = imgName.trim();
      // 如果已是外部链接
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
      // 提取纯文件名（去除前导 / 或 images/）
      const cleanName = trimmed
        .replace(/^[/\\]+/, '')
        .replace(/^images[/\\]+/i, '');

      // 匹配 key 规范：/src/content/moments/<locale>/images/<cleanName>
      const key = `/src/content/moments/${locale}/images/${cleanName}`;
      const resolved = momentImages[key]?.default?.src;
      if (resolved) {
        return resolved;
      }

      // 如果未在 glob 命中，返回标准相对路径
      return `/src/content/moments/${locale}/images/${cleanName}`;
    })
    .filter(Boolean);
}

/**
 * 解析单条动态原始数据为标准对象
 */
export function parseMoment(raw: RawMomentItem, index: number, locale = 'zh_cn'): MomentItem {
  let year = raw.year;
  let month = raw.month;
  let day = raw.day;
  let time = raw.time;

  if (raw.date) {
    const trimmed = raw.date.trim();
    // 匹配 "YYYY-MM-DD HH:mm" 或 "YYYY/MM/DD HH:mm"
    const match = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:\s+(\d{1,2}:\d{2}))?/);
    if (match) {
      if (year === undefined) year = parseInt(match[1], 10);
      if (month === undefined) month = parseInt(match[2], 10);
      if (day === undefined) day = parseInt(match[3], 10);
      if (time === undefined && match[4]) time = match[4];
    }
  }

  const finalYear = year ?? new Date().getFullYear();
  const finalMonth = month ?? (new Date().getMonth() + 1);
  const finalDay = day ?? new Date().getDate();
  const finalTime = time ?? '00:00';

  const fullDateStr = `${finalYear}-${String(finalMonth).padStart(2, '0')}-${String(finalDay).padStart(2, '0')} ${finalTime}`;
  const timestamp = new Date(fullDateStr.replace(/-/g, '/')).getTime() || 0;

  // 提取标签：支持 frontmatter tags 或从内容中识别 #标签
  const explicitTags = Array.isArray(raw.tags) ? raw.tags : [];
  const content = raw.content || '';
  const inlineTagMatches = content.match(/#([\p{L}\p{N}_-]+)/gu) || [];
  const extractedTags = inlineTagMatches.map((t) => t.replace(/^#/, ''));
  const allTags = Array.from(new Set([...explicitTags, ...extractedTags]));

  // 解析并映射对应目录下的图片路径
  const rawImages = Array.isArray(raw.images)
    ? raw.images
    : (typeof raw.images === 'string' ? [raw.images] : []);
  const resolvedImages = resolveMomentImages(locale, rawImages);

  return {
    id: `moment-${finalYear}-${finalMonth}-${finalDay}-${finalTime.replace(':', '')}-${index}`,
    year: finalYear,
    month: finalMonth,
    day: finalDay,
    time: finalTime,
    fullDateStr,
    content,
    timestamp,
    tags: allTags,
    mood: raw.mood,
    images: resolvedImages,
  };
}

/**
 * 将平铺的动态列表构建为树状层级：Year -> Month -> Day -> Moments
 */
export function buildMomentsTree(moments: MomentItem[], locale = 'zh_cn'): YearMoments[] {
  // 按时间戳倒序排列（最新发布的在最上面）
  const sorted = [...moments].sort((a, b) => b.timestamp - a.timestamp);

  const yearMap = new Map<number, Map<number, Map<number, MomentItem[]>>>();

  for (const m of sorted) {
    if (!yearMap.has(m.year)) {
      yearMap.set(m.year, new Map());
    }
    const monthMap = yearMap.get(m.year)!;
    if (!monthMap.has(m.month)) {
      monthMap.set(m.month, new Map());
    }
    const dayMap = monthMap.get(m.month)!;
    if (!dayMap.has(m.day)) {
      dayMap.set(m.day, []);
    }
    dayMap.get(m.day)!.push(m);
  }

  const result: YearMoments[] = [];

  // 年份从高到低
  const years = Array.from(yearMap.keys()).sort((a, b) => b - a);

  for (const yr of years) {
    const monthMap = yearMap.get(yr)!;
    const months = Array.from(monthMap.keys()).sort((a, b) => b - a);
    const monthGroups: MonthMoments[] = [];

    for (const mo of months) {
      const dayMap = monthMap.get(mo)!;
      const days = Array.from(dayMap.keys()).sort((a, b) => b - a);
      const dayGroups: DayMoments[] = [];

      for (const d of days) {
        const list = dayMap.get(d)!;
        // 同一天内的动态按时间戳倒序
        list.sort((a, b) => b.timestamp - a.timestamp);
        dayGroups.push({
          day: d,
          dayStr: formatDay(d),
          moments: list,
        });
      }

      monthGroups.push({
        month: mo,
        monthStr: formatMonth(mo, locale),
        days: dayGroups,
      });
    }

    result.push({
      year: yr,
      yearStr: String(yr),
      months: monthGroups,
    });
  }

  return result;
}

/**
 * 获取所有语言包下的动态数据及树状结构
 */
export async function getAllLocaleMoments(): Promise<Record<string, LocaleMomentsData>> {
  const allMomentsDocs = await getCollection('moments');
  const result: Record<string, LocaleMomentsData> = {
    zh_cn: { raw: [], tree: [], totalCount: 0 },
    en_us: { raw: [], tree: [], totalCount: 0 },
  };

  for (const doc of allMomentsDocs) {
    // doc.id 格式如 "zh_cn/moments" 或 "en_us/moments"
    const locale = doc.id.startsWith('en_us') ? 'en_us' : 'zh_cn';
    const rawList: RawMomentItem[] = doc.data.moments || [];
    const parsedList = rawList.map((item, idx) => parseMoment(item, idx, locale));
    const tree = buildMomentsTree(parsedList, locale);

    result[locale] = {
      raw: parsedList,
      tree,
      totalCount: parsedList.length,
    };
  }

  return result;
}
