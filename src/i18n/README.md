# i18n 多语言说明

基于 TypeScript 的轻量多语言方案。提供类型补全、漏译检查和自动回退。

## 文件结构

```text
src/i18n/
├── languages.ts        # 语言配置（代码、名称、显示文本）
├── i18nKeys.ts         # 词条 Key 常量与类型定义
├── translation.ts      # 翻译函数 t() 与回退逻辑
├── index.ts            # 导出入口
├── README.md           # 本文件
└── locales/            # 语言包
    ├── zh_cn.ts        # 简体中文（默认基准）
    └── en_us.ts        # 英文
```

## 核心规则

1. **强类型约束**：所有语言包都要实现 `TranslationSchema`。漏写字段时 TypeScript 会直接报错。
2. **安全回退**：查找不到词条时，自动回退到 `zh_cn`；若均未找到，返回原始 key。

---

## 常用操作

### 1. 新增一个词条

1. 在 `i18nKeys.ts` 的 `I18N_KEYS` 与 `TranslationSchema` 中加字段：
   ```ts
   // I18N_KEYS
   POST_SHARE: 'post.share',

   // TranslationSchema
   post: {
     share: string;
   }
   ```
2. 在 `locales/zh_cn.ts` 和 `locales/en_us.ts` 中补齐翻译。
3. 在页面中使用：
   ```ts
   t('post.share', locale)
   ```

### 2. 添加新语言（如 `ja_jp`）

1. 在 `languages.ts` 的 `languages` 数组中添加配置项。
2. 新建 `locales/ja_jp.ts` 并填入词条。
3. 在 `translation.ts` 的 `translations` 对象中注册该语言。

---

## 代码示例

### Astro 页面

```astro
---
import { t, useTranslations } from '@/i18n';

const { locale = 'zh_cn' } = Astro.props;
const { t: translate } = useTranslations(locale);
---

<nav>
  <a href="/">{translate('nav.home')}</a>
  <a href="/posts">{t('nav.posts', locale)}</a>
</nav>
```

### React 组件

```tsx
import { t, type SupportedLocale } from '@/i18n';

export function Header({ locale }: { locale: SupportedLocale }) {
  return <button>{t('common.themeToggle', locale)}</button>;
}
```
