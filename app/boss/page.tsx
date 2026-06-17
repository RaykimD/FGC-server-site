'use client';
import React, { useState, useMemo } from 'react';

// 임시 테스트용 데이터 (추후 구글 시트 데이터로 교체됨)
const DUMMY_DATA = [
  { id: 1, date: '7월 15일', time: '21:00', mouse: '수피길드', ginseng: '사장길드', sword: '도현길드', tigerLoot: '성태길드', tigerBind: '성태길드', elephantLoot: '만식길드', elephantBind: '만식길드' },
  { id: 2, date: '7월 15일', time: '18:00', mouse: '도현길드', ginseng: '오아길드', sword: '사장길드', tigerLoot: '성태길드', tigerBind: '만식길드', elephantLoot: '수피길드', elephantBind: '수피길드' },
  { id: 3, date: '7월 15일', time: '15:00', mouse: '성태길드', ginseng: '만식길드', sword: '수피길드', tigerLoot: '오아길드', tigerBind: '오아길드', elephantLoot: '도현길드', elephantBind: '사장길드' },
  { id: 4, date: '7월 15일', time: '12:00', mouse: '오아길드', ginseng: '성태길드', sword: '만식길드', tigerLoot: '수피길드', tigerBind: '수피길드', elephantLoot: '사장길드', elephantBind: '도현길드' },
];

export default function BossPage() {
  const [activeTab, setActiveTab] = useState<'log' | 'stats'>('log');

  // 데이터 기반 길드별 누적 합산 로직 (자동 계산)
  const guildStats = useMemo(() => {
    const stats: Record<string, any> = {};

    DUMMY_DATA.forEach((row) => {
      const bosses = ['mouse', 'ginseng', 'sword', 'tigerLoot', 'tigerBind', 'elephantLoot', 'elephantBind'];
      
      bosses.forEach((bossKey) => {
        const guildName = row[bossKey as keyof typeof row] as string;
        if (!guildName) return;
        
        if (!stats[guildName]) {
          stats[guildName] = { name: guildName, mouse: 0, ginseng: 0, sword: 0, tigerLoot: 0, tigerBind: 0, elephantLoot: 0, elephantBind: 0, total: 0 };
        }
        
        stats[guildName][bossKey]++;
        stats[guildName].total++;
      });
    });

    // 총합(total) 기준으로 내림차순 정렬
    return Object.values(stats).sort((a, b) => b.total - a.total);
  }, []);

  return (
    <div className="animate-fade-in pb-10 max-w-5xl mx-auto mt-4 select-none">
      <div className="mb-8 text-center flex flex-col items-center">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">👹 보스 루팅 현황</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-2">시간별 보스 처치 기록 및 길드별 누적 통계</p>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-gray-800 shadow-sm">
        
        {/* 탭 버튼 영역 */}
        <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-gray-800 pb-2">
          <button 
            onClick={() => setActiveTab('log')} 
            className={`text-lg font-black px-2 transition-all ${activeTab === 'log' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 pb-2 -mb-[10px]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-gray-300'}`}
          >
            ⏱️ 실시간 보스 로그
          </button>
          <button 
            onClick={() => setActiveTab('stats')} 
            className={`text-lg font-black px-2 transition-all ${activeTab === 'stats' ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 pb-2 -mb-[10px]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-gray-300'}`}
          >
            📊 길드별 누적 통계
          </button>
        </div>

        {/* 탭 1: 실시간 보스 로그 */}
        {activeTab === 'log' && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[800px] text-sm text-center">
              <thead className="bg-slate-100 dark:bg-gray-800/50 text-slate-600 dark:text-gray-300 font-bold border-b border-slate-200 dark:border-gray-700">
                <tr>
                  <th className="py-3 px-2 rounded-tl-xl" rowSpan={2}>날짜</th>
                  <th className="py-3 px-2 border-r border-slate-200 dark:border-gray-700" rowSpan={2}>시간</th>
                  <th className="py-3 px-2 border-r border-slate-200 dark:border-gray-700" rowSpan={2}>쥐</th>
                  <th className="py-3 px-2 border-r border-slate-200 dark:border-gray-700" rowSpan={2}>산삼</th>
                  <th className="py-3 px-2 border-r border-slate-200 dark:border-gray-700" rowSpan={2}>검성</th>
                  <th className="py-2 px-2 border-b border-r border-slate-200 dark:border-gray-700" colSpan={2}>설호</th>
                  <th className="py-2 px-2 border-b border-slate-200 dark:border-gray-700 rounded-tr-xl" colSpan={2}>코끼리</th>
                </tr>
                <tr>
                  <th className="py-2 px-2 border-r border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/30">루팅</th>
                  <th className="py-2 px-2 border-r border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/30">귀속</th>
                  <th className="py-2 px-2 border-r border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/30">루팅</th>
                  <th className="py-2 px-2 bg-slate-50 dark:bg-gray-800/30">귀속</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-slate-700 dark:text-gray-300 font-medium">
                {DUMMY_DATA.map((row, index) => (
                  <tr key={row.id} className={`${index === 0 ? 'bg-blue-50/50 dark:bg-blue-900/10 font-bold' : 'hover:bg-slate-50 dark:hover:bg-gray-800/30'} transition-colors`}>
                    <td className="py-3 px-2">{row.date}</td>
                    <td className="py-3 px-2 text-blue-600 dark:text-blue-400 font-bold border-r border-slate-100 dark:border-gray-800">{row.time}</td>
                    <td className="py-3 px-2">{row.mouse}</td>
                    <td className="py-3 px-2 bg-slate-50/50 dark:bg-[#181818]">{row.ginseng}</td>
                    <td className="py-3 px-2">{row.sword}</td>
                    <td className="py-3 px-2 bg-slate-50/50 dark:bg-[#181818]">{row.tigerLoot}</td>
                    <td className="py-3 px-2 bg-slate-50/50 dark:bg-[#181818] border-r border-slate-100 dark:border-gray-800">{row.tigerBind}</td>
                    <td className="py-3 px-2">{row.elephantLoot}</td>
                    <td className="py-3 px-2">{row.elephantBind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 탭 2: 길드별 누적 통계 */}
        {activeTab === 'stats' && (
          <div className="overflow-x-auto custom-scrollbar animate-fade-in">
            <table className="w-full min-w-[800px] text-sm text-center">
              <thead className="bg-slate-100 dark:bg-gray-800/50 text-slate-600 dark:text-gray-300 font-bold border-b border-slate-200 dark:border-gray-700">
                <tr>
                  <th className="py-3 px-2 rounded-tl-xl border-r border-slate-200 dark:border-gray-700" rowSpan={2}>길드명</th>
                  <th className="py-3 px-2 border-r border-slate-200 dark:border-gray-700" rowSpan={2}>쥐</th>
                  <th className="py-3 px-2 border-r border-slate-200 dark:border-gray-700" rowSpan={2}>산삼</th>
                  <th className="py-3 px-2 border-r border-slate-200 dark:border-gray-700" rowSpan={2}>검성</th>
                  <th className="py-2 px-2 border-b border-r border-slate-200 dark:border-gray-700" colSpan={2}>설호</th>
                  <th className="py-2 px-2 border-b border-r border-slate-200 dark:border-gray-700" colSpan={2}>코끼리</th>
                  <th className="py-3 px-2 rounded-tr-xl text-purple-600 dark:text-purple-400" rowSpan={2}>총 획득량</th>
                </tr>
                <tr>
                  <th className="py-2 px-2 border-r border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/30">루팅</th>
                  <th className="py-2 px-2 border-r border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/30">귀속</th>
                  <th className="py-2 px-2 border-r border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/30">루팅</th>
                  <th className="py-2 px-2 border-r border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/30">귀속</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-slate-700 dark:text-gray-300 font-medium">
                {guildStats.map((guild, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-2 font-black text-slate-800 dark:text-white border-r border-slate-100 dark:border-gray-800">{guild.name}</td>
                    <td className="py-3 px-2">{guild.mouse}</td>
                    <td className="py-3 px-2 bg-slate-50/50 dark:bg-[#181818]">{guild.ginseng}</td>
                    <td className="py-3 px-2">{guild.sword}</td>
                    <td className="py-3 px-2 bg-slate-50/50 dark:bg-[#181818]">{guild.tigerLoot}</td>
                    <td className="py-3 px-2 bg-slate-50/50 dark:bg-[#181818] border-r border-slate-100 dark:border-gray-800">{guild.tigerBind}</td>
                    <td className="py-3 px-2">{guild.elephantLoot}</td>
                    <td className="py-3 px-2 border-r border-slate-100 dark:border-gray-800">{guild.elephantBind}</td>
                    <td className="py-3 px-2 font-black text-purple-600 dark:text-purple-400 text-base bg-purple-50/30 dark:bg-purple-900/10">{guild.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
