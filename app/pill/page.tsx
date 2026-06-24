'use client';
import React, { useState, useMemo } from 'react';

// 방장님이 정리해주신 영단 24종 완벽 반영
const PILL_DATA = [
  { name: '해태단', stats: ['힘%', '체력%'], color: 'from-orange-600 to-orange-400' },
  { name: '기린단', stats: ['민첩%', '체력%'], color: 'from-green-600 to-green-400' },
  { name: '현무단', stats: ['행운+', '경험치획득량%'], color: 'from-cyan-700 to-cyan-500' },
  { name: '청룡단', stats: ['힘+', '경험치획득량%'], color: 'from-blue-600 to-blue-400' },
  { name: '천경단', stats: ['행운%', '공격력+'], color: 'from-purple-500 to-pink-500' },
  { name: '명월단', stats: ['보스공격력%', '행운+'], color: 'from-slate-400 to-slate-200' },
  { name: '매화단', stats: ['치명타공격력%', '체력+'], color: 'from-pink-500 to-rose-400' },
  { name: '은환단', stats: ['최종공격력%'], color: 'from-gray-300 to-white' },
  { name: '적환단', stats: ['체력+', '체력%'], color: 'from-red-700 to-red-500' },
  { name: '흑환단', stats: ['저항%', '물약회복량%'], color: 'from-slate-800 to-slate-600' },
  { name: '자환단', stats: ['행운%', '민첩%'], color: 'from-fuchsia-700 to-fuchsia-500' },
  { name: '황환단', stats: ['행운+', '힘+', '생명력+', '민첩+'], color: 'from-yellow-500 to-yellow-300' },
  { name: '용마단', stats: ['체력%', '행운%'], color: 'from-amber-600 to-orange-500' },
  { name: '봉황단', stats: ['체력%', '생명력%'], color: 'from-rose-600 to-orange-500' },
  { name: '백호단', stats: ['민첩+', '경험치획득량%'], color: 'from-sky-300 to-white' },
  { name: '주작단', stats: ['생명력+', '경험치획득량%'], color: 'from-red-600 to-red-400' },
  { name: '시공단', stats: ['물약회복량%', '경험치획득량%'], color: 'from-blue-500 to-cyan-400' },
  { name: '태극단', stats: ['보스공격력%', '힘+'], color: 'from-zinc-900 to-zinc-500' },
  { name: '용혈단', stats: ['체력%', '생명력+'], color: 'from-red-800 to-red-600' },
  { name: '금환단', stats: ['스킬피해량%'], color: 'from-yellow-600 to-yellow-400' },
  { name: '옥환단', stats: ['공격력%'], color: 'from-emerald-600 to-emerald-400' },
  { name: '백환단', stats: ['경험치획득량%', '드랍율%'], color: 'from-slate-200 to-white' },
  { name: '청환단', stats: ['공격력+', '보스공격력%'], color: 'from-blue-700 to-blue-500' },
  { name: '녹환단', stats: ['힘%', '생명력%'], color: 'from-lime-600 to-lime-400' },
];

export default function PillDictionaryPage() {
  const [activeFilter, setActiveFilter] = useState<string>('전체');

  // 모든 영단에서 중복 없이 존재하는 스탯 목록 추출 (필터 버튼용)
  const allUniqueStats = useMemo(() => {
    const statsSet = new Set<string>();
    PILL_DATA.forEach(pill => pill.stats.forEach(s => statsSet.add(s)));
    return Array.from(statsSet).sort();
  }, []);

  // 필터링된 영단 목록
  const filteredPills = useMemo(() => {
    if (activeFilter === '전체') return PILL_DATA;
    return PILL_DATA.filter(pill => pill.stats.includes(activeFilter));
  }, [activeFilter]);

  return (
    <div className="animate-fade-in pb-10 h-full flex flex-col select-none">
      
      {/* 헤더 섹션 */}
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">💊 영단 도감</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-2">
          자신에게 필요한 능력치가 포함된 영단을 필터링하여 찾아보세요!<br/>
          (추후 인게임 수치 데이터가 확보되면 시뮬레이터가 추가될 예정입니다.)
        </p>
      </div>

      {/* 스탯 필터 버튼 영역 */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm mb-6 shrink-0">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-gray-800 pb-3">
          <span className="text-sm font-black text-slate-700 dark:text-gray-300">🔍 스탯 필터</span>
          <span className="text-xs font-bold text-slate-400">클릭하여 해당 스탯을 올려주는 영단만 모아볼 수 있습니다.</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('전체')}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
              activeFilter === '전체' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700'
            }`}
          >
            전체 보기
          </button>
          {allUniqueStats.map((stat) => (
            <button
              key={stat}
              onClick={() => setActiveFilter(stat)}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all border ${
                activeFilter === stat 
                  ? 'bg-purple-600 border-purple-500 text-white shadow-md' 
                  : 'bg-white dark:bg-[#121212] border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:border-purple-400 dark:hover:border-purple-500'
              }`}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      {/* 영단 그리드 목록 */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filteredPills.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-400 font-bold">검색된 영단이 없습니다.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredPills.map((pill, idx) => (
              <div 
                key={idx} 
                className="bg-[#f8fafc] dark:bg-[#1a1a1a] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm hover:border-purple-400 dark:hover:border-purple-500 transition-all flex flex-col items-center group"
              >
                {/* 동그란 구슬(영단) 아이콘 연출 */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${pill.color} shadow-lg mb-4 border-2 border-white/20 dark:border-white/10 group-hover:scale-110 transition-transform flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-[2px] -top-2 -left-2 w-8 h-8"></div>
                </div>
                
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">{pill.name}</h3>
                
                <div className="w-full flex flex-col gap-1.5">
                  {pill.stats.map((stat, sIdx) => {
                    // 수치 증가(+)와 퍼센트(%)를 구분하여 색상 다르게 표시
                    const isPercent = stat.includes('%');
                    return (
                      <div 
                        key={sIdx} 
                        className={`text-xs font-black text-center py-1.5 px-2 rounded-lg border ${
                          isPercent 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/50' 
                            : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50'
                        }`}
                      >
                        {stat}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}