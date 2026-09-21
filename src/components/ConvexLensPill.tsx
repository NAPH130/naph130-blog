import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface ConvexLensPillProps {
  as?: 'a' | 'button' | 'div';
  href?: string;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}

export const ConvexLensPill: React.FC<ConvexLensPillProps> = ({
  as = 'div',
  href,
  active = false,
  onClick,
  className = '',
  children,
  ariaLabel,
}) => {
  const isButtonOrLink = as === 'button' || as === 'a';

  // 完全透明凸透镜光学样式（0 不透明底色，纯靠物理高光与透镜折射塑造体感）
  const lensBaseStyle: React.CSSProperties = {
    // 1. 完全透明底色
    backgroundColor: 'transparent',
    // 2. 纯光学透镜汇聚与透光（提升亮度与对比，透出 100% 原生背景）
    backdropFilter: 'brightness(1.12) contrast(1.06)',
    WebkitBackdropFilter: 'brightness(1.12) contrast(1.06)',
    // 3. 凸透镜纯物理玻璃边缘与倒角高光
    boxShadow: active
      ? `
        0 4px 16px -2px rgba(0, 0, 0, 0.3),
        inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.85),
        inset 0 -1.5px 1.5px 0 rgba(255, 255, 255, 0.3),
        inset 1px 0 1.5px 0 rgba(255, 255, 255, 0.45),
        inset -1px 0 1.5px 0 rgba(255, 255, 255, 0.45)
      `
      : `
        0 3px 12px -2px rgba(0, 0, 0, 0.25),
        inset 0 1.2px 1.2px 0 rgba(255, 255, 255, 0.75),
        inset 0 -1.2px 1.2px 0 rgba(255, 255, 255, 0.25),
        inset 1px 0 1px 0 rgba(255, 255, 255, 0.35),
        inset -1px 0 1px 0 rgba(255, 255, 255, 0.35)
      `,
    // 4. 超细晶莹透镜外边框
    border: active
      ? '1px solid rgba(255, 255, 255, 0.65)'
      : '1px solid rgba(255, 255, 255, 0.45)',
  };

  const Component = (
    as === 'a' ? motion.a : as === 'button' ? motion.button : motion.div
  ) as React.ComponentType<HTMLMotionProps<any>>;

  return (
    <Component
      {...(as === 'a' ? { href } : {})}
      {...(as === 'button' ? { type: 'button', 'aria-label': ariaLabel } : {})}
      onClick={onClick}
      style={lensBaseStyle}
      whileHover={isButtonOrLink ? { scale: 1.05, y: -1 } : undefined}
      whileTap={isButtonOrLink ? { scale: 0.96, y: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 450, damping: 22 }}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full cursor-pointer select-none transition-all duration-300 ${className}`}
    >
      {/* 凸透镜拱形微弱反光弧膜 */}
      <div
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at 50% 12%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.05) 45%, transparent 70%)',
        }}
      />

      {/* 内容层 */}
      <div className="relative z-10 flex items-center gap-1.5">{children}</div>
    </Component>
  );
};
export default ConvexLensPill;
