import type { SettingCategory } from '../types';

export interface FrostedGlassValues {
  enabled: boolean;
  blur: number;
}

export const FROSTED_GLASS_BACKGROUND = 'rgba(255, 255, 255, 0.28)';

/** 首页路径包含部署前缀；统一忽略末尾斜杠。 */
export function isHomePath(pathname: string, basePath: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  const base = basePath.replace(/\/+$/, '') || '/';
  return path === '/' || path === base;
}

export const frostedGlassCategory: SettingCategory<FrostedGlassValues> = {
  name: '背景磨砂效果',
  field: 'frostedGlass',
  description: '调节背景图的模糊虚化程度',
  icon: 'Sliders',
  defaultValues: {
    enabled: true,
    blur: 40, // 默认 40px，磨砂虚化更充分立体
  },
  items: [
    {
      field: 'enabled',
      label: '磨砂遮罩开关',
      type: 'switch',
      defaultValue: true,
    },
    {
      field: 'blur',
      label: '模糊强度',
      type: 'slider',
      min: 0,
      max: 120, // 0 ~ 120px 宽域调节
      step: 1,
      unit: 'px',
      defaultValue: 40,
    },
  ],
  apply: (values: FrostedGlassValues) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const isHome = isHomePath(window.location.pathname, import.meta.env.BASE_URL);

    let blur = '0px';
    let bg = 'transparent';
    let opacity = '0';

    if (values.enabled) {
      blur = `${values.blur}px`;
      opacity = '1';
      bg = FROSTED_GLASS_BACKGROUND;
    }

    // 1. 设置持久化参数变量
    root.style.setProperty('--glass-blur', blur);
    root.style.setProperty('--glass-bg', bg);
    root.style.setProperty('--glass-opacity', opacity);

    // 2. 每次应用都同步页面状态；首页始终清晰，但保留用户参数。
    root.style.setProperty('--page-blur', isHome ? '0px' : blur);
    root.style.setProperty('--page-bg', isHome ? 'transparent' : bg);
    root.style.setProperty('--page-opacity', isHome ? '0' : opacity);
  },
};
