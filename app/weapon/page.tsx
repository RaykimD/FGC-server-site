'use client';
import React, { useState } from 'react';
// 기존 타입을 불러오되, 이름이 충돌하지 않게 별칭(Base~)으로 가져옵니다.
import { Weapon, EnhanceLog as BaseEnhanceLog, UsedResources as BaseUsedResources, Stats } from '@/types';
import { ENHANCEMENT_RATES, STONE_TYPES, WEAPON_NAMES, WEAPON_STATS } from '@/constants';

// 현재 파일에서만 사용할 연장된 타입
type EnhanceLog = BaseEnhanceLog | { type: 'remote'; weaponType: string; enhancement: number; timestamp: number; };
type UsedResources = BaseUsedResources & { extraMaterials: { shiningStone: number; fireDragonStone: number; } };

const calculateAttackPower = (enhancement: number) => {
  let additionalPower = 0;
  for (let i = 1; i <= enhancement; i++) {
    additionalPower += WEAPON_STATS.enhancement[i as keyof typeof WEAPON_STATS.enhancement] || 0;
  }
  return WEAPON_STATS.base + additionalPower;
};

export default function WeaponSimulator() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string | null>(null);
  const [selectedWeaponType, setSelectedWeaponType] = useState<string>('sword');
  
  const [enhanceLogs, setEnhanceLogs] = useState<EnhanceLog[]>([]);
  const [stats, setStats] = useState<Stats>({ totalAttempts: 0, successes: 0, maintains: 0, degrades: 0, destroys: 0, maxEnhance: 0 });
  
  const [usedResources, setUsedResources] = useState<UsedResources>({
    stones: { normal: 0, advanced: 0, supreme: 0 },
    materials: { iron: 0, blackIron: 0, specialIron: 0, lapis: 0 },
    extraMaterials: { shiningStone: 0, fireDragonStone: 0 },
    money: 0
  });
  
  const [drinkUsed, setDrinkUsed] = useState<boolean>(false);
  const [showMaterialDetails, setShowMaterialDetails] = useState<boolean>(false);

  const [isRemoteOpen, setIsRemoteOpen] = useState<boolean>(false);
  const [remoteTargetLevel, setRemoteTargetLevel] = useState<number>(11);

  const selectedWeapon = weapons.find(w => w.id === selectedWeaponId) || null;

  const addEnhanceLog = (type: EnhanceLog['type'], enhancement: number, weaponType: string = 'sword') => {
    setEnhanceLogs(prev => [{ type, weaponType, enhancement, timestamp: Date.now() } as EnhanceLog, ...prev].slice(0, 50)); // 스크롤 확인을 위해 50개까지 보관
  };

  const purchaseWeapon = () => {
    if (weapons.length >= 30) { alert('인벤토리가 꽉 찼습니다!'); return; }
    const newWeapon: Weapon = { id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, type: selectedWeaponType, enhancement: 0, createdAt: Date.now() };
    setWeapons(prev => [...prev, newWeapon]);
    setUsedResources(prev => ({ ...prev, money: prev.money + 1000 }));
    if (!selectedWeaponId) setSelectedWeaponId(newWeapon.id);
  };

  const handleEnhance = (stoneType: 'normal' | 'advanced' | 'supreme') => {
    if (!selectedWeapon || selectedWeapon.enhancement >= 12) return;

    setUsedResources(prev => {
      const next = { ...prev, stones: { ...prev.stones }, materials: { ...prev.materials }, extraMaterials: { ...prev.extraMaterials } };
      if (stoneType === 'normal') {
        next.stones.normal += 1; next.materials.iron += 3; next.materials.blackIron += 1; next.materials.specialIron += 1; next.materials.lapis += 5; next.money += 5000;
      } else if (stoneType === 'advanced') {
        next.stones.advanced += 1; next.extraMaterials.shiningStone += 1; next.money += 10000;
      } else if (stoneType === 'supreme') {
        next.stones.supreme += 1; next.extraMaterials.fireDragonStone += 1; next.money += 20000;
      }
      return next;
    });

    const enhancementLevel = selectedWeapon.enhancement as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    const rates = ENHANCEMENT_RATES[enhancementLevel];
    const bonus = stoneType === 'advanced' ? 3 : stoneType === 'supreme' ? 7 : 0; 
    const successRate = rates.success + bonus + (drinkUsed ? 1 : 0);
    const roll = Math.random() * 100;

    setStats(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));

    if (roll < successRate) {
      const newEnhancement = selectedWeapon.enhancement + 1;
      setWeapons(prev => prev.map(w => w.id === selectedWeapon.id ? { ...w, enhancement: newEnhancement } : w));
      addEnhanceLog('success', newEnhancement, selectedWeapon.type);
      setStats(prev => ({ ...prev, successes: prev.successes + 1, maxEnhance: Math.max(prev.maxEnhance, newEnhancement) }));
    } else {
      const destroyRoll = Math.random() * 100;
      if (selectedWeapon.enhancement >= 5 && destroyRoll < rates.destroy) {
        
        // 💡 파괴 시 오토 포커스 이동 (다음 아이템 자동 선택)
        const destroyIndex = weapons.findIndex(w => w.id === selectedWeapon.id);
        const newWeapons = weapons.filter(w => w.id !== selectedWeapon.id);
        setWeapons(newWeapons);
        
        if (newWeapons.length > 0) {
          const nextIndex = Math.min(destroyIndex, newWeapons.length - 1);
          setSelectedWeaponId(newWeapons[nextIndex].id);
        } else {
          setSelectedWeaponId(null);
        }

        addEnhanceLog('destroy', selectedWeapon.enhancement, selectedWeapon.type);
        setStats(prev => ({ ...prev, destroys: prev.destroys + 1 }));
      } else if (destroyRoll < (rates.destroy + rates.degrade)) {
        const newEnhancement = Math.max(0, selectedWeapon.enhancement - 1);
        setWeapons(prev => prev.map(w => w.id === selectedWeapon.id ? { ...w, enhancement: newEnhancement } : w));
        addEnhanceLog('degrade', newEnhancement, selectedWeapon.type);
        setStats(prev => ({ ...prev, degrades: prev.degrades + 1 }));
      } else {
        addEnhanceLog('maintain', selectedWeapon.enhancement, selectedWeapon.type);
        setStats(prev => ({ ...prev, maintains: prev.maintains + 1 }));
      }
    }
  };

  const applyRemoteControl = () => {
    if (!selectedWeapon) return;
    setWeapons(prev => prev.map(w => w.id === selectedWeapon.id ? { ...w, enhancement: remoteTargetLevel } : w));
    addEnhanceLog('remote', remoteTargetLevel, selectedWeapon.type);
    setIsRemoteOpen(false);
  };

  const getCalculatedMaterials = () => {
    const { normal, advanced, supreme } = usedResources.stones;
    const totalNormalNeeded = normal + advanced + supreme;
    const normalCraftAttempts = Math.ceil(totalNormalNeeded / 0.8);

    return {
      iron: normalCraftAttempts * 3,
      blackIron: normalCraftAttempts * 1,
      specialIron: normalCraftAttempts * 1,
      lapis: normalCraftAttempts * 5,
      shiningStone: advanced,
      fireDragonStone: supreme,
      totalMoney: (normalCraftAttempts * 5000) + (advanced * 10000) + (supreme * 20000),
      normalCraftAttempts
    };
  };

  const rawMaterials = getCalculatedMaterials();
  const getPct = (val: number) => stats.totalAttempts > 0 ? ((val / stats.totalAttempts) * 100).toFixed(1) : '0.0';

  return (
    // 💡 전체 화면 드래그 방지 (select-none 추가)
    <div className="animate-fade-in pb-10 select-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">무기 강화</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">인벤토리에 무기를 채우고 원하는 무기를 클릭하여 강화하세요.</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(WEAPON_NAMES).map(([key, name]) => (
              <button
                key={key} onClick={() => setSelectedWeaponType(key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors border shadow-sm ${selectedWeaponType === key ? 'bg-slate-800 dark:bg-white text-white dark:text-gray-900 border-slate-800 dark:border-white transform scale-105 shadow-md' : 'bg-white dark:bg-[#1e1e1e] text-slate-600 dark:text-gray-400 border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800'}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (!selectedWeapon) { alert('인벤토리에서 조작할 무기를 먼저 선택해주세요.'); return; }
              setIsRemoteOpen(true);
            }}
            className="text-sm px-4 py-2 font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
          >
            🕹️ 리모컨 조작
          </button>
          <button
            onClick={() => {
              if (confirm('초기화하시겠습니까?')) {
                setWeapons([]); setSelectedWeaponId(null); setEnhanceLogs([]); setDrinkUsed(false); setShowMaterialDetails(false);
                setStats({ totalAttempts: 0, successes: 0, maintains: 0, degrades: 0, destroys: 0, maxEnhance: 0 });
                setUsedResources({ stones: { normal: 0, advanced: 0, supreme: 0 }, materials: { iron: 0, blackIron: 0, specialIron: 0, lapis: 0 }, extraMaterials: { shiningStone: 0, fireDragonStone: 0 }, money: 0 });
              }
            }}
            className="text-sm px-4 py-2 font-bold rounded-xl bg-white dark:bg-[#1e1e1e] text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 transition-colors shadow-sm"
          >
            초기화
          </button>
        </div>
      </div>

      {isRemoteOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-gray-800 rounded-2xl p-6 w-80 shadow-2xl text-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">&lt;&lt; 무기 차수 &gt;&gt;</h3>
            <div className="flex items-center justify-center gap-5 mb-6 bg-slate-50 dark:bg-[#121212] py-3 rounded-xl border border-slate-100 dark:border-gray-800">
              <button onClick={() => setRemoteTargetLevel(prev => Math.max(0, prev - 1))} className="text-lg font-black text-slate-400 hover:text-blue-500 transition-colors px-2">◀</button>
              <span className="font-black text-xl text-blue-600 dark:text-blue-400 min-w-[70px]">+{remoteTargetLevel}강</span>
              <button onClick={() => setRemoteTargetLevel(prev => Math.min(12, prev + 1))} className="text-lg font-black text-slate-400 hover:text-blue-500 transition-colors px-2">▶</button>
            </div>
            <div className="flex gap-2 font-bold text-sm">
              <button onClick={() => setIsRemoteOpen(false)} className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-200 transition-colors">취소</button>
              <button onClick={applyRemoteControl} className="flex-1 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md">이동하기</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. 왼쪽 패널: 인벤토리 */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col h-[650px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">인벤토리</h2>
            <span className="text-sm font-bold text-slate-400">{weapons.length} / 30</span>
          </div>
          <button onClick={purchaseWeapon} className="w-full mb-4 bg-slate-800 dark:bg-white text-white dark:text-gray-900 hover:bg-slate-700 dark:hover:bg-gray-100 rounded-xl py-3 font-bold transition-colors shadow-sm">🗡️ 무기 구매하기 (1,000원)</button>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {weapons.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
                {weapons.map(w => (
                  <button key={w.id} onClick={() => setSelectedWeaponId(w.id)} className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-colors ${selectedWeaponId === w.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-inner' : 'border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-[#121212] hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-100 dark:hover:bg-gray-800'}`}>
                    <span className={`text-sm font-black ${w.enhancement >= 10 ? 'text-purple-600 dark:text-purple-400' : w.enhancement >= 7 ? 'text-blue-600 dark:text-blue-400' : w.enhancement >= 4 ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-gray-300'}`}>+{w.enhancement}</span>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">{WEAPON_NAMES[w.type as keyof typeof WEAPON_NAMES]}</span>
                  </button>
                ))}
                {Array.from({ length: Math.max(0, 16 - weapons.length) }).map((_, i) => <div key={`empty-${i}`} className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-800 bg-transparent opacity-50"></div>)}
              </div>
            ) : <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-600"><span className="text-3xl mb-2">🎒</span><p className="text-sm font-medium">무기를 구매해주세요</p></div>}
          </div>
        </div>

        {/* 2. 중앙 & 우측: 대장간, 로그, 통계 */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 대장간 파트 */}
            <div className="flex-1 bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">대장간</h2>
              {selectedWeapon ? (
                <div className="flex-1 flex flex-col justify-center gap-8">
                  <div className="bg-slate-50/80 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-gray-800 p-6 flex flex-col items-center justify-center shadow-inner">
                    <p className={`text-4xl font-black mb-2 transition-colors ${selectedWeapon.enhancement >= 10 ? 'text-purple-600 dark:text-purple-400 drop-shadow-md' : selectedWeapon.enhancement >= 7 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
                      {selectedWeapon.enhancement > 0 ? `+${selectedWeapon.enhancement} ` : ''}{WEAPON_NAMES[selectedWeapon.type as keyof typeof WEAPON_NAMES]}
                      {selectedWeapon.enhancement === 12 && <span className="text-sm align-top text-red-500 ml-1">MAX</span>}
                    </p>
                    
                    <div className="text-slate-600 dark:text-gray-400 mt-4 text-center font-bold">
                      <p className="text-lg">공격력: <span className="[.streamer-mode_&]:blur-md [.streamer-mode_&]:opacity-50 transition-all">{calculateAttackPower(selectedWeapon.enhancement)}</span></p>
                      <p className="text-xs mt-1 font-medium text-slate-400 dark:text-gray-500">
                        (기본 {WEAPON_STATS.base} + 강화 <span className="[.streamer-mode_&]:blur-md [.streamer-mode_&]:opacity-50 transition-all">{calculateAttackPower(selectedWeapon.enhancement) - WEAPON_STATS.base}</span>)
                      </p>
                    </div>

                    {selectedWeapon.enhancement < 12 && (
                      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-gray-800 w-full text-center text-sm font-bold flex justify-around">
                        {(() => {
                          const rates = ENHANCEMENT_RATES[selectedWeapon.enhancement as keyof typeof ENHANCEMENT_RATES];
                          return (
                            <>
                              <div className="flex flex-col"><span className="text-blue-600 dark:text-blue-400 text-lg">{rates.success + (drinkUsed ? 1 : 0)}%</span><span className="text-slate-400 text-[10px] mt-1">성공 {drinkUsed && '(+1%)'}</span></div>
                              {selectedWeapon.enhancement >= 5 && <div className="flex flex-col"><span className="text-purple-600 dark:text-purple-400 text-lg">{rates.destroy}%</span><span className="text-slate-400 text-[10px] mt-1">파괴</span></div>}
                              <div className="flex flex-col"><span className="text-red-500 text-lg">{rates.degrade}%</span><span className="text-slate-400 text-[10px] mt-1">하락</span></div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button onClick={() => setDrinkUsed(!drinkUsed)} className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${drinkUsed ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50 border shadow-inner' : 'bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-transparent shadow-sm'}`}>🍺 강화주 {drinkUsed ? '적용 중 (+1%)' : '마시기'}</button>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => handleEnhance('normal')} disabled={selectedWeapon.enhancement >= 12} className="bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100/50 dark:hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 transition-all flex flex-col items-center"><span className="font-bold text-xs">일반 강화석</span><span className="text-[10px] mt-0.5 opacity-70">5,000원</span></button>
                      <button onClick={() => handleEnhance('advanced')} disabled={selectedWeapon.enhancement >= 12} className="bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 hover:bg-green-100/50 dark:hover:bg-green-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 transition-all flex flex-col items-center"><span className="font-bold text-xs">상급 강화석</span><span className="text-[10px] mt-0.5 opacity-70">+3%</span></button>
                      <button onClick={() => handleEnhance('supreme')} disabled={selectedWeapon.enhancement >= 12} className="bg-purple-50/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100/50 dark:hover:bg-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 transition-all flex flex-col items-center"><span className="font-bold text-xs">고급 강화석</span><span className="text-[10px] mt-0.5 opacity-70">+7%</span></button>
                    </div>
                  </div>
                </div>
              ) : <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-600 bg-slate-50/80 dark:bg-[#121212] rounded-xl border border-dashed border-slate-300 dark:border-gray-800 shadow-inner"><span className="text-4xl mb-4">🔨</span><p className="font-bold">인벤토리에서 장비를 선택해주세요.</p></div>}
            </div>

            {/* 재련 로그 파트 */}
            <div className="flex-1 bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">강화 로그</h2>
              {/* 💡 로그 스크롤 수정: max-h-[400px]을 적용하여 내부 스크롤이 정상적으로 발생하도록 수정 */}
              <div className="space-y-2 overflow-y-auto max-h-[350px] lg:max-h-[450px] pr-2 custom-scrollbar flex-1 bg-slate-50/80 dark:bg-[#121212] p-4 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                {enhanceLogs.length > 0 ? enhanceLogs.map((log) => (
                  <div key={log.timestamp} className={`text-xs font-bold px-3 py-2.5 rounded-lg border shadow-sm ${log.type === 'success' ? 'text-blue-600 border-blue-200 bg-white dark:border-transparent dark:text-blue-400 dark:bg-blue-900/20' : log.type === 'degrade' ? 'text-red-500 border-red-200 bg-white dark:border-transparent dark:bg-red-900/20' : log.type === 'destroy' ? 'text-purple-600 border-purple-200 bg-white dark:border-transparent dark:text-purple-400 dark:bg-purple-900/20' : log.type === 'remote' ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:border-transparent dark:text-emerald-400 dark:bg-emerald-900/20' : 'text-slate-600 border-slate-200 bg-white dark:border-transparent dark:text-gray-400 dark:bg-gray-800/50'}`}>
                    [{WEAPON_NAMES[log.weaponType as keyof typeof WEAPON_NAMES] || '검'}] {log.type === 'success' ? `✨ ${log.enhancement}강 성공` : log.type === 'degrade' ? `🔻 ${log.enhancement + 1}강에서 하락` : log.type === 'destroy' ? `💥 ${log.enhancement}강 파괴` : log.type === 'remote' ? `🕹️ ${log.enhancement}강 변경 및 이동` : `➖ ${log.enhancement}강 유지`}
                  </div>
                )) : <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400 dark:text-gray-600">기록이 없습니다.</div>}
              </div>
            </div>
          </div>

          {/* 하단 통계 및 재화 */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none shrink-0 transition-all">
            <h2 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider flex justify-between items-center">
              <span>통계 및 사용된 재화</span>
              <button onClick={() => setShowMaterialDetails(!showMaterialDetails)} className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors">
                {showMaterialDetails ? '제작 재료 닫기 🔼' : '제작 재료 보기 🔽'}
              </button>
            </h2>
            
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-5 gap-2 text-sm font-bold text-slate-700 dark:text-gray-300 bg-slate-50/80 dark:bg-[#121212] p-4 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                 <div className="flex flex-col gap-1"><span className="text-xs text-slate-500">총 시도</span><span>{stats.totalAttempts}회</span></div>
                 <div className="flex flex-col gap-1"><span className="text-xs text-blue-500">성공</span><span className="text-blue-600 dark:text-blue-400">{stats.successes}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.successes)}%)</span></span></div>
                 <div className="flex flex-col gap-1"><span className="text-xs text-slate-500">유지</span><span className="text-slate-600 dark:text-gray-400">{stats.maintains}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.maintains)}%)</span></span></div>
                 <div className="flex flex-col gap-1"><span className="text-xs text-red-500">하락</span><span className="text-red-500">{stats.degrades}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.degrades)}%)</span></span></div>
                 <div className="flex flex-col gap-1"><span className="text-xs text-purple-500">파괴</span><span className="text-purple-600 dark:text-purple-400">{stats.destroys}회 <span className="text-[10px] font-medium opacity-70">({getPct(stats.destroys)}%)</span></span></div>
              </div>

              <div className="flex justify-between items-center bg-slate-50/80 dark:bg-[#121212] p-4 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
                 <div className="flex gap-6 text-xs sm:text-sm font-bold text-slate-700 dark:text-gray-300">
                    <p>강화석: {usedResources.stones.normal}개</p>
                    <p>상급: {usedResources.stones.advanced}개</p>
                    <p>고급: {usedResources.stones.supreme}개</p>
                 </div>
                 <div className="text-right shrink-0 ml-4">
                   <p className="text-xs font-bold text-slate-500 mb-0.5">총 사용 금액</p>
                   <p className="text-xl sm:text-2xl text-amber-600 dark:text-yellow-500 font-black">{rawMaterials.totalMoney.toLocaleString()}원</p>
                 </div>
              </div>

              {showMaterialDetails && (
                <div className="pt-3 border-t border-slate-200 dark:border-gray-800 text-xs font-medium space-y-2 text-slate-700 dark:text-gray-300">
                  <p className="text-[10px] text-slate-400 dark:text-gray-500">* 기본 강화석 제작 성공률 80%를 반영한 광물 소모값입니다.</p>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-[#121212] p-3 rounded-lg border border-slate-100 dark:border-gray-800 shadow-inner">
                    <div className="flex flex-wrap gap-4 font-bold">
                      <p>철: {rawMaterials.iron.toLocaleString()}개</p>
                      <p>묵철: {rawMaterials.blackIron.toLocaleString()}개</p>
                      <p>오철: {rawMaterials.specialIron.toLocaleString()}개</p>
                      <p>청금석: {rawMaterials.lapis.toLocaleString()}개</p>
                      <p className="text-green-600 dark:text-green-400">반짝이는 돌: {rawMaterials.shiningStone.toLocaleString()}개</p>
                      <p className="text-purple-600 dark:text-purple-400">화룡석: {rawMaterials.fireDragonStone.toLocaleString()}개</p>
                    </div>
                    <div className="font-black text-amber-600 dark:text-yellow-500 shrink-0 ml-4 text-right">
                      제작 총 비용: <br/>{rawMaterials.totalMoney.toLocaleString()}원
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