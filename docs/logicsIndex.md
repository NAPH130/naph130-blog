# 项目核心逻辑文档索引 (Logics Index)

记录本项目各项核心功能、动效算法与架构逻辑的实现细节，以及在开发过程中遇到的踩坑点与修复记录。

---

## 📑 逻辑文档目录

| 序号 | 功能模块 | 对应逻辑文件 | 核心实现 | 踩坑与 Bug 修复记录 |
| :---: | :--- | :--- | :--- | :--- |
| **01** | **首页粒子文字特效** | [`logics/particleHero.md`](./logics/particleHero.md) | 离屏 Canvas 点阵采样、三次贝塞尔入场汇聚、字形轮廓谐波游动、光标排斥物理。 | 字体异步加载未就绪导致采样回退、人工描边过粗、游动半径过大散架。 |
| **02** | **磨砂玻璃与转场控制** | [`logics/frostedGlass.md`](./logics/frostedGlass.md) | SSOT 唯一真相源设置系统、Astro 页面生命周期监听、常驻持久化图层平滑插值。 | 负 Z-Index 导致背景变纯黑、`forwards` 动画锁死变量响应、人工增艳导致色彩过饱和、初次挂载无法触发 transition 导致的瞬间闪烁、`bg-fixed` 导致合成层采样失效。 |
| **03** | **边框流光旋转动效** | [`logics/rotatingBorder.md`](./logics/rotatingBorder.md) | 周长参数化二维映射算法、30 步幂函数渐变光束、180° 对称对角相位驱动。 | 拐角微步跨越产生对角斜向拉扯切线、不同分辨率下的文字重叠与边距适配。 |
| **04** | **顶部导航栏与动态路由** | [`logics/headerNav.md`](./logics/headerNav.md) | 绝对中轴线锁定（50vw）、静态纵向边界、View Transitions 动画冻结、恒定字重零 CLS。 | 静态 Prop 冻结不高亮、字重突变横向位移、底部指示线形成删除线、高度变动纵向位移、Logo 异常折行。 |
| **05** | **设置面板与毛坯极简设计** | [`logics/settingsPanel.md`](./logics/settingsPanel.md) | Anti-Polish / Raw Aesthetic 工坊风格、严格全 0 圆角（rounded-none）、独立磨砂图层。 | 绝对定位溢出触发原生滚动条、路由转场快照拉伸、首页 0 模糊状态下背景虚化缺失。 |
| **06** | **粒子时间时钟与局部差分更新** | [`logics/particleClock.md`](./logics/particleClock.md) | 8 槽位独立粒子池、字符差分检测（Differential Update）、比例字宽权重模型。 | 全局每秒重排导致小时分钟跳闪、全画布扫描导致的冒号周边噪点。 |
| **07** | **语言切换与全站联动** | [`logics/languageSwitcher.md`](./logics/languageSwitcher.md) | 悬浮磨砂菜单、localStorage 持久化、CustomEvent 事件广播解耦、URL 路径优先探测、文章详情页跨语言平滑路由。 | 菜单物理盲区失焦关闭、直接访问英文文章元数据错乱、文章切语未能自动换向路由。 |
| **08** | **文章动态页侧边栏多卡片** | [`logics/blogSidebar.md`](./logics/blogSidebar.md) | 多卡片按需架构（showStats 开关、个人简介与实时日历）、磨砂玻璃视觉语言、分语言动态统计。 | 翻月网格行数差异抖动、非标 Tailwind 类名小屏坍塌、固定最小高度屏幕截断。 |
| **09** | **文章卡片封面渐变与全栏热区** | [`logics/postCardGradient.md`](./logics/postCardGradient.md) | 全栏一体化语义单链接热区（360° 无死角穿透点击跳转）、CSS 响应式 mask-image 线性 Alpha 通道遮罩、半透明磨砂底座无缝相融、悬停微缩放。 | 实体渐变覆层污染磨砂底色、移动端纵向堆叠固定横向遮罩导致发虚、局部零散链接导致大面积点击盲区与多重键盘焦点。 |
| **10** | **文章工程化分语言加载** | [`logics/postLoader.md`](./logics/postLoader.md) | 分语言 locale 子目录切分、同级工程相对图片自动哈希解析、中英字数混合预估阅读时间、即时多语言响应切替。 | 同级相对图片资源在静态编译中找不到打包路径引发 404。 |
| **11** | **文章详情页与目录导航** | [`logics/postDetailView.md`](./logics/postDetailView.md) | 晶透磨砂玻璃胶囊返回按钮（.frosted-glass-back-btn 饱和度增强与高对比可读）、右侧目录全生命周期全屏垂直居中架构（Sticky Full-Height Flex Centering）、顶部封面自上向下渐变消融遮罩、元数据标准层级、Markdown 渲染内容严格全 0 圆角、黑曜石顶栏排布代码块与粘性吸附行号、多级自动标号与滚动实时蓝色高亮。 | 局部滚动宿主导致 IntersectionObserver 视口失焦、Markdown 标题自带序号导致目录双重标号、目录锚点跳转被顶部导航栏遮挡、代码块行号复制污染与空行塌陷、滚动条箭头穿透边角溢出、Astro Shiki 换行符与 white-space 幽灵空白行、返回按钮深色硬编码背景破坏通透感与多场景可读性、Sticky 偏移与内部 Padding-Top 叠加导致侧边目录滚动沉底出界。 |
| **12** | **动态树状时间轴与磨砂卡片** | [`logics/momentsTimeline.md`](./logics/momentsTimeline.md) | Markdown 单文件多语言维护机制（`date`/`content`/`images`）、`import.meta.glob` 图片静态解析、四级嵌套拓扑降序算法、顶部年份快速筛选切换胶囊、流光垂直时间轴与日期分叉微引线拓扑对齐、三图格栅层叠轮播（`MomentCarousel` 严格直角无圆角、左右遮挡半透微模糊、全画幅感知与竖图 9:16/3:4 舒展自适应、双层环境光影防暴力裁切）、一体化无分割线浅色半透明高饱和磨砂圆角悬浮窗（`MomentLightbox` 挂载 `document.body`、`rounded-3xl`、`w-[96vw]`、顶部高光反光、绝对水平居中页码胶囊与高对比白玉控件、纯净无噪视口）、小红书居中 7 颗圆点模型、晶透磨砂卡片（.moment-card 右下角无图标等宽时间、剥离单人博客重复头像/ID 噪声）。 | `space-y-*` 导致垂直线产生 20px 浮空断隙、月末日期垂线下坠穿透出界、语言切替时侧栏与标题动态总数未响应、纯黑黑曜石卡片与整站磨砂视觉割裂、时间轴与日期胶囊脱节悬空、卡片信息密度过载与冗余组件清洗、Vite Glob 相对图片打包 404、小红书指示器首尾边界居中漂移、流内大图阻断阅读与全屏灯箱双层平衡、时间戳 Emoji 剥离、竖向图片固定横幅强制拉伸放大裁切失真、`backdrop-filter` 与 `overflow-hidden` 导致 `position: fixed` 模态框被局限在卡片内（React Portal 解决方案）、悬浮窗深黑背景沉闷割裂与顶部分割线生硬断层、周边提示文本冗余干扰与非对称排版居中漂移、Astro ClientRouter 切页状态重置与 Flexbox `min-height: auto` 导致的轮播图外溢撑爆（全局持久缓存与严格容器尺寸约束）。 |

---

## 🛠️ 新增逻辑文档规范

1. **文件命名**：在 `docs/logics/` 下使用英文驼峰或短横线命名（如 `themeSystem.md`）。
2. **结构要求**：必须包含两个核心模块：
   - **1. 详细实现原理与技术方案**（算法、公式、关键代码片段、参数对照表）。
   - **2. 踩坑点与 Bug 修复记录**（现象、根本原因、修复方案）。
3. **维护索引**：在本文档（`docs/logicsIndex.md`）表格中同步追加条目。
