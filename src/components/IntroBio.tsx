import React, { useState, useEffect } from 'react';
import { intros } from '@/content/intro';

export const IntroBio: React.FC = () => {
  const [lang, setLang] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('naph130_lang');
      return saved === 'en' || saved === 'en_us' || saved === 'en-US' ? 'en' : 'zh';
    }
    return 'zh';
  });

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const code = customEvent.detail;
      setLang(code === 'en' || code === 'en_us' || code === 'en-US' ? 'en' : 'zh');
    };

    window.addEventListener('naph130:lang-change', handleLangChange);
    return () => {
      window.removeEventListener('naph130:lang-change', handleLangChange);
    };
  }, []);

  const currentIntro = lang === 'en' ? intros.en_us : intros.zh_cn;

  return (
    <div className="w-full flex flex-col justify-center space-y-3.5 select-text">
      {currentIntro.paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="text-base sm:text-lg font-medium text-white tracking-normal leading-relaxed drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.85)]"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
};
export default IntroBio;
