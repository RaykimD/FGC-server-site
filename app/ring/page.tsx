'use client';
import React, { useState } from 'react';

// --- 데이터 및 타입 정의 ---
type RingType = 'luck' | 'health' | 'resistance';

type RingStats = {
  luck?: number;
  health?: number;
  resistance?: number;
  innerForce?: number;
  attack?: number;
};

type Ring = {
  id: string;
  type: RingType;
  enhancement: number;
  createdAt: number;
};

type EnhanceLog = {
  type: 'success' | 'destroy' | 'remote';
  ringType: RingType;
  enhancement: number;
  timestamp: number;
};

type Stats = {
  totalAttempts: number;
  successes: number;
  destroys: number;
  maxEnhance: number;
};

const RING_NAMES: Record<RingType, string> = {
  luck: '운',
  health: '체력',
  resistance: '저항'
};

const STAT_NAMES: Record<string, string> = {
  luck: '운',
  health: '체력',
  resistance: '저항',
  innerForce: '내공',
  attack: '공격력'
};

const BASE_STATS: Record<RingType, RingStats> = {
  luck: { luck: 3 },
  health: { health: 2 },
  resistance: { resistance: 1 }
};

const ENHANCEMENT_STATS: Record<RingType, Record<number, RingStats>> = {
  luck: {
    1: { luck: 6 }, 2: { luck: 9 }, 3: { luck: 12 },
    4: { luck: 15, resistance: 1 }, 5: { luck: 18, resistance: 2, innerForce: 1 }, 6: { luck: 21, resistance: 3, innerForce: 1, attack: 1 }
  },
  health: {
    1: { health: 4 }, 2: { health: 6 }, 3: { health: 8, resistance: 1 },
    4: { health: 10, resistance: 2 }, 5: { health: 12, resistance: 2, innerForce: 1 }, 6: { health: 14, resistance: 3, innerForce: 1, attack: 1 }
  },
  resistance: {
    1: { resistance: 2 }, 2: { resistance: 3 }, 3: { resistance: 5 },
    4: { resistance: 7, innerForce: 1 }, 5: { resistance: 8, innerForce: 2 }, 6: { resistance: 10, innerForce: 3, attack: 1 }
  }
};

const ENHANCE_RATES = {
  success: 20,
  destroy: 80
};

const ENHANCEMENT_STONE_TYPES = {
  normal: { name: '강화석', cost: 5000, successRate: 0 },
  advanced: { name: '상급 장비 강화석', cost: 10000, successRate: 5 },
  premium: { name: '고급 장비 강화석', cost: 20000, successRate: 10 }
} as const;

export default function RingSimulator() {
  const [rings, setRings] = useState<Ring[]>([]);
  const [selectedRingId, setSelectedRingId] = useState<string | null>(null);
  const [selectedRingType, setSelectedRingType] = useState<RingType>('luck');
  
  const selectedRing = rings.find(r => r.id === selectedRingId) || null;
  
  const [enhanceLogs, setEnhanceLogs] = useState<EnhanceLog[]>([]);
  const [stats, setStats] = useState<Stats>({ totalAttempts: 0, successes: 0, destroys: 0, maxEnhance: 0 });
  const [usedResources, setUsedResources] = useState({
    money: 0,
    stones: { normal: 0, advanced: 0, premium: 0 }
  });
  const [showMaterialDetails, setShowMaterialDetails] = useState<boolean>(false);

  const [isRemoteOpen, setIsRemoteOpen] = useState<boolean>(false);
  const [remoteTargetLevel, setRemoteTargetLevel] = useState<number>(6);

  const addEnhanceLog = (type: EnhanceLog['type'], enhancement: number, ringType: RingType) => {
    setEnhanceLogs(prev => [{ type, ringType, enhancement, timestamp: Date.now() }, ...prev].slice(0, 10));
  };

  const purchaseRing = () => {
    if (rings.length >= 30) { alert('인벤토리가 꽉 찼습니다!'); return; }
    const newRing: Ring = { id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, type: selectedRingType, enhancement: 0, createdAt: Date.now() };
    setRings(prev => [...prev, newRing]);
    // 💡 수정 1: 구매 시 돈 차감 삭제 (무료화)
    if (!selectedRingId) setSelectedRingId(newRing.id);
  };

  const handleEnhance = (stoneType: 'normal' | 'advanced' | 'premium') => {
    if (!selectedRing || selectedRing.enhancement >= 6) return;

    setUsedResources(prev => ({
      ...prev,
      money: prev.money + ENHANCEMENT_STONE_TYPES[stoneType].cost,
      stones: { ...prev.stones, [stoneType]: prev.stones[stoneType] + 1 }
    }));

    const roll = Math.random() * 100;
    const successRate = ENHANCE_RATES.success + ENHANCEMENT_STONE_TYPES[stoneType].successRate;
    
    setStats(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));

    if (roll < successRate) {
      // 성공
      const newEnhancement = selectedRing.enhancement + 1;
      setRings(prev => prev.map(r => r.id === selectedRing.id ? { ...r, enhancement: newEnhancement } : r));
      setStats(prev => ({ ...prev, successes: prev.successes + 1, maxEnhance: Math.max(prev.maxEnhance, newEnhancement) }));
      addEnhanceLog('success', newEnhancement, selectedRing.type);
    } else {
      // 💡 수정 2: 파괴 시 자동 포커스 이동 (Auto-Select Next Item)
      const destroyIndex = rings.findIndex(r => r.id === selectedRing.id);
      const newRings = rings.filter(r => r.id !== selectedRing.id);
      
      setRings(newRings);
      
      if (newRings.length > 0) {
        // 기존 인덱스 자리를 대체하는 반지(한 칸 당겨진 반지)를 선택, 마지막 반지였다면 새로운 마지막 반지 선택
        const nextIndex = Math.min(destroyIndex, newRings.length - 1);
        setSelectedRingId(newRings[nextIndex].id);
      } else {
        setSelectedRingId(null);
      }

      setStats(prev => ({ ...prev, destroys: prev.destroys + 1 }));
      addEnhanceLog('destroy', selectedRing.enhancement, selectedRing.type);
    }
  };

  const applyRemoteControl = () => {
    if (!selectedRing) return;
    setRings(prev => prev.map(r => r.id === selectedRing.id ? { ...r, enhancement: remoteTargetLevel } : r));
    addEnhanceLog('remote', remoteTargetLevel, selectedRing.type);
    setIsRemoteOpen(false);
  };

  const getCalculatedMaterials = () => {
    const { normal, advanced, premium } = usedResources.stones;
    const totalNormalNeeded = normal + advanced + premium;
    const normalCraftAttempts = Math.ceil(totalNormalNeeded / 0.8);
    
    return {
      iron: (normalCraftAttempts * 3) + (advanced * 3) + (premium * 3),
      darkIron: (normalCraftAttempts * 1) + (advanced * 1) + (premium * 1),
      blackIron: (normalCraftAttempts * 1) + (advanced * 1) + (premium * 1),
      lapis: (normalCraftAttempts * 5) + (advanced * 5) + (premium * 5),
      totalMoney: (normalCraftAttempts * 5000) + (advanced * 10000) + (premium * 20000)
    };
  };

  const rawMaterials = getCalculatedMaterials();
  const getPct = (val: number) => stats.totalAttempts > 0 ? ((val / stats.totalAttempts) * 100).toFixed(1) : '0.0';

  const currentTotalStats = selectedRing && selectedRing.enhancement > 0 
    ? ENHANCEMENT_STATS[selectedRing.type][selectedRing.enhancement] 
    : (selectedRing ? BASE_STATS[selectedRing.type] : {});
  
  const baseStats = selectedRing ? BASE_STATS[selectedRing.type] : {};

  // 💡 수정 3: 반지 종류별 테마 색상 (운:파랑, 체력:초록, 저항:빨강)
  const getRingThemeColor = (type: RingType, isSelected: boolean = false) => {
    if (type === 'luck') return isSelected ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-md transform scale-105' : 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40';
    if (type === 'health') return isSelected ? 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 shadow-md transform scale-105' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40';
    if (type === 'resistance') return isSelected ? 'bg-rose-600 dark:bg-rose-500 text-white border-rose-600 dark:border-rose-500 shadow-md transform scale-105' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/40';
    return '';
  };

  return (
    // 💡 수정 4: 전체 영역에 select-none 추가 (드래그 방지)
    <div className="animate-fade-in pb-10 select-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">반지 강화</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">인벤토리에 반지를 채우고 주문서를 사용하여 강화하세요.</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {(Object.entries(RING_NAMES) as [RingType, string][]).map(([key, name]) => (
              <button
                key={key} onClick={() => setSelectedRingType(key)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all border ${getRingThemeColor(key, selectedRingType === key)}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (!selectedRing) { alert('인벤토리에서 조작할 반지를 먼저 선택해주세요.'); return; }
              setIsRemoteOpen(true);
            }}
            className="text-sm px-4 py-2 font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1"
          >
            🕹️ 리모컨 조작
          </button>
          <button
            onClick={() => {
              if (confirm('초기화하시겠습니까?')) {
                setRings([]); setSelectedRingId(null);
                setEnhanceLogs([]); setShowMaterialDetails(false);
                setStats({ totalAttempts: 0, successes: 0, destroys: 0, maxEnhance: 0 });
                setUsedResources({ money: 0, stones: { normal: 0, advanced: 0, premium: 0 } });
              }
            }}
            className="shrink-0 text-sm px-4 py-2 font-bold rounded-xl bg-white dark:bg-[#1e1e1e] text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 transition-colors shadow-sm"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 리모컨 모달창 */}
      {isRemoteOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-gray-800 rounded-2xl p-6 w-80 shadow-2xl text-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">&lt;&lt; 반지 차수 &gt;&gt;</h3>
            <div className="flex items-center justify-center gap-5 mb-6 bg-slate-50 dark:bg-[#121212] py-3 rounded-xl border border-slate-100 dark:border-gray-800">
              <button onClick={() => setRemoteTargetLevel(prev => Math.max(0, prev - 1))} className="text-lg font-black text-slate-400 hover:text-purple-500 transition-colors px-2">◀</button>
              <span className="font-black text-xl text-purple-600 dark:text-purple-400 min-w-[70px]">+{remoteTargetLevel}강</span>
              <button onClick={() => setRemoteTargetLevel(prev => Math.min(6, prev + 1))} className="text-lg font-black text-slate-400 hover:text-purple-500 transition-colors px-2">▶</button>
            </div>
            <div className="flex gap-2 font-bold text-sm">
              <button onClick={() => setIsRemoteOpen(false)} className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-200 transition-colors">취소</button>
              <button onClick={applyRemoteControl} className="flex-1 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md">이동하기</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 h-full lg:h-[650px]">
        
        {/* 1. 왼쪽 패널: 인벤토리 */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">인벤토리</h2>
            <span className="text-sm font-bold text-slate-400">{rings.length} / 30</span>
          </div>
          <button onClick={purchaseRing} className={`w-full mb-4 rounded-xl py-2 font-bold transition-all border shadow-sm ${getRingThemeColor(selectedRingType, true)}`}>
            💍 {RING_NAMES[selectedRingType]} 반지 구매
          </button>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {rings.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
                {rings.map(r => (
                  <button 
                    key={r.id} 
                    onClick={() => setSelectedRingId(r.id)} 
                    className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-colors 
                      ${selectedRingId === r.id 
                        ? (r.type === 'luck' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-inner' 
                          : r.type === 'health' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-inner'
                          : 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 shadow-inner')
                        : 'border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-[#121212] hover:bg-slate-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <span className={`text-sm font-black 
                      ${r.type === 'luck' ? (r.enhancement >= 5 ? 'text-blue-700 dark:text-blue-300' : r.enhancement >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500 dark:text-blue-500/70') 
                      : r.type === 'health' ? (r.enhancement >= 5 ? 'text-emerald-700 dark:text-emerald-300' : r.enhancement >= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-500 dark:text-emerald-500/70')
                      : (r.enhancement >= 5 ? 'text-rose-700 dark:text-rose-300' : r.enhancement >= 3 ? 'text-rose-600 dark:text-rose-400' : 'text-rose-500 dark:text-rose-500/70')}
                    `}>+{r.enhancement}</span>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">{RING_NAMES[r.type]}</span>
                  </button>
                ))}
                {Array.from({ length: Math.max(0, 16 - rings.length) }).map((_, i) => <div key={`empty-${i}`} className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-800 bg-transparent opacity-50"></div>)}
              </div>
            ) : <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-600"><span className="text-3xl mb-2">🎒</span><p className="text-sm font-medium">반지를 구매해주세요</p></div>}
          </div>
        </div>

        {/* 2. 중앙 & 우측 영역 */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4 h-full">
          <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
            {/* 강화소 파트 */}
            <div className="w-full md:w-1/2 bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col">
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-3">강화소</h2>
              {selectedRing ? (
                <div className="flex-1 flex flex-col justify-center gap-4">
                  <div className="bg-slate-50/80 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-gray-800 p-4 flex flex-col items-center justify-center shadow-inner">
                    <p className={`text-4xl font-black mb-4 transition-colors 
                      ${selectedRing.type === 'luck' ? (selectedRing.enhancement >= 5 ? 'text-blue-700 dark:text-blue-300 drop-shadow-md' : selectedRing.enhancement >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white')
                      : selectedRing.type === 'health' ? (selectedRing.enhancement >= 5 ? 'text-emerald-700 dark:text-emerald-300 drop-shadow-md' : selectedRing.enhancement >= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white')
                      : (selectedRing.enhancement >= 5 ? 'text-rose-700 dark:text-rose-300 drop-shadow-md' : selectedRing.enhancement >= 3 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white')}
                    `}>
                      {selectedRing.enhancement > 0 ? `+${selectedRing.enhancement} ` : ''}{RING_NAMES[selectedRing.type]}
                      {selectedRing.enhancement === 6 && <span className="text-sm align-top text-red-500 ml-1">MAX</span>}
                    </p>
                    
                    <div className="w-full text-slate-600 dark:text-gray-300 font-bold space-y-3 px-2">
                      <div>
                        <p className="text-xs text-slate-400 border-b border-slate-200 dark:border-gray-800 pb-1 mb-1.5">기본 스탯</p>
                        <div className="grid grid-cols-2 gap-1 text-sm">
                          {Object.entries(baseStats).map(([stat, val]) => val > 0 && <p key={stat}>{STAT_NAMES[stat]}: +{val}</p>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-blue-500 border-b border-slate-200 dark:border-gray-800 pb-1 mb-1.5">강화 스탯</p>
                        <div className="grid grid-cols-2 gap-1 text-sm text-blue-600 dark:text-blue-400 [.streamer-mode_&]:blur-md [.streamer-mode_&]:opacity-50 [.streamer-mode_&]:select-none transition-all">
                          {selectedRing.enhancement > 0 ? Object.entries(currentTotalStats).map(([stat, val]) => {
                            const addedValue = (val as number) - ((baseStats[stat as keyof RingStats] as number) || 0);
                            return addedValue > 0 ? <p key={stat}>{STAT_NAMES[stat]}: +{addedValue}</p> : null;
                          }) : <p className="text-slate-400 text-[10px] col-span-2">추가된 스탯이 없습니다.</p>}
                        </div>
                      </div>
                    </div>

                    {selectedRing.enhancement < 6 && (
                      <div className="mt-5 pt-3 border-t border-slate-200 dark:border-gray-800 w-full text-center text-sm font-bold flex justify-around">
                        <div className="flex flex-col"><span className="text-blue-600 dark:text-blue-400 text-lg">{ENHANCE_RATES.success}%</span><span className="text-slate-400 text-[10px] mt-0.5">성공</span></div>
                        <div className="flex flex-col"><span className="text-rose-600 dark:text-rose-400 text-lg">{ENHANCE_RATES.destroy}%</span><span className="text-slate-400 text-[10px] mt-0.5">파괴</span></div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => handleEnhance('normal')} disabled={selectedRing.enhancement >= 6} className="bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100/50 dark:hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 transition-all flex flex-col items-center">
                        <span className="font-bold text-xs">일반 강화석</span>
                        <span className="text-[10px] mt-1 opacity-70">5,000원</span>
                      </button>
                      <button onClick={() => handleEnhance('advanced')} disabled={selectedRing.enhancement >= 6} className="bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 transition-all flex flex-col items-center">
                        <span className="font-bold text-xs">상급 강화석</span>
                        <span className="text-[10px] mt-1 opacity-70">+5% 성공</span>
                      </button>
                      <button onClick={() => handleEnhance('premium')} disabled={selectedRing.enhancement >= 6} className="bg-rose-50/50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100/50 dark:hover:bg-rose-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 transition-all flex flex-col items-center">
                        <span className="font-bold text-xs">고급 강화석</span>
                        <span className="text-[10px] mt-1 opacity-70">+10% 성공</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-600 bg-slate-50/80 dark:bg-[#121212] rounded-xl border border-dashed border-slate-300 dark:border-gray-800 shadow-inner"><span className="text-4xl mb-4">💍</span><p className="font-bold">인벤토리에서 반지를 선택해주세요.</p></div>}
            </div>

            {/* 강화 로그 파트 */}
            <div className="w-full md:w-1/2 bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col">
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-3">강화 로그</h2>
              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1 bg-slate-50/80 dark:bg-[#121212] p-4 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                {enhanceLogs.length > 0 ? enhanceLogs.map((log) => (
                  <div key={log.timestamp} className={`text-xs font-bold px-3 py-2 rounded-lg border shadow-sm ${log.type === 'success' ? 'text-blue-600 border-blue-200 bg-white dark:border-transparent dark:text-blue-400 dark:bg-blue-900/20' : log.type === 'remote' ? 'text-purple-600 border-purple-200 bg-white dark:border-transparent dark:text-purple-400 dark:bg-purple-900/20' : 'text-rose-600 border-rose-200 bg-white dark:border-transparent dark:text-rose-400 dark:bg-rose-900/20'}`}>
                    [{RING_NAMES[log.ringType]}] {log.type === 'success' ? `✨ ${log.enhancement}강 성공` : log.type === 'remote' ? `🕹️ ${log.enhancement}강 이동` : `💥 ${log.enhancement}강 파괴`}
                  </div>
                )) : <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400 dark:text-gray-600">기록이 없습니다.</div>}
              </div>
            </div>
          </div>

          {/* 하단 2단 구조 통계 및 재화 */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-4 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none shrink-0 transition-all">
            <h2 className="text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider flex justify-between items-center">
              <span>통계 및 사용된 재화</span>
              <button onClick={() => setShowMaterialDetails(!showMaterialDetails)} className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors">
                {showMaterialDetails ? '제작 재료 닫기 🔼' : '제작 재료 보기 🔽'}
              </button>
            </h2>
            
            <div className="flex flex-col gap-2.5">
              {/* 통계 박스 */}
              <div className="grid grid-cols-3 gap-2 text-sm font-bold text-slate-700 dark:text-gray-300 bg-slate-50/80 dark:bg-[#121212] p-3 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                 <div className="flex flex-col gap-0.5"><span className="text-[10px] text-slate-500">총 시도</span><span>{stats.totalAttempts}회</span></div>
                 <div className="flex flex-col gap-0.5"><span className="text-[10px] text-blue-500">성공</span><span className="text-blue-600 dark:text-blue-400">{stats.successes}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.successes)}%)</span></span></div>
                 <div className="flex flex-col gap-0.5"><span className="text-[10px] text-rose-500">파괴</span><span className="text-rose-600 dark:text-rose-400">{stats.destroys}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.destroys)}%)</span></span></div>
              </div>

              {/* 재화 박스 */}
              <div className="flex justify-between items-center bg-slate-50/80 dark:bg-[#121212] p-3 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                 <div className="flex gap-4 text-xs font-bold text-slate-700 dark:text-gray-300">
                    <p>강화석: {usedResources.stones.normal}개</p>
                    <p>상급: {usedResources.stones.advanced}개</p>
                    <p>고급: {usedResources.stones.premium}개</p>
                 </div>
                 <div className="text-right shrink-0 ml-4">
                   <p className="text-[10px] font-bold text-slate-500 mb-0.5">총 사용 금액</p>
                   <p className="text-lg text-amber-600 dark:text-yellow-500 font-black leading-none">{usedResources.money.toLocaleString()}원</p>
                 </div>
              </div>

              {/* 세부 재료 */}
              {showMaterialDetails && (
                <div className="pt-2 border-t border-slate-200 dark:border-gray-800 text-xs font-medium space-y-1.5 text-slate-700 dark:text-gray-300">
                  <p className="text-[10px] text-slate-400 dark:text-gray-500">* 기본 강화석 제작 성공률 80%를 반영한 예상 소모값입니다.</p>
                  <div className="flex justify-between bg-slate-50 dark:bg-[#121212] p-2.5 rounded-lg border border-slate-100 dark:border-gray-800 shadow-inner">
                    <div className="space-y-0.5 font-bold flex gap-4">
                      <p>철: {rawMaterials.iron.toLocaleString()}</p>
                      <p>묵철: {rawMaterials.darkIron.toLocaleString()}</p>
                      <p>오철: {rawMaterials.blackIron.toLocaleString()}</p>
                      <p>청금석: {rawMaterials.lapis.toLocaleString()}</p>
                    </div>
                    <div className="font-black text-amber-600 dark:text-yellow-500">
                      총 비용: {rawMaterials.totalMoney.toLocaleString()}원
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}