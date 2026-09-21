/**
 * 控件类型
 */
export type SettingControlType = 'switch' | 'slider' | 'select';

/**
 * 单个选项控件的配置项定义
 */
export interface SettingControlItem<T = unknown> {
  /** 子选项字段标识，例如 'blur', 'opacity' */
  field: string;
  /** 子选项显示名称，例如 '模糊强度' */
  label: string;
  /** 子选项简要描述 */
  description?: string;
  /** 控件类型 */
  type: SettingControlType;
  /** 默认值 */
  defaultValue: T;
  /** 数值范围最小值 (仅 slider 生效) */
  min?: number;
  /** 数值范围最大值 (仅 slider 生效) */
  max?: number;
  /** 步长 (仅 slider 生效) */
  step?: number;
  /** 显示单位，例如 'px', '%' */
  unit?: string;
  /** 选项列表 (仅 select 生效) */
  options?: Array<{
    label: string;
    value: string;
  }>;
}

/**
 * 顶级设置大类配置契约
 */
export interface SettingCategory<TValues = Record<string, unknown>> {
  /** 选项大类名称，例如 '磨砂玻璃' */
  name: string;
  /** 选项大类字段标识，例如 'frostedGlass' */
  field: string;
  /** 选项大类说明文案，例如 '控制全站背景虚化与透明遮罩效果' */
  description: string;
  /** 图标名称标识 */
  icon?: string;
  /** 该大类下的所有子配置控件定义 */
  items: Array<SettingControlItem<unknown>>;
  /** 默认值集合 */
  defaultValues: TValues;
  /** 实时应用此大类设置到页面（例如更新 CSS 变量或 DOM） */
  apply: (values: TValues) => void;
}
