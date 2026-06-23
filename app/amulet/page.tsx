'use client';
import React, { useState } from 'react';

// --- 데이터 정의 ---
type Tier = '일반' | '고급' | '희귀';

interface AmuletOption { statName: string; min: number; max: number; names: string[]; }
interface AmuletData { id: string; tier: Tier; option: AmuletOption; name: string; level: number; exp: number; }

const AMULET_DB: Record<Tier, AmuletOption[]> = {
  '일반': [
    { statName: '회복력 증가', min: 1, max: 11, names: ['풍호', '극난', '단마'] },
    { statName: '체력 증가', min: 1, max: 11, names: ['산달', '폭웅'] },
    { statName: '보스 데미지', min: 1, max: 7, names: ['극왕', '음강'] },
  ],
  '고급': [
    { statName: '체력 증가', min: 12, max: 21, names: ['백웅', '구군', '청검'] },
    { statName: '치명타 확률', min: 1, max: 6, names: ['독호', '비봉'] },
    { statName: '치명타 데미지', min: 1, max: 7, names: ['독존', '금마'] },
    { statName: '보스 데미지', min: 7, max: 12, names: ['구호', '풍영', '황공'] },
    { statName: '운 증가', min: 6, max: 11, names: ['해봉', '풍수'] },
    { statName: '회복력 증가', min: 12, max: 21, names: ['해공', '옥공', '비야'] },
    { statName: '저항 증가', min: 1, max: 6, names: ['비전', '비주'] },
  ],
  '희귀': [
    { statName: '체력 증가', min: 21, max: 31, names: ['설룡월', '주무선'] },
    { statName: '치명타 확률', min: 6, max: 11, names: ['대토학', '호금일'] },
    { statName: '보스 데미지', min: 12, max: 21, names: ['선무익'] },
    { statName: '운 증가', min: 11, max: 21, names: ['월일국', '해산호', '화조화'] },
    { statName: '회복력 증가', min: 21, max: 31, names: ['신룡검', '무산설'] },
    { statName: '저항 증가', min: 6, max: 11, names: ['금성조', '상인금'] },
    { statName: '공격 속도', min: 1, max: 5, names: ['신광무', '삼호파'] },
    { statName: '회피율', min: 1, max: 5, names: ['대력문'] },
    { statName: '내공 증가', min: 1, max: 5, names: ['암운주'] },
    { statName: '치명타 데미지', min: 8, max: 15, names: ['목하인', '호심조'] },
  ]
};

const TIER_COLORS = {
  '일반': 'from-slate-600 to-slate-800 border-slate-400 text-slate-100',
  '고급': 'from-blue-600 to-blue-900 border-blue-400 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.6)]',
  '희귀': 'from-purple-600 to-purple-900 border-purple-400 text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.8)]'
};

const LEVEL_COSTS = {
  '일반': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 
  '고급': [2, 2, 2, 2, 2, 2, 2, 2, 2, 2], 
  '희귀': [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]  
};

export default function AmuletSimulator() {
  const [totalGenerated, setTotalGenerated] = useState(0); 
  const [usedTickets, setUsedTickets] = useState(0); 
  
  const [equipped, setEquipped] = useState<(AmuletData | null)[]>([null, null, null]);
  const [inventory, setInventory] = useState<AmuletData[]>([]);
  const [logMsg, setLogMsg] = useState('');
  
  const [selectedAmulet, setSelectedAmulet] = useState<{ data: AmuletData, location: 'equipped' | 'inventory', index?: number } | null>(null);
  
  const [selectionMode, setSelectionMode] = useState<{
    target: { data: AmuletData, location: 'equipped' | 'inventory', index?: number },
    costToMax: number,
    selectedIds: string[]
  } | null>(null);

  const [isAnimating, setIsAnimating] = useState(false);

  const showLog = (msg: string) => {
    setLogMsg(msg);
    setTimeout(() => setLogMsg(''), 2500);
  };

  const triggerAnim = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getStatValue = (option: AmuletOption, level: number) => {
    const val = option.min + ((option.max - option.min) / 10) * level;
    return val.toFixed(1).replace('.0', '');
  };

  const getTotalExpNeeded = (tier: Tier) => LEVEL_COSTS[tier].reduce((a,b)=>a+b, 0);
  
  const getCurrentExp = (tier: Tier, level: number, exp: number) => {
    let sum = 0;
    for(let i=0; i<level; i++) sum += LEVEL_COSTS[tier][i];
    return sum + exp;
  };

  const getCostToMax = (tier: Tier, level: number, exp: number) => {
    return getTotalExpNeeded(tier) - getCurrentExp(tier, level, exp);
  };

  const generateRandomAmulet = (tier: Tier): AmuletData => {
    const options = AMULET_DB[tier];
    const option = options[Math.floor(Math.random() * options.length)];
    const name = option.names[Math.floor(Math.random() * option.names.length)];
    return { id: Math.random().toString(36).substr(2, 9), tier, option, name, level: 0, exp: 0 };
  };

  const handleDraw = (amount: number) => {
    const drawn = Array.from({ length: amount }).map(() => generateRandomAmulet('일반'));
    setTotalGenerated(p => p + amount);
    setInventory(p => [...p, ...drawn]);
    showLog(`✨ 일반 부적 ${amount}장을 보관함에 지급했습니다.`);
  };

  const handleStartLevelUp = () => {
    if (!selectedAmulet) return;
    const { data } = selectedAmulet;
    
    if (data.level >= 10) return showLog('❌ 이미 최대 레벨입니다.');
    
    const costToMax = getCostToMax(data.tier, data.level, data.exp);
    const availableNormals = inventory.filter(a => a.tier === '일반' && a.id !== data.id).length;
    
    if (availableNormals === 0) {
      return showLog(`❌ 보관함에 재료로 사용할 일반 부적이 없습니다.`);
    }
    
    setSelectionMode({ target: selectedAmulet, costToMax, selectedIds: [] });
    setSelectedAmulet(null);
    showLog(`👇 최대 ${costToMax}장까지 재료를 선택할 수 있습니다.`);
  };

  const handleAutoSelect = () => {
    if (!selectionMode) return;
    const availableNormals = sortedInventory.filter(a => a.tier === '일반' && a.id !== selectionMode.target.data.id && !selectionMode.selectedIds.includes(a.id));
    const needed = selectionMode.costToMax - selectionMode.selectedIds.length;
    
    if (needed <= 0) return showLog('❌ 이미 최대치까지 선택되었습니다.');
    if (availableNormals.length === 0) return showLog('❌ 더 이상 선택할 수 있는 일반 부적이 없습니다.');

    const toSelect = availableNormals.slice(0, needed).map(a => a.id);
    setSelectionMode({
      ...selectionMode,
      selectedIds: [...selectionMode.selectedIds, ...toSelect]
    });
    showLog('⚡ 보관함 정렬 순서대로 재료를 일괄 선택했습니다! (고레벨 주의)');
  };

  const handleInventoryClick = (amulet: AmuletData) => {
    if (selectionMode) {
      if (amulet.tier !== '일반') return showLog('❌ 재료로는 일반 부적만 사용할 수 있습니다.');
      if (amulet.id === selectionMode.target.data.id) return showLog('❌ 강화 대상은 재료로 선택할 수 없습니다.');

      setSelectionMode(prev => {
        if (!prev) return prev;
        const isSelected = prev.selectedIds.includes(amulet.id);
        if (isSelected) {
          return { ...prev, selectedIds: prev.selectedIds.filter(id => id !== amulet.id) };
        } else {
          if (prev.selectedIds.length >= prev.costToMax) {
            showLog(`❌ 최대 레벨에 도달하기 위한 필요량(${prev.costToMax}장)을 모두 선택했습니다.`);
            return prev;
          }
          return { ...prev, selectedIds: [...prev.selectedIds, amulet.id] };
        }
      });
      return;
    }
    setSelectedAmulet({ data: amulet, location: 'inventory' });
  };

  const handleConfirmLevelUp = () => {
    if (!selectionMode || selectionMode.selectedIds.length === 0) return;

    setInventory(p => p.filter(item => !selectionMode.selectedIds.includes(item.id)));

    const targetData = selectionMode.target.data;
    let curLevel = targetData.level;
    let curExp = targetData.exp + selectionMode.selectedIds.length;
    
    while (curLevel < 10 && curExp >= LEVEL_COSTS[targetData.tier][curLevel]) {
      curExp -= LEVEL_COSTS[targetData.tier][curLevel];
      curLevel++;
    }
    if (curLevel === 10) curExp = 0;

    const upgraded = { ...targetData, level: curLevel, exp: curExp };

    if (selectionMode.target.location === 'equipped' && selectionMode.target.index !== undefined) {
      const newEq = [...equipped];
      newEq[selectionMode.target.index] = upgraded;
      setEquipped(newEq);
    } else {
      setInventory(p => p.map(item => item.id === targetData.id ? upgraded : item));
    }

    setSelectionMode(null);
    showLog(`🔥 경험치 투입 완료! (현재 Lv.${upgraded.level})`);
    triggerAnim();
  };

  const handleReroll = () => {
    if (!selectedAmulet) return;
    const { data, location, index } = selectedAmulet;
    setUsedTickets(p => p + 5);
    
    let newAmuletData: AmuletData;
    do {
      newAmuletData = generateRandomAmulet(data.tier);
    } while (newAmuletData.name === data.name);
    
    const rerolled = { ...data, option: newAmuletData.option, name: newAmuletData.name };

    if (location === 'equipped' && equipped.some((a, i) => i !== index && a && a.name === rerolled.name)) {
      setUsedTickets(p => p - 5); 
      return showLog(`❌ 리롤 결과 장착 중인 다른 부적과 동일한 이름이 떠서 취소되었습니다. 다시 시도해주세요.`);
    }

    if (location === 'equipped' && index !== undefined) {
      const newEq = [...equipped];
      newEq[index] = rerolled;
      setEquipped(newEq);
    } else {
      setInventory(p => p.map(item => item.id === data.id ? rerolled : item));
    }

    setSelectedAmulet({ ...selectedAmulet, data: rerolled });
    showLog('🌀 옵션을 재설정했습니다! (별풍선 티켓 5장 소모)');
    triggerAnim();
  };

  const handleUnequip = () => {
    if (!selectedAmulet || selectedAmulet.location !== 'equipped' || selectedAmulet.index === undefined) return;
    const newEq = [...equipped];
    newEq[selectedAmulet.index] = null;
    setEquipped(newEq);
    setInventory(p => [...p, selectedAmulet.data]);
    setSelectedAmulet(null);
    showLog('📥 부적을 장착 해제하여 보관함에 넣었습니다.');
  };

  const handleEquip = () => {
    if (!selectedAmulet || selectedAmulet.location !== 'inventory') return;
    
    if (equipped.some(a => a && a.name === selectedAmulet.data.name)) {
      return showLog(`❌ 이미 동일한 이름의 부적([${selectedAmulet.data.name}])을 장착 중입니다.`);
    }

    const emptyIndex = equipped.findIndex(slot => slot === null);
    if (emptyIndex === -1) return showLog('❌ 장착 슬롯이 꽉 찼습니다. 기존 부적을 해제해주세요.');
    
    const newEq = [...equipped];
    newEq[emptyIndex] = selectedAmulet.data;
    setEquipped(newEq);
    setInventory(p => p.filter(item => item.id !== selectedAmulet.data.id));
    setSelectedAmulet(null);
    showLog('✨ 부적을 장착했습니다!');
  };

  const handleMerge = () => {
    if (!selectedAmulet) return;
    const tier = selectedAmulet.data.tier;
    const nextTier = tier === '일반' ? '고급' : tier === '고급' ? '희귀' : null;
    if (!nextTier) return;

    const allAmulets = [...inventory, ...equipped.filter(a => a !== null)] as AmuletData[];
    const partner = allAmulets.find(i => i.tier === tier && i.level === 10 && i.id !== selectedAmulet.data.id);
    
    if (!partner) return showLog(`❌ 합성할 또 다른 10레벨 ${tier} 부적이 필요합니다.`);

    const toRemove = [selectedAmulet.data.id, partner.id];
    
    setInventory(p => p.filter(i => !toRemove.includes(i.id)));
    setEquipped(p => p.map(i => (i && toRemove.includes(i.id) ? null : i)));
    
    setInventory(p => [...p, generateRandomAmulet(nextTier)]);
    setSelectedAmulet(null);
    showLog(`🎉 대성공! [${nextTier}] 등급 부적을 보관함에 획득했습니다!`);
  };

  const getMergePartnerCount = (tier: Tier, currentId: string) => {
    const allAmulets = [...inventory, ...equipped.filter(a => a !== null)] as AmuletData[];
    return allAmulets.filter(i => i.tier === tier && i.level === 10 && i.id !== currentId).length;
  };

  const sortedInventory = [...inventory].sort((a, b) => {
    const tierWeight = { '희귀': 3, '고급': 2, '일반': 1 };
    if (tierWeight[a.tier] !== tierWeight[b.tier]) return tierWeight[b.tier] - tierWeight[a.tier];
    if (a.level !== b.level) return b.level - a.level;
    if (a.exp !== b.exp) return b.exp - a.exp;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="h-full flex flex-col p-6 bg-[#0f172a] text-white rounded-2xl overflow-hidden relative border border-slate-800 shadow-2xl pb-24">
      {logMsg && <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-emerald-500 text-white px-8 py-4 rounded-full font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-fade-in">{logMsg}</div>}

      {/* 💡 헤더 여백 축소 (p-5 -> p-4, mb-6 -> mb-4) */}
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg shrink-0 mb-4 z-10">
        <div>
          <h1 className="text-xl font-black text-white drop-shadow-md">🎴 부적 강화 시뮬레이터</h1>
          <p className="text-[11px] font-bold text-slate-400 mt-0.5">부적을 뽑고 성장시켜 추가 능력치를 얻어보세요!</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <div className="text-right">
            <p className="text-[11px] font-bold text-slate-400 mb-0.5">사용한 별풍선 : <span className="text-amber-400 font-black text-sm">{usedTickets}개</span></p>
            <p className="text-[11px] font-bold text-slate-400">생성한 부적 : <span className="text-emerald-400 font-black text-sm">{totalGenerated}장</span></p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleDraw(1)} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white text-xs font-black transition-colors border border-slate-500 shadow-sm">
              1장 뽑기
            </button>
            <button onClick={() => handleDraw(10)} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-white text-xs font-black transition-colors border border-emerald-500 shadow-sm">
              10장 뽑기
            </button>
          </div>
        </div>
      </div>

      {/* 💡 장착 슬롯 크기 대폭 축소 & 가운데 정렬 (높이 다이어트) */}
      <div className="flex justify-center gap-8 mb-5 shrink-0">
        {equipped.map((amulet, idx) => (
          <div key={`slot-${idx}`} className="flex flex-col items-center">
            <h2 className="text-[11px] font-black text-slate-400 mb-2 bg-slate-800 px-3 py-0.5 rounded-full border border-slate-700 shadow-sm">
              장착 슬롯 {idx + 1}
            </h2>
            
            {amulet ? (
              <div 
                onClick={() => {
                  if (selectionMode) return showLog('❌ 재료 선택 모드 중에는 슬롯을 조작할 수 없습니다.');
                  setSelectedAmulet({ data: amulet, location: 'equipped', index: idx });
                }}
                // 💡 크기를 w-[170px] h-[230px] 로 고정하여 확실하게 줄였습니다.
                className={`w-[170px] h-[230px] rounded-xl flex flex-col items-center justify-between p-3 bg-gradient-to-b border-4 relative transition-transform shadow-xl ${TIER_COLORS[amulet.tier]} ${selectionMode ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer hover:-translate-y-1'}`}
              >
                {selectionMode?.target.data.id === amulet.id && (
                  <div className="absolute inset-0 bg-blue-900/60 rounded-lg flex items-center justify-center z-10">
                    <span className="text-xs font-black text-white px-2 py-1 bg-blue-600 rounded-md border border-blue-400 shadow-lg">강화 대상</span>
                  </div>
                )}
                
                <div className="w-full flex justify-between items-center text-[11px] font-black bg-black/40 px-2 py-0.5 rounded shadow-inner">
                  <span>{amulet.tier}</span>
                  <span className={amulet.level === 10 ? 'text-red-400' : 'text-yellow-400'}>Lv.{amulet.level}</span>
                </div>
                
                <div className="text-center w-full">
                  <h3 className="text-lg font-black mb-1 drop-shadow-md truncate">[{amulet.name}] 부적</h3>
                  <div className="bg-black/60 px-2 py-1.5 rounded-lg border border-current mt-1.5 shadow-inner">
                    <p className="text-[10px] opacity-80 mb-0.5">{amulet.option.statName}</p>
                    <p className="text-sm font-black text-yellow-300">+{getStatValue(amulet.option, amulet.level)}</p>
                  </div>
                </div>
                
                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-slate-500 relative shadow-inner">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(getCurrentExp(amulet.tier, amulet.level, amulet.exp) / getTotalExpNeeded(amulet.tier)) * 100}%` }} />
                </div>
              </div>
            ) : (
              <div className={`w-[170px] h-[230px] border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center bg-slate-800/30 transition-colors ${selectionMode ? 'opacity-50' : ''}`}>
                <span className="text-xs font-bold text-slate-600 mt-1">비어있음</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 💡 인벤토리 높이 보장 (min-h-[360px] 이상으로 늘려 최소 2줄 이상 무조건 보이게 설정) */}
      <div className={`flex-1 bg-slate-800 rounded-2xl border ${selectionMode ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-slate-700'} flex flex-col overflow-hidden shadow-lg min-h-[380px] transition-all`}>
        <div className={`p-2.5 border-b shrink-0 flex justify-between items-center transition-colors ${selectionMode ? 'bg-blue-900 border-blue-500' : 'bg-slate-900 border-slate-700'}`}>
          <h2 className="text-sm font-black text-white flex items-center gap-2 px-2">
            {selectionMode ? '🎯 재료로 사용할 일반 부적을 선택하세요' : '📥 부적 보관함'}
          </h2>
          <span className="text-[11px] font-bold bg-slate-800 px-2.5 py-0.5 rounded text-slate-300 border border-slate-700">{inventory.length}개 보유</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-wrap content-start gap-2.5 bg-slate-900/30">
          {sortedInventory.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
              보관된 부적이 없습니다. 뽑기를 진행해주세요.
            </div>
          ) : (
            sortedInventory.map((amulet) => {
              const isSelected = selectionMode?.selectedIds.includes(amulet.id);
              const isTarget = selectionMode?.target.data.id === amulet.id;
              const isNormal = amulet.tier === '일반';
              const canSelect = selectionMode && isNormal && !isTarget;

              return (
                <div 
                  key={amulet.id} 
                  onClick={() => handleInventoryClick(amulet)}
                  className={`w-[120px] h-[150px] p-2 rounded-lg border-2 flex flex-col items-center justify-between relative bg-gradient-to-b transition-all duration-200 
                    ${TIER_COLORS[amulet.tier].replace('border-', 'border-opacity-50 border-')}
                    ${selectionMode ? (canSelect ? 'cursor-pointer hover:border-blue-400' : 'opacity-40 grayscale cursor-not-allowed') : 'cursor-pointer hover:-translate-y-1 hover:shadow-lg opacity-90 hover:opacity-100'}
                    ${isSelected ? 'brightness-50 blur-[1px] border-emerald-500 scale-95' : ''}
                  `}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <span className="text-5xl drop-shadow-xl">✅</span>
                    </div>
                  )}

                  {isTarget && (
                    <div className="absolute inset-0 bg-blue-900/60 rounded-lg flex items-center justify-center z-20">
                      <span className="text-[10px] font-black text-white px-2 py-1 bg-blue-600 rounded">강화 대상</span>
                    </div>
                  )}

                  <div className="text-[9px] font-black w-full flex justify-between bg-black/40 px-1.5 py-0.5 rounded shadow-inner">
                    <span>{amulet.tier}</span>
                    <span className={amulet.level === 10 ? 'text-red-400' : 'text-yellow-400'}>Lv.{amulet.level}</span>
                  </div>
                  <div className="text-center w-full">
                    <span className="text-[11px] font-black truncate w-full block mb-0.5 drop-shadow-sm">{amulet.name}</span>
                    <div className="bg-black/40 rounded px-1 py-0.5 border border-current/30">
                      <span className="text-[9px] text-slate-300 block truncate opacity-80">{amulet.option.statName}</span>
                      <span className="text-[10px] font-black text-yellow-300">+{getStatValue(amulet.option, amulet.level)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 액션 모달 및 배너 등은 기존과 동일하게 유지 */}
      {selectionMode && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-blue-500 text-white px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.5)] flex flex-col md:flex-row items-center gap-6 md:gap-12 animate-slide-up w-11/12 max-w-3xl justify-between">
          <div>
            <p className="text-[11px] font-black text-blue-400 mb-0.5">🔥 성장 재료 선택 모드</p>
            <p className="text-base font-bold">재료 선택 (<span className={selectionMode.selectedIds.length === selectionMode.costToMax ? 'text-emerald-400' : 'text-yellow-400'}>{selectionMode.selectedIds.length}</span> / 최대 {selectionMode.costToMax})</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={handleAutoSelect} className="flex-1 md:flex-none px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-black transition-colors text-slate-200 border border-slate-500">
              일괄 자동선택
            </button>
            <button onClick={() => setSelectionMode(null)} className="flex-1 md:flex-none px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-black transition-colors text-red-300 border border-slate-500">
              취소
            </button>
            <button 
              onClick={handleConfirmLevelUp}
              disabled={selectionMode.selectedIds.length === 0}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400"
            >
              성장 진행 ({selectionMode.selectedIds.length}장)
            </button>
          </div>
        </div>
      )}

      {selectedAmulet && !selectionMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedAmulet(null)}>
          <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl p-8 max-w-2xl w-full flex flex-col md:flex-row gap-8 items-center" onClick={e => e.stopPropagation()}>
            
            <div className={`w-56 h-72 rounded-2xl flex flex-col items-center justify-between p-5 bg-gradient-to-b border-4 relative shadow-2xl shrink-0 ${isAnimating ? 'scale-105' : 'scale-100'} transition-transform duration-300 ${TIER_COLORS[selectedAmulet.data.tier]}`}>
              <div className="w-full flex justify-between items-center text-sm font-black bg-black/40 px-3 py-1.5 rounded shadow-inner">
                <span>{selectedAmulet.data.tier}</span>
                <span className={selectedAmulet.data.level === 10 ? 'text-red-400' : 'text-yellow-400'}>Lv.{selectedAmulet.data.level}</span>
              </div>
              <div className="text-center w-full">
                <h3 className="text-2xl font-black mb-2 drop-shadow-lg truncate">[{selectedAmulet.data.name}]</h3>
                <div className="bg-black/60 px-3 py-2.5 rounded-xl border border-current mt-2 shadow-inner">
                  <p className="text-xs opacity-80 mb-1">{selectedAmulet.data.option.statName}</p>
                  <p className="text-xl font-black text-yellow-300 drop-shadow-md">+{getStatValue(selectedAmulet.data.option, selectedAmulet.data.level)}</p>
                </div>
              </div>
              <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden border border-slate-500 relative shadow-inner">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(getCurrentExp(selectedAmulet.data.tier, selectedAmulet.data.level, selectedAmulet.data.exp) / getTotalExpNeeded(selectedAmulet.data.tier)) * 100}%` }} />
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3 w-full">
              <h3 className="text-lg font-black text-white mb-2 border-b border-slate-700 pb-2">⚙️ 부적 관리</h3>
              
              {selectedAmulet.data.level < 10 ? (
                <button onClick={handleStartLevelUp} className="flex justify-between items-center bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-black transition-colors border border-blue-400 shadow-md">
                  <span className="text-base text-white">🔥 성장 (레벨업)</span>
                  <span className="text-xs text-blue-200 bg-blue-900/50 px-2 py-1 rounded">재료 선택하기</span>
                </button>
              ) : (
                <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl font-black border border-slate-600 opacity-60">
                  <span className="text-base text-slate-400">🔥 최대 레벨 달성</span>
                  <span className="text-xs text-slate-500">성장 불가</span>
                </div>
              )}

              <button onClick={handleReroll} className="flex justify-between items-center bg-amber-600 hover:bg-amber-500 p-4 rounded-xl font-black transition-colors border border-amber-400 shadow-md">
                <span className="text-base text-white">🌀 옵션 재설정</span>
                <span className="text-xs text-amber-100 bg-amber-900/50 px-2 py-1 rounded">티켓 5장 소모</span>
              </button>

              <hr className="border-slate-700 my-2" />

              {selectedAmulet.location === 'equipped' ? (
                <button onClick={handleUnequip} className="w-full p-4 rounded-xl font-black text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-500 shadow-md">
                  📥 장착 해제 (보관함으로 이동)
                </button>
              ) : (
                <button onClick={handleEquip} className="w-full p-4 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-colors border border-emerald-400 shadow-md">
                  ✨ 이 부적 장착하기
                </button>
              )}

              {selectedAmulet.data.level === 10 && selectedAmulet.data.tier !== '희귀' && (
                <button onClick={handleMerge} className="flex justify-between items-center bg-purple-600 hover:bg-purple-500 p-4 rounded-xl font-black transition-colors border border-purple-400 shadow-md mt-2">
                  <span className="text-base text-white">✨ 상위 등급 합성</span>
                  <span className={`text-xs px-2 py-1 rounded ${getMergePartnerCount(selectedAmulet.data.tier, selectedAmulet.data.id) >= 1 ? 'bg-purple-900/50 text-purple-200' : 'bg-red-900/80 text-red-200'}`}>
                    보유한 MAX 재료: {getMergePartnerCount(selectedAmulet.data.tier, selectedAmulet.data.id)}/1장
                  </span>
                </button>
              )}

              <button onClick={() => setSelectedAmulet(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white font-black text-xl w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}