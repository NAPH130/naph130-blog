# Tailwind CSS 4

项目使用 Tailwind CSS 4 和官方 `@tailwindcss/vite` 插件。Astro 配置中的
`vite.plugins` 负责样式编译，入口为 `src/styles/global.css`。

## 安装与运行

建议统一使用 pnpm，避免不同包管理器混用安装目录：

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm preview
```

网站使用 `/naph130-blog/` 路径前缀。服务启动时会输出实际端口。

## 样式配置

- `@import 'tailwindcss' source('../')` 扫描 `src` 目录，包括 Astro、React 和内容文件。
- `@custom-variant dark (&:where(.dark, .dark *))` 保留由 `.dark` 类触发的暗色样式。
- 原来的 `tailwind.config.mjs` 已移除。新增设计变量使用 CSS `@theme` 配置，
  无需恢复旧的 JavaScript 配置文件。
- 原有的玻璃效果、Markdown 排版和 KaTeX 样式继续位于全局 CSS 中。
- 基础样式显式保留原先的默认边框颜色、占位文本颜色及按钮手形光标。

## 工具类迁移

| Tailwind 3 | Tailwind 4 | 目的 |
| --- | --- | --- |
| `shadow-sm` | `shadow-xs` | 保留原来的小阴影 |
| `drop-shadow-sm` | `drop-shadow-xs` | 保留图片投影强度 |
| `blur-sm` | `blur-xs` | 保留 4px 模糊 |
| `outline-none` | `outline-hidden` | 保留强制颜色模式下的轮廓支持 |
| `bg-gradient-to-*` | `bg-linear-to-*/srgb` | 使用新名称，保留 sRGB 渐变插值 |

后续代码应直接采用 v4 写法。迁移方式参考
[Astro 样式指南](https://docs.astro.build/en/guides/styling/#tailwind) 和
[Tailwind 升级指南](https://tailwindcss.com/docs/upgrade-guide)。
