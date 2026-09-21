# 设置系统 (Settings) 设计与维护说明

本系统采用类似 `i18n` 的注册驱动架构，实现页面设置项的模块化声明与 UI 动态渲染。

## 目录结构

```text
src/settings/
├── types.ts            # 设置大类、控件类型与配置契约定义
├── registry.ts         # 全局注册中心与 apply 调度逻辑
├── index.ts            # 统一对外导出入口
├── README.md           # 本说明文件
└── items/              # 具体设置项维护目录
    └── frostedGlass.ts # 磨砂玻璃大类及子配置
```

## 核心设计

1. **配置大类契约 (`SettingCategory`)**：每个设置大类包含名称、字段标识、说明文案、子控件列表及 `apply()` 页面生效逻辑。
2. **UI 纯数据驱动**：在 `items/` 下新增文件并在 `registry.ts` 注册后，设置弹窗面板会自动生成对应的控件，无需手动写组件代码。

---

## 如何新增一个设置大类？

### 第 1 步：在 `src/settings/items/` 下新建配置项（如 `theme.ts`）

```typescript
import type { SettingCategory } from '../types';

export interface ThemeValues {
  primaryColor: string;
}

export const themeCategory: SettingCategory<ThemeValues> = {
  name: '主题配色',
  field: 'theme',
  description: '自定义全站高亮强调色',
  defaultValues: {
    primaryColor: 'sky',
  },
  items: [
    {
      field: 'primaryColor',
      label: '强调主色',
      description: '选择按钮与高亮元素的主色调',
      type: 'select',
      defaultValue: 'sky',
      options: [
        { label: '天空蓝', value: 'sky' },
        { label: '翡翠绿', value: 'emerald' },
        { label: '罗兰紫', value: 'violet' },
      ],
    },
  ],
  apply: (values: ThemeValues) => {
    // 在此编写修改 DOM、类名或 CSS 变量的逻辑
    document.documentElement.setAttribute('data-theme', values.primaryColor);
  },
};
```

### 第 2 步：在 `src/settings/registry.ts` 注册

```typescript
import { themeCategory } from './items/theme';

export const settingCategories = [
  frostedGlassCategory,
  themeCategory, // 追加在此处
] as const;
```
设置面板即刻自动渲染该项并实现状态存储与应用。
