# 动态星轨友邻与二维完全弹性碰撞系统 (Friends Elastic Collision Arena)

负责渲染博客友链展示页（`/friends`），颠覆传统九宫格电商货架式友链卡片，结合全站物理建模与晶透高光磨砂规范，将友邻站点抽象为在二维密闭空间内自由漫游的圆形天体，通过实时二维完全弹性碰撞物理引擎（动量与动能守恒、重叠位移分离、边框反弹）驱动，并支持悬停锁止探针（Frosted HUD Inspector）展开全量信息。

源码文件：
- `src/pages/friends.astro`
- `src/components/FloatingFriends.tsx`
- `src/utils/friends.ts`
- `src/content.config.ts`
- `src/content/friends/**/*.md`

---

## 1. 详细实现原理与技术方案

### 1.1 内容集合架构设计 (`src/content/friends/`)
依据标准 Astro Content Collections 规范，在 `src/content.config.ts` 中声明 `friends` 集合：
- **分语言目录结构**：`src/content/friends/zh_cn/<friend>.md` 与 `src/content/friends/en_us/<friend>.md`；
- **Frontmatter 核心元数据字段**：
  - `id`: 友链唯一标识符（如 `antigravity`）；
  - `title`: 友链站点名称（支持 `title` / `name` 别名自动回退）；
  - `avatar`: 头像图片 URL 或相对静态资源；
  - `description`: 站点描述或一句话 Slogan（支持 `bio` 别名回退）；
  - `url`: 友链直达目标链接；
  - `tags`: 站点技术栈或特征标签数组（如 `['Astro', 'React', '物理建模']`）；
  - `category`: 类别划分（如 `tech`、`algorithm`、`life`）。

### 1.2 二维完全弹性碰撞物理仿真引擎 (2D Elastic Collision Physics)
在 `FloatingFriends.tsx` 中，每个头像节点抽象为一个具有质量、速度矢量和固定半径的物理刚体：
1. **边界碰撞检测与镜面反弹 (Wall Bouncing)**：
   在容器尺寸 $W \times H$ 与节点半径 $R$ 的约束下：
   $$
   x \le R \implies x = R, \quad v_x = |v_x|
   $$
   $$
   x \ge W - R \implies x = W - R, \quad v_x = -|v_x|
   $$
   $$
   y \le R \implies y = R, \quad v_y = |v_y|
   $$
   $$
   y \ge H - R \implies y = H - R, \quad v_y = -|v_y|
   $$
2. **两两球体完全弹性碰撞与动量冲量守恒 (Sphere-to-Sphere Collision)**：
   对于任意两球 $A(x_1, y_1, \mathbf{v}_1)$ 与 $B(x_2, y_2, \mathbf{v}_2)$，当球心欧式距离 $d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} < R_1 + R_2$ 时触发碰撞：
   - **重叠穿透消除 (Positional Separation)**：沿着法线单位向量 $\hat{\mathbf{n}} = \frac{\mathbf{p}_2 - \mathbf{p}_1}{d}$，将两球各自反向推开 $\frac{(R_1 + R_2 - d)}{2}$，彻底消除由于时间步长导致的刚体粘滞锁死。
   - **冲量交换标量 $J$**：
     $$
     J = (\mathbf{v}_1 - \mathbf{v}_2) \cdot \hat{\mathbf{n}}
     $$
   - **速度更新**（仅在趋近阶段 $J > 0$ 时应用）：
     $$
     \mathbf{v}_1 \gets \mathbf{v}_1 - J \hat{\mathbf{n}}, \quad \mathbf{v}_2 \gets \mathbf{v}_2 + J \hat{\mathbf{n}}
     $$
3. **GPU 硬件加速与零 React 重新渲染开销 (DOM Direct Transform Sync)**：
   - 每帧位置更新并不触发 React `setState`；
   - 通过 `requestAnimationFrame` 直接修改节点的 `style.transform = translate3d(...)`，实现流畅的 60 FPS 物理漫游与最低的 CPU 占用。

### 1.3 悬停锁止与极简探针卡片 (Frosted HUD Inspector)
1. **头像下方 ID 标识常驻**：每个漫游的圆形头像正下方挂载等宽半透明微胶囊，直观显示其 `friend.id`（如 `anthony-fu`、`antigravity`），安全边距动态扩展（`BOUNDARY_MARGIN_BOTTOM = 70px`）确保文本永不触底或溢出；
2. **极简检视卡片架构 (Pure Minimalist HUD)**：
   - 严格剔除类别徽章、冗余 URL 文本、散落标签群及复制按钮等非必要视觉噪声；
   - 仅包含三项核心信息：
     1. **ID**：顶部等宽加粗标识（辅以极简头像缩略）；
     2. **简介**：站点描述核心 Slogan；
     3. **“访问”按钮**：高对比天蓝色平直圆角外链跳转按钮。
3. **自适应视口内贴靠边界算法**：
   - 探针卡片自适应根据头像坐标贴边，限制在容器可见边界内，杜绝任何破屏截断；
   - 背景 Canvas 同步绘制由天体射向探针卡片的微脉冲能量射线（Dashed Laser Ray）。

## 2. 踩坑点与 Bug 修复记录

### 坑 1：弹性球体频繁交错时由于离散步长导致的“球体粘滞重叠无法弹开”
- **现象**：当两个球体以特定速度对心撞击时，球体可能会黏在一起震颤并缓慢沿对角线飞出，而非立即弹开。
- **原因**：在离散帧步长下（Euler Step），两球发生相交时往往已经深度渗透。如果仅更新速度而不更新位置，下一帧两球可能仍处于相交状态，速度再次被反向翻转，形成无穷正反馈振荡。
- **修复**：在速度反弹计算前，必须显式加入位置修正分离：`overlap = (minDist - dist) * 0.5; a.x -= nx * overlap; b.x += nx * overlap;`，同时严格限制仅在相对速度趋近时（`dotProduct > 0`）触发速度反弹，从几何层与力学层根除粘滞。

### 坑 2：高频动画帧直接通过 React State 同步导致页面风扇狂转与掉帧
- **现象**：若将 `nodes` 数组保存在 React `useState` 中并在每帧调用 `setNodes([...])`，页面出现肉眼可见的微卡顿，DevTools 提示大量的 JS Heap 垃圾回收。
- **原因**：React 19 的 Virtual DOM Diff 在 60 FPS 下对数组对象进行整帧对比会产生严重的主线程渲染开销。
- **修复**：将物理状态全部托管在 `useRef<PhysicalNode[]>` 中，通过 `domRefs.current.get(id).style.transform = translate3d(...)` 直接调度浏览器合成器（Compositor），绕过 React 重新渲染，达成零 GC 压力与稳固的 60 FPS 体验。

### 坑 3：悬停阻尼衰减后未恢复巡航速度导致的“实体永久静止停止移动”
- **现象**：在页面交互一段时间后，部分头像停在原地不再漫游，变成静止状态。
- **原因**：此前在悬停时执行 `node.vx *= 0.85; node.vy *= 0.85` 将速度阻尼至接近 0。光标移开后，代码缺少最低速度校验与动能补偿机制，导致被悬停过的节点永久保持在极低速度（近乎 0）的假死状态。
- **修复**：建立基于恒定巡航速度（`CRUISING_SPEED = 1.35`）的补偿与自愈机制：当节点未被悬停且当前模长 $v < 0.2$ 时，自动按随机方向注入完整巡航速度；当速度偏离目标值时通过平滑插值自适应修正，彻底保证所有非悬停天体恒久匀速漫游。

### 坑 4：两球碰撞重叠推开导致刚体穿透外边框或在边界产生切边截断
- **现象**：头像靠近边框时，若与另一个头像发生碰撞，靠近边框的头像会被强行推入边框外部并产生局部被 `overflow-hidden` 裁切的破图现象。
- **原因**：此前的物理循环将边框反弹计算置于球体碰撞计算之前。当 Step 2 钳制在边框内后，Step 3 的球体反向分离（Positional Separation）强行施加了位移并将坐标推至安全边界之外，随后直接同步至 DOM Transform。
- **修复**：
  1. 将边框检测与钳制严格置于球体碰撞分离**之后**执行；
  2. 引入充足的边界安全裕量（`BOUNDARY_MARGIN = 44px`），使 64px 头像在放大、描边与外阴影下与容器外框始终保持至少 12px 的呼吸间隙，彻底杜绝边界溢出。
