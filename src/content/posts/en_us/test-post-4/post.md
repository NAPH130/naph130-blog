---
title: "Algorithm Design, Graph Theory & Discrete Mathematics"
description: "Analyzing divide-and-conquer Master Theorem bounds, directed acyclic graph shortest path dynamics, Catalan number combinatorics, and algebraic graph Laplacians."
date: 2026-08-15
pubDate: 2026-08-15
cover: "cover.png"
tags:
  - "Algorithms"
  - "GraphTheory"
  - "DiscreteMath"
  - "Complexity"
---

## 1. Asymptotic Analysis & Master Theorem

Asymptotic analysis provides the mathematical foundation for evaluating computational efficiency. Divide-and-conquer recurrences standardly follow:

$$
T(n) = a T\left( \frac{n}{b} \right) + f(n)
$$

where $a \ge 1$ denotes the subproblem branching factor, $b > 1$ represents the division ratio, and $f(n)$ accounts for partitioning and combining overhead.

### 1.1 Critical Exponent & Asymptotic Cases

Comparing $f(n)$ with polynomial baseline $n^{\log_b a}$ where $c_{\text{crit}} = \log_b a$:

$$
T(n) = \begin{cases}
\Theta\left( n^{\log_b a} \right), & \text{if } f(n) = O\left( n^{\log_b a - \epsilon} \right), \, \epsilon > 0 \\
\Theta\left( n^{\log_b a} \log^{k+1} n \right), & \text{if } f(n) = \Theta\left( n^{\log_b a} \log^k n \right), \, k \ge 0 \\
\Theta\left( f(n) \right), & \text{if } f(n) = \Omega\left( n^{\log_b a + \epsilon} \right) \text{ and regularity holds}
\end{cases}
$$

For Merge Sort where $a=2, b=2, f(n)=\Theta(n)$, since $\log_2 2 = 1$, Case 2 with $k=0$ applies, yielding $T(n) = \Theta(n \log n)$.

## 2. Graph Topology & Shortest Path Dynamic Programming

Given a directed weighted graph $G = (V, E)$, single-source shortest path estimation relies on edge relaxation.

![Figure 4.1 Directed Acyclic Graph (DAG) Shortest Path Relaxation and Node Weight Topology](./graph.svg)

### 2.1 Bellman-Ford & Optimal Substructure

Let $d[v]$ be the current upper bound distance to vertex $v$. The dynamic programming Bellman optimality condition satisfies:

$$
d[v] = \min \left\{ d[v], \, \min_{(u, v) \in E} (d[u] + w(u, v)) \right\}
$$

The Floyd-Warshall all-pairs shortest path recurrence utilizes intermediate vertex $k$:

$$
d_{ij}^{(k)} = \min\left( d_{ij}^{(k-1)}, \, d_{ik}^{(k-1)} + d_{kj}^{(k-1)} \right)
$$

## 3. Combinatorics & Catalan Numbers

Catalan numbers appear ubiquitously across combinatorial counting problems (e.g. Dyck paths, polygon triangulations, binary tree counting).

### 3.1 Closed Form & Generating Function

The standard closed form for the $n$-th Catalan number $C_n$:

$$
C_n = \frac{1}{n+1} \binom{2n}{n} = \frac{(2n)!}{(n+1)! \, n!} = \prod_{k=2}^n \frac{n+k}{k}
$$

It obeys the convolution recurrence:

$$
C_0 = 1, \quad C_{n+1} = \sum_{i=0}^n C_i C_{n-i}
$$

Through ordinary generating function $G(x) = \sum_{n=0}^\infty C_n x^n$, we solve quadratic $x G(x)^2 - G(x) + 1 = 0$:

$$
G(x) = \frac{1 - \sqrt{1 - 4x}}{2x}
$$

## 4. Algebraic Graph Theory & Graph Laplacians

Given degree matrix $\mathbf{D}$ and adjacency matrix $\mathbf{A}$, the unnormalized graph Laplacian is:

$$
\mathbf{L} \triangleq \mathbf{D} - \mathbf{A}
$$

The Symmetric Normalized Laplacian exhibits positive semi-definiteness:

$$
\mathbf{L}_{\text{sym}} = \mathbf{D}^{-1/2} \mathbf{L} \mathbf{D}^{-1/2} = \mathbf{I} - \mathbf{D}^{-1/2} \mathbf{A} \mathbf{D}^{-1/2}
$$

Its eigenvalues satisfy $0 = \lambda_1 \le \lambda_2 \le \dots \le \lambda_n \le 2$. The second smallest eigenvalue $\lambda_2$ (the Fiedler value) governs algebraic connectivity and underpins Graph Convolutional Networks (GCN).
