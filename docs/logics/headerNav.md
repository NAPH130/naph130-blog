# 顶部导航栏与动态高亮路由逻辑 (Header Nav)

全站常驻悬浮导航栏组件，负责跨页面平滑跳转、Astro ClientRouter 生命周期同步、绝对中轴线锁定与零布局偏移（Zero CLS）。

源码文件：
- `src/components/HeaderNav.tsx`
- `src/layouts/BaseLayout.astro`
- `src/styles/global.css`

---

## 1. 详细实现原理与架构方案

### 1.1 绝对中轴线与静态纵向坐标锁定
为了彻底根治传统 Flexbox 两端推挤（`justify-between`）导致的亚像素级横向抖动与响应式纵向跳变：
1. **中轴线绝对居中**：导航选项组使用 `absolute left-1/2 -translate-x-1/2` 直接锚定在视口几何中心（$50\text{vw}$），与两侧容器宽度完全解耦。
2. **纵向静态边界**：导航栏固定高度为 `h-20`（80px），子元素使用 `inset-y-0 flex items-center` 静态垂直对齐，去除所有容器级过渡动画（`transition-all`）与 `translate-y` 计算。

```tsx
<header className="relative w-full h-20 bg-transparent select-none">
  <div className="relative max-w-7xl mx-auto h-full px-6 sm:px-12 flex items-center justify-between">
    <div className="flex items-center shrink-0 z-10 min-w-[220px]">
      <span className="whitespace-nowrap">NAPH130's Blog</span>
    </div>

    <nav className="absolute left-1/2 -translate-x-1/2 inset-y-0 flex items-center justify-center gap-6 sm:gap-9 md:gap-10 shrink-0 z-20">
      {/* 导航项 */}
    </nav>

    <div className="flex items-center justify-end shrink-0 z-10 min-w-[220px]">
      {/* 设置按钮 */}
    </div>
  </div>
</header>
```

### 1.2 动态响应式路由状态与生命周期监听
在 Astro 的 ClientRouter（View Transitions）单页模式下，组件通过监听浏览器与 Astro 专属事件实时更新高亮：
```ts
const [activePath, setActivePath] = useState(() => {
  if (typeof window !== 'undefined') {
    return window.location.pathname.replace(/\/$/, '') || '/';
  }
  return currentPath.replace(/\/$/, '') || '/';
});

useEffect(() => {
  const handlePathUpdate = () => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    setActivePath(path);
    setIsSettingsOpen(false); // 路由切换时自动收起设置面板
  };

  handlePathUpdate();
  document.addEventListener('astro:page-load', handlePathUpdate);
  window.addEventListener('popstate', handlePathUpdate);

  return () => {
    document.removeEventListener('astro:page-load', handlePathUpdate);
    window.removeEventListener('popstate', handlePathUpdate);
  };
}, []);
```

### 1.3 冻结 View Transitions 对导航栏的插值动画
在 `src/styles/global.css` 中注入规则，豁免导航栏在页面路由切换时的平移/缩放动画：
```css
::view-transition-group(site-header-nav) {
  animation: none !important;
}
```

---

## 2. 踩坑点与 Bug 修复记录

### 坑 1：客户端 SPA 跳转后导航高亮停留在旧页面
- **现象**：点击导航项进入新页面后，高亮停留在旧页面。
- **原因**：依赖服务端渲染传入的静态 `currentPath` prop，单页转场未重新加载组件。
- **修复**：改用内部状态 `activePath` 并在 `astro:page-load` / `popstate` 中动态同步。

### 坑 2：激活态字重突变（font-bold）引发文字横向抖动位移
- **现象**：点击导航项时，整排文字向左右发生 2~4px 抖动。
- **原因**：激活项原本由 `font-medium (500)` 切换为 `font-bold (700)`，字符宽度变宽推挤了相邻元素。
- **修复**：统一字重为恒定 `font-semibold (600)`，仅依靠不透明度（`text-white/60` $\to$ `text-white`）与纯白发光阴影实现视觉区分。

### 坑 3：底部指示线穿过文字形成“删除线”
- **现象**：文字底部出现一条横线穿插，形似删除线。
- **原因**：指示线使用了 `absolute -bottom-0.5`，在 Flex 垂直居中行内与文字字面下边缘发生重叠。
- **修复**：彻底移除多余下划线，改用高对比度漫反射光晕（`drop-shadow-[0_0_12px_rgba(255,255,255,0.95)]`）。

### 坑 4：路由跳转瞬间导航栏随页面发生纵向位移
- **现象**：点击导航项时，整个导航栏向下/向上跳动几像素后再复位。
- **原因**：高度使用了响应式 `h-20 sm:h-24`（80px $\leftrightarrow$ 96px）且携带 `transition-all duration-300`，加之 Astro View Transitions 对未冻结元素执行形变插值。
- **修复**：高度固定为 `h-20`（80px），移除容器过渡，并在 `global.css` 声明 `::view-transition-group(site-header-nav) { animation: none !important; }`。

### 坑 5：Logo 文字在部分宽度下异常折行
- **现象**：`NAPH130's Blog` 折行为两行。
- **原因**：容器设置了过窄的固定宽度且缺少不换行声明。
- **修复**：添加 `whitespace-nowrap` 并拓展左右预留宽度至 `min-w-[220px]`。
