# 语言切换与全站联动逻辑 (Language Switcher)

位于顶部导航栏右侧功能区，在设置齿轮图标左侧提供国际化（i18n）多语言切换入口。采用悬浮微交互、统一配置清单、持久化存储与多组件响应式联动机制。

源码文件：
- `src/i18n/languages.ts`
- `src/i18n/i18nKeys.ts`
- `src/i18n/locales/zh_cn.ts`
- `src/i18n/locales/en_us.ts`
- `src/components/HeaderNav.tsx`
- `src/components/IntroBio.tsx`

---

## 1. 详细实现原理与联动流程

### 1.1 导航栏与全站组件动态切语链路
当用户在语言下拉菜单中选择一种语言时：
1. **内部状态更新**：`handleSelectLang(name)` 触发 `currentLang` 更新。
2. **持久化与事件广播**：
   - 将选中的语言键存储至 `localStorage('naph130_lang')`。
   - 分发 `window.dispatchEvent(new CustomEvent('naph130:lang-change', { detail: name }))`。
3. **导航栏无刷新重绘（HeaderNav）**：
   - 导航项标签动态调用 `t('nav.' + item.key, targetLocale)`。
   - 首页/简介/文章/动态/友链 5 个标签即时由中文切换为英文（`Home`, `Intro`, `Posts`, `Moments`, `Friends`）或切回中文，**零刷新、零页面位移**。
4. **页面级内容联动（IntroBio）**：
   - 简介页正文组件监听 `naph130:lang-change`，同步将简介 4 行内容在 `zh_cn` 与 `en_us` 之间平滑无刷新切替。

### 1.2 5 项导航词条对照表

| 路由路径 | 词条 Key | 中文（`zh_cn`） | 英文（`en_us`） |
| :---: | :--- | :---: | :---: |
| `/` | `nav.home` | 首页 | Home |
| `/intro` | `nav.intro` | 简介 | Intro |
| `/posts` | `nav.posts` | 文章 | Posts |
| `/moments` | `nav.moments` | 动态 | Moments |
| `/friends` | `nav.friends` | 友链 | Friends |

### 1.3 路径感知自适应与文章详情页跨语言平滑路由
1. **URL 优先语言探测**：在直接通过外链访问 `/posts/en_us/...` 或 `/posts/zh_cn/...` 时，`HeaderNav` 与 `BaseLayout` 优先根据 URL 中的 locale 片段初始化语言状态与 `<html lang>` 属性，保证即使客户端 localStorage 未设定也能准确匹配文章语言。
2. **文章跨语言即时路由重定向**：
   - 当用户在阅读 `/posts/en_us/test-post-1` 并在菜单中选择“简体中文”时，系统侦测到处于分语言文章路由，自动重定向至 `/posts/zh_cn/test-post-1`；
   - 反之，在 `/posts/zh_cn/test-post-1` 选择“English”时自动重定向至 `/posts/en_us/test-post-1`，彻底解决“切语后页面仍停留在异语种文章正文”的断层问题。

---

## 2. 踩坑点与 Bug 修复记录

### 坑 1：切换语言后导航栏仍为固定中文
- **现象**：在右上角切换至 English 后，简介内容变为了英文，但顶部导航栏仍然显示“首页、简介、文章、动态、友链”。
- **原因**：导航栏选项数组中原先写死了静态字符串 `label: '首页'`。
- **修复**：在 `i18nKeys.ts` 与语言包中补充导航词条，`HeaderNav` 改为通过 `t('nav.' + item.key, targetLocale)` 动态推导标签，实现与语言状态的即时联动。

### 坑 2：直接访问英文文章时导航栏与元数据依然显示中文、切语未跳转对应文章
- **现象**：直接输入链接访问 `/posts/en_us/test-post-1` 时，顶部导航栏仍为中文，返回按钮显示“返回”，目录栏显示“目录 2节”，阅读时间显示“约1分钟”，且在菜单切换为中文后页面 URL 毫无变化。
- **原因**：此前全站语言状态单纯从 `localStorage` 获取，未结合路由参数判定；详情页外壳组件写死了中文文本；语言切换菜单仅做了事件派发，没有对文章详情页的分语言路由进行换向。
- **修复**：
  1. `BaseLayout` 支持 `lang` 属性并同步更新 `<html lang={lang}>`；
  2. `HeaderNav` 初始化及路由更新时增加 URL 路径正则嗅探（`/en_us/` $\rightarrow$ `en`）；
  3. `TableOfContents` 增加 `locale` 属性，标头支持 `Table of Contents`，徽章单位由 `节` 变为 `sections`，进度由 `当前进度` 变为 `Progress`；
  4. `HeaderNav.handleSelectLang` 增加文章路由正则匹配，在切语时自动在 `zh_cn` 与 `en_us` 间换向跳转。

