'use client';
import React, { useState } from 'react';

// --- 데이터 및 타입 정의 ---
type EnhanceLog = {
  type: 'success' | 'degrade' | 'maintain' | 'destroy';
  enhancement: number;
  timestamp: number;
};

type Stats = {
  totalAttempts: number;
  successes: number;
  maintains: number;
  degrades: number;
  destroys: number;
  maxEnhance: number;
};

const MAX_LEVEL = 5;

// --- 메인 컴포넌트 ---
export default function LightfootSimulator() {
  const [enhancement, setEnhancement] = useState<number>(0);
  const [enhanceLogs, setEnhanceLogs] = useState<EnhanceLog[]>([]);
  const [stats, setStats] = useState<Stats>({ totalAttempts: 0, successes: 0, maintains: 0, degrades: 0, destroys: 0, maxEnhance: 0 });

  const addEnhanceLog = (type: EnhanceLog['type'], currentLevel: number) => {
    setEnhanceLogs(prev => [{ type, enhancement: currentLevel, timestamp: Date.now() }, ...prev].slice(0, 10));
  };

  const handleEnhance = () => {
    if (enhancement >= MAX_LEVEL) return;

    setStats(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));

    const roll = Math.random() * 100;

    // 성공 30% / 유지 23.33% / 하락 23.33% / 파괴 23.34%
    if (roll < 30.0) {
      // 성공
      const newEnhancement = enhancement + 1;
      setEnhancement(newEnhancement);
      setStats(prev => ({ ...prev, successes: prev.successes + 1, maxEnhance: Math.max(prev.maxEnhance, newEnhancement) }));
      addEnhanceLog('success', newEnhancement);
    } else if (roll < 30.0 + 23.33) {
      // 유지
      setStats(prev => ({ ...prev, maintains: prev.maintains + 1 }));
      addEnhanceLog('maintain', enhancement);
    } else if (roll < 30.0 + 23.33 + 23.33) {
      // 하락 (0강에서는 하락해도 0 유지)
      const newEnhancement = Math.max(0, enhancement - 1);
      setEnhancement(newEnhancement);
      setStats(prev => ({ ...prev, degrades: prev.degrades + 1 }));
      addEnhanceLog('degrade', newEnhancement);
    } else {
      // 파괴 (0강으로 초기화)
      setEnhancement(0);
      setStats(prev => ({ ...prev, destroys: prev.destroys + 1 }));
      addEnhanceLog('destroy', enhancement); // 파괴되기 전 레벨 기록
    }
  };

  const getPct = (val: number) => stats.totalAttempts > 0 ? ((val / stats.totalAttempts) * 100).toFixed(1) : '0.0';

  return (
    <div className="animate-fade-in pb-10 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">경공비급 강화</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">단일 귀속 아이템입니다. 재화 소모 없이 오직 운으로만 승부하세요.</p>
        </div>
        <button
          onClick={() => {
            if (confirm('초기화하시겠습니까?')) {
              setEnhancement(0);
              setEnhanceLogs([]);
              setStats({ totalAttempts: 0, successes: 0, maintains: 0, degrades: 0, destroys: 0, maxEnhance: 0 });
            }
          }}
          className="shrink-0 text-sm px-4 py-2 font-bold rounded-xl bg-white dark:bg-[#1e1e1e] text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 transition-colors shadow-sm"
        >
          초기화
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* 1. 왼쪽 패널: 현재 비급 상태 */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col h-full">
          <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">현재 비급 정보</h2>
          
          <div className="flex-1 bg-slate-50/80 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-inner flex flex-col items-center justify-center">
            <p className={`text-4xl font-black text-center transition-colors ${
              enhancement >= 4 ? 'text-purple-600 dark:text-purple-400 drop-shadow-md' :
              enhancement >= 2 ? 'text-blue-600 dark:text-blue-400' :
              'text-slate-800 dark:text-white'
            }`}>
              {enhancement > 0 ? `+${enhancement} ` : ''}경공비급
              {enhancement === MAX_LEVEL && <span className="text-sm align-top text-red-500 ml-1">MAX</span>}
            </p>
            <p className="mt-6 text-sm font-bold text-slate-400 dark:text-gray-500">추가 옵션 및 스탯 없음</p>
          </div>
        </div>

        {/* 2. 중앙 & 우측 영역 */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4 h-full">
          <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
            
            {/* 강화소 파트 */}
            <div className="w-full md:w-1/2 bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col">
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-3">강화소</h2>
              <div className="flex-1 flex flex-col justify-center gap-4">
                {enhancement < MAX_LEVEL ? (
                  <div className="bg-slate-50/80 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-gray-800 p-4 text-center shadow-inner">
                    <p className="text-xs font-bold text-slate-500 mb-4 uppercase">다음 단계 강화 확률</p>
                    <div className="grid grid-cols-4 gap-2 items-center text-sm font-black">
                      <div className="flex flex-col"><span className="text-blue-600 dark:text-blue-400 text-lg">30%</span><span className="text-slate-400 text-[10px] mt-0.5">성공</span></div>
                      <div className="flex flex-col"><span className="text-slate-500 text-lg">23.3%</span><span className="text-slate-400 text-[10px] mt-0.5">유지</span></div>
                      <div className="flex flex-col"><span className="text-red-500 text-lg">23.3%</span><span className="text-slate-400 text-[10px] mt-0.5">하락</span></div>
                      <div className="flex flex-col"><span className="text-purple-600 dark:text-purple-400 text-lg">23.3%</span><span className="text-slate-400 text-[10px] mt-0.5">파괴</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50/80 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-gray-800 p-4 flex items-center justify-center h-[90px] shadow-inner">
                    <p className="text-base font-black text-red-500">최대 수치에 도달했습니다.</p>
                  </div>
                )}

                <div className="space-y-2.5">
                  <button 
                    onClick={handleEnhance} 
                    disabled={enhancement >= MAX_LEVEL} 
                    className="w-full bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100/50 dark:hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-4 transition-all flex flex-col items-center shadow-sm"
                  >
                    <span className="font-bold text-sm">경공비급 강화하기</span>
                    <span className="text-[10px] mt-1 opacity-70">재화 소모 없음</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 강화 로그 파트 */}
            <div className="w-full md:w-1/2 bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col">
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-3">강화 로그</h2>
              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1 bg-slate-50/80 dark:bg-[#121212] p-4 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                {enhanceLogs.length > 0 ? enhanceLogs.map((log) => (
                  <div key={log.timestamp} className={`text-xs font-bold px-3 py-2.5 rounded-lg border shadow-sm ${
                    log.type === 'success' ? 'text-blue-600 border-blue-200 bg-white dark:border-transparent dark:text-blue-400 dark:bg-blue-900/20' : 
                    log.type === 'degrade' ? 'text-red-500 border-red-200 bg-white dark:border-transparent dark:bg-red-900/20' : 
                    log.type === 'destroy' ? 'text-purple-600 border-purple-200 bg-white dark:border-transparent dark:text-purple-400 dark:bg-purple-900/20' : 
                    'text-slate-600 border-slate-200 bg-white dark:border-transparent dark:text-gray-400 dark:bg-gray-800/50'
                  }`}>
                    {log.type === 'success' ? `✨ ${log.enhancement}강 성공` : 
                     log.type === 'degrade' ? `🔻 ${log.enhancement + 1}강에서 하락` : 
                     log.type === 'destroy' ? `💥 ${log.enhancement}강 파괴 (초기화)` : 
                     `➖ ${log.enhancement}강 유지`}
                  </div>
                )) : <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400 dark:text-gray-600">기록이 없습니다.</div>}
              </div>
            </div>
          </div>

          {/* 하단 단일 구조 통계 */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-4 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none shrink-0 transition-all">
            <h2 className="text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">강화 통계</h2>
            
            {/* 통계 박스 */}
            <div className="grid grid-cols-5 gap-2 text-sm font-bold text-slate-700 dark:text-gray-300 bg-slate-50/80 dark:bg-[#121212] p-3 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
               <div className="flex flex-col gap-0.5"><span className="text-[10px] text-slate-500">총 시도</span><span>{stats.totalAttempts}회</span></div>
               <div className="flex flex-col gap-0.5"><span className="text-[10px] text-blue-500">성공</span><span className="text-blue-600 dark:text-blue-400">{stats.successes}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.successes)}%)</span></span></div>
               <div className="flex flex-col gap-0.5"><span className="text-[10px] text-slate-500">유지</span><span className="text-slate-600 dark:text-gray-400">{stats.maintains}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.maintains)}%)</span></span></div>
               <div className="flex flex-col gap-0.5"><span className="text-[10px] text-red-500">하락</span><span className="text-red-500">{stats.degrades}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.degrades)}%)</span></span></div>
               <div className="flex flex-col gap-0.5"><span className="text-[10px] text-purple-500">파괴</span><span className="text-purple-600 dark:text-purple-400">{stats.destroys}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.destroys)}%)</span></span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}