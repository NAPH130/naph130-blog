# 文章详情展示页与目录导航逻辑 (Post Detail View & TOC)

负责渲染文章展示详情页（在文章目录列表点击卡片后进入），提供与文章页（`/posts`）及简介页（`/intro`）质感完全对齐的磨砂玻璃阅读环境、自上向下平滑渐变消融封面遮罩、元数据标准信息层级、富文本 Markdown 引擎增强排版，以及右侧 1.5 倍高度、全生命周期屏幕垂直居中、实时滚动追踪、蓝色高亮指示的目录导航栏。

源码文件：
- `src/pages/posts/[...slug].astro`
- `src/components/TableOfContents.tsx`
- `src/styles/global.css`
- `src/utils/posts.ts`

---

## 1. 详细实现原理与技术方案

### 1.1 磨砂玻璃视觉语言与全局对齐
为了彻底解决卡片色彩发暗或发灰问题，文章详情页全面放弃单独的 `.frosted-glass-card` 微饱和度滤镜，与 `/posts`（文章页）及 `/intro`（简介页）的核心卡片视觉规范**100% 对齐**：
- **核心类名规范**：`bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)]`；
- **全站统一色温**：完全依靠 `#frosted-glass-overlay` 提供的纯净背景模糊，配合 `bg-white/20` 的半透明白质光晕，消除任何多余的人工饱和度干扰，还原背景壁纸真实自然的色阶。

### 1.2 页面空间布局与动线设计 (内嵌胶囊返回按钮 & 两栏等高栅格)
文章详情页分为居中正文主体卡片与右侧常驻目录导航栏两大部分：
1. **内嵌卡片左上角晶透磨砂胶囊返回按钮（方案 B）**：
   - 摒弃原本孤立悬挂于卡片上方的独立占位行，彻底消除突兀感与视觉割裂；
   - 采用常驻浮动胶囊（Sticky Floating Pill）：`sticky top-2 sm:top-3 z-30`，随读者向下滑动始终常驻左上角，无需滚回顶部即可一键返回；
   - **全站统一晶透磨砂玻璃质感 (`.frosted-glass-back-btn`)**：
     - **磨砂与饱和度增强**：`background-color: rgba(255, 255, 255, 0.65)` 配合 `backdrop-filter: blur(24px) saturate(180%)`，既能自然透出封面与背景的光影，又保持高透光晶莹感；
     - **高光边框与立体微阴影**：1px 白透微边框（`rgba(255, 255, 255, 0.75)`），内嵌顶层高光（`inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.95)`）与双层自然弥散阴影（`0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.05)`）；
     - **清晰易读**：字色采用高对比深岩灰 `color: #1e293b` 与 `font-semibold`，在暗色封面图及浅色正文卡片上均具备最佳可读性（实用性优先）；
     - **微交互**：Hover 时上浮 1px、背景亮化至 `0.85`、微阴影扩大，内置 Lucide `ArrowLeft` 箭头向左微移（`-translate-x-1`）；Active 按下时缩放至 `scale-95` 产生清脆机械触感；多语言自动适配（中文 `返回`，英文 `Back`）。
2. **两栏自适应栅格与等高拉伸**：
   - 栅格排布：`grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_310px] gap-6 lg:gap-8 items-stretch pb-16`；
   - 重点：使用 `items-stretch` 让右侧 `aside` 高度自动等同于正文 `main`，为 Sticky 垂直居中提供全长滚动轨道；右侧目录卡片在初次挂载时即与视口中央精准对称。

### 1.3 顶部封面图自上向下平滑渐变消融遮罩
为了实现“最上面是 cover 图片，自上向下渐变过渡（上方图片清晰、下方遮挡过渡融入正文）”的极佳观感，采用**多阶渐变消融算法**：
1. **CSS 垂直 Alpha 通道渐进消融遮罩 (`.post-detail-cover-mask`)**：
   ```css
   .post-detail-cover-mask {
     mask-image: linear-gradient(
       to bottom,
       rgba(0, 0, 0, 1) 0%,
       rgba(0, 0, 0, 1) 45%,
       rgba(0, 0, 0, 0.85) 65%,
       rgba(0, 0, 0, 0.5) 82%,
       rgba(0, 0, 0, 0.15) 94%,
       transparent 100%
     );
     -webkit-mask-image: linear-gradient(
       to bottom,
       rgba(0, 0, 0, 1) 0%,
       rgba(0, 0, 0, 1) 45%,
       rgba(0, 0, 0, 0.85) 65%,
       rgba(0, 0, 0, 0.5) 82%,
       rgba(0, 0, 0, 0.15) 94%,
       transparent 100%
     );
   }
   ```
   - 顶部 `0% ~ 45%` 区域保持 `rgba(0, 0, 0, 1)`，呈现封面原图完整清晰的视觉主体；
   - `45% ~ 100%` 呈现类似三次缓动的连续非线性衰减，至底部平滑过渡至 `transparent`，直接透出卡片底色。
2. **柔和底部微过渡层 (`from-white/20 via-white/5 to-transparent`)**：
   彻底移除此前过于生硬的 `from-white/60` 高透明度白雾层，采用与卡片底色严格对齐的 `from-white/20`，杜绝生硬白色分割带，实现照片自然消融进磨砂玻璃面板的绝美观感。
3. **正文区域上浮负边距 (`-mt-12 sm:-mt-16`)**：
   正文标题与元数据区域优雅上浮，与封面图消融区轻柔搭接，产生层次丰富的景深感。

### 1.4 文章元数据层级规范
正文区顶部严格按层级排版：
- **第一层 Title**：`Comfortaa` 字体加粗渲染大标题，字号 `text-2xl sm:text-3xl md:text-4xl lg:text-5xl`。
- **第二层 标签徽章**：标题下方展示 Lucide `Tag` 图标及标签列表（如 `#架构`、`#Astro`），半透明磨砂圆角胶囊。
- **第三层 发布时间与预估阅读时间**：
  - 发布日期：前置 Lucide `Calendar` 图标；
  - 预估阅读时间：前置 Lucide `Clock` 图标，格式严格对齐规范为 `约<time>分钟`（基于中英文字数算法 `calculateReadingTime`）。

### 1.5 侧边目录导航栏 1.5 倍加高与全生命周期屏幕居中
1. **加高至 1.5 倍高度 (`h-[520px]`)**：
   - 卡片高度扩充为 `h-[520px] max-h-[calc(100vh-8rem)] min-h-[460px]`；
   - 内部纵向舒展：顶部标题与章节计数徽章、中间平滑滚动的目录列表（`flex-1 custom-slidebar pr-2`）、底部常驻小节阅读进度指示器（`当前进度 X / N`）。
2. **全生命周期全屏垂直居中架构 (Sticky Full-Height Flex Centering)**：
   - 彻底摒弃此前容易受滚动内边距干扰的硬编码像素偏移；
   - 采用等高视口常驻流设计：`sticky top-0 h-[calc(100vh-5.75rem)] flex flex-col justify-center pointer-events-none`；
   - **零滚动偏移稳定性**：常驻容器顶边牢固吸附在滚动视口顶部，高度恒等于视口可见高度，内部通过 `flex justify-center` 自动将目录卡片（`pointer-events-auto`）弹性锁定在视口垂直中轴线；
   - 无论是页面初始挂载（`scrollTop = 0`），还是连续向下快速滚动扫读（`scrollTop > 0`），目录卡片**在屏幕上的绝对垂直坐标（Y 轴）分秒不差、始终完全居中锁死**，消除任何滑动下沉或晃动。
3. **层级自动编号与实时纯字体蓝色高亮**：
   - 自动生成 `1`、`1.1`、`1.2`、`2`、`2.1` 编号；
   - 目录整体字号升级放大（标头提升至 `text-base sm:text-lg`，小节条目提升至 `text-sm sm:text-[14.5px]`），大幅增强扫读辨识度；
   - 挂载 `IntersectionObserver` 监听 `#post-scroll-container` 内的标题 Slug，视口中上部正在阅读的标题实时高亮；
   - **严格满足“仅字体蓝色，无蓝色背景，无侧边蓝条”**：彻底移除任何蓝色底色块与侧边边框线（`border-l-2`），保持纯净透明背景（`bg-transparent`），文本与编号呈现高饱和的天蓝加粗色（`text-sky-600 font-bold`），达到极简纯粹的现代排版质感。

### 1.6 黑曜石极客代码块重构 (Obsidian Header Bar, Line Numbers & Pure Copy)
为了给技术文章提供极致的现代极客阅读体验，正文中的所有 Markdown 代码块基于参考规范完成了**独立顶栏（左侧代码语言 + 右侧复制按钮）与左侧粘性行号栏**的架构重构，同时保持经典的黑曜石暗色质感不变：
1. **顶栏结构排布 (`.code-block-header`)**：
   - **全宽顶栏与清晰水平分割**：外层容器采用 Flex 纵向流布局（`flex flex-col`），顶部设置常驻顶栏（`display: flex; justify-content: space-between; align-items: center;`），底部配合 `border-bottom: 1px solid rgba(255, 255, 255, 0.08)` 形成精致微弱的几何分界；
   - **左上角代码语言类型 (`.code-lang-label`)**：采用小写等宽字体（`font-mono text-xs text-neutral-300`），如 `typescript`、`c`、`bash`、`python`，工整清晰；
   - **右上角复制按钮 (`.code-copy-btn`)**：采用矢量剪贴板图标配合文案（多语言自适应：中文 `复制`，英文 `Copy`）。用户点击后无缝过渡至绿宝石轻微晶体高亮反馈态（`copied`，绿宝石 Check 勾选图标 + `已复制` / `Copied`），2000ms 后平滑恢复。
2. **代码栏数显示与粘性行号系统 (`.line::before`)**：
   - **每一行的伪元素 `.line::before`**：
     ```css
     counter-increment: line-number;
     content: counter(line-number);
     position: sticky;
     left: 0;
     z-index: 2;
     background-color: #0c1017;
     display: inline-block;
     width: 2.85rem;
     min-width: 2.85rem;
     padding-right: 0.75rem;
     margin-right: 0.875rem;
     text-align: right;
     color: rgba(255, 255, 255, 0.28);
     border-right: 1px solid rgba(255, 255, 255, 0.08);
     user-select: none;
     -webkit-user-select: none;
     pointer-events: none;
     font-size: 0.75rem;
     font-weight: 500;
     line-height: inherit;
     ```
   - **Sticky 悬浮吸附**：横向滚动长代码时，行号栏始终牢牢贴紧左侧视界，右侧微边框充当竖向标尺，底色遮蔽滑过的字符，浑然一体；
   - **紧凑单行高度**：代码正文使用 `line-height: 1.45 !important`，各行与行号严格基准线对齐。
3. **彻底防止行号污染的纯净代码复制机制**：
   - 通过 `Array.from(pre.querySelectorAll('.line')).map(l => l.textContent).join('\n')` 提取纯净源码文本；
   - 依据 W3C DOM 标准，`textContent` 绝不捕获 CSS 伪元素内容，从而在源头上 100% 确保用户剪贴板仅包含纯净源码，绝不夹带任何行号。
4. **边缘防溢出与防幽灵空白行保护**：
   - 内部 `code` 强制 `display: grid !important`，利用 W3C Grid 规范直接在排版引擎层剔除空白换行节点；
   - `pre` 滚动条移除两端系统箭头，轨道左右留有 `1.25rem` 安全外边距，彻底杜绝刺破边框。

### 1.7 Markdown 正文渲染内容全直角规范 (Strict Zero Border Radius)
依据工坊极简（Raw / Anti-Polish）硬核美学与用户指定规范，文章详情页内由 Markdown 编译出的正文内容一律**不使用任何圆角**：
1. **全局强制铁律**：
   在 `src/styles/global.css` 中声明深层全选择器规则：
   ```css
   .markdown-content,
   .markdown-content *,
   .markdown-content *::before,
   .markdown-content *::after {
     border-radius: 0 !important;
   }
   ```
2. **涵盖全部正文元素**：
   - **代码卡片与顶栏**：`.code-block-wrapper`、`.code-block-header`、`.code-copy-btn`、`pre`、`code`、滚动条滑块（`::-webkit-scrollbar-thumb`）一律呈现平直硬朗的纯直角工坊形态；
   - **表格系统**：`.markdown-content table` 移除外层 `1rem` 圆角，转为纯平直角亚克力网格；
   - **行内元素与引用**：行内代码徽章（`code`）、块引用（`blockquote`）、图片（`img`）等全部取消圆角，达成极度统一的严谨技术读物美感。

---

## 2. 踩坑点与 Bug 修复记录

### 坑 1：子容器局部滚动导致 `IntersectionObserver` 失焦
- **现象**：在整体单屏布局（`h-screen overflow-hidden`）下，正文滚动发生在内层 `#post-scroll-container`，默认使用 `root: null`（视口）可能导致不同浏览器中 Intersection 边界计算产生偏移或漏判。
- **原因**：当滚动宿主不是 `window` 而是具有 `overflow-y-auto` 的局部容器时，IntersectionObserver 的视口基准应明确指向该滚动宿主。
- **修复**：在 `TableOfContents.tsx` 中优先通过 `document.getElementById('post-scroll-container')` 抓取滚动容器并传入 `root: scrollContainer || null`，实现跨平台一致的像素级判定。

### 坑 2：Markdown 标题自带编号引发目录双重标号
- **现象**：作者在撰写 Markdown 时若习惯写成 `## 1. 架构概述`，目录组件自动编号后会出现 `1 1. 架构概述`，视觉体验重复冗余。
- **原因**：Astro 提取出的 `h.text` 包含了正文字符串本身的数字前缀。
- **修复**：在 `numberedItems` 映射算法中增加正则表达式清洗：
  ```ts
  const cleanText = h.text.replace(/^\d+(\.\d+)*[、.\s]+/, '').trim();
  ```
  优雅剥离正文手写前缀，统一由组件算法输出规范编号。

### 坑 3：点击目录锚点时标题被顶部导航栏截断遮挡
- **现象**：点击小节目录跳转后，目标标题恰好停留在屏幕顶端 `top: 0`，被固定在顶部的 HeaderNav 盖住。
- **原因**：原生的 `scrollIntoView` 默认将元素顶部对齐容器边界，忽略了固定定位遮挡层。
- **修复**：在 `src/styles/global.css` 中为 `.markdown-content h1, h2, h3, h4, h5, h6` 统一配置 `scroll-margin-top: 6rem`，在滚动对齐时自动预留顶部导航安全距离。

### 坑 4：微饱和度滤镜导致文章页与文章列表/简介页背景色温失调
- **现象**：进入文章详情页后，背景底色明显偏暗黄或偏深，与 `/posts`、`/intro` 纯净通透的晶莹白底不一致。
- **原因**：此前文章详情页使用了自定义的 `.frosted-glass-card`，其自带 `saturate(135%) brightness(1.02)`，在暖色壁纸区域将色彩过度增艳。
- **修复**：全面对齐 `/posts` 和 `/intro` 的经典类名组合 `bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)]`，彻底恢复清澈透亮的白透亚克力质感。

### 坑 5：CSS Grid 的 `items-start` 导致 Sticky 居中失效
- **现象**：右侧目录卡片设置了 `sticky`，但在页面滚动时卡片跟随文档流直接滚出屏幕，无法悬停居中。
- **原因**：父级 Grid 容器默认声明了 `items-start`，导致右侧列的实际物理高度仅仅等于卡片自身高度（约 520px），没有产生可供 Sticky 滑动的纵向余量。
- **修复**：将 Grid 容器调整为 `items-stretch`，让右侧列高度自动继承左侧主内容卡片的全部高度（例如 2500px），为 `sticky top-[calc(...)]` 提供充足的垂直居中滚动轨道。

### 坑 6：封面图内部人工遮罩与容器硬边界导致色差截断
- **现象**：封面图底部与文章标题之间出现一道明显的水平截断线，并伴随雾状白块，过渡显得僵硬脱节。
- **原因**：此前在封面容器内叠加了 `from-white/20` 渐变色块，且遮罩仅施加在 `img` 标签上，导致封面容器底部的 DOM 物理边界与正文容器负边距交错时形成突兀的光学断层。
- **修复**：彻底剥离任何内部的实体渐变覆盖层（CSS Overlay），将非线性透明度遮罩（`.post-detail-cover-mask`）直接赋予封面容器外壳，使外壳自身的透明度在到达底部前平滑下降至 0（完全透明），使封面图片犹如水墨般浑然一体融进磨砂卡片中，彻底消除任何水平硬切线。

### 坑 7：Astro 内联脚本模板字面量解析异常与剪贴板权限沙盒限制
- **现象**：在 `.astro` 页面的 `<script is:inline>` 中若直接使用 ES6 模板字符串变量插值（如 `${displayLang}`），容易被 Astro 模板编译器提前当作 JSX 表达式拦截并报错；此外在 Headless 自动化测试环境或非前台聚焦窗口中，`navigator.clipboard.writeText` 容易触发 `DOMException: Document is not focused` 或 `NotAllowedError`，导致无反馈。
- **原因**：Astro 编译器对内联脚本存在 AST 语法预解析；现代浏览器安全模型中，异步 Clipboard API 具有严格的前台用户手势及安全凭证上下文限制。
- **修复**：在 DOM 组装中全面采用标准 DOM API（`document.createElement` 与 `textContent` / 显式字符串拼接）避开模板表达式解析冲突；在复制流程中增加双层容错逻辑，当 `navigator.clipboard.writeText` 抛出异常时自动无缝 fallback 至隐藏 `textarea` + `document['execCommand']('copy')`，并在成功后赋予 emerald 绿宝石高亮徽章与 2000ms 自动还原机制。

### 坑 8：代码块添加行号后容易发生“行号污染复制”与“空行高度塌陷”
- **现象**：在通过 CSS 伪元素添加行号后，用户复制代码时剪贴板开头每一行都包含了 `1`、`2`、`3` 等行号，无法直接粘贴运行；同时代码中的空换行（如 `\n\n`）在 flex 布局下容易塌陷为 0 高度。
- **原因**：在 Chromium 浏览器中，`innerText` 会将屏幕可见的 CSS 生成内容（伪元素 `::before`）合并导出；此外没有子节点的 `<span class="line"></span>` 在 flex 容器下如果无文字渲染可能会丢失 baseline 高度。
- **修复**：
  1. 在 CSS 中为 `.code-block-wrapper pre code .line` 增加 `min-height: 1.25em;` 强制锁死空行基准高度；
  2. 复制代码文本提取逻辑改用 `Array.from(pre.querySelectorAll('.line')).map(l => l.textContent).join('\n')`。W3C 规范明确保证 `textContent` 绝不捕获伪元素内容，彻底保证复制代码 100% 纯净无污染。

### 坑 9：代码块下边角溢出（Scrollbar Button 箭头穿透圆角边框）
- **现象**：代码块底部左右两角出现尖锐灰色小方块/三角箭头（`◄` / `►`）刺破外层容器的圆角边框，产生刺眼的视觉溢出瑕疵。
- **原因**：
  1. 此前在每行 `.line` 添加了过大的 `padding-right: 7rem`，导致普通长度的代码在桌面端也被迫触发 `scrollWidth > clientWidth` 产生横向滚动条；
  2. Chromium 在启用了 `scrollbar-width` 时会降级忽略 `::-webkit-scrollbar*` 伪类，恢复 Windows 原生 OS 滚动条两端方块箭头；
  3. Chromium 原生滚动条层级位于普通文档流上方，且不响应外层父容器 `overflow: hidden` 的 `border-radius` 剪裁，导致箭头按钮超出圆角边界。
- **修复**：
  1. 将 `.line` 右侧填充回归为 `1.25rem`，仅对 `:first-child` 单独预留 `6.5rem` 避让右上角胶囊，常规代码卡片不再产生多余的横向滚动条；
  2. 显式声明 `scrollbar-width: auto !important; scrollbar-color: auto !important;` 激活自定义 webkit 滚动条引擎；
  3. 通过 `::-webkit-scrollbar-button { display: none !important; width: 0; height: 0; }` 彻底消灭两端箭头；
  4. 为 `::-webkit-scrollbar-track` 设置 `margin: 0 1.25rem`，即使在必须横向滚动的超长代码下，滚动条两端也严格内缩于圆角弧度安全区域内，彻底杜绝边角溢出。

### 坑 10：Astro Shiki 渲染的源码换行符与 `white-space: pre` 导致行间产生“幽灵空白行”
- **现象**：代码块在浏览器中渲染时，每两行有效代码之间被强行插入了一行不可选中的空白行，导致代码块高度异常膨胀（例如 10 行代码高度高达 370px），行间距极其稀疏松散。
- **原因**：
  1. Astro Shiki 在服务端将 Markdown 代码块高亮编译为 HTML 时，其结构为：
     ```html
     <code><span class="line">...</span>\n<span class="line">...</span></code>
     ```
  2. 每个 `<span class="line">` 之间存在一个真实的 `\n`（换行符）纯文本节点（TextNode）。
  3. 由于父级 `<pre>` 拥有默认属性 `white-space: pre`，当 `code` 处于普通块级格式化上下文（`display: block`）中时，这一个个换行符文本节点会被浏览器当作独立的换行内联流渲染，从而在两个 `span.line` 之间额外生成一个完全等同于行高的空白文本行！
  4. 此外，如果尝试在内联脚本中用 JavaScript 遍历并 `node.remove()` 过滤空白文本节点，在 Astro SSR 静态打包或初次渲染的一瞬间依然会闪烁或面临水合脱节风险。
- **修复**：
  - **基于 W3C CSS Grid 规范的原子级优雅清除**：
    将 `.code-block-wrapper pre code` 的显示模式设置为：
    ```css
    .code-block-wrapper pre code {
      display: grid !important;
      counter-reset: line-number;
      min-width: 100%;
      width: max-content;
    }
    ```
  - **规范原理**：根据 W3C CSS Grid Layout Module Level 1 规范（§4.1）：
    > *"An anonymous grid item is not created for text nodes that consist only of white space."*  
    > （仅由空白字符组成的文本节点不会被生成匿名网格项，直接在排版计算中被彻底忽略！）
  - 浏览器将 `code` 视作 Grid 容器后，夹杂在 `<span class="line">` 之间的 `\n` 文本节点被底层排版引擎自动静默剔除，无需任何复杂的 JS DOM 操作，所有幽灵空白行 100% 凭空消失。
  - 配合设定 `.code-block-wrapper pre` 的 `padding-top: 2.25rem !important` 与紧凑工整的 `line-height: 1.45 !important`，代码块高度由 370px 瞬间压缩回 249px 的极致紧凑比例，且右上角控制胶囊与首行代码拥有清晰的纵向安全间隔，彻底杜绝重合。

### 坑 11：返回按钮深色硬编码背景破坏全站磨砂通透感与多场景可读性
- **现象**：文章详情页左上角的返回按钮呈现突兀的深黑灰色块（`bg-neutral-900/60`），与全站清澈通透的磨砂白透亚克力视觉规范严重割裂，在暗色封面图上缺乏层次感，在正文浅色卡片上滚动时像一块黑色贴片。
- **原因**：此前为了在暗色封面图上获取视觉反差，使用了粗暴的深色实体背景类名硬编码，破坏了磨砂玻璃的通透光泽感，且缺乏色彩饱和度补偿。
- **修复**：
  1. 在 `src/styles/global.css` 中独立抽象 `.frosted-glass-back-btn` 专属规范；
  2. 采用 `rgba(255, 255, 255, 0.65)` 白透基底配合 `backdrop-filter: blur(24px) saturate(180%)`，使穿透的高斯模糊光影保持鲜亮、不发灰；
  3. 配合 1px 白亮边框（`rgba(255, 255, 255, 0.75)`）、顶层微高光（`inset 0 1px 1.5px rgba(255, 255, 255, 0.95)`）与双层自然弥散阴影（`0 8px 24px -4px rgba(0,0,0,0.12), 0 2px 6px -1px rgba(0,0,0,0.05)`）；
  4. 文本采用深岩灰 `#1e293b` 与 `font-semibold` 加粗，达成暗色封面与浅色正文卡片上的全天候最高对比度与实用可读性；
  5. 赋予 Hover 态上浮 1px、底色微亮至 `0.85`、箭头平滑左移（`group-hover:-translate-x-1`）与 Active 态物理弹性按压反馈（`scale-95`）。

### 坑 12：Sticky 偏移与内部 Padding-Top 叠加导致侧边目录滚动沉底出界
- **现象**：当读者向下滚动阅读文章正文时，右侧目录导航栏不仅没有保持垂直居中，反而不断向下坠落滑行，最终几乎脱离浏览器视口底部，只露出顶部标题。
- **原因**：
  1. 此前在 sticky 容器上同时定义了 `sticky top-[max(1rem,calc((100vh-5.75rem-520px)/2))]` 与 `pt-[max(0px,calc((100vh-5.75rem-520px)/2))]`；
  2. 在 CSS 盒模型与定位规则中，`sticky` 的 `top` 计算的是外边缘相对于滚动视口的偏移，而 `padding-top` 依然在容器内部产生内边距；
  3. 当滚动触发 sticky 吸顶时，卡片相对于视口顶部的物理距离实际上是 `top + padding-top`（偏移量被双重叠加翻倍），导致卡片在滚动时被暴跌式向下推移多达 120px+，沉入屏幕底部；
  4. 此外依赖硬编码估计的 520px 卡片高度，在不同屏幕高度下极易失效。
- **修复**：
  1. 重构为**视口等高弹性常驻流架构 (Sticky Full-Height Flex Centering)**：
     ```astro
     <aside class="hidden lg:block w-full h-full relative select-none">
       <div class="sticky top-0 h-[calc(100vh-5.75rem)] flex flex-col justify-center pointer-events-none">
         <div class="pointer-events-auto w-full">
           <TableOfContents headings={headings} locale={postLocale} client:load />
         </div>
       </div>
     </aside>
     ```
  2. 外层常驻容器高度设为与视口有效高度严格相等的 `h-[calc(100vh-5.75rem)]`，并通过 `top-0` 锁定于滚动视口顶端；
  3. 内部通过 Flexbox 标准的 `justify-center` 将目录卡片弹性定位在垂直几何中线；
  4. 彻底消除任何容易造成多重叠加的内部 `padding-top`，通过外层 `pointer-events-none` 与卡片 `pointer-events-auto` 杜绝空白区域阻碍事件点击；
  5. 自动化测试实测从 `scrollTop = 0` 到长文深入 `scrollTop = 1500px`，目录卡片在视口中的屏幕 Y 轴绝对坐标恒为 `top: 248px, bottom: 768px`，达成真正的“**无论滚动与否，永远绝对居中**”。




