import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { settingCategories, type SettingControlItem } from '@/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Record<string, Record<string, unknown>>;
  onUpdateValue: (categoryField: string, itemField: string, value: unknown) => void;
  onReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateValue,
  onReset,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const renderControl = (
    categoryField: string,
    control: SettingControlItem<unknown>,
    currentCategoryValues: Record<string, unknown>
  ) => {
    const isCategoryEnabled =
      'enabled' in currentCategoryValues ? Boolean(currentCategoryValues.enabled) : true;
    const value = currentCategoryValues[control.field] ?? control.defaultValue;
    const isDisabled = control.field !== 'enabled' && !isCategoryEnabled;

    switch (control.type) {
      case 'switch': {
        const isChecked = Boolean(value);
        return (
          <div
            key={control.field}
            className={`flex items-center justify-between py-2 transition-opacity ${
              isDisabled ? 'opacity-30' : 'opacity-100'
            }`}
          >
            <div className="flex items-center gap-2.5 pr-3">
              <span className="text-xs font-mono font-bold text-neutral-900 select-none">□</span>
              <div>
                <label className="text-xs font-mono font-bold tracking-wider text-neutral-900 uppercase block">
                  {control.label}
                </label>
                {control.description && (
                  <p className="text-[11px] font-mono text-neutral-700 mt-0.5 leading-tight">
                    {control.description}
                  </p>
                )}
              </div>
            </div>

            {/* Anti-Polish Square Raw Switch (半透明适配) */}
            <button
              type="button"
              role="switch"
              aria-checked={isChecked}
              disabled={isDisabled}
              onClick={() => onUpdateValue(categoryField, control.field, !isChecked)}
              className={`h-7 px-3 flex items-center justify-center font-mono text-xs border rounded-none transition-all disabled:cursor-not-allowed ${
                isChecked
                  ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                  : 'bg-white/40 text-neutral-800 border-neutral-600/70 hover:border-neutral-900 hover:text-neutral-950'
              }`}
            >
              {isChecked ? '[ ON ]' : '[ OFF ]'}
            </button>
          </div>
        );
      }

      case 'slider': {
        const numValue = typeof value === 'number' ? value : 0;
        const min = control.min ?? 0;
        const max = control.max ?? 100;
        const step = control.step ?? 1;

        return (
          <div
            key={control.field}
            className={`space-y-2 py-2 transition-opacity ${
              isDisabled ? 'opacity-30' : 'opacity-100'
            }`}
          >
            <div className="flex items-center justify-between font-mono">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-neutral-900 select-none">□</span>
                <span className="text-xs font-bold tracking-wider text-neutral-900 uppercase">
                  {control.label}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-900 px-2 py-0.5 border border-neutral-900/40 bg-white/50 rounded-none shadow-xs">
                {numValue}
                {control.unit ?? ''}
              </span>
            </div>

            {/* 半透明纯净工坊滑块 */}
            <div className="relative flex items-center pt-1 pb-0.5">
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={numValue}
                disabled={isDisabled}
                onChange={(e) =>
                  onUpdateValue(categoryField, control.field, parseFloat(e.target.value))
                }
                className="w-full h-1.5 bg-neutral-900/20 appearance-none cursor-pointer border border-neutral-900/30 rounded-none disabled:cursor-not-allowed
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:w-3.5 
                  [&::-webkit-slider-thumb]:h-3.5 
                  [&::-webkit-slider-thumb]:bg-neutral-900 
                  [&::-webkit-slider-thumb]:border 
                  [&::-webkit-slider-thumb]:border-neutral-900 
                  [&::-webkit-slider-thumb]:rounded-none 
                  [&::-webkit-slider-thumb]:shadow-xs
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-3.5 
                  [&::-moz-range-thumb]:h-3.5 
                  [&::-moz-range-thumb]:bg-neutral-900 
                  [&::-moz-range-thumb]:border-none 
                  [&::-moz-range-thumb]:rounded-none"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono font-bold text-neutral-600">
              <span>{min}{control.unit ?? ''}</span>
              <span>{max}{control.unit ?? ''}</span>
            </div>
          </div>
        );
      }

      case 'select': {
        const strValue = String(value);
        return (
          <div
            key={control.field}
            className={`space-y-2 py-2 transition-opacity ${
              isDisabled ? 'opacity-30' : 'opacity-100'
            }`}
          >
            <div className="flex items-center gap-2.5 font-mono">
              <span className="text-xs font-bold text-neutral-900 select-none">□</span>
              <span className="text-xs font-bold tracking-wider text-neutral-900 uppercase">
                {control.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {control.options?.map((option) => {
                const isSelected = strValue === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => onUpdateValue(categoryField, control.field, option.value)}
                    className={`px-3 py-2 font-mono text-xs border text-left flex items-center justify-between transition-colors rounded-none ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                        : 'bg-white/40 text-neutral-800 border-neutral-400 hover:border-neutral-900 hover:text-neutral-950'
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className="text-[10px]">{isSelected ? '■' : '□'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景轻微暗场 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/25 backdrop-blur-xs"
          />

          {/* Anti-Polish 半透明磨砂面板 (bg-white/45 + blur-2xl) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-[calc(100vw-32px)] sm:w-[400px] max-w-[400px] mx-auto select-none z-10 font-mono shadow-2xl rounded-none border border-neutral-900/80 text-neutral-900"
            style={{
              background: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(32px) saturate(150%)',
              WebkitBackdropFilter: 'blur(32px) saturate(150%)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.6)',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {/* 顶部标题栏 */}
            <div className="px-6 py-4 border-b border-neutral-900/15 flex items-center justify-between bg-white/20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-neutral-900 text-white rounded-none">
                  SYS//01
                </span>
                <h3 className="text-sm font-bold tracking-widest text-neutral-900 uppercase">
                  设置
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className="px-2.5 py-1 text-xs font-mono border border-neutral-600/60 text-neutral-800 hover:text-neutral-950 hover:border-neutral-900 active:bg-neutral-200/50 transition-colors rounded-none"
              >
                [ ✕ ]
              </button>
            </div>

            {/* 控制项列表 */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {settingCategories.map((category, catIndex) => {
                const categoryValues = settings[category.field] ?? category.defaultValues;
                return (
                  <section key={category.field} className="space-y-3">
                    {/* 分类标题 */}
                    <div className="flex items-baseline justify-between pb-1.5 border-b border-neutral-900/15">
                      <h4 className="text-xs font-bold text-neutral-900 tracking-wider uppercase">
                        // {String(catIndex + 1).padStart(2, '0')}. {category.name}
                      </h4>
                      {category.description && (
                        <span className="text-[10px] text-neutral-600 font-mono font-medium">
                          {category.description}
                        </span>
                      )}
                    </div>

                    {/* 控制列表 */}
                    <div className="space-y-2">
                      {category.items.map((control) => (
                        <div key={control.field}>
                          {renderControl(category.field, control, categoryValues)}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* 底部操作栏 */}
            <div className="px-6 py-4 border-t border-neutral-900/15 flex items-center justify-between bg-white/20">
              <button
                type="button"
                onClick={onReset}
                className="px-3 py-1.5 text-xs font-mono border border-neutral-600/60 text-neutral-800 hover:text-neutral-950 hover:border-neutral-900 active:bg-neutral-200/50 transition-colors rounded-none"
              >
                [ 恢复默认 ]
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-1.5 text-xs font-mono font-bold bg-neutral-900 text-white hover:bg-neutral-800 active:bg-black transition-colors rounded-none shadow-xs"
              >
                [ 完成 ]
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default SettingsModal;
