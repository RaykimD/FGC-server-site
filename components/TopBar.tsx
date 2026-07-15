'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TopBar() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isStreamerMode, setIsStreamerMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 💡 스트리머 모드가 켜지면 html 태그에 클래스를 부여함
  useEffect(() => {
    if (isStreamerMode) {
      document.documentElement.classList.add('streamer-mode');
    } else {
      document.documentElement.classList.remove('streamer-mode');
    }
  }, [isStreamerMode]);

  return (
    <header className="flex justify-end items-center gap-6 mb-8 pb-4 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      
      <label className="relative inline-flex items-center cursor-pointer group">
        <input 
          type="checkbox" 
          checked={isStreamerMode}
          onChange={(e) => setIsStreamerMode(e.target.checked)}
          className="sr-only peer" 
        />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-500"></div>
        <span className="ml-3 text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
          스트리머 모드
        </span>
      </label>

      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm"
      >
        🏠 홈
      </Link>

      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm"
      >
        {isDarkMode ? '☀️ 라이트 모드' : '🌙 다크 모드'}
      </button>
      
    </header>
  );
}