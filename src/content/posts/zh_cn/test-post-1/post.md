---
title: "测试文章1"
description: "这是测试文章1的示例简介内容，用于检查文章索引页卡片排版、封面渐变过渡与文本折行效果。"
date: 2026-09-03
pubDate: 2026-09-03
cover: "cover.png"
tags:
  - "测试标签1"
  - "示例标签2"
---

## 1. 项目架构概述

本项目基于 Astro 5 + React 19 + TailwindCSS 构建，采用了现代的前端工程化解耦设计，具备极佳的首屏加载性能与交互流畅度。

### 1.1 核心技术选型

在此次升级中，我们统一梳理了全局样式变量与组件设计规范：

| 模块 / 技术 | 版本 | 核心作用 | 备注 |
| :--- | :--- | :--- | :--- |
| **Astro** | `^5.0.0` | 静态孤岛架构与内容集合管理 | 零 JS 首屏性能 |
| **React** | `19.0.0` | 交互式客户端组件 (Islands) | `client:load` 按需挂载 |
| **TailwindCSS** | `v4 / 3.4` | 原子化实用工具类库 | 结合 Vanilla CSS 磨砂变量 |
| **Lucide React** | `^1.16.0` | 矢量图标库 | 统一视觉微标 |

### 1.2 目录与路由解析

路由采用了双层动态参数 `[...slug].astro`，支持分语言隔离索引：

```typescript
import { getCollection, render } from 'astro:content';
import { resolvePostCover, calculateReadingTime } from '@/utils/posts';

export async function getStaticPaths() {
  const allPosts = await getCollection('posts');
  return allPosts.map((post) => ({
    params: { slug: post.id.replace(/\/post(\.md)?$/, '') },
    props: { post },
  }));
}
```

在本地开发调试环境中，可以通过以下命令快速启动开发服务器：

```bash
# 启动本地热重载开发服务器
npm run dev -- --host
```

## 2. 界面设计规范与交互实现

### 2.1 磨砂玻璃质感

中间栏主卡片与右侧目录导航统一继承了全局磨砂玻璃设计规范：

> 磨砂玻璃卡片采用微饱和度与微亮度消除深色暗区发灰问题，具有极高的观赏度与视觉通透感。

### 2.2 目录平滑跳转与实时追踪

右侧目录具备以下特性：
- 自动层级编号（如 `1`, `1.1`, `1.2`, `2`, `2.1`）；
- 点击目录项平滑滚动至对应正文位置；
- 滚动页面时通过 `IntersectionObserver` 实时判定当前阅读位置，并以**蓝色高亮**指示。

