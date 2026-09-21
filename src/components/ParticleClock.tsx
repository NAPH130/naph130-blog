import React, { useEffect, useRef } from 'react';

interface Particle {
  slot: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  orbitPhase: number;
  orbitSpeed: number;
  orbitRadius: number;
}

export const ParticleClock: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const renderCtx = ctx;

    let animationFrameId: number;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    renderCtx.scale(dpr, dpr);

    // 8 个字符槽位 (HH:MM:SS) 独立粒子池与字符缓存
    const slotChars: string[] = ['', '', '', '', '', '', '', ''];
    const slotParticles: Particle[][] = [[], [], [], [], [], [], [], []];

    // 8 字符权重比例：数字权重大 (~1.0)，冒号较窄 (~0.55)
    const slotWeights = [1.0, 1.0, 0.55, 1.0, 1.0, 0.55, 1.0, 1.0];
    const totalWeight = 7.1;

    // 获取当前北京时间 (UTC+8) 的 8 字符数组
    function getBeijingTimeChars(): string[] {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const beijingDate = new Date(utc + 3600000 * 8);
      const h = String(beijingDate.getHours()).padStart(2, '0');
      const m = String(beijingDate.getMinutes()).padStart(2, '0');
      const s = String(beijingDate.getSeconds()).padStart(2, '0');
      return [h[0], h[1], ':', m[0], m[1], ':', s[0], s[1]];
    }

    // 计算指定槽位的水平中心坐标与字号
    function getSlotLayout(slotIndex: number) {
      const unit = width / totalWeight;
      let currX = 0;
      for (let i = 0; i < slotIndex; i++) {
        currX += slotWeights[i] * unit;
      }
      const slotWidth = slotWeights[slotIndex] * unit;
      const centerX = currX + slotWidth / 2;
      const centerY = height / 2;
      const fontSize = Math.min(width / 5.2, height * 0.92);
      return { centerX, centerY, slotWidth, fontSize };
    }

    // 单个字符独立离屏点阵采样 (仅针对指定槽位采样)
    function sampleSingleCharCoordinates(
      char: string,
      slotIndex: number
    ): Array<{ x: number; y: number }> {
      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return [];

      offscreen.width = width;
      offscreen.height = height;

      const { centerX, centerY, fontSize } = getSlotLayout(slotIndex);

      offCtx.font = `700 ${fontSize}px "Comfortaa", "Outfit", monospace, sans-serif`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillStyle = '#ffffff';
      offCtx.fillText(char, centerX, centerY);

      const imgData = offCtx.getImageData(0, 0, width, height).data;
      const points: Array<{ x: number; y: number }> = [];
      const density = width < 500 ? 3 : 4;

      // 仅在当前槽位有效水平区间内扫描像素，提高采样效率与隔离度
      const minScanX = Math.max(0, Math.floor(centerX - fontSize * 0.6));
      const maxScanX = Math.min(width, Math.ceil(centerX + fontSize * 0.6));

      for (let y = 0; y < height; y += density) {
        for (let x = minScanX; x < maxScanX; x += density) {
          const index = (y * width + x) * 4;
          if (imgData[index + 3] > 128) {
            points.push({
              x: x + (Math.random() - 0.5) * 1.2,
              y: y + (Math.random() - 0.5) * 1.2,
            });
          }
        }
      }
      return points;
    }

    // 独立按槽位更新：仅在字符发生物理变化时，才触发布局重算与粒子重汇聚
    function updateSlotParticles(slotIndex: number, newChar: string) {
      const targets = sampleSingleCharCoordinates(newChar, slotIndex);
      const targetCount = targets.length;
      if (targetCount === 0) return;

      const currentParticles = slotParticles[slotIndex];
      const { centerX, centerY } = getSlotLayout(slotIndex);

      // 调整该槽位内的粒子池大小
      if (currentParticles.length < targetCount) {
        const diff = targetCount - currentParticles.length;
        for (let i = 0; i < diff; i++) {
          const randTarget = targets[Math.floor(Math.random() * targetCount)];
          currentParticles.push({
            slot: slotIndex,
            x: centerX + (Math.random() - 0.5) * 16,
            y: centerY + (Math.random() - 0.5) * 16,
            targetX: randTarget.x,
            targetY: randTarget.y,
            size: Math.random() * 0.9 + 1.2,
            alpha: Math.random() * 0.3 + 0.7,
            baseAlpha: Math.random() * 0.3 + 0.7,
            orbitPhase: Math.random() * Math.PI * 2,
            orbitSpeed: Math.random() * 0.03 + 0.015,
            orbitRadius: Math.random() * 1.5 + 0.6,
          });
        }
      } else if (currentParticles.length > targetCount) {
        currentParticles.splice(targetCount);
      }

      // 将该槽位粒子引导至新的字符目标点
      for (let i = 0; i < targetCount; i++) {
        const p = currentParticles[i];
        p.targetX = targets[i].x;
        p.targetY = targets[i].y;
      }

      slotChars[slotIndex] = newChar;
    }

    // 检查并分发时间刷新：逐个比对 8 个槽位
    function syncTime(force = false) {
      const currentChars = getBeijingTimeChars();
      for (let i = 0; i < 8; i++) {
        // 核心优化：未改变的字符绝不重新采样、绝不重新分配坐标
        if (currentChars[i] !== slotChars[i] || force) {
          updateSlotParticles(i, currentChars[i]);
        }
      }
    }

    if (document.fonts) {
      document.fonts.ready.then(() => syncTime(true));
    } else {
      syncTime(true);
    }

    // 鼠标交互排斥
    let mouseX = -1000;
    let mouseY = -1000;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    let lastTick = 0;

    function render(currentTime: number) {
      if (currentTime - lastTick > 400) {
        syncTime();
        lastTick = currentTime;
      }

      renderCtx.clearRect(0, 0, width, height);

      // 遍历 8 个槽位的粒子进行物理更新与渲染
      for (let s = 0; s < 8; s++) {
        const particles = slotParticles[s];
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          p.orbitPhase += p.orbitSpeed;
          const targetX = p.targetX + Math.sin(p.orbitPhase) * p.orbitRadius;
          const targetY = p.targetY + Math.cos(p.orbitPhase) * p.orbitRadius;

          // 鼠标排斥物理
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 55;

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 12;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }

          // 平滑靠拢当前槽位目标点
          p.x += (targetX - p.x) * 0.14;
          p.y += (targetY - p.y) * 0.14;

          renderCtx.beginPath();
          renderCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          renderCtx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          renderCtx.shadowColor = 'rgba(255, 255, 255, 0.85)';
          renderCtx.shadowBlur = 3;
          renderCtx.fill();
        }
      }

      renderCtx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      renderCtx.scale(dpr, dpr);
      syncTime(true);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
export default ParticleClock;
