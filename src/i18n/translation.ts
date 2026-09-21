import { defaultLocale, type SupportedLocale } from './languages';
import type { I18nKey, TranslationSchema } from './i18nKeys';
import { zh_cn } from './locales/zh_cn';
import { en_us } from './locales/en_us';

/** 所有语言词条映射字典 */
export const translations: Record<SupportedLocale, TranslationSchema> = {
  zh_cn,
  en_us,
};

/**
 * 获取指定语言的完整词条字典（若不支持则回退至默认语言）
 */
export function getTranslations(locale?: string): TranslationSchema {
  if (locale && locale in translations) {
    return translations[locale as SupportedLocale];
  }
  return translations[defaultLocale];
}

/**
 * 校验并获取合法的语言代码
 */
export function normalizeLocale(locale?: string): SupportedLocale {
  if (locale && locale in translations) {
    return locale as SupportedLocale;
  }
  return defaultLocale;
}

/**
 * 获取指定语言的点路径翻译文本（带智能类型推导与默认语言回退）
 * @example
 * t('nav.home', 'zh_cn') // => "首页"
 * t('post.publishedAt', 'en_us') // => "Published"
 */
function resolveNestedKey(source: unknown, pathSegments: readonly string[]): string | undefined {
  let cursor: unknown = source;
  for (const segment of pathSegments) {
    if (cursor && typeof cursor === 'object' && segment in cursor) {
      cursor = (cursor as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return typeof cursor === 'string' ? cursor : undefined;
}

/**
 * 获取指定语言的点路径翻译文本（带智能类型推导与默认语言回退）
 * @example
 * t('nav.home', 'zh_cn') // => "首页"
 * t('post.publishedAt', 'en_us') // => "Published"
 */
export function t(key: I18nKey, locale?: string): string {
  const pathSegments = key.split('.');
  const currentResult = resolveNestedKey(getTranslations(locale), pathSegments);
  if (currentResult !== undefined) {
    return currentResult;
  }

  const fallbackResult = resolveNestedKey(translations[defaultLocale], pathSegments);
  return fallbackResult !== undefined ? fallbackResult : key;
}

/**
 * 创建针对特定语言的翻译快捷函数
 */
export function useTranslations(locale?: string) {
  const normalized = normalizeLocale(locale);
  return {
    locale: normalized,
    t: (key: I18nKey) => t(key, normalized),
    dict: getTranslations(normalized),
  };
}
