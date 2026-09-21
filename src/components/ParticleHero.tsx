import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  orbitRadiusX: number;
  orbitRadiusY: number;
  orbitSpeedX: number;
  orbitSpeedY: number;
  orbitPhase: number;
  shimmerSpeed: number;
  shimmerPhase: number;
  delay: number;
}

interface TextBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const ParticleHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const renderCtx = ctx;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let bounds: TextBounds = { x: 0, y: 0, w: 0, h: 0 };
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    renderCtx.scale(dpr, dpr);

    const TEXT = "NAPH130's Blog";

    // 1. 离屏 Canvas 采样目标文字点阵并提取文字外接矩形
    function sampleTextCoordinates(): {
      points: Array<{ x: number; y: number }>;
      rect: TextBounds;
    } {
      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return { points: [], rect: { x: 0, y: 0, w: 0, h: 0 } };

      offscreen.width = width;
      offscreen.height = height;

      const fontSize = Math.max(30, Math.min(width / 10.5, 78));
      offCtx.font = `700 ${fontSize}px "Comfortaa", "Outfit", cursive, sans-serif`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillStyle = '#ffffff';
      offCtx.fillText(TEXT, width / 2, height / 2);

      const imgData = offCtx.getImageData(0, 0, width, height).data;
      const points: Array<{ x: number; y: number }> = [];
      const density = width < 640 ? 5 : 4;

      let minX = width;
      let maxX = 0;
      let minY = height;
      let maxY = 0;

      for (let y = 0; y < height; y += density) {
        for (let x = 0; x < width; x += density) {
          const index = (y * width + x) * 4;
          if (imgData[index + 3] > 128) {
            points.push({
              x: x + (Math.random() - 0.5) * 1.2,
              y: y + (Math.random() - 0.5) * 1.2,
            });
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const padX = width < 640 ? 24 : 36;
      const padY = width < 640 ? 16 : 22;

      return {
        points,
        rect: {
          x: minX - padX,
          y: minY - padY,
          w: Math.max(10, maxX - minX + padX * 2),
          h: Math.max(10, maxY - minY + padY * 2),
        },
      };
    }

    // 2. 初始化粒子系统
    function initParticles() {
      const { points: textPoints, rect } = sampleTextCoordinates();
      bounds = rect;
      const count = textPoints.length;
      if (count === 0) return;

      particles = [];

      for (let i = 0; i < count; i++) {
        const target = textPoints[i];
        const originX = Math.random() * width;
        const originY = Math.random() * height;

        particles.push({
          x: originX,
          y: originY,
          originX,
          originY,
          targetX: target.x,
          targetY: target.y,
          size: Math.random() * 0.9 + 1.2,
          alpha: 1,
          baseAlpha: Math.random() * 0.35 + 0.65,
          orbitRadiusX: Math.random() * 2.0 + 1.2,
          orbitRadiusY: Math.random() * 1.6 + 1.0,
          orbitSpeedX: (Math.random() * 0.03 + 0.015) * (Math.random() > 0.5 ? 1 : -1),
          orbitSpeedY: (Math.random() * 0.03 + 0.015) * (Math.random() > 0.5 ? 1 : -1),
          orbitPhase: Math.random() * Math.PI * 2,
          shimmerSpeed: Math.random() * 0.03 + 0.015,
          shimmerPhase: Math.random() * Math.PI * 2,
          delay: Math.random() * 0.35,
        });
      }
    }

    if (document.fonts) {
      document.fonts.ready.then(() => {
        initParticles();
      });
    } else {
      initParticles();
    }

    // 3. 矩形周长沿线坐标映射函数（顺时针）
    function getPointOnRectPerimeter(dist: number, rect: TextBounds): { x: number; y: number } {
      const { x, y, w, h } = rect;
      const perimeter = 2 * (w + h);
      let d = dist % perimeter;
      if (d < 0) d += perimeter;

      // 顶部边 (左 -> 右)
      if (d < w) {
        return { x: x + d, y: y };
      }
      d -= w;
      // 右侧边 (上 -> 下)
      if (d < h) {
        return { x: x + w, y: y + d };
      }
      d -= h;
      // 底部边 (右 -> 左)
      if (d < w) {
        return { x: x + w - d, y: y + h };
      }
      d -= w;
      // 左侧边 (下 -> 上)
      return { x: x, y: y + h - d };
    }

    // 4. 绘制第一版平滑流线型顺时针旋转光束
    function drawBeam(headDist: number, beamLength: number, rect: TextBounds) {
      const steps = 30;
      for (let s = 0; s < steps; s++) {
        const d1 = headDist - (s * beamLength) / steps;
        const d2 = headDist - ((s + 1) * beamLength) / steps;

        const pt1 = getPointOnRectPerimeter(d1, rect);
        const pt2 = getPointOnRectPerimeter(d2, rect);

        // 如果刚好跨越拐角，跳过单段绘制避免斜向连线
        const distDelta = Math.abs(pt1.x - pt2.x) + Math.abs(pt1.y - pt2.y);
        if (distDelta > (beamLength / steps) * 2.5) continue;

        const progress = 1 - s / steps; // 1 (头部高亮) -> 0 (尾部渐隐)
        const alpha = Math.pow(progress, 1.8) * 0.95;

        renderCtx.beginPath();
        renderCtx.moveTo(pt1.x, pt1.y);
        renderCtx.lineTo(pt2.x, pt2.y);
        renderCtx.lineWidth = progress * 2.2 + 0.8;
        renderCtx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        renderCtx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        renderCtx.shadowBlur = progress * 6;
        renderCtx.stroke();
      }
    }

    // 鼠标交互
    let mouseX = -1000;
    let mouseY = -1000;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const startTime = performance.now();

    // 5. 动画主循环
    function render(currentTime: number) {
      const elapsed = (currentTime - startTime) / 1000; // 秒

      renderCtx.clearRect(0, 0, width, height);

      const isAssemblePhase = elapsed < 1.8;

      // A. 第一版边框旋转光束特效（两条对称顺时针旋转流动）
      if (bounds.w > 0 && bounds.h > 0) {
        const perimeter = 2 * (bounds.w + bounds.h);
        const beamLength = perimeter * 0.16; // 光束占周长 16%
        const speed = perimeter * 0.18; // 顺时针流速
        const currentOffset = elapsed * speed;

        // 基础微弱发光矩形边框
        renderCtx.beginPath();
        renderCtx.rect(bounds.x, bounds.y, bounds.w, bounds.h);
        renderCtx.lineWidth = 1;
        renderCtx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        renderCtx.shadowColor = 'transparent';
        renderCtx.shadowBlur = 0;
        renderCtx.stroke();

        // 两个对称顺时针旋转流动的线条 (相差 180° = perimeter / 2)
        const beam1Dist = currentOffset;
        const beam2Dist = currentOffset + perimeter / 2;

        drawBeam(beam1Dist, beamLength, bounds);
        drawBeam(beam2Dist, beamLength, bounds);

        renderCtx.shadowBlur = 0;
      }

      // B. 绘制粒子文字
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.orbitPhase += p.orbitSpeedX;
        p.shimmerPhase += p.shimmerSpeed;

        const currentTargetX = p.targetX + Math.sin(p.orbitPhase) * p.orbitRadiusX;
        const currentTargetY = p.targetY + Math.cos(p.orbitPhase * 0.9) * p.orbitRadiusY;

        if (isAssemblePhase) {
          const rawT = elapsed / 1.6;
          const delayedT = Math.max(0, Math.min(1, (rawT - p.delay) / (1 - p.delay)));
          const easeT =
            delayedT < 0.5
              ? 4 * delayedT * delayedT * delayedT
              : 1 - Math.pow(-2 * delayedT + 2, 3) / 2;

          p.x = p.originX + (currentTargetX - p.originX) * easeT;
          p.y = p.originY + (currentTargetY - p.originY) * easeT;
          p.alpha = Math.min(p.baseAlpha, delayedT * 1.2);
        } else {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 70;

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 14;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }

          p.x += (currentTargetX - p.x) * 0.08;
          p.y += (currentTargetY - p.y) * 0.08;
          p.alpha = p.baseAlpha + Math.sin(p.shimmerPhase) * 0.2;
        }

        renderCtx.beginPath();
        renderCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        renderCtx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        renderCtx.shadowColor = 'rgba(255, 255, 255, 0.75)';
        renderCtx.shadowBlur = 2.5;
        renderCtx.fill();
      }

      renderCtx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      renderCtx.scale(dpr, dpr);
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-auto select-none z-20 flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
export default ParticleHero;
