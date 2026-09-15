import React, { useState, useEffect, useRef } from 'react';
import { Home, User, BookOpen, Sparkles, Link2, Settings, Languages, Check } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import {
  loadSavedSettings,
  persistSettings,
  applyAllSettings,
  getDefaultSettings,
} from '@/settings';
import { languages, defaultLanguage, t, type I18nKey } from '@/i18n';

interface HeaderNavProps {
  currentPath?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ currentPath = '/' }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<Record<string, Record<string, unknown>>>(() =>
    loadSavedSettings()
  );

  // 语言状态管理 (根据当前路径及 localStorage 智能识别)
  const [currentLang, setCurrentLang] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/en_us/') || path.startsWith('/en/')) {
        return 'en';
      }
      if (path.includes('/zh_cn/') || path.startsWith('/zh/')) {
        return 'zh';
      }
      return localStorage.getItem('naph130_lang') || defaultLanguage;
    }
    if (currentPath.includes('/en_us/') || currentPath.startsWith('/en/')) {
      return 'en';
    }
    if (currentPath.includes('/zh_cn/') || currentPath.startsWith('/zh/')) {
      return 'zh';
    }
    return defaultLanguage;
  });

  const handleSelectLang = (name: string) => {
    setCurrentLang(name);
    setIsLangOpen(false); // 选中后立即收起菜单
    if (typeof window !== 'undefined') {
      localStorage.setItem('naph130_lang', name);
      window.dispatchEvent(new CustomEvent('naph130:lang-change', { detail: name }));

      // 若当前正处于分语言文章详情页 (/posts/[locale]/[slug])，平滑切换至目标语言对应文章路由
      const path = window.location.pathname;
      const match = path.match(/^\/posts\/(zh_cn|en_us)\/(.+)$/);
      if (match) {
        const currentLocaleInUrl = match[1];
        const postSlug = match[2];
        const targetLocaleInUrl = name === 'en' || name === 'en_us' ? 'en_us' : 'zh_cn';
        if (currentLocaleInUrl !== targetLocaleInUrl) {
          window.location.href = `/posts/${targetLocaleInUrl}/${postSlug}`;
        }
      }
    }
  };

  // 点击外部收起与 ESC 键快捷收起语言菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLangOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 动态响应式路由状态（支持 Astro ClientRouter 客户端平滑导航）
  const [activePath, setActivePath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.replace(/\/$/, '') || '/';
    }
    return currentPath.replace(/\/$/, '') || '/';
  });

  useEffect(() => {
    const handlePathUpdate = () => {
      const path = window.location.pathname.replace(/\/$/, '') || '/';
      setActivePath(path);
      setIsSettingsOpen(false);
      setIsLangOpen(false);

      if (path.includes('/en_us/') || path.startsWith('/en/')) {
        setCurrentLang('en');
        localStorage.setItem('naph130_lang', 'en');
      } else if (path.includes('/zh_cn/') || path.startsWith('/zh/')) {
        setCurrentLang('zh');
        localStorage.setItem('naph130_lang', 'zh');
      }
    };

    handlePathUpdate();
    document.addEventListener('astro:page-load', handlePathUpdate);
    window.addEventListener('popstate', handlePathUpdate);

    return () => {
      document.removeEventListener('astro:page-load', handlePathUpdate);
      window.removeEventListener('popstate', handlePathUpdate);
    };
  }, []);

  // 初次挂载与 settings 变更时自动执行 apply 并持久化
  useEffect(() => {
    applyAllSettings(settings);
    persistSettings(settings);
  }, [settings]);

  const handleUpdateValue = (categoryField: string, itemField: string, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [categoryField]: {
        ...(prev[categoryField] ?? {}),
        [itemField]: value,
      },
    }));
  };

  const handleReset = () => {
    const defaults = getDefaultSettings();
    setSettings(defaults);
  };

  const targetLocale = currentLang === 'en' || currentLang === 'en_us' ? 'en_us' : 'zh_cn';

  const navItems = [
    { key: 'home', href: '/', icon: Home },
    { key: 'intro', href: '/intro', icon: User },
    { key: 'posts', href: '/posts', icon: BookOpen },
    { key: 'moments', href: '/moments', icon: Sparkles },
    { key: 'friends', href: '/friends', icon: Link2 },
  ];

  return (
    <>
      {/* 顶部透明悬浮 Bar */}
      <header className="relative w-full h-20 bg-transparent select-none">
        <div className="relative max-w-7xl mx-auto h-full px-6 sm:px-12 flex items-center justify-between">
          {/* 左侧：纯白 Logo */}
          <div className="flex items-center shrink-0 z-10 min-w-[220px]">
            <a
              href="/"
              className="flex items-center text-xl sm:text-2xl font-['Comfortaa'] font-bold tracking-normal text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <span className="whitespace-nowrap">NAPH130's Blog</span>
            </a>
          </div>

          {/* 中间：横向与纵向绝对居中锁定 */}
          <nav className="absolute left-1/2 -translate-x-1/2 inset-y-0 flex items-center justify-center gap-6 sm:gap-9 md:gap-10 shrink-0 z-20 pointer-events-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? activePath === '/'
                  : activePath === item.href || activePath.startsWith(item.href + '/');

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 py-1 text-base sm:text-lg font-semibold tracking-normal transition-colors duration-200 shrink-0 ${
                    isActive
                      ? 'text-white opacity-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.95)]'
                      : 'text-white/60 opacity-60 hover:opacity-100 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0 pointer-events-none" />
                  <span className="whitespace-nowrap shrink-0 pointer-events-none">
                    {t(`nav.${item.key}` as I18nKey, targetLocale)}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* 右侧：功能按钮组（语言切换 + 设置按钮） */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 text-white shrink-0 z-10 min-w-[220px]">
            {/* 语言切换菜单（半透明高通透磨砂玻璃质感） */}
            <div
              className="relative group"
              onMouseEnter={() => setIsLangOpen(true)}
              onMouseLeave={() => setIsLangOpen(false)}
            >
              <button
                type="button"
                aria-label="语言切换"
                onClick={() => setIsLangOpen((prev) => !prev)}
                className={`p-2 transition-all focus:outline-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center ${
                  isLangOpen ? 'opacity-100 scale-105' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <Languages className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              </button>

              {/* 语言浮层下拉菜单：半透明磨砂玻璃卡片 */}
              <div
                className={`absolute right-0 top-full pt-2 transition-all duration-200 z-50 ${
                  isLangOpen
                    ? 'opacity-100 pointer-events-auto translate-y-0'
                    : 'opacity-0 pointer-events-none -translate-y-1'
                }`}
              >
                <div
                  className="w-36 p-1.5 rounded-xl text-neutral-900 font-mono text-xs select-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.55)',
                    backdropFilter: 'blur(28px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(28px) saturate(150%)',
                    border: '1px solid rgba(255, 255, 255, 0.65)',
                    boxShadow:
                      '0 20px 40px -12px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold text-neutral-600 uppercase tracking-wider border-b border-neutral-300/60 mb-1">
                    Language // 语言
                  </div>
                  <div className="space-y-0.5">
                    {languages.map((lang) => {
                      const isSelected = currentLang === lang.name;
                      return (
                        <button
                          key={lang.name}
                          type="button"
                          onClick={() => handleSelectLang(lang.name)}
                          className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-all ${
                            isSelected
                              ? 'bg-neutral-900 text-white font-bold shadow-xs'
                              : 'text-neutral-800 hover:bg-white/40 hover:text-neutral-950 font-medium'
                          }`}
                        >
                          <span>{lang.fullName}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 设置按钮 */}
            <button
              type="button"
              aria-label="设置"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className={`p-2 transition-all focus:outline-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] ${
                isSettingsOpen ? 'rotate-90 text-white opacity-100' : 'opacity-85 hover:opacity-100'
              }`}
            >
              <Settings className="w-5 h-5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </header>

      {/* 设置面板 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateValue={handleUpdateValue}
        onReset={handleReset}
      />
    </>
  );
};
export default HeaderNav;
