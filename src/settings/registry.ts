import { frostedGlassCategory } from './items/frostedGlass';

/** 全局设置在 localStorage 中的唯一存储键名 */
export const PAGE_SETTINGS_STORAGE_KEY = 'naph130_page_settings';

/**
 * 全局注册的所有设置大类列表 (SSOT 唯一真相源)
 * 新增大类只需在此数组追加
 */
export const settingCategories = [
  frostedGlassCategory,
] as const;

/**
 * 获取所有大类的初始默认值集合
 */
export function getDefaultSettings(): Record<string, Record<string, unknown>> {
  const defaults: Record<string, Record<string, unknown>> = {};
  for (const cat of settingCategories) {
    defaults[cat.field] = { ...(cat.defaultValues as unknown as Record<string, unknown>) };
  }
  return defaults;
}

/**
 * 从 localStorage 读取当前配置（若无则返回默认配置）
 */
export function loadSavedSettings(): Record<string, Record<string, unknown>> {
  const defaults = getDefaultSettings();
  if (typeof window === 'undefined') return defaults;
  try {
    const saved = localStorage.getItem(PAGE_SETTINGS_STORAGE_KEY);
    if (!saved) return defaults;
    const parsed = JSON.parse(saved);
    // 确保所有注册的字段完整
    const result: Record<string, Record<string, unknown>> = { ...defaults };
    for (const key in parsed) {
      if (key in result) {
        result[key] = { ...result[key], ...parsed[key] };
      }
    }
    return result;
  } catch {
    return defaults;
  }
}

/**
 * 将配置持久化保存到 localStorage
 */
export function persistSettings(settings: Record<string, Record<string, unknown>>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PAGE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/**
 * 执行所有注册大类的 apply() 函数，使设置在页面即刻生效
 */
export function applyAllSettings(settings: Record<string, Record<string, unknown>>): void {
  if (typeof document === 'undefined') return;
  for (const cat of settingCategories) {
    const values = settings[cat.field] ?? (cat.defaultValues as unknown as Record<string, unknown>);
    cat.apply(values as never);
  }
}

/**
 * 一键读取并应用当前全部设置（初始化时调用）
 */
export function initAndApplySettings(): Record<string, Record<string, unknown>> {
  const settings = loadSavedSettings();
  applyAllSettings(settings);
  return settings;
}

/**
 * 按字段名查找对应大类配置
 */
export function getCategoryByField(field: string): (typeof settingCategories)[number] | undefined {
  return settingCategories.find((cat) => cat.field === field);
}
