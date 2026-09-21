# 磨砂玻璃与跨页面过渡逻辑 (Frosted Glass)

记录项目中背景磨砂效果的控制链路、跨页面平滑起雾动画与单一真相源（SSOT）架构。

涉及文件：
- `src/settings/items/frostedGlass.ts`
- `src/settings/registry.ts`
- `src/layouts/BaseLayout.astro`
- `src/components/SettingsModal.tsx`
- `src/styles/global.css`

---

## 1. 详细实现原理与技术方案

### 1.1 精简单一真相源 (SSOT)
磨砂参数严格由 `src/settings/items/frostedGlass.ts` 集中管理，仅保留最核心的两个配置项：
- `enabled`：磨砂遮罩开关（布尔值，默认 `true`）。
- `blur`：高斯模糊强度（范围 `0 ~ 120px`，步长 1px，默认 `40px`）。
- 遮罩底色固定采用自然纯净的白底半透光晕：`rgba(255, 255, 255, 0.28)`。

### 1.2 变量分发与分层渲染
1. **参数写入**：用户在设置面板拖动滑块时，`apply()` 方法即时向 `document.documentElement` 写入：
   - `--glass-blur`：当前保存的模糊值（如 `40px`）。
   - `--glass-bg`：半透底色（`rgba(255, 255, 255, 0.28)`）。
   - `--glass-opacity`：`0` 或 `1`。
2. **活跃状态同步**：非首页环境下，`apply()` 同步更新 `--page-blur`、`--page-bg` 与 `--page-opacity`，实现滑块拖动的毫秒级即时视觉反馈。
3. **层叠上下文分级（Stacking Context）**：
   - `z-[0]`：背景壁纸图层（`transition:persist="site-background"`）。
   - `z-[1]`：持久化磨砂遮罩图层（`transition:persist="site-frosted-overlay"`）。
   - `z-[10]`：页面内容区域（`<main>`）。
   - `z-[50]`：顶部透明导航 Bar（`<HeaderNav>`）。

### 1.3 跨路由平滑起雾与消散机制
- **进入非首页（如 `/intro`）**：
  Astro 路由加载后，监听 `astro:page-load` 将 `--page-blur` 从 `0px` 插值到 `--glass-blur`。配合 CSS `transition`（500ms 缓动），遮罩层像水汽起雾一样平滑显现。
- **返回首页（`/`）**：
  监听器将 `--page-blur` 重新设为 `0px`、`--page-opacity` 设为 `0`，磨砂层平滑消散，壁纸恢复原生清晰。
- **参数保留**：整个路由切换过程绝不修改 `localStorage` 中的自定义参数。

---

## 2. 踩坑点与 Bug 修复记录

### 坑 1：Chromium 硬件合成器层隔离导致模糊几乎失效
- **现象**：滑块无论拉到多大，背景画面几乎看不到模糊效果。
- **原因**：背景壁纸 div 原本添加了 Tailwind 的 `bg-fixed`（`background-attachment: fixed`）。在 Chromium / WebKit 渲染引擎中，`background-attachment: fixed` 会被推入独立的视口合成层，导致处于普通 DOM 树中的遮罩层 `backdrop-filter` 无法对该合成层进行有效像素采样，模糊效果严重失真或被忽略。
- **修复**：因为外层容器本身已是 `fixed inset-0`，直接移除多余的 `bg-fixed` 类名，恢复直接在 DOM 树中的标准硬件采样，模糊效果瞬间清晰呈现。

### 坑 2：调节滑块时页面无实时视觉响应
- **现象**：在设置面板中拖动滑块，页面没有任何变化，必须刷新或切换页面后才生效。
- **原因**：DOM 遮罩节点读取的是过渡变量 `--page-blur`，而 `apply()` 当时只更新了持久化存储变量 `--glass-blur`，两者在交互期间未进行双向同步。
- **修复**：在 `frostedGlass.ts` 的 `apply()` 方法中，判断当前若处于非首页环境，在写入 `--glass-blur` 的同时，立即同步更新当前活跃页面的 `--page-blur` 与 `--page-bg`。

### 坑 3：切换页面时发生属性硬替换闪烁
- **现象**：从简介页点击“首页”时，模糊效果瞬间掉落至 0，随后才渲染首页内容。
- **原因**：之前在 Astro 模板中对不同页面写入了不同的静态 inline `style`。在 View Transitions 交换页面时，Astro 同步覆盖了持久化节点的 `style` 属性，破坏了正在进行的 CSS 平滑插值。
- **修复**：将 `#frosted-glass-overlay` 节点的内联样式固定绑定为动态 CSS 变量（`var(--page-blur)`、`var(--page-bg)`、`var(--page-opacity)`），所有路由切换仅改变根节点变量，Astro 不再发生 DOM 属性硬替换。

### 坑 4：切换页面背景变为纯黑
- **现象**：从首页点击进入简介页，整个背景壁纸消失，显示为纯黑底色。
- **原因**：背景壁纸图层被赋予了 `-z-30` 负层级，而全局 `body` 在 `global.css` 中默认带有不透明背景色 `bg-neutral-950`，导致壁纸被遮挡在 body 底色之下。
- **修复**：将 `body` 背景色设为透明（`background-color: transparent`），并将壁纸层级扶正为 `z-[0]`，磨砂层设为 `z-[1]`。

### 坑 5：背景图片过度饱和、颜色变深
- **现象**：进入简介页后，背景颜色变得异常浓郁刺眼。
- **原因**：为了强化亚克力玻璃感，在滤镜中人工添加了 `saturate(160%) contrast(105%)`，导致底层壁纸的色彩饱和度被强制放大。
- **修复**：彻底移除多余的人工增艳滤镜，仅保留纯净的 `blur(var(--glass-blur))` 高斯模糊，确保 100% 还原壁纸真实自然色调。
