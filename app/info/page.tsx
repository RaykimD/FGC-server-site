'use client';
import Link from 'next/link';

export default function InfoHubPage() {
  // 💡 패치노트와 API 목록을 삭제하고 3개만 남겼습니다!
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
      title: '💊 영단 정보',
      desc: '각 영단별 증가 스탯 도감 및 필터 검색',
      href: '/pill',
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
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

      {/* 💡 메뉴가 3개이므로 lg:grid-cols-3을 추가해 PC 화면에서 가로로 3개가 꽉 차게 예쁘게 정렬됩니다. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 content-start">
        {infoMenus.map((menu, idx) => (
          <Link
            key={idx}
            href={menu.href}
            className={`group flex flex-col p-6 rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-lg ${menu.color}`}
          >
            <h2 className="text-xl font-black mb-3 flex items-center justify-between">
              {menu.title}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xl">→</span>
            </h2>
            <p className="text-sm font-bold opacity-80 leading-relaxed">{menu.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}