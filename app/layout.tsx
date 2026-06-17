import type { Metadata } from 'next';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import './globals.css';

export const metadata: Metadata = {
  title: '총겜동 내수서버 정보공유 사이트',
  description: 'Made by. SOOP 김쨔응',
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
          <div className="p-6">
            <Link href="/" className="block group">
              <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight group-hover:text-blue-500 transition-colors">
                총겜동 내수서버<br /><span className="text-blue-500">사이트</span>
              </h1>
            </Link>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">
              총겜동 내수서버 강화 시뮬레이터
            </p>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
            {/* 💡 서버 정보 (위로 이동 및 글씨 색상 통일) */}
            <div className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3 pl-2">
              서버 정보
            </div>
            <Link href="/streamers" className="block px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
              👥 신청자 명단
            </Link>
            <Link href="/status" className="block px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
              📊 길드/직업 현황
            </Link>
            <Link href="/report" className="block px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
              📢 정보 공유방
            </Link>

            {/* 보스타임 (예정) - 비활성화 효과(opacity-60)는 유지하되 기본 색상은 통일 */}
            <Link href="#" className="block px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all cursor-not-allowed opacity-60">
              👹 보스타임 (예정)
            </Link>

            {/* 💡 시뮬레이터 (아래로 이동 및 위쪽 여백 mt-8 적용) */}
            <div className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3 mt-8 pl-2">
              시뮬레이터
            </div>
            <Link href="/weapon" className="block px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
              ⚔️ 무기 강화
            </Link>
            <Link href="/armor" className="block px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
              🛡️ 방어구 재련
            </Link>
            <Link href="/ring" className="block px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
              💍 반지 강화
            </Link>
            <Link href="/pickaxe" className="block px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
              ⛏️ 곡괭이 강화
            </Link>
            <Link href="/lightfoot" className="block px-4 py-3 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
              🏃 경공비급 강화
            </Link>
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
