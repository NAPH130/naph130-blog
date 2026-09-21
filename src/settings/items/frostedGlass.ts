import type { SettingCategory } from '../types';

export interface FrostedGlassValues {
  enabled: boolean;
  blur: number;
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
    const isHome =
      typeof window !== 'undefined' &&
      (window.location.pathname === '/' || window.location.pathname === '');

    let blur = '0px';
    let bg = 'transparent';
    let opacity = '0';

    if (values.enabled) {
      blur = `${values.blur}px`;
      opacity = '1';
      bg = 'rgba(255, 255, 255, 0.28)'; // 纯净白底半透光晕
    }

    // 1. 设置持久化参数变量
    root.style.setProperty('--glass-blur', blur);
    root.style.setProperty('--glass-bg', bg);
    root.style.setProperty('--glass-opacity', opacity);

    // 2. 若在非首页，立即同步当前活跃页面的生效变量
    if (!isHome) {
      root.style.setProperty('--page-blur', blur);
      root.style.setProperty('--page-bg', bg);
      root.style.setProperty('--page-opacity', opacity);
    }
  },
};
