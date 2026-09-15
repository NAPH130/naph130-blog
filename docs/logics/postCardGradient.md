# 文章卡片封面渐变过渡逻辑 (Post Card Cover Gradient)

应用于“文章（`/posts`）”列表页中文章展示卡片的设计。在维持全站统一的纯净半透明磨砂玻璃卡片底座的前提下，实现封面图片左侧边缘平滑渐隐消融（Gradient Fade Mask）进入磨砂玻璃卡片的视觉效果。

源码文件：
- `src/pages/posts.astro`

---

## 1. 详细实现原理与遮罩技术

### 1.1 纯净磨砂玻璃底座保留
卡片容器严格继承当前项目的磨砂玻璃美学规范：
```html
<article class="group relative flex flex-col md:flex-row items-stretch justify-between rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 hover:border-white/40 shadow-sm transition-all duration-300 overflow-hidden">
  <!-- 左侧元数据与内容 -->
  <!-- 右侧渐变封面 -->
</article>
```

### 1.2 CSS 响应式线性透明度遮罩（Linear Alpha Mask）
传统的背景渐变遮罩（`bg-gradient-to-r` 覆盖层）在半透明磨砂玻璃卡片上会产生色块断层，无法真实透出卡片背后的模糊壁纸。
因此改用 **CSS `mask-image` / `-webkit-mask-image` 矢量透明度遮罩**，并通过媒体查询适配桌面端与移动端排版方向：

```css
/* 文章卡片封面渐变遮罩：移动端自上而下，桌面端自左向右平滑消融 */
.post-cover-mask {
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.25) 10%,
    rgba(0, 0, 0, 0.85) 30%,
    black 50%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.25) 10%,
    rgba(0, 0, 0, 0.85) 30%,
    black 50%
  );
}

@media (min-width: 768px) {
  .post-cover-mask {
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      rgba(0, 0, 0, 0.25) 10%,
      rgba(0, 0, 0, 0.85) 30%,
      black 50%
    );
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      rgba(0, 0, 0, 0.25) 10%,
      rgba(0, 0, 0, 0.85) 30%,
      black 50%
    );
  }
}
```
- **渐变阈值**：
  - `0% ~ 10%`：Alpha 完全透明（`transparent`），边缘彻底隐形，100% 透出磨砂玻璃底色。
  - `10% ~ 30%`：S 型非线性透明度插值，呈现平滑自然的烟雾消隐过渡。
  - `50% ~ 100%`：Alpha 恢复为完全不透明（`black`），完整展示高清封面细节。
- **自适应方向**：
  - 桌面端（`md:` 及以上横向排版）：使用 `to right`，由左向右消融。
  - 移动端（纵向堆叠排版）：使用 `to bottom`，由上向下消融，使卡片正文与下方图片自然过渡。

### 1.3 悬停交互动效
封面图片包裹在 `overflow-hidden` 容器内，结合 `transform group-hover:scale-105 transition-transform duration-500`，在用户光标移入卡片时产生微幅放大景深感，而渐变过渡线始终稳定锚定在卡片内。

### 1.4 全栏热区触发与单链接语义架构 (Full-Card Anchor & Single Focus)
为了极大提升读者的点击便利性，彻底消除“必须精准将鼠标移至标题细字才能点击”的操作门槛，文章卡片摒弃了局部零散内嵌链接方案，升级为**全栏一体化语义单链接**：
- **顶层外壳作为 `<a>` 锚点**：
  ```tsx
  <a
    key={post.id}
    href={`/posts/${post.slug}`}
    className="group relative flex flex-col md:flex-row items-stretch justify-between rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 hover:border-white/40 shadow-sm hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.25)] transition-all duration-300 overflow-hidden select-none cursor-pointer block no-underline text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
  >
    <!-- 左侧内容与元数据 -->
    <!-- 右侧渐变封面容器 -->
  </a>
  ```
- **360° 无死角响应**：读者点击卡片内的任何区域（包含内边距空白、简介段落、发布日期、阅读时间、标签徽章、封面图片等），均能直接、平滑地进入该文章的详情页；
- **全站统一的手型光标与高亮**：鼠标滑入卡片任何象限，统一呈现手型指针（`cursor-pointer`），底色柔和提亮至 `bg-white/15`，高光白边扩散至 `border-white/40`，标题同步变为深黑；
- **原生浏览习惯与无障碍**：符合 W3C HTML5 规范中 `<a>` 允许包裹流式内容（Flow Content）的标准，完美支持鼠标中键后台标签页打开、Ctrl/Cmd + 单击、右键复制文章链接，且键盘 Tab 导航时单篇卡片仅占用 1 个焦点，无多余冗余停靠。

---

## 2. 踩坑点与 Bug 修复记录

### 坑 1：使用实体渐变覆层（`from-white`）导致半透明底座被污染
- **现象**：如果在图片左侧覆盖一层 `bg-gradient-to-r from-white`，在半透明磨砂卡片上会看到一块死白色的矩形渐变色块，遮挡了底层的虚化壁纸。
- **修复**：放弃实体颜色渐变覆盖，改用通道级透明度遮罩（`mask-image`），使图片本身的像素直接产生由实入虚的渐隐效果，完美与半透明磨砂底座相融。

### 坑 2：移动端纵向堆叠时固定水平遮罩引发半侧发虚断层
- **现象**：在移动端或窄屏下卡片自动折行为纵向（`flex-col`），封面置于正文下方，但遮罩仍固定为水平向右（`to right`），导致移动端图片左半侧异常虚化发空，顶部衔接处反而是生硬截断。
- **修复**：将内联行内遮罩抽象为响应式 `.post-cover-mask` 类，在 `< md` 时自动切换为 `to bottom` 渐变遮罩，使图片顶部平滑消融衔接正文。

### 坑 3：局部零散链接导致大面积点击盲区与多重键盘焦点
- **现象**：读者必须小心翼翼把鼠标精准对齐文章标题文字才能点击跳转，点击卡片大部分留白处、简介正文或标签周围均无反应，操作体验极为逼仄；同时无障碍键盘 Tab 聚焦时同一篇文章被分别聚焦两次（标题一次、封面图一次），多余冗余。
- **原因**：此前仅在 `<h2><a href="...">` 和封面图 `<a href="...">` 分别嵌套了独立的内层链接，外层卡片本身没有导航能力。
- **修复**：将最外层卡片直接提升为单一的 `<a href={`/posts/${post.slug}`}>`，去除标题与封面图内部的冗余链接，使整栏 100% 面积成为交互热区，并提供统一的 `focus-visible:ring-2` 键盘指示。

