---
title: "高等微积分、复变函数与微分方程导论"
description: "涵盖多元微积分格林与高斯散度定理、柯西留数积分定理、拉普拉斯积分变换以及量子力学薛定谔波动方程与狄拉克符号系统。"
date: 2026-08-20
pubDate: 2026-08-20
cover: "cover.png"
tags:
  - "数学分析"
  - "微积分"
  - "复变函数"
  - "量子物理"
---

## 1. 多元微积分与空间场论积分体系

空间场论将微分算子与流形边界积分紧密结合，构筑了现代偏微分方程与流体力学的基石。

### 1.1 格林公式 (Green's Theorem)

在平面光滑闭合区域 $D \subset \mathbb{R}^2$ 上，向量场与其边界环周积分的等价关系：

$$
\oint_{\partial D} (P dx + Q dy) = \iint_D \left( \frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y} \right) dx dy
$$

### 1.2 高斯散度定理与斯托克斯旋度定理

三维紧致光滑区域 $V \subset \mathbb{R}^3$ 内部的散度体积积分等于闭合外法向通量：

$$
\iiint_V (\nabla \cdot \mathbf{F}) \, dV = \oiint_{\partial V} (\mathbf{F} \cdot \mathbf{n}) \, dS
$$

斯托克斯旋度定理将曲面边界环路积分映射至全域法向旋度积分：

$$
\oint_{\partial S} \mathbf{F} \cdot d\mathbf{r} = \iint_S (\nabla \times \mathbf{F}) \cdot d\mathbf{S}
$$

## 2. 复变函数与柯西留数定理

复分析利用全纯（Holomorphic）函数的可微对称性，为高维解析延拓与实积分提供了强大的积分工具。

### 2.1 柯西积分公式与全纯高阶导数

设函数 $f(z)$ 在单连通区域内全纯，对任意内部解析点 $z_0$：

$$
f^{(n)}(z_0) = \frac{n!}{2\pi i} \oint_C \frac{f(z)}{(z - z_0)^{n+1}} dz
$$

### 2.2 柯西留数定理 (Residue Theorem)

对于区域内包含孤立奇点 $\{z_1, z_2, \dots, z_k\}$ 的闭合回路 $C$：

$$
\oint_C f(z) \, dz = 2\pi i \sum_{j=1}^k \text{Res}(f, z_j)
$$

其中一阶极点的留数计算解析式为：

$$
\text{Res}(f, z_0) = \lim_{z \to z_0} (z - z_0) f(z)
$$

## 3. 积分变换分析：拉普拉斯变换

拉普拉斯变换（Laplace Transform）将时域微分方程转化为频域复频代数多项式：

$$
\mathcal{L}\{f(t)\}(s) \triangleq F(s) = \int_0^{+\infty} f(t) e^{-st} \, dt
$$

微分性质将求导算子转换为多项式乘积：

$$
\mathcal{L}\{f^{(n)}(t)\}(s) = s^n F(s) - \sum_{k=1}^n s^{n-k} f^{(k-1)}(0)
$$

## 4. 量子力学波动方程与算符代数

在希尔伯特空间 $\mathcal{H}$ 中，物理可观测量对应于自伴算符，量子态演化遵循薛定谔方程。

### 4.1 狄拉克括号表示法 (Bra-Ket Notation)

设波函数态矢量为 $|\psi\rangle$，对偶共轭泛函为 $\langle \phi|$，算符 $\hat{A}$ 的跃迁矩阵元与期望值定义为：

$$
\langle \phi | \hat{A} | \psi \rangle = \int_{-\infty}^{+\infty} \phi^*(\mathbf{r}) \hat{A} \psi(\mathbf{r}) \, d\mathbf{r}
$$

### 4.2 广义海森堡不确定性原理 (Robertson-Schrödinger Relation)

对于任意两个不可对易的自伴物理量算符 $\hat{A}$ 与 $\hat{B}$，其对易子记为 $[\hat{A}, \hat{B}] = \hat{A}\hat{B} - \hat{B}\hat{A}$：

$$
\sigma_A \sigma_B \ge \frac{1}{2} \left| \langle [\hat{A}, \hat{B}] \rangle \right|
$$

代入坐标算符 $\hat{x}$ 与动量算符 $\hat{p} = -i\hbar \frac{\partial}{\partial x}$，由标准对易关系 $[\hat{x}, \hat{p}] = i\hbar$ 直接得出经典测不准关系：

$$
\sigma_x \sigma_p \ge \frac{\hbar}{2}
$$
