---
title: "深度学习数学基础与注意力机制推导"
description: "系统梳理深度神经网络的反向传播算法、Adam 优化器一阶与二阶动量修正、Transformer 缩放点积多头注意力机制数学推导及拓扑计算流图。"
date: 2026-09-08
pubDate: 2026-09-08
cover: "cover.png"
tags:
  - "深度学习"
  - "数学建模"
  - "Transformer"
  - "LaTeX"
---

## 1. 神经网络与梯度反向传播

现代深度神经网络通过多层连续仿射变换与非线性激活函数的复合，拟合高维空间中的复杂流形映射。

### 1.1 前向传播与层级复合

设网络第 $l$ 层的输入为 $\mathbf{a}^{[l-1]}$，线性加权输出为 $\mathbf{z}^{[l]}$，经过非线性激活函数 $\sigma(\cdot)$ 处理后的激活输出为：

$$
\mathbf{z}^{[l]} = \mathbf{W}^{[l]} \mathbf{a}^{[l-1]} + \mathbf{b}^{[l]}, \quad \mathbf{a}^{[l]} = \sigma(\mathbf{z}^{[l]})
$$

其中 $\mathbf{W}^{[l]} \in \mathbb{R}^{n_l \times n_{l-1}}$ 为可学习权重张量，$\mathbf{b}^{[l]} \in \mathbb{R}^{n_l}$ 为偏置向量。

### 1.2 链式求导与反向传播方程

根据微积分多元复合函数链式法则，损失标量 $\mathcal{L}$ 关于线性输出 $\mathbf{z}^{[l]}$ 的误差灵敏度项 $\boldsymbol{\delta}^{[l]}$ 递归传递关系如下：

$$
\boldsymbol{\delta}^{[l]} \triangleq \frac{\partial \mathcal{L}}{\partial \mathbf{z}^{[l]}} = \left( (\mathbf{W}^{[l+1]})^T \boldsymbol{\delta}^{[l+1]} \right) \odot \sigma'(\mathbf{z}^{[l]})
$$

利用局部误差项，可推导出损失函数对参数矩阵和偏置的解析梯度：

$$
\begin{aligned}
\frac{\partial \mathcal{L}}{\partial \mathbf{W}^{[l]}} &= \boldsymbol{\delta}^{[l]} (\mathbf{a}^{[l-1]})^T \\
\frac{\partial \mathcal{L}}{\partial \mathbf{b}^{[l]}} &= \boldsymbol{\delta}^{[l]}
\end{aligned}
$$

## 2. 优化算法与自适应动量估计 (Adam)

Adam（Adaptive Moment Estimation）综合了 Momentum 与 RMSProp 的优点，计算梯度的一阶矩（均值）与二阶未中心化矩（方差）：

### 2.1 动量递推与偏差校正

在第 $t$ 次迭代中，对于目标参数 $\theta_t$ 和当前批量梯度 $g_t = \nabla_\theta \mathcal{L}(\theta_t)$：

$$
\begin{aligned}
m_t &= \beta_1 m_{t-1} + (1 - \beta_1) g_t \\
v_t &= \beta_2 v_{t-1} + (1 - \beta_2) g_t^2
\end{aligned}
$$

由于 $m_0 = 0$ 和 $v_0 = 0$，初始迭代步会严重偏向零向量。通过理论推导进行无偏修正：

$$
\hat{m}_t = \frac{m_t}{1 - \beta_1^t}, \quad \hat{v}_t = \frac{v_t}{1 - \beta_2^t}
$$

最终参数更新方程为：

$$
\theta_{t+1} = \theta_t - \frac{\eta}{\sqrt{\hat{v}_t} + \epsilon} \hat{m}_t
$$

其中超参数典型取值：学习率 $\eta = 10^{-3}$，衰减率 $\beta_1 = 0.9$，$\beta_2 = 0.999$，数值稳定微元 $\epsilon = 10^{-8}$。

## 3. Transformer 架构与注意力机制推导

自注意力机制（Self-Attention）是现代大语言模型（LLM）的核心架构基石。

![图 2.1 Transformer 多头自注意力前向计算与投影拓扑流图](./neural-net.svg)

### 3.1 缩放点积注意力 (Scaled Dot-Product Attention)

给定输入序列的查询张量 $\mathbf{Q}$、键张量 $\mathbf{K}$ 与值张量 $\mathbf{V}$，其中 $\mathbf{Q}, \mathbf{K} \in \mathbb{R}^{n \times d_k}$，$\mathbf{V} \in \mathbb{R}^{n \times d_v}$：

$$
\text{Attention}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \text{softmax}\left( \frac{\mathbf{Q} \mathbf{K}^T}{\sqrt{d_k}} \right) \mathbf{V}
$$

**缩放因子 $\frac{1}{\sqrt{d_k}}$ 的数学成因**：假设 $\mathbf{q}$ 与 $\mathbf{k}$ 的各分量均为均值为 0、方差为 1 的独立同分布随机变量，则点积 $q \cdot k = \sum_{i=1}^{d_k} q_i k_i$ 的期望与方差分别为：

$$
\mathbb{E}[q \cdot k] = 0, \quad \text{Var}(q \cdot k) = \sum_{i=1}^{d_k} \text{Var}(q_i k_i) = d_k
$$

当维度 $d_k$ 较大时，点积的数值方差极度扩大，使 Softmax 函数的输入落入饱和区，导致反向传播梯度弥散。因此除以 $\sqrt{d_k}$ 使方差重新归一化至 1。

### 3.2 多头注意力机制 (Multi-Head Attention)

多头机制允许模型在不同子空间中共同捕获上下文表示：

$$
\text{MultiHead}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \text{Concat}(\text{head}_1, \dots, \text{head}_h) \mathbf{W}^O
$$

其中每个单头表示为独立参数投影：

$$
\text{head}_i = \text{Attention}(\mathbf{Q}\mathbf{W}_i^Q, \mathbf{K}\mathbf{W}_i^K, \mathbf{V}\mathbf{W}_i^V)
$$

投影矩阵参数维度：$\mathbf{W}_i^Q \in \mathbb{R}^{d_{\text{model}} \times d_k}$，$\mathbf{W}_i^K \in \mathbb{R}^{d_{\text{model}} \times d_k}$，$\mathbf{W}_i^V \in \mathbb{R}^{d_{\text{model}} \times d_v}$，输出投影矩阵 $\mathbf{W}^O \in \mathbb{R}^{h d_v \times d_{\text{model}}}$。

## 4. 损失函数与分段函数排版 (Piecewise Functions)

在目标检测与鲁棒回归中广泛采用的光滑 $L_1$ 损失（Smooth $L_1$ Loss）：

$$
\text{Smooth}_{L_1}(x) = \begin{cases}
0.5 x^2, & \text{if } |x| < 1 \\
|x| - 0.5, & \text{otherwise}
\end{cases}
$$

以及概率分布间的 Kullback-Leibler 散度（相对熵）：

$$
D_{\text{KL}}(P \parallel Q) = \int_{-\infty}^{+\infty} p(x) \ln\left( \frac{p(x)}{q(x)} \right) dx = \mathbb{E}_{x \sim P}\left[ \ln p(x) - \ln q(x) \right]
$$
