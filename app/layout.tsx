import type { Metadata } from 'next';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import './globals.css';

export const metadata: Metadata = {
  title: '총겜동 내수서버 사이트',
  description: '총겜동 내수서버 정보공유 사이트',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="stylesheet" as="style" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css" />
      </head>
      <body className="min-h-screen flex overflow-hidden bg-gray-50 dark:bg-[#121212] transition-colors duration-300 text-gray-900 dark:text-gray-100">

        {/* 왼쪽 사이드바 */}
        <aside className="w-64 bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col h-screen shrink-0 transition-colors duration-300">
          <div className="p-6 shrink-0">
            <Link href="/" className="block group">
              <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-blue-500 transition-colors">
                총겜동 내수서버<br /><span className="text-blue-500">정보 공유 사이트</span>
              </h1>
            </Link>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">
              Made by. SOOP 김쨔응
            </p>
          </div>

          {/* 💡 아코디언 감성 유지 & 짧아진 메뉴 구성 */}
          <nav className="flex-1 px-4 mt-2 overflow-y-auto custom-scrollbar pb-6 space-y-3">
            
            {/* 📂 1. 서버 정보 (핵심 메뉴들만 슬림하게) */}
            <details open className="group">
              <summary className="flex justify-between items-center px-2 mb-2 text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:text-gray-600 dark:hover:text-gray-300 transition-colors select-none">
                <span>서버 정보</span>
                <span className="text-[10px] transition-transform duration-300 group-open:rotate-180">▼</span>
              </summary>
              <div className="space-y-1 mt-1 pl-1 border-l-2 border-slate-100 dark:border-gray-800 ml-2">
                <Link href="/info" className="block px-4 py-2.5 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                  ℹ️ 서버 종합 정보
                </Link>
                <Link href="/status" className="block px-4 py-2.5 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                  📊 길드/직업 현황
                </Link>
                <Link href="/boss" className="block px-4 py-2.5 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                  👹 보스타임
                </Link>
                <Link href="/report" className="block px-4 py-2.5 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                  📢 정보 공유방
                </Link>
              </div>
            </details>

            {/* 📂 2. 시뮬레이터 */}
            <details open className="group">
              <summary className="flex justify-between items-center px-2 mb-2 text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:text-gray-600 dark:hover:text-gray-300 transition-colors select-none">
                <span>시뮬레이터</span>
                <span className="text-[10px] transition-transform duration-300 group-open:rotate-180">▼</span>
              </summary>
              <div className="space-y-1 mt-1 pl-1 border-l-2 border-slate-100 dark:border-gray-800 ml-2">
                <Link href="/weapon" className="block px-4 py-2.5 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                  ⚔️ 무기 강화
                </Link>
                <Link href="/armor" className="block px-4 py-2.5 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                  🛡️ 방어구 재련
                </Link>
                <Link href="/ring" className="block px-4 py-2.5 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                  💍 반지 강화
                </Link>
                <Link href="/pickaxe" className="block px-4 py-2.5 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                  ⛏️ 곡괭이 강화
                </Link>
                <Link href="/lightfoot" className="block px-4 py-2.5 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                  🏃 경공비급 강화
                </Link>
              </div>
            </details>

            {/* 📂 3. 라운지 */}
            <details open className="group">
              <summary className="flex justify-between items-center px-2 mb-2 text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:text-gray-600 dark:hover:text-gray-300 transition-colors select-none">
                <span>라운지</span>
                <span className="text-[10px] transition-transform duration-300 group-open:rotate-180">▼</span>
              </summary>
              <div className="space-y-1 mt-1 pl-1 border-l-2 border-slate-100 dark:border-gray-800 ml-2">
                <Link href="/multiview" className="block px-4 py-2.5 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                  📺 커스텀 멀티뷰
                </Link>
                <Link href="/attendance" className="block px-4 py-2.5 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                  📅 출석체크
                </Link>
                <Link href="/collection" className="block px-4 py-2.5 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all mb-6">
                  🃏 스트리머 도감
                </Link>
              </div>
            </details>

          </nav>
        </aside>

        {/* 오른쪽 메인 컨텐츠 영역 */}
        <main className="flex-1 h-screen overflow-y-auto">
          <div className="p-8 h-full max-w-7xl mx-auto flex flex-col">
            <TopBar />
            <div className="flex-1 min-h-0">
              {children}
            </div>
          </div>
        </main>

      </body>
    </html>
  );
}