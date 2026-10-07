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
2. **活跃状态同步**：每次 `apply()` 都更新 `--page-blur`、`--page-bg` 与 `--page-opacity`。非首页使用用户参数；首页始终写入 `0px / transparent / 0`，避免开关或 React 水合重新打开首页遮罩。
   - `isHomePath()` 统一忽略末尾斜杠，识别 `/`、部署前缀 `/naph130-blog` 和 `/naph130-blog/`。
   - `--glass-*` 保存用户参数，`--page-*` 表示当前页面目标状态。关闭开关不会清除保存的 `blur` 数值。
3. **层叠上下文分级（Stacking Context）**：
   - `z-[0]`：背景壁纸图层（`transition:persist="site-background"`）。
   - `z-[1]`：持久化磨砂遮罩图层（`transition:persist="site-frosted-overlay"`）。
   - `z-[10]`：页面内容区域（`<main>`）。
   - `z-[50]`：顶部透明导航 Bar（`<HeaderNav>`）。

### 1.3 初始化与跨路由同步

`BaseLayout.astro` 分两阶段初始化：

1. **首次绘制前**：头部的 `is:inline` 脚本通过 `define:vars` 接收部署前缀、存储键、默认设置和遮罩底色，从 `localStorage` 读取配置并写入六个根节点变量，避免等待 React 水合才显示磨砂。
2. **模块初始化**：Astro 处理的普通 `<script>` 导入 `initAndApplySettings()`，统一读取注册中心设置并调用 `apply()`。该模块只注册一次路由监听，不依赖持久化导航组件重新挂载。

客户端切页的顺序为：

```text
astro:before-swap
  → 将当前六个 --glass-* / --page-* 变量复制到 event.newDocument.documentElement
Astro 交换 <html> 属性，并保留背景与遮罩节点
astro:after-swap
  → initAndApplySettings() 读取设置，按目标 URL 重新应用页面状态
```

- **进入非首页**：开启时恢复用户保存的模糊强度、白色半透明底色和 `opacity: 1`；关闭时保持透明且无模糊。
- **返回首页**：`--page-blur / --page-bg / --page-opacity` 变为 `0px / transparent / 0`，`--glass-*` 中的用户参数仍保留。
- **动画**：`.frosted-glass-overlay` 使用 500ms 的滤镜、底色和透明度过渡；新文档先继承上一页变量，再应用目标值，防止交换属性时先跳回 CSS 默认状态。
- **持久化**：切页同步只读取设置，不写入 `localStorage`。开关和滑块更新仍由 `HeaderNav` 的设置 effect 执行 `applyAllSettings()` 与 `persistSettings()`。

### 1.4 效果范围

开关控制全屏壁纸遮罩 `#frosted-glass-overlay`。卡片及设置弹窗自己的 `backdrop-filter` 独立存在，因此关闭全局磨砂后，卡片仍可能呈现玻璃效果；首页按原设计始终保持清晰壁纸。

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
- **修复**：移除多余的人工增艳滤镜，遮罩使用 `blur(var(--page-blur, 0px))`，按当前页面状态应用用户保存的模糊参数。

### 坑 6：内联脚本使用 import.meta，切页后开启磨砂无效果

- **现象**：直接刷新子页面时，React 水合后可能恢复磨砂；从文章页点击简介等页面后，根节点 `style` 消失，遮罩变为 `blur(0px)`、`opacity: 0`，即使设置开关仍显示 `[ ON ]`。
- **原因**：`is:inline` 内容不会由 Astro 打包转换。普通经典脚本中的 `import.meta.env.BASE_URL` 原样进入浏览器，引发 `Cannot use 'import.meta' outside a module`，初始化和路由监听均无法执行。ClientRouter 又会交换 `<html>` 属性，持久化遮罩无法保留根节点变量；持久化 `HeaderNav` 的 settings 未变化，其 effect 也不会重新应用。
- **修复**：头部脚本用 `define:vars` 注入服务端配置，移除内联 `import.meta`；路由处理改成 Astro 编译的模块，通过 `astro:before-swap` 保留变量、`astro:after-swap` 重新读取并应用设置。

### 坑 7：部署在子路径时，首页开关错误地打开全局遮罩

- **原因**：原 `apply()` 只判断 `/` 和空路径，遗漏实际首页 `/naph130-blog/`，与布局脚本的判断不一致。
- **修复**：`isHomePath()` 同时处理部署前缀和末尾斜杠；首页也显式同步三个 `--page-*` 变量，使开关和滑块只更新保存的参数，不改变首页清晰壁纸。

## 3. 回归检查

观察目标值时读取根节点变量；观察最终视觉效果时等待 500ms 过渡完成。设置弹窗自带独立模糊，比较壁纸前应关闭弹窗。

| 操作 | 预期 |
| --- | --- |
| 直接加载子页面，默认开启 | `--page-blur: 40px`，遮罩透明度为 1 |
| 子页面关闭 / 再开启 | 关闭变为 `0px / transparent / 0`；开启恢复保存的强度 |
| 将强度改为 73px，再切到另一子页面 | 新页面仍为 73px，开关保持开启 |
| 返回 `/naph130-blog/` | 页面遮罩关闭，`--glass-blur` 仍为 73px |
| 首页操作开关，再进入子页面 | 首页保持清晰，子页面按最新开关和强度生效 |
| 刷新、前进和后退 | 设置保持，按当前页面恢复正确状态 |
| 关闭后刷新或切页 | 遮罩保持关闭，不因默认值回退而重开 |
| 检查浏览器控制台 | 初始化和切页不再出现内联 `import.meta` 语法错误 |

本次修复验证（2026-10-07）：`pnpm build` 完成，40 个文件检查为 0 错误、0 警告，生成 7 个静态页面；浏览器验证了开关、120px 上限、73px 自定义强度、首页与子页往返、刷新及前进后退。生产预览中从文章页切换到简介页后，遮罩保持 `blur(40px)`、`opacity: 1`，控制台无错误。验证后将开发页面设置恢复为原来的开启、40px。
