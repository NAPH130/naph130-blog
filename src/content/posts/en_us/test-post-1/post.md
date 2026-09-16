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

![Figure 1.1 Core Layered Architecture and Islands Topology](./cover.png)

As shown above, clicking any Markdown image within the article activates the theater-scale frosted glass Lightbox for lossless full-screen inspection, supporting keyboard navigation (ESC, arrow keys) and scroll gestures.

![Figure 1.2 Client Rendering Pipeline and SSOT Frosted Layer Data Flow](./architecture.svg)

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

## 3. Mathematical Modeling & LaTeX Formula Support

The Markdown typography engine integrates full KaTeX-powered mathematical formula rendering, beautifully displaying inline mathematical symbols and complex multi-line display equations within frosted glass micro-cards.

### 3.1 Inline Formulas & Calculus Notations

High-precision inline mathematical expressions render seamlessly within standard paragraphs:
- Mass-energy equivalence: $E = mc^2$;
- Euler's identity: $e^{i\pi} + 1 = 0$;
- Schrödinger time-dependent wave equation: $i\hbar \frac{\partial}{\partial t}\Psi(\mathbf{r}, t) = \hat{H}\Psi(\mathbf{r}, t)$;
- Cross-entropy loss in machine learning: $L(\theta) = -\frac{1}{N}\sum_{i=1}^N \left[ y_i \ln \hat{y}_i + (1 - y_i)\ln(1 - \hat{y}_i) \right]$.

### 3.2 Display Equations & Integral Transforms

Analytical solution of the Gaussian integral (Euler-Poisson integral) over the real domain:

$$
\int_{-\infty}^{+\infty} e^{-x^2} dx = \sqrt{\pi}
$$

Continuous Fourier Transform pair:

$$
\mathcal{F}(\omega) = \frac{1}{\sqrt{2\pi}} \int_{-\infty}^{+\infty} f(t) e^{-i\omega t} dt, \quad f(t) = \frac{1}{\sqrt{2\pi}} \int_{-\infty}^{+\infty} \mathcal{F}(\omega) e^{i\omega t} d\omega
$$

### 3.3 Classical Field Theory & Aligned Equation Systems

Maxwell's equations in differential form:

$$
\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \cdot \mathbf{B} &= 0 \\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0 \varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}
\end{aligned}
$$

### 3.4 Matrix Algebra & Attention Mechanism

High-dimensional matrix parameterization in the real domain:

$$
\mathbf{W} = \begin{pmatrix}
w_{11} & w_{12} & \cdots & w_{1n} \\
w_{21} & w_{22} & \cdots & w_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
w_{m1} & w_{m2} & \cdots & w_{mn}
\end{pmatrix} \in \mathbb{R}^{m \times n}
$$

Scaled Dot-Product Attention in the Transformer architecture:

$$
\text{Attention}(Q, K, V) = \text{softmax}\left( \frac{Q K^T}{\sqrt{d_k}} \right) V
$$

When equation dimensions exceed the viewport width, the container automatically enables smooth horizontal scrolling, guaranteeing a flawless reading experience across mobile and desktop devices.
