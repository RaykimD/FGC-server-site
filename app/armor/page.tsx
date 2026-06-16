'use client';
import React, { useState } from 'react';
import { ArmorType, Armor, ArmorStats, PotentialOption, Stats } from '@/types';

// 기존 보너스 수치
const STARBALLOON_TICKET_COST = 10;
const LUCKY_STONE_BONUS = 3;
const ADVANCED_LUCKY_STONE_BONUS = 7;
const ENHANCEMENT_DRINK_BONUS = 1;

const ArmorTypeKorean: Record<ArmorType, string> = { helmet: '투구', armor: '갑옷', belt: '벨트', shoes: '신발' };
const StatTypeKorean: Record<keyof ArmorStats, string> = { health: '체력', innerForce: '내공', luck: '운', attackSpeed: '공격속도', evasion: '회피율', attack: '공격력' };
const PotentialTypeKorean: Record<PotentialOption['type'], string> = { recovery: '회복력', evasion: '회피율', criticalChance: '치명타 확률', criticalDamage: '치명타 피해', bossDamage: '보스 공격력', attackSpeed: '공격속도', health: '체력', luck: '행운' };

// 💡 수정됨: 'remote' 타입 추가
type ArmorEnhanceLog = {
  type: 'success' | 'degrade' | 'maintain' | 'remote';
  enhancement: number;
  armorType: ArmorType;
  timestamp: number;
};

const BASE_STATS: Record<ArmorType, ArmorStats> = {
  helmet: { health: 22, innerForce: 12, luck: 0, attackSpeed: 0, evasion: 0, attack: 0 },
  armor: { health: 33, innerForce: 12, luck: 0, attackSpeed: 0, evasion: 0, attack: 0 },
  belt: { health: 12, innerForce: 11, luck: 0, attackSpeed: 0, evasion: 0, attack: 0 },
  shoes: { health: 22, innerForce: 9, luck: 0, attackSpeed: 0, evasion: 0, attack: 0 }
};

// 💡 수정됨: 5강의 luck: 2 오류 삭제 (스탯 누적 오류 완벽 해결)
const ENHANCEMENT_STATS: Record<number, Partial<ArmorStats>> = {
  1: { health: 1 }, 2: { health: 1 }, 3: { health: 1, luck: 2 },
  4: { health: 1 }, 5: { health: 1, innerForce: 1 }, // 👈 운 2 삭제
  6: { health: 1, luck: 2 }, 7: { health: 1 }, 8: { health: 2 },
  9: { health: 2, attackSpeed: 1 }, 10: { health: 2, innerForce: 1 },
  11: { health: 2 }, 12: { health: 2, evasion: 1 },
  13: { health: 2, attackSpeed: 1 }, 14: { health: 2, evasion: 1 },
  15: { health: 3 }, 16: { health: 3, attackSpeed: 1 },
  17: { health: 6, attack: 1 }, 18: { health: 3, innerForce: 2, evasion: 1 },
  19: { health: 9 }, 20: { health: 3, attack: 1, evasion: 1 }
};

const ENHANCEMENT_RATES: Record<number, { success: number, maintain: number, degrade: number }> = {
  0: { success: 45, maintain: 16.5, degrade: 38.5 }, 1: { success: 45, maintain: 16.5, degrade: 38.5 },
  2: { success: 45, maintain: 16.5, degrade: 38.5 }, 3: { success: 45, maintain: 16.5, degrade: 38.5 },
  4: { success: 40, maintain: 18.0, degrade: 42.0 }, 5: { success: 40, maintain: 18.0, degrade: 42.0 },
  6: { success: 40, maintain: 18.0, degrade: 42.0 }, 7: { success: 35, maintain: 19.5, degrade: 45.5 },
  8: { success: 35, maintain: 19.5, degrade: 45.5 }, 9: { success: 35, maintain: 19.5, degrade: 45.5 },
  10: { success: 30, maintain: 21.0, degrade: 49.0 }, 11: { success: 30, maintain: 21.0, degrade: 49.0 },
  12: { success: 30, maintain: 21.0, degrade: 49.0 }, 13: { success: 25, maintain: 22.5, degrade: 52.5 },
  14: { success: 25, maintain: 22.5, degrade: 52.5 }, 15: { success: 25, maintain: 22.5, degrade: 52.5 },
  16: { success: 20, maintain: 24.0, degrade: 56.0 }, 17: { success: 20, maintain: 24.0, degrade: 56.0 },
  18: { success: 20, maintain: 24.0, degrade: 56.0 }, 19: { success: 15, maintain: 25.5, degrade: 59.5 },
  20: { success: 15, maintain: 25.5, degrade: 59.5 }
};

const calculateEnhancementStats = (enhancement: number): ArmorStats => {
  const totalStats: ArmorStats = { health: 0, innerForce: 0, luck: 0, attackSpeed: 0, evasion: 0, attack: 0 };
  for (let i = 1; i <= enhancement; i++) {
    const levelStats = ENHANCEMENT_STATS[i];
    if (levelStats) Object.entries(levelStats).forEach(([stat, value]) => { if (value) totalStats[stat as keyof ArmorStats] += value; });
  }
  return totalStats;
};

const createInitialArmor = (type: ArmorType): Armor => ({
  type, enhancement: 0, baseStats: BASE_STATS[type],
  enhanceStats: { health: 0, innerForce: 0, luck: 0, attackSpeed: 0, evasion: 0, attack: 0 }, potentials: []
});

export default function ArmorSimulator() {
  const [armors, setArmors] = useState<Record<ArmorType, Armor>>({
    helmet: createInitialArmor('helmet'), armor: createInitialArmor('armor'),
    belt: createInitialArmor('belt'), shoes: createInitialArmor('shoes'),
  });
  
  const [selectedArmorType, setSelectedArmorType] = useState<ArmorType>('helmet');
  const selectedArmor = armors[selectedArmorType];
  
  const [enhanceLogs, setEnhanceLogs] = useState<ArmorEnhanceLog[]>([]);
  const [drinkUsed, setDrinkUsed] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({ totalAttempts: 0, successes: 0, maintains: 0, degrades: 0, destroys: 0, maxEnhance: 0 });
  
  // 💡 수정됨: 방어구 전용 재화 추적 상태 (돌 종류 분류)
  const [usedResources, setUsedResources] = useState({
    stones: { normal: 0, advanced: 0, supreme: 0 },
    starBalloonTicket: 0,
    money: 0
  });

  // 💡 리모컨 상태
  const [isRemoteOpen, setIsRemoteOpen] = useState<boolean>(false);
  const [remoteTargetLevel, setRemoteTargetLevel] = useState<number>(11);

  const addEnhanceLog = (type: ArmorEnhanceLog['type'], enhancement: number, armorType: ArmorType) => {
    setEnhanceLogs(prev => [{ type, armorType, enhancement, timestamp: Date.now() }, ...prev].slice(0, 10));
  };

  const handleEnhance = (enhanceType: 'normal' | 'advanced' | 'supreme') => {
    if (selectedArmor.enhancement >= 20) return;

    // 💡 새로운 방어구 재화 공식 적용
    setUsedResources(prev => {
      const next = { ...prev, stones: { ...prev.stones } };
      if (enhanceType === 'normal') { next.stones.normal += 1; next.money += 5000; }
      else if (enhanceType === 'advanced') { next.stones.advanced += 1; next.money += 10000; }
      else if (enhanceType === 'supreme') { next.stones.supreme += 1; next.money += 20000; }
      return next;
    });

    const bonus = enhanceType === 'advanced' ? LUCKY_STONE_BONUS : enhanceType === 'supreme' ? ADVANCED_LUCKY_STONE_BONUS : 0;
    let successRate = ENHANCEMENT_RATES[selectedArmor.enhancement].success + (drinkUsed ? ENHANCEMENT_DRINK_BONUS : 0) + bonus;
    const roll = Math.random() * 100;
    
    setStats(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));

    if (roll < successRate) {
      const newEnhancement = selectedArmor.enhancement + 1;
      setArmors(prev => ({ ...prev, [selectedArmorType]: { ...prev[selectedArmorType], enhancement: newEnhancement, enhanceStats: calculateEnhancementStats(newEnhancement) } }));
      setStats(prev => ({ ...prev, successes: prev.successes + 1 }));
      addEnhanceLog('success', newEnhancement, selectedArmor.type);
    } else if (roll < successRate + ENHANCEMENT_RATES[selectedArmor.enhancement].degrade) {
      const newEnhancement = Math.max(0, selectedArmor.enhancement - 1);
      setArmors(prev => ({ ...prev, [selectedArmorType]: { ...prev[selectedArmorType], enhancement: newEnhancement, enhanceStats: calculateEnhancementStats(newEnhancement) } }));
      setStats(prev => ({ ...prev, degrades: prev.degrades + 1 }));
      addEnhanceLog('degrade', newEnhancement, selectedArmor.type);
    } else {
      setStats(prev => ({ ...prev, maintains: prev.maintains + 1 }));
      addEnhanceLog('maintain', selectedArmor.enhancement, selectedArmor.type);
    }
  };

  // 💡 리모컨 적용 로직
  const applyRemoteControl = () => {
    setArmors(prev => ({ 
      ...prev, 
      [selectedArmorType]: { 
        ...prev[selectedArmorType], 
        enhancement: remoteTargetLevel, 
        enhanceStats: calculateEnhancementStats(remoteTargetLevel) 
      } 
    }));
    addEnhanceLog('remote', remoteTargetLevel, selectedArmor.type);
    setIsRemoteOpen(false);
  };

  // 💡 방어구 전용: 제작 성공률 80% 역산 재료 계산
  const getCalculatedMaterials = () => {
    const { normal, advanced, supreme } = usedResources.stones;
    const totalNormalNeeded = normal + advanced + supreme;
    const normalCraftAttempts = Math.ceil(totalNormalNeeded / 0.8);

    return {
      ironOre: normalCraftAttempts * 1,
      oIron: normalCraftAttempts * 1,
      copper: normalCraftAttempts * 3,
      shiningStone: advanced,
      fireDragonStone: supreme,
      totalMoney: usedResources.money
    };
  };

  const rerollPotentials = () => {
    setUsedResources(prev => ({ ...prev, starBalloonTicket: prev.starBalloonTicket + STARBALLOON_TICKET_COST }));
    const lineCount = Math.random() * 100 < 25 ? 1 : Math.random() * 100 < 60 ? 2 : 3;
    const newPotentials: PotentialOption[] = [];
    const pTypes = ['recovery', 'evasion', 'criticalChance', 'criticalDamage', 'bossDamage', 'attackSpeed', 'health', 'luck'] as const;

    for (let i = 0; i < lineCount; i++) {
      const selectedType = pTypes[Math.floor(Math.random() * pTypes.length)];
      let value = Math.floor(Math.random() * 4) + 1;
      if (selectedType === 'recovery') value = [3, 6, 9][Math.floor(Math.random() * 3)];
      else if (selectedType === 'evasion' || selectedType === 'attackSpeed') value = Math.floor(Math.random() * 3) + 2;
      else if (selectedType === 'bossDamage') value = [2, 4, 6, 8][Math.floor(Math.random() * 4)];
      else if (selectedType === 'luck') value = [2, 4, 6][Math.floor(Math.random() * 3)];
      newPotentials.push({ type: selectedType, value });
    }
    setArmors(prev => ({ ...prev, [selectedArmorType]: { ...prev[selectedArmorType], potentials: newPotentials } }));
  };

  const rawMaterials = getCalculatedMaterials();
  const getPct = (val: number) => stats.totalAttempts > 0 ? ((val / stats.totalAttempts) * 100).toFixed(1) : '0.0';

  return (
    <div className="animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">방어구 재련</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">부위별 귀속 장비를 선택하고 재련 및 잠재능력을 띄워보세요.</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {(['helmet', 'armor', 'belt', 'shoes'] as ArmorType[]).map((key) => (
              <button
                key={key} onClick={() => setSelectedArmorType(key)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all border shadow-sm ${selectedArmorType === key ? 'bg-slate-800 dark:bg-white text-white dark:text-gray-900 border-slate-800 dark:border-white transform scale-105 shadow-md' : 'bg-white dark:bg-[#1e1e1e] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800'}`}
              >
                {ArmorTypeKorean[key]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* 💡 리모컨 버튼 추가 */}
          <button
            onClick={() => setIsRemoteOpen(true)}
            className="text-sm px-4 py-2 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
          >
            🕹️ 리모컨 조작
          </button>
          <button
            onClick={() => {
              if (confirm('초기화하시겠습니까?')) {
                setArmors({ helmet: createInitialArmor('helmet'), armor: createInitialArmor('armor'), belt: createInitialArmor('belt'), shoes: createInitialArmor('shoes') });
                setEnhanceLogs([]); setDrinkUsed(false);
                setStats({ totalAttempts: 0, successes: 0, maintains: 0, degrades: 0, destroys: 0, maxEnhance: 0 });
                setUsedResources({ stones: { normal: 0, advanced: 0, supreme: 0 }, starBalloonTicket: 0, money: 0 });
              }
            }}
            className="shrink-0 text-sm px-4 py-2 font-bold rounded-xl bg-white dark:bg-[#1e1e1e] text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 transition-colors shadow-sm"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 💡 리모컨 모달창 */}
      {isRemoteOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-gray-800 rounded-2xl p-6 w-80 shadow-2xl text-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">&lt;&lt; 방어구 차수 &gt;&gt;</h3>
            <div className="flex items-center justify-center gap-5 mb-6 bg-slate-50 dark:bg-[#121212] py-3 rounded-xl border border-slate-100 dark:border-gray-800">
              <button onClick={() => setRemoteTargetLevel(prev => Math.max(0, prev - 1))} className="text-lg font-black text-slate-400 hover:text-blue-500 transition-colors px-2">◀</button>
              <span className="font-black text-xl text-blue-600 dark:text-blue-400 min-w-[70px]">+{remoteTargetLevel}강</span>
              <button onClick={() => setRemoteTargetLevel(prev => Math.min(20, prev + 1))} className="text-lg font-black text-slate-400 hover:text-blue-500 transition-colors px-2">▶</button>
            </div>
            <div className="flex gap-2 font-bold text-sm">
              <button onClick={() => setIsRemoteOpen(false)} className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-200 transition-colors">취소</button>
              <button onClick={applyRemoteControl} className="flex-1 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md">이동하기</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 h-full lg:h-[650px]">
        {/* 1. 왼쪽 패널: 방어구 상태 */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col h-full">
          <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">현재 장비 정보</h2>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar bg-slate-50/80 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-inner">
            <p className={`text-4xl font-black text-center mb-6 pt-2 transition-colors ${selectedArmor.enhancement >= 15 ? 'text-purple-600 dark:text-purple-400 drop-shadow-md' : selectedArmor.enhancement >= 10 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
              {selectedArmor.enhancement > 0 ? `+${selectedArmor.enhancement} ` : ''}{ArmorTypeKorean[selectedArmor.type]}
              {selectedArmor.enhancement === 20 && <span className="text-sm align-top text-red-500 ml-1">MAX</span>}
            </p>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-2 border-b border-slate-200 dark:border-gray-800 pb-1.5">기본 스탯</p>
                {/* 💡 스트리머 모드 블라인드 적용 (.streamer-mode_&) */}
                <div className="grid grid-cols-2 gap-2 text-sm font-bold text-slate-600 dark:text-gray-300 [.streamer-mode_&]:blur-md [.streamer-mode_&]:opacity-50 [.streamer-mode_&]:select-none transition-all">
                  {Object.entries(selectedArmor.baseStats).map(([stat, val]) => val > 0 && <p key={stat}>{StatTypeKorean[stat as keyof ArmorStats]}: +{val}</p>)}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-blue-500 mb-2 border-b border-slate-200 dark:border-gray-800 pb-1.5">재련 스탯</p>
                {/* 💡 기존 스트리머 모드 블라인드 유지 */}
                <div className="grid grid-cols-2 gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 [.streamer-mode_&]:blur-md [.streamer-mode_&]:opacity-50 [.streamer-mode_&]:select-none transition-all">
                  {Object.entries(selectedArmor.enhanceStats).map(([stat, val]) => val > 0 && (
                    <p key={stat}>{StatTypeKorean[stat as keyof ArmorStats]}: +{val}</p>
                  ))}
                  {Object.values(selectedArmor.enhanceStats).every(v => v === 0) && <p className="text-slate-400 text-xs">재련 스탯이 없습니다.</p>}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-amber-500 mb-2 border-b border-slate-200 dark:border-gray-800 pb-1.5">잠재능력</p>
                <div className="space-y-1.5 text-sm font-bold text-amber-600 dark:text-yellow-500">
                  {selectedArmor.potentials.length > 0 ? selectedArmor.potentials.map((pot, idx) => <p key={idx}>✨ {PotentialTypeKorean[pot.type]} +{pot.value}</p>) : <p className="text-slate-400 text-xs font-medium">잠재능력이 부여되지 않았습니다.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 오른쪽 영역 */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4 h-full">
          <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
            {/* 대장간 파트 */}
            <div className="w-full md:w-1/2 bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col">
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-3">대장간</h2>
              <div className="flex-1 flex flex-col justify-center gap-4">
                {selectedArmor.enhancement < 20 ? (
                  <div className="bg-slate-50/80 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-gray-800 p-4 text-center">
                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase">다음 단계 성공 확률</p>
                    <div className="flex justify-around items-center text-sm font-black">
                      <div className="flex flex-col"><span className="text-blue-600 dark:text-blue-400 text-lg">{ENHANCEMENT_RATES[selectedArmor.enhancement].success + (drinkUsed ? 1 : 0)}%</span><span className="text-slate-400 text-[10px] mt-0.5">성공 {drinkUsed && '(+1%)'}</span></div>
                      <div className="flex flex-col"><span className="text-slate-500 text-lg">{ENHANCEMENT_RATES[selectedArmor.enhancement].maintain}%</span><span className="text-slate-400 text-[10px] mt-0.5">유지</span></div>
                      <div className="flex flex-col"><span className="text-red-500 text-lg">{ENHANCEMENT_RATES[selectedArmor.enhancement].degrade}%</span><span className="text-slate-400 text-[10px] mt-0.5">하락</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50/80 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-gray-800 p-4 flex items-center justify-center h-[90px]"><p className="text-base font-black text-red-500">최대 수치 도달</p></div>
                )}

                <div className="space-y-2.5">
                  <button onClick={() => setDrinkUsed(!drinkUsed)} className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all ${drinkUsed ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50 border shadow-inner' : 'bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-transparent'}`}>🍺 재련주 {drinkUsed ? '적용 중 (+1%)' : '마시기'}</button>
                  <div className="grid grid-cols-3 gap-2">
                    {/* 💡 버튼명 및 재화 소모량 최신화 */}
                    <button onClick={() => handleEnhance('normal')} disabled={selectedArmor.enhancement >= 20} className="bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100/50 dark:hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-2 transition-all flex flex-col items-center"><span className="font-bold text-xs">장비 강화석</span><span className="text-[10px] opacity-70">5,000원</span></button>
                    <button onClick={() => handleEnhance('advanced')} disabled={selectedArmor.enhancement >= 20} className="bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 hover:bg-green-100/50 dark:hover:bg-green-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-2 transition-all flex flex-col items-center"><span className="font-bold text-xs">상급 강화석</span><span className="text-[10px] opacity-70">+3%</span></button>
                    <button onClick={() => handleEnhance('supreme')} disabled={selectedArmor.enhancement >= 20} className="bg-purple-50/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100/50 dark:hover:bg-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-2 transition-all flex flex-col items-center"><span className="font-bold text-xs">고급 강화석</span><span className="text-[10px] opacity-70">+7%</span></button>
                  </div>
                  <button onClick={rerollPotentials} className="w-full bg-amber-50/50 dark:bg-yellow-900/20 text-amber-700 dark:text-yellow-500 border border-amber-200 dark:border-yellow-700/50 hover:bg-amber-100/50 dark:hover:bg-yellow-900/40 rounded-xl py-2.5 font-bold text-xs transition-all shadow-sm">✨ 잠재능력 재설정 (티켓 10개)</button>
                </div>
              </div>
            </div>

            {/* 재련 로그 */}
            <div className="w-full md:w-1/2 bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col">
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-3">재련 로그</h2>
              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1 bg-slate-50/80 dark:bg-[#121212] p-4 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                {enhanceLogs.length > 0 ? enhanceLogs.map((log) => (
                  <div key={log.timestamp} className={`text-xs font-bold px-3 py-2 rounded-lg border shadow-sm ${log.type === 'success' ? 'text-blue-600 border-blue-200 bg-white dark:border-transparent dark:text-blue-400 dark:bg-blue-900/20' : log.type === 'degrade' ? 'text-red-500 border-red-200 bg-white dark:border-transparent dark:bg-red-900/20' : log.type === 'remote' ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:border-transparent dark:text-emerald-400 dark:bg-emerald-900/20' : 'text-slate-600 border-slate-200 bg-white dark:border-transparent dark:text-gray-400 dark:bg-gray-800/50'}`}>
                    [{ArmorTypeKorean[log.armorType]}] {log.type === 'success' ? `✨ ${log.enhancement}강 성공` : log.type === 'degrade' ? `🔻 ${log.enhancement + 1}강에서 하락` : log.type === 'remote' ? `🕹️ ${log.enhancement}강 변경 및 이동` : `➖ ${log.enhancement}강 유지`}
                  </div>
                )) : <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400 dark:text-gray-600">기록이 없습니다.</div>}
              </div>
            </div>
          </div>

          {/* 하단 2단 구조 통계 및 재화 */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-4 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none shrink-0">
            <h2 className="text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider">통계 및 사용된 재화</h2>
            
            <div className="flex flex-col gap-2.5">
              {/* 통계 박스 */}
              <div className="grid grid-cols-4 gap-2 text-sm font-bold text-slate-700 dark:text-gray-300 bg-slate-50/80 dark:bg-[#121212] p-3 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                 <div className="flex flex-col gap-0.5"><span className="text-[10px] text-slate-500">총 시도</span><span>{stats.totalAttempts}회</span></div>
                 <div className="flex flex-col gap-0.5"><span className="text-[10px] text-blue-500">성공</span><span className="text-blue-600 dark:text-blue-400">{stats.successes}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.successes)}%)</span></span></div>
                 <div className="flex flex-col gap-0.5"><span className="text-[10px] text-slate-500">유지</span><span className="text-slate-600 dark:text-gray-400">{stats.maintains}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.maintains)}%)</span></span></div>
                 <div className="flex flex-col gap-0.5"><span className="text-[10px] text-red-500">하락</span><span className="text-red-500">{stats.degrades}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.degrades)}%)</span></span></div>
              </div>

              {/* 재화 박스 */}
              <div className="flex justify-between items-center bg-slate-50/80 dark:bg-[#121212] p-3 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                 <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-700 dark:text-gray-300">
                    <p>장비 강화석: {usedResources.stones.normal}개</p>
                    <p>상급: {usedResources.stones.advanced}개</p>
                    <p>고급: {usedResources.stones.supreme}개</p>
                    <p>별풍선티켓: {usedResources.starBalloonTicket}개</p>
                 </div>
                 <div className="text-right shrink-0 ml-4">
                   <p className="text-[10px] font-bold text-slate-500 mb-0.5">총 사용 금액</p>
                   <p className="text-lg text-amber-600 dark:text-yellow-500 font-black leading-none">{usedResources.money.toLocaleString()}원</p>
                 </div>
              </div>
              
              {/* 💡 새로운 방어구 광물 누적 소모량 표시 박스 */}
              <div className="mt-1 pt-1.5 border-t border-slate-200 dark:border-gray-800 text-xs font-medium space-y-1 text-slate-700 dark:text-gray-300">
                 <p className="text-[10px] text-slate-400 dark:text-gray-500">* 장비 강화석 제작 성공률 80%를 반영한 광물 누적 소모량입니다.</p>
                 <div className="flex flex-wrap gap-3 font-bold">
                    <p>철광석: {rawMaterials.ironOre.toLocaleString()}개</p>
                    <p>오철: {rawMaterials.oIron.toLocaleString()}개</p>
                    <p>구리: {rawMaterials.copper.toLocaleString()}개</p>
                    <p className="text-green-600 dark:text-green-400">반짝이는 돌: {rawMaterials.shiningStone.toLocaleString()}개</p>
                    <p className="text-purple-600 dark:text-purple-400">화룡석: {rawMaterials.fireDragonStone.toLocaleString()}개</p>
                 </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}