'use client';
import React, { useState, useEffect, useMemo } from 'react';

type BossRow = {
  id: number; date: string; time: string; mouse: string; ginseng: string;
  sword: string; tigerLoot: string; tigerBind: string; elephantLoot: string; elephantBind: string;
};

export default function BossPage() {
  const [activeTab, setActiveTab] = useState<'log' | 'stats'>('log');
  const [bossData, setBossData] = useState<BossRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBossData = async () => {
      try {
        const res = await fetch('/api/boss');
        const json = await res.json();
        if (json.success) setBossData(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBossData();
  }, []);

  const guildStats = useMemo(() => {
    const stats: Record<string, any> = {};

    bossData.forEach((row) => {
      const bosses = ['mouse', 'ginseng', 'sword', 'tigerLoot', 'tigerBind', 'elephantLoot', 'elephantBind'];
      
      bosses.forEach((bossKey) => {
        const guildName = row[bossKey as keyof typeof row] as string;
        if (!guildName || guildName === '-' || guildName.trim() === '') return;
        
        if (!stats[guildName]) {
          stats[guildName] = { name: guildName, mouse: 0, ginseng: 0, sword: 0, tigerLoot: 0, tigerBind: 0, elephantLoot: 0, elephantBind: 0, total: 0 };
        }
        
        stats[guildName][bossKey]++;
        stats[guildName].total++;
      });
    });

    return Object.values(stats).sort((a, b) => b.total - a.total);
  }, [bossData]);

  if (isLoading) return <div className="h-full flex items-center justify-center font-bold text-slate-400">보스 루팅 데이터를 불러오는 중입니다...</div>;

  return (
    <div className="animate-fade-in pb-10 max-w-5xl mx-auto mt-4 select-none">
      <div className="mb-8 text-center flex flex-col items-center">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">👹 보스 루팅 현황</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-2">시간별 보스 처치 기록 및 길드별 누적 통계</p>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-gray-800 shadow-sm">
        
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

        {activeTab === 'log' && (
          <div className="overflow-x-auto custom-scrollbar">
            {bossData.length > 0 ? (
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
                  {bossData.map((row, index) => {
                    const isLatest = index === 0;
                    return (
                      <tr key={row.id} className={isLatest 
                        ? 'bg-gradient-to-r from-fuchsia-100 via-purple-100 to-indigo-100 dark:from-fuchsia-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
                        : 'hover:bg-slate-50 dark:hover:bg-gray-800/30 transition-colors'}>
                        <td className={`py-3 px-2 ${isLatest ? 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-indigo-600 dark:from-fuchsia-300 dark:to-indigo-300' : ''}`}>
                          {isLatest ? '✨ 가장 최근 보스타임' : row.date}
                        </td>
                        <td className={`py-3 px-2 border-r border-slate-100 dark:border-gray-800 ${isLatest ? 'text-indigo-600 dark:text-indigo-300' : 'text-blue-600 dark:text-blue-400 font-bold'}`}>{row.time}</td>
                        <td className="py-3 px-2">{row.mouse || '-'}</td>
                        <td className={`py-3 px-2 ${!isLatest && 'bg-slate-50/50 dark:bg-[#181818]'}`}>{row.ginseng || '-'}</td>
                        <td className="py-3 px-2">{row.sword || '-'}</td>
                        <td className={`py-3 px-2 ${!isLatest && 'bg-slate-50/50 dark:bg-[#181818]'}`}>{row.tigerLoot || '-'}</td>
                        <td className={`py-3 px-2 border-r border-slate-100 dark:border-gray-800 ${!isLatest && 'bg-slate-50/50 dark:bg-[#181818]'}`}>{row.tigerBind || '-'}</td>
                        <td className="py-3 px-2">{row.elephantLoot || '-'}</td>
                        <td className="py-3 px-2">{row.elephantBind || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-400 font-bold">등록된 보스 루팅 데이터가 없습니다. 구글 시트를 확인해주세요.</div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="overflow-x-auto custom-scrollbar animate-fade-in">
            {guildStats.length > 0 ? (
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
            ) : (
              <div className="py-12 text-center text-slate-400 font-bold">통계를 낼 루팅 기록이 존재하지 않습니다.</div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}