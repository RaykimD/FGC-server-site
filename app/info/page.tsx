'use client';
import Link from 'next/link';

export default function InfoHubPage() {
  const infoMenus = [
    {
      title: '👥 신청자 명단',
      desc: '모집 공고에 참여했던 1차 및 전체 스트리머 현황',
      href: '/streamers',
      color: 'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-700',
    },
    {
      title: '🗓️ 서버 일정',
      desc: '회차별 주요 이벤트 및 서버 스케줄표',
      href: '/schedule',
      color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    {
      title: '📝 패치노트',
      desc: '날짜별 서버 업데이트 및 버그 수정 내역',
      href: '/patchnote',
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    {
      title: '🎁 API 목록',
      desc: '별풍선 티켓, 지원상자 등 후원 혜택 보상표 안내',
      href: '/api-list',
      color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
  ];

  return (
    <div className="animate-fade-in pb-10 h-full flex flex-col">
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">ℹ️ 서버 종합 정보</h1>
        <p className="text-sm font-medium text-slate-500 mt-2">
          서버에 필요한 정보들을 한곳에 모아두었습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-start">
        {infoMenus.map((menu, idx) => (
          <Link
            key={idx}
            href={menu.href}
            className={`group flex flex-col p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-md ${menu.color}`}
          >
            <h2 className="text-xl font-black mb-2 flex items-center justify-between">
              {menu.title}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xl">→</span>
            </h2>
            <p className="text-sm font-medium opacity-80">{menu.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}