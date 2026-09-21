export interface LanguageConfig {
  /** 名称（作为索引的键，使用英文，例如：zh、en） */
  name: string;
  /** 语言全称（用对应的语言书写，例如：简体中文、English） */
  fullName: string;
  /** 语言简称（用对应的语言书写，例如：简中、EN） */
  shortName: string;
  /** 区域与语言代码（locale，例如：zh_cn、en_us） */
  locale: string;
  /** 对应词条文件或路径（path，例如：zh_cn.ts、en_us.ts） */
  path: string;
}

/** 默认语言名称与 locale */
export const defaultLanguage = 'zh' as const;
export const defaultLocale = 'zh_cn' as const;

/** 支持的语言列表配置 */
export const languages = [
  {
    name: 'zh',
    fullName: '简体中文',
    shortName: '简中',
    locale: 'zh_cn',
    path: 'zh_cn.ts',
  },
  {
    name: 'en',
    fullName: 'English',
    shortName: 'EN',
    locale: 'en_us',
    path: 'en_us.ts',
  },
] as const;

export type SupportedLanguage = (typeof languages)[number]['name'];
export type SupportedLocale = (typeof languages)[number]['locale'];

/** 按英文名称索引的语言映射字典 */
export const languagesByName: Record<SupportedLanguage, LanguageConfig> = Object.fromEntries(
  languages.map((lang) => [lang.name, lang])
) as Record<SupportedLanguage, LanguageConfig>;

/** 按 locale 索引的语言映射字典 */
export const languagesByLocale: Record<SupportedLocale, LanguageConfig> = Object.fromEntries(
  languages.map((lang) => [lang.locale, lang])
) as Record<SupportedLocale, LanguageConfig>;
