# 粒子文字特效实现逻辑 (Particle Hero)

首页中心动态粒子文字组件，负责在 Canvas 2D 上将全屏星尘粒子汇聚为 `NAPH130's Blog`，并在成型后维持微游动与鼠标交互。

源码文件：`src/components/ParticleHero.tsx`

---

## 1. 详细实现原理与数学模型

### 1.1 离屏 Canvas 点阵采样 (`sampleTextCoordinates`)
为了让粒子准确拼成自定义矢量字体，采用内存离屏渲染与像素采样：
1. 创建离屏 Canvas（尺寸与视口一致），使用指定字体（`Comfortaa` 700）绘制居中文字：
   ```ts
   const fontSize = Math.max(30, Math.min(width / 10.5, 78));
   offCtx.font = `700 ${fontSize}px "Comfortaa", "Outfit", cursive, sans-serif`;
   offCtx.fillText(TEXT, width / 2, height / 2);
   ```
2. 调用 `getImageData(0, 0, width, height)` 获取全部像素数据。
3. 按步进（`density = 4~5px`）遍历像素矩阵，提取 Alpha 通道大于 128 的有效坐标点。
4. 对每个采样点叠加微小随机扰动 `(Math.random() - 0.5) * 1.2`，消除机械网格感，使文字边缘呈现自然的微星尘质感。

### 1.2 入场汇聚时间线与插值算法
- **起点分布**：每颗粒子初始化时在屏幕视口内随机散射 `(originX, originY)`。
- **平滑汇聚算法**（0.0s ~ 1.8s）：
  引入粒子随机延迟 `delay = Math.random() * 0.35`，使用三次贝塞尔缓动函数（Smooth Cubic Easing）计算进度 `easeT`：
  ```ts
  const rawT = elapsed / 1.6;
  const delayedT = Math.max(0, Math.min(1, (rawT - p.delay) / (1 - p.delay)));
  const easeT = delayedT < 0.5
    ? 4 * delayedT * delayedT * delayedT
    : 1 - Math.pow(-2 * delayedT + 2, 3) / 2;

  p.x = p.originX + (currentTargetX - p.originX) * easeT;
  p.y = p.originY + (currentTargetY - p.originY) * easeT;
  ```

### 1.3 围绕字形的动态自由微游动 (Living Swarm Phase)
拼装完成后（1.8s+），粒子绝不静态锁死在固定像素上，而是基于正弦/余弦谐波围绕其文字锚点做连续微轨道漂移：
```ts
p.orbitPhase += p.orbitSpeedX;
const currentTargetX = p.targetX + Math.sin(p.orbitPhase) * p.orbitRadiusX;
const currentTargetY = p.targetY + Math.cos(p.orbitPhase * 0.9) * p.orbitRadiusY;

p.x += (currentTargetX - p.x) * 0.08;
p.y += (currentTargetY - p.y) * 0.08;
```
- `orbitRadiusX`：`1.2px ~ 3.2px`
- `orbitRadiusY`：`1.0px ~ 2.6px`

### 1.4 鼠标光标物理排斥
监听视口 `mousemove`，当鼠标进入粒子的排斥半径（70px）内时，沿反方向施加推力向量：
```ts
const dx = p.x - mouseX;
const dy = p.y - mouseY;
const dist = Math.sqrt(dx * dx + dy * dy);
if (dist < 70 && dist > 0) {
  const force = (1 - dist / 70) * 14;
  p.x += (dx / dist) * force;
  p.y += (dy / dist) * force;
}
```
鼠标移开后，粒子通过阻尼弹性平滑复位至字形微游动轨道上。

---

## 2. 踩坑点与 Bug 修复记录

### 坑 1：离屏 Canvas 采样时网络字体尚未加载完成
- **现象**：初次加载页面时，粒子拼出的文字是系统的默认无衬线字体，字形生硬，刷新后才偶尔变回 `Comfortaa`。
- **原因**：Google Fonts（`Comfortaa`）是通过网络异步下载的，组件挂载瞬间字体文件可能还在传输中，Canvas `fillText` 回退到了系统字体进行采样。
- **修复**：使用 `document.fonts.ready.then(() => initParticles())` 显式等待全站字体下载并解析完毕后，再触发点阵提取。

### 坑 2：字形过粗、边缘发糊
- **现象**：文字看起来像粗墨块，缺少粒子空灵通透感。
- **原因**：初期为了增强存在感，添加了 `offCtx.lineWidth = 5` 的描边扩展与 900 字体权重，且粒子尺寸过大（3.6px）。
- **修复**：移除全部人工加粗描边，字体权重定为纯净的 700，粒子半径收敛到 `1.2px ~ 2.1px`。

### 坑 3：游动范围过大导致字形散架
- **现象**：粒子漂移半径过大（8px+），文字轮廓模糊，难以阅读。
- **修复**：将游动范围大幅压缩至 `1.2px ~ 3.2px`，在保持字迹清晰锐利的前提下提供微妙的星光颤动感。
