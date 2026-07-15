'use client';
import React, { useState, useMemo, useEffect } from 'react';

interface BossData { name: string; hp: string; img: string; drops: string[]; }
interface BossLog { id: number; date: string; time: string; bossName: string; guild: string; player: string; }

type TabType = '일간현황' | '누적통계' | '루팅랭킹' | '도감';

const getTodayStr = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}/${day}`;
};
const TODAY_STR = getTodayStr();

export default function BossTimePage() {
  const [activeTab, setActiveTab] = useState<TabType>('일간현황');
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_STR);
  const [activeGuildDetail, setActiveGuildDetail] = useState<string>('');

  const [bossDictionary, setBossDictionary] = useState<BossData[]>([]);
  const [logs, setLogs] = useState<BossLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/boss');
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setBossDictionary(data.dictionary || []);
        setLogs(data.logs || []);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const getBossImg = (bossName: string) => {
    return bossDictionary.find(b => b.name === bossName)?.img || '👹';
  };

  const dynamicGuilds = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => { if (l.guild) set.add(l.guild); });
    const list = Array.from(set);
    
    if (list.length > 0 && !activeGuildDetail) {
      setActiveGuildDetail(list[0]);
    }
    return list;
  }, [logs, activeGuildDetail]);

  const { dailyLogs, dailyGuildStats, bossMatrix, guildDetailedMap, allTimePlayerStats } = useMemo(() => {
    const timeToMins = (t: string) => {
      if (!t || !t.includes(':')) return 0;
      const [h, m] = t.split(':').map(Number);
      return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
    };

    const daily = logs.filter(l => l.date === selectedDate);
    const dGuild: Record<string, number> = {};
    daily.forEach(l => dGuild[l.guild] = (dGuild[l.guild] || 0) + 1);
    
    const matrix: Record<string, Record<string, number>> = {};
    const detailedMap: Record<string, { total: number, bosses: Record<string, number>, history: BossLog[] }> = {};
    
    dynamicGuilds.forEach(g => {
      matrix[g] = { 'total': 0 };
      bossDictionary.forEach(b => matrix[g][b.name] = 0);
      detailedMap[g] = { total: 0, bosses: {}, history: [] };
    });

    const aPlayer: Record<string, number> = {};

    const sortedLogs = [...logs].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return timeToMins(b.time) - timeToMins(a.time);
    });

    sortedLogs.forEach(l => {
      aPlayer[l.player] = (aPlayer[l.player] || 0) + 1;
      
      if (matrix[l.guild]) {
        matrix[l.guild][l.bossName] = (matrix[l.guild][l.bossName] || 0) + 1;
        matrix[l.guild]['total'] += 1;
      }
      
      if (detailedMap[l.guild]) {
        detailedMap[l.guild].total += 1;
        detailedMap[l.guild].bosses[l.bossName] = (detailedMap[l.guild].bosses[l.bossName] || 0) + 1;
        detailedMap[l.guild].history.push(l);
      }
    });

    return {
      dailyLogs: daily.sort((a, b) => timeToMins(b.time) - timeToMins(a.time)),
      dailyGuildStats: Object.entries(dGuild).sort((a, b) => b[1] - a[1]),
      bossMatrix: matrix,
      guildDetailedMap: detailedMap,
      allTimePlayerStats: Object.entries(aPlayer).sort((a, b) => b[1] - a[1]),
    };
  }, [logs, bossDictionary, selectedDate, dynamicGuilds]);

  const changeDate = (offset: number) => {
    const [m, day] = selectedDate.split('/').map(Number);
    const currentYear = new Date().getFullYear();
    const d = new Date(currentYear, m - 1, day);
    d.setDate(d.getDate() + offset);
    
    const nextM = String(d.getMonth() + 1).padStart(2, '0');
    const nextDay = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${nextM}/${nextDay}`);
  };

  const currentGuildData = guildDetailedMap[activeGuildDetail] || { total: 0, bosses: {}, history: [] };
  const currentGuildPercentage = logs.length > 0 ? Math.round((currentGuildData.total / logs.length) * 100) : 0;

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-slate-400 font-bold text-sm">스프레드시트 원격 데이터를 불러오는 중...</div>;
  }

  return (
    <div className="h-full flex flex-col p-6 bg-[#0f172a] text-white rounded-2xl overflow-hidden relative border border-slate-800 shadow-2xl pb-10">
      
      <div className="flex justify-between items-center bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg shrink-0 mb-6 z-10">
        <div>
          <h1 className="text-2xl font-black text-white drop-shadow-md">👹 보스 쟁 현황판</h1>
          <p className="text-xs font-bold text-slate-400 mt-1">서버 내 보스 쟁의 치열한 기록과 길드별 누적 점유율을 확인하세요!</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-4 mb-6 shrink-0 overflow-x-auto custom-scrollbar">
        {(['일간현황', '누적통계', '루팅랭킹', '도감'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-black text-sm transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {tab === '일간현황' && '⚔️ 일간 타임라인'}
            {tab === '누적통계' && '📊 전체 누적 통계'}
            {tab === '루팅랭킹' && '🏆 개인 루팅 랭킹'}
            {tab === '도감' && '📖 보스 도감'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        
        {activeTab === '일간현황' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-center gap-6 mb-6 bg-slate-800/80 w-max mx-auto px-6 py-3 rounded-2xl border border-slate-700 shadow-md">
              <button onClick={() => changeDate(-1)} className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors font-black text-lg text-slate-300 hover:text-white">◀</button>
              <div className="flex flex-col items-center w-36">
                <span className="text-xl font-black text-white">{selectedDate}</span>
                <span className="text-[10px] font-bold text-slate-400">{selectedDate === TODAY_STR ? '(오늘)' : '일간 기록'}</span>
              </div>
              <button onClick={() => changeDate(1)} disabled={selectedDate === TODAY_STR} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors font-black text-lg ${selectedDate === TODAY_STR ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'}`}>▶</button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
              <div className="flex-1 bg-slate-800/50 rounded-2xl border border-slate-700 flex flex-col overflow-hidden shadow-inner">
                <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shrink-0">
                  <h2 className="font-black text-white">🗓️ 보스 쟁 타임라인</h2>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">총 {dailyLogs.length}회 처치됨</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
                  <div className="absolute left-[87px] top-6 bottom-6 w-0.5 bg-slate-700"></div>
                  <div className="flex flex-col gap-6">
                    {dailyLogs.length === 0 ? (
                      <div className="text-slate-500 text-sm font-bold text-center mt-10">이 날짜에 기록된 보스 쟁이 없습니다.</div>
                    ) : (
                      dailyLogs.map(log => (
                        <div key={log.id} className="flex items-start gap-4 relative z-10 animate-fade-in">
                          <div className="w-16 text-right shrink-0">
                            <span className="text-sm font-black text-slate-300 bg-slate-900 px-2 py-1 rounded-md border border-slate-700 shadow-sm">{log.time}</span>
                          </div>
                          <div className="w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-800 shrink-0 mt-1 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                          <div className="flex-1 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-md hover:-translate-y-1 transition-transform">
                            <div className="flex justify-between items-start mb-3">
                              <span className="font-black text-xl text-white">{getBossImg(log.bossName)} {log.bossName}</span>
                              <span className="text-sm font-bold bg-amber-900/50 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg shadow-sm">
                                승리: {log.guild}
                              </span>
                            </div>
                            <div className="bg-slate-900/50 px-4 py-2.5 rounded-lg border border-slate-700 flex items-center gap-2 w-max">
                              <span className="text-xs font-bold text-slate-400">최종 루팅 ➡️</span>
                              <span className="text-sm font-black text-emerald-300">👤 {log.player}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[350px] bg-slate-800 rounded-2xl border border-slate-700 flex flex-col overflow-hidden shadow-lg shrink-0">
                <div className="p-4 bg-slate-900 border-b border-slate-700 shrink-0">
                  <h2 className="text-sm font-black text-white">📈 해당 일자 승리 횟수</h2>
                </div>
                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                  {dailyGuildStats.map(([guildName, count], idx) => {
                    const percentage = dailyLogs.length > 0 ? Math.round((count / dailyLogs.length) * 100) : 0;
                    return (
                      <div key={guildName} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 animate-fade-in">
                        <div className="flex justify-between text-base font-black mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 flex items-center justify-center rounded text-white text-xs font-black ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-slate-700'}`}>
                              {idx + 1}
                            </span>
                            <span className="text-slate-200 text-sm">{guildName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-blue-400 text-base block">{count}회</span>
                            <span className="text-slate-500 text-[10px] font-bold">점유율 {percentage}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                          <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                  {dailyGuildStats.length === 0 && <div className="text-slate-500 text-sm font-bold text-center mt-10">데이터가 없습니다.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === '누적통계' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-1">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg shrink-0">
              <div className="p-4 bg-slate-900 border-b border-slate-700">
                <h3 className="text-base font-black text-white">📊 보스별 누적 킬 현황판</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-700 text-xs font-black text-slate-400">
                      <th className="p-4 text-center">길드 이름</th>
                      {bossDictionary.map((b, idx) => (
                        <th key={idx} className="p-4 text-center">{b.img} {b.name}</th>
                      ))}
                      <th className="p-4 text-center text-blue-400 bg-blue-900/20">🏆 총 승리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-black text-sm">
                    {dynamicGuilds.map(g => (
                      <tr key={g} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 text-slate-200 text-center font-bold">{g}</td>
                        {bossDictionary.map((b, idx) => (
                          <td key={idx} className="p-4 text-center text-slate-400">
                            {bossMatrix[g]?.[b.name] || 0}회
                          </td>
                        ))}
                        <td className="p-4 text-center text-blue-400 font-extrabold bg-blue-900/10">
                          {bossMatrix[g]?.[ 'total' ] || 0}회
                        </td>
                      </tr>
                    ))}
                    {dynamicGuilds.length === 0 && (
                      <tr>
                        <td colSpan={bossDictionary.length + 2} className="p-10 text-center text-slate-500 font-bold text-xs">스프레드시트에 기록이 누적되면 표가 자동으로 생성됩니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {dynamicGuilds.length > 0 && (
              <div className="shrink-0">
                <span className="text-xs font-black text-slate-400 mb-2 block">👇 분석할 길드를 선택하세요.</span>
                <div className="flex flex-wrap gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
                  {dynamicGuilds.map(g => (
                    <button
                      key={g}
                      onClick={() => setActiveGuildDetail(g)}
                      className={`flex-1 min-w-[120px] py-2 px-4 rounded-lg font-black text-xs transition-all ${
                        activeGuildDetail === g ? 'bg-blue-600 text-white shadow-md border border-blue-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-700 border border-slate-800'
                      }`}
                    >
                      {g} ({bossMatrix[g]?.[ 'total' ] || 0}승)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {dynamicGuilds.length > 0 && activeGuildDetail && (
              <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-xl p-6 flex flex-col md:flex-row gap-6 animate-fade-in shrink-0">
                
                <div className="w-full md:w-[240px] bg-slate-900/60 border border-slate-700 p-5 rounded-xl flex flex-col justify-between shrink-0">
                  <div>
                    <span className="text-xs text-blue-400 font-black">GUILD DOSSIER</span>
                    <h3 className="text-xl font-black text-white mt-1">[{activeGuildDetail}]</h3>
                  </div>
                  <div className="my-4">
                    <span className="text-xs text-slate-400 block font-bold">서버 점유율</span>
                    <span className="text-4xl font-black text-yellow-400 mt-1 block">{currentGuildPercentage}%</span>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700 mt-2 shadow-inner">
                      <div className="h-full bg-yellow-400 transition-all duration-700" style={{ width: `${currentGuildPercentage}%` }} />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-bold border-t border-slate-700/60 pt-2">
                    전체 {logs.length}번의 전투 중 {currentGuildData.total}번 파이널 스트라이크 성공.
                  </div>
                </div>

                <div className="flex-1 bg-slate-900/30 border border-slate-700 p-5 rounded-xl">
                  <h4 className="text-xs font-black text-slate-400 mb-3 border-b border-slate-700 pb-1.5">🎯 보스별 타격 밸런스</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {bossDictionary.map((b, idx) => {
                      const count = bossMatrix[activeGuildDetail]?.[b.name] || 0;
                      const guildTotal = bossMatrix[activeGuildDetail]?.['total'] || 1;
                      const bPercent = Math.round((count / guildTotal) * 100);
                      return (
                        <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/80 flex justify-between items-center">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-lg">{b.img}</span>
                            <span className="text-xs font-black truncate text-slate-200">{b.name}</span>
                          </div>
                          <span className="text-xs font-black text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md shrink-0">
                            {count}회 ({bPercent}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 bg-slate-900/30 border border-slate-700 p-5 rounded-xl flex flex-col">
                  <h4 className="text-xs font-black text-slate-400 mb-3 border-b border-slate-700 pb-1.5">📜 보스 루팅 로그 (전체 기록)</h4>
                  <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 max-h-[160px] pr-1">
                    {currentGuildData.history.map((h, i) => (
                      <div key={i} className="flex justify-between items-center text-[11px] bg-slate-900 px-3 py-2 rounded border border-slate-800 hover:border-slate-700 transition-colors">
                        <span className="text-slate-500 font-bold">{h.date} {h.time}</span>
                        <span className="text-slate-200 font-black">{getBossImg(h.bossName)} {h.bossName}</span>
                        <span className="text-blue-400 font-black truncate w-16 text-right">👤 {h.player}</span>
                      </div>
                    ))}
                    {currentGuildData.history.length === 0 && (
                      <div className="text-center text-slate-600 text-xs font-bold pt-10">루팅 이력이 존재하지 않습니다.</div>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {activeTab === '루팅랭킹' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-800 rounded-2xl border border-slate-700 p-6 flex flex-col gap-3">
            {allTimePlayerStats.map(([playerName, count], idx) => (
              <div key={playerName} className="flex justify-between items-center bg-slate-900/80 p-5 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-colors animate-fade-in">
                <div className="flex items-center gap-5">
                  <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg ${idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-500 border border-slate-600'}`}>
                    {idx + 1}위
                  </span>
                  <span className="text-xl font-black text-slate-200">{playerName}</span>
                </div>
                <div className="bg-emerald-900/30 border border-emerald-500/30 px-5 py-2.5 rounded-xl shadow-inner">
                  <span className="text-lg font-black text-emerald-400">총 {count}회 득템</span>
                </div>
              </div>
            ))}
            {allTimePlayerStats.length === 0 && <div className="text-slate-500 text-sm font-bold text-center mt-10">기록된 루팅 데이터가 없습니다.</div>}
          </div>
        )}

        {activeTab === '도감' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-wrap gap-4 content-start">
            {bossDictionary.map((boss, idx) => (
              <div key={idx} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.66rem)] bg-slate-800/80 border border-slate-700 rounded-xl p-6 flex flex-col shadow-md hover:border-red-500/50 transition-colors duration-300">
                <div className="flex items-center gap-4 mb-4 border-b border-slate-700 pb-4">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-3xl border border-slate-600 shadow-inner">
                    {boss.img}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-white mb-1">{boss.name}</h3>
                    <span className="text-sm font-bold text-red-400 bg-red-900/30 px-2 py-1 rounded">HP: {boss.hp}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-black text-slate-400 mb-2 block flex items-center gap-1">🎁 주요 드랍 아이템</span>
                  <div className="flex flex-wrap gap-2">
                    {boss.drops.map((drop, i) => (
                      <span key={i} className="text-xs font-bold bg-slate-900 border border-slate-600 px-3 py-1.5 rounded-md text-slate-200">
                        {drop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {bossDictionary.length === 0 && <div className="text-slate-500 text-sm font-bold text-center mt-10 w-full">구글 시트의 Boss_Dictionary 탭에 데이터를 추가하시면 실시간 도감이 채워집니다.</div>}
          </div>
        )}

      </div>
    </div>
  );
}