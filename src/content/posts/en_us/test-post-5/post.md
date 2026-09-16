---
title: "Computer Graphics & 3D Shader Rendering Pipeline"
description: "Dissecting modern 3D programmable graphics pipelines, MVP coordinate transformation matrices, Kajiya rendering equations, and Cook-Torrance microfacet PBR."
date: 2026-08-05
pubDate: 2026-08-05
cover: "cover.png"
tags:
  - "ComputerGraphics"
  - "Shaders"
  - "PBR"
  - "3DMath"
---

## 1. Homogeneous Coordinates & 3D Transformations

Computer graphics adopts 4D homogeneous coordinates to unify 3D affine translations, rotations, and perspective projections within a single $4 \times 4$ linear algebra framework.

### 1.1 Model-View-Projection (MVP) Pipeline

Vertex transformations follow sequential matrix multiplications:

$$
\mathbf{v}_{\text{clip}} = \mathbf{M}_{\text{MVP}} \cdot \mathbf{v}_{\text{local}} = (\mathbf{P} \cdot \mathbf{V} \cdot \mathbf{M}) \cdot \begin{pmatrix} x \\ y \\ z \\ 1 \end{pmatrix}
$$

The perspective projection matrix $\mathbf{P}$ maps the view frustum into Normalized Device Coordinates (NDC):

$$
\mathbf{P} = \begin{pmatrix}
\frac{1}{\tan(\theta/2) \cdot r} & 0 & 0 & 0 \\
0 & \frac{1}{\tan(\theta/2)} & 0 & 0 \\
0 & 0 & -\frac{f + n}{f - n} & -\frac{2fn}{f - n} \\
0 & 0 & -1 & 0
\end{pmatrix}
$$

where $\theta$ denotes the vertical Field of View (FOV), $r$ is the aspect ratio, and $n, f$ represent near and far clipping plane distances.

## 2. Modern Programmable Graphics Pipeline

Low-level graphics APIs (Vulkan, DirectX 12, WebGPU) structure GPU hardware work into a pipelined execution sequence.

![Figure 5.1 Modern 3D Programmable Graphics Pipeline from Vertex Input to Fragment Shading](./pipeline.svg)

### 2.1 Rasterization & Barycentric Interpolation

During rasterization, fragment attributes (UV coordinates, normal $\mathbf{n}$, tangent $\mathbf{t}$) interpolate across triangle primitives using barycentric weights $(\alpha, \beta, \gamma)$:

$$
\mathbf{p} = \alpha \mathbf{v}_1 + \beta \mathbf{v}_2 + \gamma \mathbf{v}_3, \quad \text{with } \alpha + \beta + \gamma = 1, \; \alpha, \beta, \gamma \ge 0
$$

## 3. Physically Based Rendering (PBR) & Light Transport

Photorealistic rendering is grounded in the energy-conserving Kajiya Rendering Equation.

### 3.1 The Rendering Equation

The hemispherical integral over directions $\Omega$:

$$
L_o(\mathbf{p}, \omega_o) = L_e(\mathbf{p}, \omega_o) + \int_\Omega f_r(\mathbf{p}, \omega_i, \omega_o) L_i(\mathbf{p}, \omega_i) (\mathbf{n} \cdot \omega_i) \, d\omega_i
$$

where $L_e$ is emitted radiance, $f_r$ is the Bidirectional Reflectance Distribution Function (BRDF), $L_i$ represents incoming radiance, and $\mathbf{n} \cdot \omega_i = \cos\theta_i$ is the Lambertian cosine factor.

### 3.2 Cook-Torrance Microfacet Specular BRDF

Cook-Torrance partitions surface reflectance into diffuse and specular components:

$$
f_r = k_d \frac{c}{\pi} + k_s \frac{D(\mathbf{h}) \, F(\omega_o, \mathbf{h}) \, G(\omega_i, \omega_o, \mathbf{h})}{4 (\mathbf{n} \cdot \omega_i) (\mathbf{n} \cdot \omega_o)}
$$

where the constituent physics functions evaluate as:
- **Normal Distribution Function (GGX $D$)**:
  $$
  D(\mathbf{h}) = \frac{\alpha^2}{\pi \left( (\mathbf{n} \cdot \mathbf{h})^2 (\alpha^2 - 1) + 1 \right)^2}
  $$
- **Fresnel Factor (Fresnel-Schlick $F$)**:
  $$
  F(\omega_o, \mathbf{h}) = F_0 + (1 - F_0) \left( 1 - (\omega_o \cdot \mathbf{h}) \right)^5
  $$
- **Geometric Shadowing Function (Smith $G$)**:
  $$
  G(\omega_i, \omega_o, \mathbf{h}) = G_1(\omega_i) \cdot G_1(\omega_o), \quad G_1(\mathbf{v}) = \frac{2 (\mathbf{n} \cdot \mathbf{v})}{(\mathbf{n} \cdot \mathbf{v}) + \sqrt{\alpha^2 + (1 - \alpha^2)(\mathbf{n} \cdot \mathbf{v})^2}}
  $$

## 4. Ray Tracing Intersection Solutions

In ray tracing, finding intersections between ray $\mathbf{r}(t) = \mathbf{o} + t \mathbf{d}$ and sphere with center $\mathbf{c}$ and radius $R$ solves the quadratic algebraic equation:

$$
(\mathbf{d} \cdot \mathbf{d}) t^2 + 2 \mathbf{d} \cdot (\mathbf{o} - \mathbf{c}) t + (\mathbf{o} - \mathbf{c}) \cdot (\mathbf{o} - \mathbf{c}) - R^2 = 0
$$

The discriminant $\Delta = b^2 - 4ac$ categorizes ray intersection geometry ($\Delta < 0$ misses, $\Delta = 0$ grazes, $\Delta > 0$ enters and exits).
