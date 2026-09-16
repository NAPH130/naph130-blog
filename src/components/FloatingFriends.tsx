import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { FriendItem } from '@/utils/friends';
import { ExternalLink } from 'lucide-react';

interface FloatingFriendsProps {
  friendsByLocale: Record<string, FriendItem[]>;
  initialLocale?: string;
}

interface PhysicalNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  friend: FriendItem;
}

// 目标稳定巡航速度与边界安全边距 (预留头像与下方 ID 标签空间)
const CRUISING_SPEED = 1.35;
const NODE_RADIUS = 32; // 直径 64px
const BOUNDARY_MARGIN_X = 52;
const BOUNDARY_MARGIN_TOP = 42;
const BOUNDARY_MARGIN_BOTTOM = 70;
const COLLISION_DISTANCE = 68; // 弹性碰撞缓冲间距

export const FloatingFriends: React.FC<FloatingFriendsProps> = ({
  friendsByLocale,
  initialLocale = 'zh_cn',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<PhysicalNode[]>([]);
  const domRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const hoveredNodeIdRef = useRef<string | null>(null);
  const isHoveringHudRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);

  // 语言状态管理 (响应全站语言切替)
  const [currentLocale, setCurrentLocale] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('naph130_lang');
      if (saved === 'en' || saved === 'en_us') return 'en_us';
      if (saved === 'zh' || saved === 'zh_cn') return 'zh_cn';
      const path = window.location.pathname;
      if (path.includes('/en_us/') || path.startsWith('/en/')) return 'en_us';
    }
    return initialLocale;
  });

  const isEnglish = currentLocale === 'en_us';
  const friendsList = useMemo(() => {
    return friendsByLocale[currentLocale] || friendsByLocale['zh_cn'] || [];
  }, [friendsByLocale, currentLocale]);

  // HUD 悬浮探针卡片状态
  const [activeHud, setActiveHud] = useState<{
    friend: FriendItem;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const code = customEvent.detail;
      setCurrentLocale(code === 'en' || code === 'en_us' ? 'en_us' : 'zh_cn');
    };

    window.addEventListener('naph130:lang-change', handleLangChange);
    return () => {
      window.removeEventListener('naph130:lang-change', handleLangChange);
    };
  }, []);

  // 初始化物理节点散列分布
  useEffect(() => {
    const container = containerRef.current;
    if (!container || friendsList.length === 0) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;

    const minX = BOUNDARY_MARGIN_X;
    const maxX = Math.max(minX + 100, width - BOUNDARY_MARGIN_X);
    const minY = BOUNDARY_MARGIN_TOP;
    const maxY = Math.max(minY + 100, height - BOUNDARY_MARGIN_BOTTOM);

    const cols = Math.ceil(Math.sqrt(friendsList.length));
    const cellW = (maxX - minX) / (cols || 1);
    const cellH = (maxY - minY) / (Math.ceil(friendsList.length / cols) || 1);

    const nodes: PhysicalNode[] = friendsList.map((friend, idx) => {
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * CRUISING_SPEED;
      const vy = Math.sin(angle) * CRUISING_SPEED;

      const col = idx % cols;
      const row = Math.floor(idx / cols);

      const x = minX + col * cellW + Math.random() * (cellW * 0.6);
      const y = minY + row * cellH + Math.random() * (cellH * 0.6);

      return {
        id: friend.id,
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y)),
        vx,
        vy,
        radius: NODE_RADIUS,
        friend,
      };
    });

    nodesRef.current = nodes;
  }, [friendsList]);

  // 核心高精度二维完全弹性碰撞引擎
  useEffect(() => {
    const updatePhysics = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width <= 0 || height <= 0) {
        animationFrameRef.current = requestAnimationFrame(updatePhysics);
        return;
      }

      // 同步画布物理尺寸
      if (canvas && (canvas.width !== width || canvas.height !== height)) {
        canvas.width = width;
        canvas.height = height;
      }
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }

      const nodes = nodesRef.current;
      const hoveredId = hoveredNodeIdRef.current;
      const count = nodes.length;

      const minX = BOUNDARY_MARGIN_X;
      const maxX = width - BOUNDARY_MARGIN_X;
      const minY = BOUNDARY_MARGIN_TOP;
      const maxY = height - BOUNDARY_MARGIN_BOTTOM;

      // 阶段 1：位置更新与巡航恒速维护
      for (let i = 0; i < count; i++) {
        const node = nodes[i];
        const isHovered = hoveredId === node.id;

        if (isHovered) {
          // 悬停时平滑刹车锁止在当前坐标，不改变原方向角
          node.vx *= 0.8;
          node.vy *= 0.8;
        } else {
          node.x += node.vx;
          node.y += node.vy;

          // 速度衰减补偿：防止碰撞阻尼或悬停退出后停滞，恒定维持巡航速度
          const speed = Math.hypot(node.vx, node.vy);
          if (speed < 0.2) {
            const angle = Math.random() * Math.PI * 2;
            node.vx = Math.cos(angle) * CRUISING_SPEED;
            node.vy = Math.sin(angle) * CRUISING_SPEED;
          } else if (Math.abs(speed - CRUISING_SPEED) > 0.05) {
            const factor = CRUISING_SPEED / speed;
            node.vx = node.vx * 0.94 + (node.vx * factor) * 0.06;
            node.vy = node.vy * 0.94 + (node.vy * factor) * 0.06;
          }
        }
      }

      // 阶段 2：球体间完全弹性碰撞与几何渗透消除
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const a = nodes[i];
          const b = nodes[j];

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);

          if (dist < COLLISION_DISTANCE && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;

            // 几何重叠分离 (Positional Separation)
            const overlap = (COLLISION_DISTANCE - dist) * 0.5;
            const aHovered = hoveredId === a.id;
            const bHovered = hoveredId === b.id;

            if (!aHovered && !bHovered) {
              a.x -= nx * overlap;
              a.y -= ny * overlap;
              b.x += nx * overlap;
              b.y += ny * overlap;
            } else if (aHovered && !bHovered) {
              b.x += nx * overlap * 2;
              b.y += ny * overlap * 2;
            } else if (!aHovered && bHovered) {
              a.x -= nx * overlap * 2;
              a.y -= ny * overlap * 2;
            }

            // 动量守恒冲量交换 (Impulse)
            const kx = a.vx - b.vx;
            const ky = a.vy - b.vy;
            const p = nx * kx + ny * ky;

            if (p > 0) {
              if (!aHovered) {
                a.vx -= p * nx;
                a.vy -= p * ny;
              }
              if (!bHovered) {
                b.vx += p * nx;
                b.vy += p * ny;
              }
            }
          }
        }
      }

      // 阶段 3：边框反弹与严格安全边界钳制 (必须在球体碰撞之后执行，确保绝对不破界)
      for (let i = 0; i < count; i++) {
        const node = nodes[i];

        if (node.x <= minX) {
          node.x = minX;
          node.vx = Math.abs(node.vx);
        } else if (node.x >= maxX) {
          node.x = maxX;
          node.vx = -Math.abs(node.vx);
        }

        if (node.y <= minY) {
          node.y = minY;
          node.vy = Math.abs(node.vy);
        } else if (node.y >= maxY) {
          node.y = maxY;
          node.vy = -Math.abs(node.vy);
        }
      }

      // 阶段 4：Direct Transform 硬件加速坐标同步 (无 React 重新渲染)
      for (let i = 0; i < count; i++) {
        const node = nodes[i];
        const dom = domRefs.current.get(node.id);
        if (dom) {
          dom.style.transform = `translate3d(${node.x - node.radius}px, ${node.y - node.radius}px, 0)`;
        }
      }

      // 阶段 5：悬停能量脉冲虚线与光环渲染
      if (hoveredId && activeHud && ctx) {
        const target = nodes.find((n) => n.id === hoveredId);
        if (target) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(target.x, target.y);
          ctx.lineTo(activeHud.x + 130, activeHud.y + 35);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();

          // 目标外层呼吸光环
          ctx.beginPath();
          ctx.arc(target.x, target.y, target.radius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }

      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animationFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeHud]);

  // 鼠标悬停进入头像
  const handleMouseEnterNode = (node: PhysicalNode) => {
    hoveredNodeIdRef.current = node.id;

    const container = containerRef.current;
    if (!container) return;
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    const hudWidth = 280;
    const hudHeight = 180;

    let targetX = node.x + node.radius + 16;
    let targetY = node.y - 20;

    // 自适应贴边检测
    if (targetX + hudWidth > containerW - 16) {
      targetX = node.x - node.radius - hudWidth - 16;
    }
    if (targetX < 16) {
      targetX = 16;
    }
    if (targetY + hudHeight > containerH - 16) {
      targetY = containerH - hudHeight - 16;
    }
    if (targetY < 16) {
      targetY = 16;
    }

    setActiveHud({
      friend: node.friend,
      x: targetX,
      y: targetY,
    });
  };

  const handleMouseLeaveNode = (node: PhysicalNode) => {
    setTimeout(() => {
      if (!isHoveringHudRef.current && hoveredNodeIdRef.current === node.id) {
        hoveredNodeIdRef.current = null;
        setActiveHud(null);
      }
    }, 150);
  };

  return (
    // 纯粹的单一晶透磨砂物理竞技场 (无外框包裹、无任何无意义文字)
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] overflow-hidden select-none"
    >
      {/* 顶部镜面高光线条 */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-20" />

      {/* 能量射线 Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* 漫游圆形头像 DOM 节点 (包含头像和正下方显示的 ID) */}
      {friendsList.map((friend) => {
        const initials = friend.title.slice(0, 2).toUpperCase();

        return (
          <div
            key={friend.id}
            ref={(el) => {
              if (el) domRefs.current.set(friend.id, el);
              else domRefs.current.delete(friend.id);
            }}
            onMouseEnter={() => {
              const node = nodesRef.current.find((n) => n.id === friend.id);
              if (node) handleMouseEnterNode(node);
            }}
            onMouseLeave={() => {
              const node = nodesRef.current.find((n) => n.id === friend.id);
              if (node) handleMouseLeaveNode(node);
            }}
            onClick={() => {
              const node = nodesRef.current.find((n) => n.id === friend.id);
              if (node) handleMouseEnterNode(node);
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '64px',
              willChange: 'transform',
            }}
            className="group cursor-pointer z-10 select-none touch-manipulation flex flex-col items-center"
            title={friend.id}
          >
            {/* 1. 圆形头像外壳 */}
            <div className="relative w-16 h-16 rounded-full p-1 bg-white/30 dark:bg-white/20 backdrop-blur-md border border-white/70 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.2)] transition-transform duration-200 group-hover:scale-110 flex items-center justify-center overflow-hidden shrink-0">
              {friend.avatar ? (
                <img
                  src={friend.avatar}
                  alt={friend.id}
                  className="w-full h-full rounded-full object-cover pointer-events-none"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* 首字母降级备用徽章 */}
              <div
                className={`w-full h-full rounded-full items-center justify-center font-mono font-bold text-xs text-neutral-800 dark:text-white bg-white/40 ${
                  friend.avatar ? 'hidden' : 'flex'
                }`}
              >
                {initials}
              </div>
            </div>

            {/* 2. 头像正下方显示 ID */}
            <div className="mt-1.5 px-2 py-0.5 max-w-[96px] truncate text-center font-mono text-[11px] font-semibold text-neutral-800 dark:text-neutral-100 bg-white/30 dark:bg-black/40 backdrop-blur-md rounded-full border border-white/40 shadow-xs pointer-events-none">
              {friend.id}
            </div>

            {/* 悬停光晕 */}
            <div className="absolute top-0 left-0 w-16 h-16 -z-10 rounded-full bg-sky-400/25 blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        );
      })}

      {/* 悬停探针检视卡片 (仅包含 ID、简介、“访问”按钮) */}
      {activeHud && (
        <div
          onMouseEnter={() => {
            isHoveringHudRef.current = true;
          }}
          onMouseLeave={() => {
            isHoveringHudRef.current = false;
            hoveredNodeIdRef.current = null;
            setActiveHud(null);
          }}
          style={{
            position: 'absolute',
            left: `${activeHud.x}px`,
            top: `${activeHud.y}px`,
          }}
          className="z-30 w-64 sm:w-72 rounded-2xl bg-white/45 dark:bg-white/35 backdrop-blur-3xl backdrop-saturate-150 border border-white/70 shadow-[0_24px_60px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,0.9)] p-4 sm:p-5 flex flex-col gap-3 select-text animate-in fade-in zoom-in-95 duration-200"
        >
          {/* 顶栏高光反光 */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />

          {/* 1. ID 头部 */}
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/30">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/80 shadow-xs shrink-0 bg-white/30">
              <img
                src={activeHud.friend.avatar || '/avatar.jpg'}
                alt={activeHud.friend.id}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-mono font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-900 truncate">
              {activeHud.friend.id}
            </h3>
          </div>

          {/* 2. 简介 */}
          <p className="text-xs text-neutral-700 leading-relaxed font-sans line-clamp-3">
            {activeHud.friend.description}
          </p>

          {/* 3. “访问”按钮 */}
          <div className="pt-2 border-t border-white/20">
            <a
              href={activeHud.friend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <span>{isEnglish ? 'Visit' : '访问'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingFriends;
