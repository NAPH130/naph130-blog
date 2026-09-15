---
title: "Test Post 1"
description: "This is the sample description for Test Post 1, used to test post index layout, cover gradient, and typography."
date: 2026-09-03
pubDate: 2026-09-03
cover: "cover.png"
tags:
  - "TestTag1"
  - "SampleTag2"
---

## 1. Architectural Overview

This project is built with Astro 5, React 19, and TailwindCSS, adopting a modern decoupled frontend architecture that delivers exceptional first-screen performance and fluid interactions.

### 1.1 Core Technology Stack

In this milestone, we unified the global style design system and component specifications:

| Module / Tech | Version | Core Purpose | Notes |
| :--- | :--- | :--- | :--- |
| **Astro** | `^5.0.0` | Static Islands & Content Collections | Zero-JS initial payload |
| **React** | `19.0.0` | Interactive Client Islands | `client:load` on demand |
| **TailwindCSS** | `v4 / 3.4` | Utility-First CSS Framework | Paired with Frosted Glass tokens |
| **Lucide React** | `^1.16.0` | Vector Icon Library | Unified design visual cues |

### 1.2 Routing & Directory Structure

Routing uses the dynamic parameter `[...slug].astro` to support locale-isolated indexing:

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

In a local development environment, you can quickly spin up the dev server with:

```bash
# Start local development server with hot reload
npm run dev -- --host
```

## 2. Design System & Interaction Implementation

### 2.1 Frosted Glass Aesthetics

The central article card and Table of Contents column inherit the global frosted glass design tokens:

> Frosted glass cards adopt calibrated opacity and backdrop blur to eliminate muddy gray tones on dark background gradients, delivering an authentic crystalline feel.

### 2.2 Smooth Anchoring & Real-time Tracking

The right navigation column delivers:
- Automated hierarchical section numbering (e.g. `1`, `1.1`, `1.2`, `2`, `2.1`);
- Smooth viewport anchoring on click;
- Real-time active reading location tracking via `IntersectionObserver` with sky-blue typography highlighting.
