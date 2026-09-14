# 文章与动态页侧边栏与页面多语言逻辑 (Blog Sidebar & Pages)

应用于“文章（`/posts`）”与“动态（`/moments`）”页面侧边栏多卡片架构与正文标题国际化联动逻辑。

源码文件：
- `src/components/BlogSidebar.tsx`
- `src/components/PageHeader.tsx`
- `src/components/MomentsFeed.tsx`
- `src/pages/posts.astro`
- `src/pages/moments.astro`
- `src/i18n/locales/zh_cn.ts`
- `src/i18n/locales/en_us.ts`

---

## 1. 详细实现原理与结构设计

### 1.1 纯净单词标题与去中英对照
- **文章页**：标题精简为纯粹的“**文章**”（对应英文“**Posts**”），彻底移除“文章列表”与英文对照副标（`ARTICLE INDEX`）。
- **动态页**：标题精简为纯粹的“**动态**”（对应英文“**Moments**”），彻底移除“动态速递”与英文对照副标（`MOMENTS STREAM`）。
- 由响应式组件 `PageHeader` 统一承载，切语时瞬时响应。

### 1.2 侧边栏与统计词条统一规范
个人简介卡片与站点数据统计卡片的中文文案严格对齐统一：
- **文章**（`sidebar.posts`）：对应文章计数
- **标签**（`sidebar.tags`）：对应标签计数
- **动态**（`sidebar.moments`）：对应动态计数
- **运行**（`sidebar.running`）：数字后附加单位“**天**”（如 `1 天` / `1 d`）

### 1.3 侧边栏及正文多语言（i18n）动态联动
`BlogSidebar`、`PageHeader`、`MomentsFeed` 均挂载 `naph130:lang-change` 广播监听：
- **统计词条**：`文章` $\leftrightarrow$ `Posts`、`标签` $\leftrightarrow$ `Tags`、`动态` $\leftrightarrow$ `Moments`、`运行` $\leftrightarrow$ `Uptime`。
- **日历表头**：星期表头（`日 一 二...` $\leftrightarrow$ `Su Mo Tu...`）与年月（`2026年 9月` $\leftrightarrow$ `Sep 2026`）实时同步。
- **动态数字联动**：通过父级下发 `statsByLocale` 与 `countsByLocale` 映射字典，当切换为对应语言（如英文）时，侧边栏与表头中的文章数、标签数自动响应为该语言下的真实统计，无需刷新。

### 1.4 侧边栏组件按需渲染控制 (`showStats`)
针对不同页面的信息密度差异，`BlogSidebar` 提供 `showStats?: boolean` 开关属性：
- **文章页（`/posts`）**：传入 `showStats={false}` 取消“站点统计”组件，仅保留“个人简介卡片”与“磨砂玻璃实时日历卡片”2 个核心侧边组件。
- **空间与高度重新平衡**：移除中间统计卡片后，个人卡片分配 `flex-[0.9] min-h-[220px]`，日历卡片分配 `flex-[1.1] min-h-[260px]`，双卡片优雅舒展均分侧边高度，与右侧文章面板底部严密齐平。

---

## 2. 踩坑点与 Bug 修复记录

### 坑 1：翻月网格行数差异引发卡片高度推拉抖动
- **现象**：当月份占 4 周与 6 周切换时，卡片高度发生纵向推拉跳动。
- **修复**：在网格生成算法中统一设定 `totalSlots` 补齐策略（固定 35 或 42 格），保持翻月过程高度稳定。

### 坑 2：不同卡片间统计词条不统一
- **现象**：个人卡片写“文章”，统计卡片写“文章总数”，导致视觉冗余。
- **修复**：全面收敛统一为基础名词“文章、标签、动态、运行”，运行数据自动追加“天”字。

### 坑 3：白底半透明平铺导致侧边栏视觉发灰发污与磨砂感失真
- **现象**：若卡片完全使用透明（`bg-transparent`），会导致左侧卡片空洞无白雾质感，与右侧主面板不一致；若平铺粗暴的 `bg-white/20`，在左侧偏暗的暮色暮云壁纸上又会混合成死板浑浊的浅灰底色。
- **修复**：在全局抽象标准旗舰级磨砂玻璃卡片类 `.frosted-glass-card`：
  ```css
  .frosted-glass-card {
    background-color: rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(32px) saturate(135%) brightness(1.02);
    -webkit-backdrop-filter: blur(32px) saturate(135%) brightness(1.02);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow:
      inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
      0 12px 32px -8px rgba(0, 0, 0, 0.15);
  }
  ```
  通过 `saturate(135%) brightness(1.02)` 注入微折射光感，使得左侧冷色暗区背板保持通透明亮、原色不发灰，同时让左侧三张卡片的白雾起雾感与右侧面板完全对齐一致。

### 坑 4：CSS Grid 与 Flex 属性冲突导致日历日期单元格重叠堆挤
- **现象**：日历网格容器同时被赋予了 `grid grid-cols-7` 与 `flex flex-col`，CSS 解析冲突使 42 个日期单元格在纵向上挤压堆叠在一起。
- **修复**：采用单层纯粹的 CSS Grid 布局，严格锁定 `grid-cols-7` 与 `gridTemplateRows: 'repeat(6, minmax(0, 1fr))'`，42 个日期单元格按 7 列 6 行精确均分容器高度，彻底根治堆叠问题。

### 坑 5：Tailwind 非标准原子类导致移动端头像尺寸坍塌
- **现象**：个人简介卡片中误使用了 `w-18 h-18` 与 `p-4.5`，该尺度在 Tailwind CSS v3 默认尺度中不存在，导致小屏下样式失效、头像无宽高约束发生尺寸坍塌。
- **修复**：将头像容器修复为标准尺寸 `w-[72px] h-[72px] sm:w-20 sm:h-20`，内边距规范为 `p-4 sm:p-5`。

### 坑 6：3 张固定最小高度卡片在笔记本与缩放屏幕下纵向溢出
- **现象**：个人卡片（190px）+ 统计卡片（150px）+ 日历卡片（250px）合计最小高度约 620px，在 1080p 125%~150% 缩放或小屏笔记本下，容器锁死 `overflow-hidden` 导致日历底部日期被严重截断。
- **修复**：文章页精简移除“站点统计”组件，仅保留 2 张卡片，将总最小高度安全收敛至约 480px，彻底适配主流笔记本屏幕高度。
