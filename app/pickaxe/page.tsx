'use client';
import React, { useState } from 'react';

// --- 타입 및 데이터 정의 ---
type CraftLevel = 1 | 2 | 3 | 4 | 5;

type MaterialKey =
  | 'iron' | 'wood' | 'diamond' | 'emerald' | 'galok'
  | 'strengthenStone' | 'maehwaok' | 'steel' | 'blackjade' | 'specialSteel';

type Materials = Record<MaterialKey, number>;

type EnhanceLog = {
  type: 'success' | 'destroy';
  level: number;
  timestamp: number;
};

type UsedResources = {
  materials: Materials;
  money: number;
};

type Stats = {
  totalAttempts: number;
  successes: number;
  destroys: number;
};

const ENHANCEMENT_RATES: Record<CraftLevel, { success: number; destroy: number }> = {
  1: { success: 55, destroy: 45 },
  2: { success: 30, destroy: 70 },
  3: { success: 20, destroy: 80 },
  4: { success: 15, destroy: 85 },
  5: { success: 15, destroy: 85 }
};

const STONE_TYPES: Record<CraftLevel, { money: number; materials: Partial<Record<MaterialKey, number>> }> = {
  1: { money: 1000, materials: { iron: 3, wood: 3 } },
  2: { money: 5000, materials: { iron: 1, galok: 2, strengthenStone: 2, diamond: 2 } },
  3: { money: 10000, materials: { steel: 1, emerald: 5, strengthenStone: 2 } },
  4: { money: 20000, materials: { steel: 2, maehwaok: 2, strengthenStone: 2 } },
  5: { money: 40000, materials: { blackjade: 2, specialSteel: 2, strengthenStone: 2 } }
};

const MATERIAL_NAMES: Record<MaterialKey, string> = {
  iron: '철', wood: '참나무원목', diamond: '다이아몬드', emerald: '에메랄드', galok: '갈옥',
  strengthenStone: '장비강화석', maehwaok: '매화옥', steel: '강철', blackjade: '흑옥', specialSteel: '오금철'
};

const INITIAL_MATERIALS: Materials = {
  iron: 0, wood: 0, diamond: 0, emerald: 0, galok: 0,
  strengthenStone: 0, maehwaok: 0, steel: 0, blackjade: 0, specialSteel: 0
};

// --- 메인 컴포넌트 ---
export default function PickaxeSimulator() {
  const [picks, setPicks] = useState<Record<CraftLevel, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  });

  const [selectedLevel, setSelectedLevel] = useState<CraftLevel>(1);
  const [enhanceLogs, setEnhanceLogs] = useState<EnhanceLog[]>([]);
  const [stats, setStats] = useState<Stats>({ totalAttempts: 0, successes: 0, destroys: 0 });
  const [usedResources, setUsedResources] = useState<UsedResources>({
    materials: { ...INITIAL_MATERIALS },
    money: 0
  });

  const addEnhanceLog = (type: 'success' | 'destroy', level: number) => {
    setEnhanceLogs(prev => [{ type, level, timestamp: Date.now() }, ...prev].slice(0, 10));
  };

  const updateResources = (level: CraftLevel) => {
    setUsedResources(prev => {
      const newMaterials = { ...prev.materials };
      Object.entries(STONE_TYPES[level].materials).forEach(([key, value]) => {
        const mKey = key as MaterialKey;
        newMaterials[mKey] = (newMaterials[mKey] || 0) + (value || 0);
      });
      return { materials: newMaterials, money: prev.money + STONE_TYPES[level].money };
    });
  };

  const handleCraft = () => {
    if (selectedLevel === 1) {
      // 1강은 조건 없이 제작
      setPicks(prev => ({ ...prev, 1: prev[1] + 1 }));
      updateResources(1);
      setStats(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1, successes: prev.successes + 1 }));
      addEnhanceLog('success', 1);
    } else {
      const prevLevel = (selectedLevel - 1) as CraftLevel;
      if (picks[prevLevel] <= 0) {
        alert(`${prevLevel}강 곡괭이가 필요합니다!`);
        return;
      }

      setPicks(prev => ({ ...prev, [prevLevel]: prev[prevLevel] - 1 }));
      updateResources(selectedLevel);
      setStats(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));

      const roll = Math.random() * 100;
      const successRate = ENHANCEMENT_RATES[prevLevel].success;

      if (roll < successRate) {
        setPicks(prev => ({ ...prev, [selectedLevel]: prev[selectedLevel] + 1 }));
        setStats(prev => ({ ...prev, successes: prev.successes + 1 }));
        addEnhanceLog('success', selectedLevel);
      } else {
        setStats(prev => ({ ...prev, destroys: prev.destroys + 1 }));
        addEnhanceLog('destroy', prevLevel);
      }
    }
  };

  const getPct = (val: number) => stats.totalAttempts > 0 ? ((val / stats.totalAttempts) * 100).toFixed(1) : '0.0';

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">곡괭이 제작</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">보관함에서 곡괭이를 선택하여 상위 등급으로 강화(제작)해 보세요.</p>
        </div>
        <button
          onClick={() => {
            if (confirm('초기화하시겠습니까?')) {
              setPicks({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
              setSelectedLevel(1);
              setEnhanceLogs([]);
              setStats({ totalAttempts: 0, successes: 0, destroys: 0 });
              setUsedResources({ materials: { ...INITIAL_MATERIALS }, money: 0 });
            }
          }}
          className="shrink-0 text-sm px-4 py-2 font-bold rounded-xl bg-white dark:bg-[#1e1e1e] text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 transition-colors shadow-sm"
        >
          초기화
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-full lg:h-[650px]">
        
        {/* 1. 왼쪽 패널: 곡괭이 보관함 (클릭하여 선택 가능) */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">곡괭이 보관함</h2>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-gray-800 px-2 py-1 rounded-md">항목 클릭 시 제작소 이동</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {([1, 2, 3, 4, 5] as CraftLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${
                  selectedLevel === level
                    ? 'border-slate-800 bg-slate-800 text-white dark:border-white dark:bg-white dark:text-gray-900 shadow-md transform scale-[1.02]'
                    : picks[level] > 0
                    ? 'border-blue-300 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20 text-slate-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                    : 'border-slate-200 bg-slate-50 dark:border-gray-800 dark:bg-[#121212] text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⛏️</span>
                  <span className={`font-black ${selectedLevel === level ? '' : picks[level] > 0 ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-gray-500'}`}>
                    {level}강 곡괭이
                  </span>
                </div>
                <span className={`text-lg font-black ${selectedLevel === level ? '' : picks[level] > 0 ? 'text-gray-900 dark:text-white' : 'text-slate-400 dark:text-gray-600'}`}>
                  {picks[level]}개
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. 중앙 & 우측 영역 */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4 h-full">
          <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
            
            {/* 제작소 파트 (UI 깨짐 방지: 내부 스크롤 적용) */}
            <div className="w-full md:w-1/2 bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col">
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-3 shrink-0">제작소</h2>
              <div className="flex-1 flex flex-col justify-between gap-4 min-h-0">
                <div className="bg-slate-50/80 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-gray-800 p-4 flex flex-col shadow-inner flex-1 min-h-0">
                  <p className="text-3xl font-black mb-4 text-center transition-colors text-slate-800 dark:text-white shrink-0">
                    {selectedLevel}강 곡괭이
                  </p>
                  
                  {/* 스크롤 영역: 재료 리스트가 많아져도 버튼이 밀려나지 않음 */}
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                    <p className="text-xs font-bold text-slate-500 border-b border-slate-200 dark:border-gray-800 pb-1.5 mb-2 sticky top-0 bg-slate-50/90 dark:bg-[#121212]/90 backdrop-blur-sm z-10">필요 조건 및 재료</p>
                    <div className="space-y-2 text-sm text-slate-700 dark:text-gray-300">
                      {selectedLevel > 1 && (
                        <div className="flex justify-between items-center bg-white dark:bg-gray-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-gray-700">
                          <span className="font-bold">{selectedLevel - 1}강 곡괭이</span>
                          <span className={picks[(selectedLevel - 1) as CraftLevel] > 0 ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-red-500 font-black'}>
                            1개 <span className="text-[10px] font-normal opacity-70">(보유: {picks[(selectedLevel - 1) as CraftLevel]}개)</span>
                          </span>
                        </div>
                      )}
                      {Object.entries(STONE_TYPES[selectedLevel].materials).map(([key, amount]) => (
                        <div key={key} className="flex justify-between items-center bg-white dark:bg-gray-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-gray-700">
                          <span className="font-bold">{MATERIAL_NAMES[key as MaterialKey]}</span>
                          <span className="font-black">{amount}개</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 하단 확률 정보 */}
                  {selectedLevel > 1 ? (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-gray-800 w-full text-center text-sm font-bold flex justify-around shrink-0">
                      <div className="flex flex-col"><span className="text-blue-600 dark:text-blue-400 text-lg">{ENHANCEMENT_RATES[(selectedLevel - 1) as CraftLevel].success}%</span><span className="text-slate-400 text-[10px] mt-0.5">성공 확률</span></div>
                      <div className="flex flex-col"><span className="text-red-500 text-lg">{ENHANCEMENT_RATES[(selectedLevel - 1) as CraftLevel].destroy}%</span><span className="text-slate-400 text-[10px] mt-0.5">실패 시 파괴</span></div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-gray-800 w-full text-center text-sm font-bold text-blue-600 dark:text-blue-400 shrink-0">
                      100% 확률로 확정 제작됩니다.
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 shrink-0">
                  <button onClick={handleCraft} className="w-full bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100/50 dark:hover:bg-blue-900/40 rounded-xl py-3.5 transition-all flex flex-col items-center shadow-sm">
                    <span className="font-bold text-sm">{selectedLevel}강 곡괭이 제작하기</span>
                    <span className="text-xs mt-1 opacity-70">제작 비용: {STONE_TYPES[selectedLevel].money.toLocaleString()}원</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 제작 로그 파트 */}
            <div className="w-full md:w-1/2 bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col">
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-3">제작 로그</h2>
              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1 bg-slate-50/80 dark:bg-[#121212] p-4 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                {enhanceLogs.length > 0 ? enhanceLogs.map((log) => (
                  <div key={log.timestamp} className={`text-xs font-bold px-3 py-2.5 rounded-lg border shadow-sm ${log.type === 'success' ? 'text-blue-600 border-blue-200 bg-white dark:border-transparent dark:text-blue-400 dark:bg-blue-900/20' : 'text-red-500 border-red-200 bg-white dark:border-transparent dark:bg-red-900/20'}`}>
                    {log.type === 'success' ? `✨ ${log.level}강 곡괭이 제작 성공` : `💥 ${log.level}강 곡괭이 파괴`}
                  </div>
                )) : <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400 dark:text-gray-600">기록이 없습니다.</div>}
              </div>
            </div>
          </div>

          {/* 하단 2단 구조 통계 및 재화 */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-4 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none shrink-0 transition-all">
            <h2 className="text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">통계 및 사용된 재료</h2>
            
            <div className="flex flex-col gap-2.5">
              {/* 통계 박스 */}
              <div className="grid grid-cols-3 gap-2 text-sm font-bold text-slate-700 dark:text-gray-300 bg-slate-50/80 dark:bg-[#121212] p-3 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                 <div className="flex flex-col gap-0.5"><span className="text-[10px] text-slate-500">총 시도</span><span>{stats.totalAttempts}회</span></div>
                 <div className="flex flex-col gap-0.5"><span className="text-[10px] text-blue-500">성공</span><span className="text-blue-600 dark:text-blue-400">{stats.successes}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.successes)}%)</span></span></div>
                 <div className="flex flex-col gap-0.5"><span className="text-[10px] text-red-500">파괴</span><span className="text-red-500">{stats.destroys}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.destroys)}%)</span></span></div>
              </div>

              {/* 재료 박스 */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/80 dark:bg-[#121212] p-4 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-y-2 gap-x-4 w-full text-xs font-bold text-slate-700 dark:text-gray-300">
                  {Object.entries(usedResources.materials)
                    .filter(([_, val]) => val > 0)
                    .map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[10px] text-slate-500">{MATERIAL_NAMES[key as MaterialKey]}</span>
                        <span>{val.toLocaleString()}개</span>
                      </div>
                  ))}
                  {Object.values(usedResources.materials).every(v => v === 0) && (
                    <span className="text-slate-400 col-span-full">아직 사용된 재료가 없습니다.</span>
                  )}
                </div>
                
                <div className="text-right shrink-0 min-w-[120px] pl-4 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-gray-800 pt-3 sm:pt-0">
                  <p className="text-[10px] font-bold text-slate-500 mb-0.5">총 사용 금액</p>
                  <p className="text-lg text-amber-600 dark:text-yellow-500 font-black leading-none">{usedResources.money.toLocaleString()}원</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}