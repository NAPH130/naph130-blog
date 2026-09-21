# 设置面板与毛坯极简设计逻辑 (Settings Panel)

全站配置交互面板组件，采用 `Anti-Polish / Raw Aesthetic` 原生工坊风格、严格全 0 圆角（`rounded-none`）与浅色通透磨砂玻璃质感。

源码文件：
- `src/components/SettingsModal.tsx`
- `src/settings/types.ts`
- `src/settings/registry.ts`

---

## 1. 详细实现原理与技术方案

### 1.1 Anti-Polish / Raw Aesthetic 设计规范
1. **纯直角几何约束（0 Rounded Corners）**：
   - 彻底废除圆角（`rounded-none`），外边框、开关按键、滑动条触点、标签徽章均采用直角与 1px 纯黑发丝边框。
2. **工坊机械排版（Raw Typography）**：
   - 全等宽字体（`font-mono`）、机械编号索引（`// 01. 磨砂玻璃`）、状态符号（`□` / `■`）。
3. **功能性原生控件**：
   - **方形开关**：`[ ON ]`（实心黑底白字）与 `[ OFF ]`（线框灰字）。
   - **矩形触点滑块**：极简双色轨道 + 纯黑方形金属滑块触点。
   - **结构操作按键**：`[ 恢复默认 ]` 与 `[ 完成 ]`。

### 1.2 独立磨砂玻璃图层架构
为了保证面板在**首页（0 全局模糊）**与**子页面（40px 全局模糊）**下均具备一致的浅色虚化质感：
- 面板自身承载独立的背景遮罩与滤镜：
  ```tsx
  <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
  ```
- 面板主体采用浅色高通透纸白磨砂：
  ```tsx
  className="relative w-[calc(100vw-32px)] sm:w-[400px] max-w-[400px] mx-auto bg-white/90 text-neutral-900 backdrop-blur-2xl border border-neutral-900 rounded-none shadow-2xl"
  ```

### 1.3 键盘与无障碍交互
- 挂载全局 `Escape` 监听，支持随时按键盘 `ESC` 键关闭面板。
- 路由切换（`astro:page-load`）时自动同步关闭面板，防止跳转后弹窗卡死。

---

## 2. 踩坑点与 Bug 修复记录

### 坑 1：绝对定位元素溢出触发浏览器原生滚动条
- **现象**：弹窗右侧与底部出现粗大的白灰色原生滚动条，破坏整体视觉。
- **原因**：外层容器设置了 `overflow-y-auto`，而原本用 CSS `absolute -translate` 定位的十字准星突出了容器边界，被浏览器判定为溢出内容从而唤起横向与纵向滚动条。
- **修复**：外层容器使用固定边界，内层滚动容器显式加入 `scrollbar-none`（`scrollbarWidth: 'none', msOverflowStyle: 'none'`），彻底消灭原生滚动条。

### 坑 2：路由转场期间模态框被拉伸至全屏宽
- **现象**：在路由切换期间唤起设置面板时，面板宽度瞬间与屏幕等宽，样式失真。
- **原因**：弹窗外层容器在转场过程中被 Astro View Transitions 捕获进带有 `transform` 的快照容器中，破坏了 `fixed` 定位的视口基准。
- **修复**：设置显式宽度约束 `w-[calc(100vw-32px)] sm:w-[400px] max-w-[400px] mx-auto`，并在 `BaseLayout.astro` 中对导航容器声明持久化。

### 坑 3：在首页打开设置面板时磨砂背景“消失”
- **现象**：在子页面打开面板背景有强虚化，在首页打开面板背景无虚化。
- **原因**：首页全局壁纸起雾层被配置为 0 模糊，原本模态框自身遮罩层未附加独立模糊。
- **修复**：在模态框自身的遮罩层加入独立 `backdrop-blur-sm bg-black/40`，保证任何页面环境下背景虚化效果完全自洽。
