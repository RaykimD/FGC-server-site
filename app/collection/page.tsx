'use client';
import React, { useState, useEffect } from 'react';

// API에서 불러올 모든 세부 스탯 타입 추가
type Streamer = { 
  id: string; name: string; guildName: string; job: string; 
  level: number; power: number; 
  weapon: number; armor: number; innerPower: number; 
  evasion: number; atkSpeed: number; hp: number; luck: number; 
};
type UnlockedData = { level: number; pullCount: number; };
type CollectionState = Record<string, UnlockedData>;

const ENHANCE_PROBS = [100, 81, 64, 50, 26, 15, 10, 8, 7, 6, 5, 4, 3];
const MAX_LEVEL = 13;
const GUILDS = ['전체', '성태 길드', '만식 길드', '오아 길드', '수피 길드', '사장 길드', '도현 길드'];

const getStarCount = (pulls: number) => {
  if (pulls >= 64) return 7;
  if (pulls >= 32) return 6;
  if (pulls >= 16) return 5;
  if (pulls >= 8) return 4;
  if (pulls >= 4) return 3;
  if (pulls >= 2) return 2;
  return 1;
};

const getStars = (pulls: number) => '⭐'.repeat(getStarCount(pulls));

const getNextStarReq = (pulls: number) => {
  if (pulls >= 64) return 'MAX';
  if (pulls >= 32) return `${pulls} / 64`;
  if (pulls >= 16) return `${pulls} / 32`;
  if (pulls >= 8) return `${pulls} / 16`;
  if (pulls >= 4) return `${pulls} / 8`;
  if (pulls >= 2) return `${pulls} / 4`;
  return `${pulls} / 2`;
};

export default function CollectionGamePage() {
  const [activeTab, setActiveTab] = useState<'shop'|'gacha'|'enhance'|'collection'>('shop');
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [points, setPoints] = useState(0);
  const [tickets, setTickets] = useState(0);
  const [stones, setStones] = useState(0);
  const [luckyStones, setLuckyStones] = useState(0);
  const [premiumStones, setPremiumStones] = useState(0);
  const [isAttended, setIsAttended] = useState(false);
  const [collection, setCollection] = useState<CollectionState>({});
  
  const [isPulling, setIsPulling] = useState(false);
  const [gachaResults, setGachaResults] = useState<{ streamer: Streamer, isDuplicate: boolean, newStars?: number }[] | null>(null);
  
  const [enhanceTarget, setEnhanceTarget] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceResult, setEnhanceResult] = useState<'success'|'fail'|null>(null);

  const [guildFilter, setGuildFilter] = useState('전체');
  const [logMsg, setLogMsg] = useState('');
  const [selectedCard, setSelectedCard] = useState<Streamer | null>(null);

  useEffect(() => {
    const fetchStreamers = async () => {
      try {
        const res = await fetch('/api/status');
        const json = await res.json();
        if (json.success) {
          const list: Streamer[] = [];
          json.data.forEach((g: any) => {
            if (!g.members) return;
            g.members.forEach((m: any) => {
              // API에서 넘어오는 모든 세부 스탯 매핑 (없으면 0으로 처리)
              list.push({ 
                id: m.id, 
                name: m.name, 
                guildName: g.name,
                job: m.job || m.role || m.className || '직업 없음',
                level: Number(m.level || m.lv || 0),
                power: Number(m.power || m.combatPower || m.cp || 0),
                weapon: Number(m.weapon || 0),
                armor: Number(m.armor || 0),
                innerPower: Number(m.innerPower || 0),
                evasion: Number(m.evasion || 0),
                atkSpeed: Number(m.atkSpeed || 0),
                hp: Number(m.hp || m.health || 0),
                luck: Number(m.luck || 0)
              });
            });
          });
          list.sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
          setStreamers(list);
        }
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
      
      const saved = localStorage.getItem('minigame_data_final_v5');
      if (saved) {
        const data = JSON.parse(saved);
        setPoints(data.points || 0);
        setTickets(data.tickets || 0);
        setStones(data.stones || 0);
        setLuckyStones(data.luckyStones || 0);
        setPremiumStones(data.premiumStones || 0);
        setCollection(data.collection || {});
        if (data.lastAttendance !== new Date().toDateString()) setIsAttended(false);
        else setIsAttended(data.isAttended);
      }
    };
    fetchStreamers();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    localStorage.setItem('minigame_data_final_v5', JSON.stringify({ points, tickets, stones, luckyStones, premiumStones, collection, isAttended, lastAttendance: new Date().toDateString() }));
  }, [points, tickets, stones, luckyStones, premiumStones, collection, isAttended, isLoading]);

  const showLog = (msg: string) => {
    setLogMsg(msg);
    setTimeout(() => setLogMsg(''), 2500);
  };

  const handleAttendance = () => {
    if (isAttended) return;
    const rp = Math.floor(Math.random() * 50001) + 50000;
    setPoints(p => p + rp);
    setIsAttended(true);
    showLog(`출석 완료! ${rp.toLocaleString()}P 획득`);
  };

  const handleBuy = (type: 'ticket'|'stone'|'lucky'|'premium', count: number, price: number) => {
    const total = price * count;
    if (points < total) return showLog('포인트가 부족합니다!');
    setPoints(p => p - total);
    if (type === 'ticket') setTickets(t => t + count);
    if (type === 'stone') setStones(s => s + count);
    if (type === 'lucky') setLuckyStones(s => s + count);
    if (type === 'premium') setPremiumStones(s => s + count);
    showLog(`${count}개 구매 완료!`);
  };

  const handlePull = (isMulti: boolean) => {
    const pullCount = isMulti ? Math.min(tickets, 10) : 1;
    if (tickets < pullCount || tickets === 0) return showLog('뽑기권이 부족합니다!');
    
    setTickets(p => p - pullCount);
    setIsPulling(true);
    setGachaResults(null);
    
    const tempCollection = { ...collection };
    const results: { streamer: Streamer; isDuplicate: boolean; newStars?: number }[] = [];
    
    for (let i = 0; i < pullCount; i++) {
      const randomStreamer = streamers[Math.floor(Math.random() * streamers.length)];
      const existingData = tempCollection[randomStreamer.id];
      const isDuplicate = !!existingData;
      let newStars = 1;
      
      if (isDuplicate) {
        const newPullCount = existingData.pullCount + 1;
        const oldStar = getStarCount(existingData.pullCount);
        const currentStar = getStarCount(newPullCount);
        tempCollection[randomStreamer.id] = { ...existingData, pullCount: newPullCount };
        if (currentStar > oldStar) newStars = currentStar;
      } else {
        tempCollection[randomStreamer.id] = { level: 0, pullCount: 1 };
      }
      results.push({ streamer: randomStreamer, isDuplicate, newStars: newStars > 1 ? newStars : undefined });
    }
    
    setTimeout(() => {
      setCollection(tempCollection);
      setGachaResults(results);
      setIsPulling(false);
    }, 800);
  };

  const handleEnhance = (type: 'normal'|'lucky'|'premium') => {
    if (!enhanceTarget || isEnhancing) return;
    let hasStone = false;
    if (type === 'normal' && stones > 0) { setStones(p => p - 1); hasStone = true; }
    if (type === 'lucky' && luckyStones > 0) { setLuckyStones(p => p - 1); hasStone = true; }
    if (type === 'premium' && premiumStones > 0) { setPremiumStones(p => p - 1); hasStone = true; }
    
    if (!hasStone) return showLog('강화석이 부족합니다!');
    const targetData = collection[enhanceTarget];
    if (targetData.level >= MAX_LEVEL) {
      if (type === 'normal') setStones(p => p + 1);
      if (type === 'lucky') setLuckyStones(p => p + 1);
      if (type === 'premium') setPremiumStones(p => p + 1);
      return showLog('이미 최고 레벨입니다!');
    }

    setIsEnhancing(true);
    setEnhanceResult(null);

    const baseProb = ENHANCE_PROBS[targetData.level];
    const bonus = type === 'lucky' ? 3 : type === 'premium' ? 5 : 0;
    const finalProb = Math.min(100, baseProb + bonus);

    setTimeout(() => {
      if (Math.random() * 100 <= finalProb) {
        setCollection(p => ({ ...p, [enhanceTarget]: { ...targetData, level: targetData.level + 1 } }));
        setEnhanceResult('success');
      } else {
        setEnhanceResult('fail');
      }
      setIsEnhancing(false);
      setTimeout(() => setEnhanceResult(null), 2500);
    }, 1500);
  };

  const filteredStreamers = streamers.filter(s => guildFilter === '전체' || s.guildName === guildFilter);
  const unlockedCount = Object.keys(collection).length;

  return (
    <div className="h-full flex flex-col relative pb-10">
      <style>{`
        @keyframes tension {
          0% { transform: scale(1) translate(0,0); filter: brightness(1); }
          25% { transform: scale(1.02) translate(1px,-1px); filter: brightness(1.2); }
          50% { transform: scale(1.04) translate(-2px,1px); filter: brightness(1.5); }
          75% { transform: scale(1.06) translate(2px,-2px); filter: brightness(1.8); }
          100% { transform: scale(1.08) translate(1px,-1px); filter: brightness(2.5); }
        }
        .animate-tension { animation: tension 1.5s ease-in-out forwards; }
        .stat-box { display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 6px 12px; border-radius: 8px; border: 1px solid #334155; }
        .stat-label { color: #94a3b8; font-weight: 700; font-size: 0.75rem; }
        .stat-value { font-weight: 900; font-size: 0.85rem; }
      `}</style>

      {logMsg && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-8 py-4 rounded-full font-black text-sm">{logMsg}</div>}
      
      {/* 🃏 포켓몬 카드 스타일 도감 상세 팝업 (모든 스탯 연동) */}
      {selectedCard && collection[selectedCard.id] && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto custom-scrollbar py-10" onClick={() => setSelectedCard(null)}>
          <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl border-4 border-slate-600 shadow-2xl p-6 m-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedCard(null)} className="absolute top-4 right-4 text-white/50 hover:text-white font-black text-xl">✕</button>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-600 px-3 py-1 rounded-lg font-black text-white text-sm shadow-md">
                +{collection[selectedCard.id].level}강
              </div>
              <div className="text-yellow-400 text-sm tracking-widest drop-shadow-md">
                {getStars(collection[selectedCard.id].pullCount)}
              </div>
            </div>
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-blue-400 overflow-hidden mb-4 shadow-[0_0_20px_rgba(59,130,246,0.5)] bg-slate-800">
                <img src={`https://profile.img.afreecatv.com/LOGO/${selectedCard.id.substring(0, 2).toLowerCase()}/${selectedCard.id}/${selectedCard.id}.jpg`} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-bold text-slate-400 mb-1">{selectedCard.guildName}</span>
              <h2 className="text-2xl font-black text-white">{selectedCard.name}</h2>
            </div>
            
            <div className="bg-black/40 rounded-xl p-4 border border-slate-700 w-full mt-2">
              <h4 className="text-xs font-black text-slate-500 mb-3 text-center">⚔️ 인게임 종합 스탯 ⚔️</h4>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="stat-box"><span className="stat-label">직업</span><span className="stat-value text-white">{selectedCard.job}</span></div>
                <div className="stat-box"><span className="stat-label">레벨</span><span className="stat-value text-blue-400">Lv.{selectedCard.level > 0 ? selectedCard.level : '?'}</span></div>
                <div className="stat-box"><span className="stat-label">무기 강화</span><span className="stat-value text-orange-400">+{selectedCard.weapon}</span></div>
                <div className="stat-box"><span className="stat-label">방어구 강화</span><span className="stat-value text-indigo-400">+{selectedCard.armor}</span></div>
                <div className="stat-box"><span className="stat-label">내공</span><span className="stat-value text-cyan-400">{selectedCard.innerPower}</span></div>
                <div className="stat-box"><span className="stat-label">체력</span><span className="stat-value text-emerald-400">{selectedCard.hp > 0 ? selectedCard.hp.toLocaleString() : '?'}</span></div>
                <div className="stat-box"><span className="stat-label">공격속도</span><span className="stat-value text-yellow-300">{selectedCard.atkSpeed}</span></div>
                <div className="stat-box"><span className="stat-label">회피율</span><span className="stat-value text-teal-300">{selectedCard.evasion}</span></div>
                <div className="stat-box"><span className="stat-label">운</span><span className="stat-value text-pink-400">{selectedCard.luck}</span></div>
                <div className="stat-box border-red-900/50 bg-red-900/20"><span className="stat-label text-red-300">서버 전투력</span><span className="stat-value text-red-400">{selectedCard.power > 0 ? selectedCard.power.toLocaleString() : '?'}</span></div>
              </div>
              
              <div className="h-px w-full bg-slate-700 my-4"></div>

              <h4 className="text-xs font-black text-slate-500 mb-3 text-center">🎴 도감 컬렉션 정보 🎴</h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="stat-box"><span className="stat-label">다음 성급 조각</span><span className="stat-value text-emerald-400">{getNextStarReq(collection[selectedCard.id].pullCount)}</span></div>
                <div className="stat-box border-purple-900/50 bg-purple-900/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]"><span className="stat-label text-purple-300">카드 전투력</span><span className="stat-value text-purple-400">{(1000 + (collection[selectedCard.id].level * 150) + (getStarCount(collection[selectedCard.id].pullCount) * 300)).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 bg-[#1e1e1e] p-6 rounded-2xl flex flex-col xl:flex-row justify-between items-center gap-4 text-white">
        <h1 className="text-2xl font-black">🃏 스트리머 덱 메이커</h1>
        <div className="flex items-center gap-3 w-full xl:w-auto flex-wrap sm:flex-nowrap">
          <div className="flex flex-wrap gap-4 bg-black/30 px-5 py-3 rounded-xl border border-gray-700 font-black text-sm justify-center flex-1">
            <span className="text-amber-500">💰 {points.toLocaleString()}</span>
            <span className="text-blue-500">🎫 {tickets}</span>
            <span className="text-purple-500">💎 {stones}</span>
            <span className="text-emerald-500">🍀 {luckyStones}</span>
            <span className="text-rose-500">🌟 {premiumStones}</span>
          </div>
          <button onClick={handleAttendance} disabled={isAttended} className="shrink-0 w-full sm:w-auto px-6 py-3 rounded-xl font-black text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-400">
            {isAttended ? '출석 완료' : '📅 출석체크'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 shrink-0 overflow-x-auto">
        <button onClick={() => { setActiveTab('shop'); setGachaResults(null); setIsPulling(false); setEnhanceTarget(null); }} className={`px-5 py-3 rounded-xl font-black text-sm whitespace-nowrap ${activeTab === 'shop' ? 'bg-white text-black' : 'bg-[#1e1e1e] text-slate-500'}`}>🛒 포인트 상점</button>
        <button onClick={() => { setActiveTab('gacha'); setGachaResults(null); setIsPulling(false); setEnhanceTarget(null); }} className={`px-5 py-3 rounded-xl font-black text-sm whitespace-nowrap ${activeTab === 'gacha' ? 'bg-white text-black' : 'bg-[#1e1e1e] text-slate-500'}`}>🎒 가챠 (뽑기)</button>
        <button onClick={() => { setActiveTab('enhance'); setGachaResults(null); setIsPulling(false); setEnhanceTarget(null); }} className={`px-5 py-3 rounded-xl font-black text-sm whitespace-nowrap ${activeTab === 'enhance' ? 'bg-white text-black' : 'bg-[#1e1e1e] text-slate-500'}`}>⚒️ 전용 강화소</button>
        <button onClick={() => { setActiveTab('collection'); setGachaResults(null); setIsPulling(false); setEnhanceTarget(null); }} className={`px-5 py-3 rounded-xl font-black text-sm whitespace-nowrap ${activeTab === 'collection' ? 'bg-white text-black' : 'bg-[#1e1e1e] text-slate-500'}`}>🃏 스트리머 도감</button>
      </div>

      <div className="flex-1 bg-[#1e1e1e] rounded-2xl p-6 overflow-y-auto">
        {activeTab === 'shop' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 border border-gray-700 bg-gray-800 rounded-xl text-center text-white flex flex-col">
              <div className="text-4xl mb-2">🎫</div><h3 className="font-black mb-4">뽑기권</h3>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => handleBuy('ticket', 1, 1000)} className="flex-1 py-2 bg-blue-600 rounded-lg font-black text-xs">1개 (1,000P)</button>
                <button onClick={() => handleBuy('ticket', 10, 1000)} className="flex-1 py-2 bg-blue-700 rounded-lg font-black text-xs">10개 (10,000P)</button>
              </div>
            </div>
            <div className="p-5 border border-gray-700 bg-gray-800 rounded-xl text-center text-white flex flex-col">
              <div className="text-4xl mb-2">💎</div><h3 className="font-black mb-4">일반 강화석</h3>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => handleBuy('stone', 1, 100)} className="flex-1 py-2 bg-purple-600 rounded-lg font-black text-xs">1개 (100P)</button>
                <button onClick={() => handleBuy('stone', 10, 100)} className="flex-1 py-2 bg-purple-700 rounded-lg font-black text-xs">10개 (1,000P)</button>
              </div>
            </div>
            <div className="p-5 border border-gray-700 bg-gray-800 rounded-xl text-center text-white flex flex-col">
              <div className="text-4xl mb-2">🍀</div><h3 className="font-black mb-4">행운 강화석 (+3%)</h3>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => handleBuy('lucky', 1, 500)} className="flex-1 py-2 bg-emerald-600 rounded-lg font-black text-xs">1개 (500P)</button>
                <button onClick={() => handleBuy('lucky', 10, 500)} className="flex-1 py-2 bg-emerald-700 rounded-lg font-black text-xs">10개 (5,000P)</button>
              </div>
            </div>
            <div className="p-5 border border-gray-700 bg-gray-800 rounded-xl text-center text-white flex flex-col">
              <div className="text-4xl mb-2">🌟</div><h3 className="font-black mb-4">고급 행운석 (+5%)</h3>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => handleBuy('premium', 1, 1000)} className="flex-1 py-2 bg-rose-600 rounded-lg font-black text-xs">1개 (1,000P)</button>
                <button onClick={() => handleBuy('premium', 10, 1000)} className="flex-1 py-2 bg-rose-700 rounded-lg font-black text-xs">10개 (10,000P)</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gacha' && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex-1 w-full flex items-center justify-center min-h-[300px] mb-8">
              {gachaResults ? (
                <div className={`grid gap-3 w-full max-w-4xl ${gachaResults.length > 1 ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-1 max-w-xs'}`}>
                  {gachaResults.map((res, i) => (
                    <div key={i} className={`rounded-2xl border-2 p-4 flex flex-col items-center relative ${res.newStars ? 'bg-amber-50 border-amber-300 dark:bg-amber-900/40 dark:border-amber-500' : 'bg-gray-800 border-gray-500'}`}>
                      {res.newStars && <div className="absolute -top-4 text-2xl">🌟</div>}
                      <img src={`https://profile.img.afreecatv.com/LOGO/${res.streamer.id.substring(0, 2).toLowerCase()}/${res.streamer.id}/${res.streamer.id}.jpg`} className="w-16 h-16 rounded-full mb-2 object-cover"/>
                      <span className={`text-[10px] ${res.newStars ? 'text-amber-700 dark:text-amber-200' : 'text-gray-400'}`}>{res.streamer.guildName}</span>
                      <h3 className={`text-sm font-black ${res.newStars ? 'text-amber-900 dark:text-amber-100' : 'text-white'}`}>{res.streamer.name}</h3>
                      <div className="text-[10px] text-yellow-500 mt-1">{getStars(collection[res.streamer.id]?.pullCount || 1)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-6xl">{isPulling ? '🌀' : '🃏'}</div>
              )}
            </div>
            <div className="flex gap-4">
              <button onClick={() => handlePull(false)} disabled={isPulling} className="px-8 py-3 rounded-full bg-white text-black font-black">1회 뽑기</button>
              <button onClick={() => handlePull(true)} disabled={isPulling || tickets === 0} className="px-8 py-3 rounded-full bg-blue-600 text-white font-black">{tickets >= 10 ? '10회 연속 뽑기' : `${tickets}회 모두 뽑기`}</button>
            </div>
          </div>
        )}

        {activeTab === 'enhance' && (
          <div className="flex flex-col md:flex-row h-full gap-8">
            <div className="w-full md:w-1/3 bg-[#121212] rounded-2xl p-4 border border-gray-800 overflow-y-auto h-[300px] md:h-full">
              <h3 className="font-black text-gray-300 mb-4">강화할 카드 선택</h3>
              <div className="grid grid-cols-2 gap-3">
                {streamers.filter(s => collection[s.id]).map(s => (
                  <button key={s.id} onClick={() => !isEnhancing && setEnhanceTarget(s.id)} className={`p-3 rounded-xl border flex flex-col items-center gap-2 ${enhanceTarget === s.id ? 'bg-purple-900/40 border-purple-400' : 'bg-black/40 border-gray-700'}`}>
                    <img src={`https://profile.img.afreecatv.com/LOGO/${s.id.substring(0, 2).toLowerCase()}/${s.id}/${s.id}.jpg`} className="w-12 h-12 rounded-full object-cover"/>
                    <span className="text-xs font-black truncate text-white w-full text-center">{s.name}</span>
                    <span className="text-[10px] font-bold text-purple-400">+{collection[s.id].level}강</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0f] rounded-2xl p-6 border-2 border-gray-800">
              {enhanceTarget ? (
                <div className="flex flex-col items-center w-full max-w-sm">
                  <div className="text-purple-400 font-black mb-6 text-lg">⚒️ 스트리머 모루 ⚒️</div>
                  <div className={`relative w-40 h-56 bg-gray-800 rounded-2xl border-2 flex flex-col items-center justify-center ${isEnhancing ? 'animate-tension border-white' : 'border-gray-500'} ${enhanceResult === 'success' ? 'scale-110 border-yellow-400 bg-amber-900' : ''} ${enhanceResult === 'fail' ? 'grayscale opacity-60 border-gray-700' : ''}`}>
                    <img src={`https://profile.img.afreecatv.com/LOGO/${enhanceTarget.substring(0, 2).toLowerCase()}/${enhanceTarget}/${enhanceTarget}.jpg`} className="w-20 h-20 rounded-full border-2 border-white/50 mb-4 object-cover" />
                    <h3 className="text-white font-black text-lg">{streamers.find(s => s.id === enhanceTarget)?.name}</h3>
                    <div className="font-black text-xl mt-2 bg-black/50 px-4 py-1 rounded-full text-purple-300">+{collection[enhanceTarget].level}</div>
                  </div>
                  <div className="mt-8 w-full flex flex-col items-center">
                    <p className="text-gray-400 text-xs font-bold mb-3">성공 확률: <span className="text-white font-black">{collection[enhanceTarget].level >= MAX_LEVEL ? 'MAX' : `${ENHANCE_PROBS[collection[enhanceTarget].level]}%`}</span></p>
                    <div className="w-full flex flex-col gap-2">
                      <button onClick={() => handleEnhance('normal')} disabled={isEnhancing || collection[enhanceTarget].level >= MAX_LEVEL} className="w-full py-3 rounded-xl bg-purple-600 text-white font-black text-sm flex justify-between px-4 disabled:opacity-40"><span>💎 일반 (보유: {stones})</span><span>기본 확률</span></button>
                      <button onClick={() => handleEnhance('lucky')} disabled={isEnhancing || collection[enhanceTarget].level >= MAX_LEVEL} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-black text-sm flex justify-between px-4 disabled:opacity-40"><span>🍀 행운 (보유: {luckyStones})</span><span>+3%p</span></button>
                      <button onClick={() => handleEnhance('premium')} disabled={isEnhancing || collection[enhanceTarget].level >= MAX_LEVEL} className="w-full py-3 rounded-xl bg-rose-600 text-white font-black text-sm flex justify-between px-4 disabled:opacity-40"><span>🌟 고급 행운 (보유: {premiumStones})</span><span>+5%p</span></button>
                    </div>
                  </div>
                </div>
              ) : <div className="text-gray-500 font-bold">좌측에서 강화할 카드를 선택해주세요.</div>}
            </div>
          </div>
        )}

        {activeTab === 'collection' && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-white">컬렉션 <span className="text-blue-500 text-sm">({unlockedCount}/{streamers.length})</span></h2>
              <select value={guildFilter} onChange={e => setGuildFilter(e.target.value)} className="px-4 py-2 rounded-xl bg-[#121212] text-white text-sm font-bold border border-gray-700">
                {GUILDS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-10">
              {filteredStreamers.map(streamer => {
                const data = collection[streamer.id];
                const isUnlocked = !!data;
                const firstTwo = streamer.id.substring(0, 2).toLowerCase();
                return (
                  <div key={streamer.id} onClick={() => isUnlocked && setSelectedCard(streamer)} className={`flex flex-col items-center p-4 rounded-2xl border ${isUnlocked ? 'bg-[#121212] border-blue-900/50 cursor-pointer hover:border-blue-500 transition-all' : 'bg-black/40 border-gray-800'}`}>
                    <div className="relative mb-3 w-20 h-20 flex items-center justify-center">
                      <img src={`https://profile.img.afreecatv.com/LOGO/${firstTwo}/${streamer.id}/${streamer.id}.jpg`} className={`w-full h-full rounded-full object-cover ${!isUnlocked ? 'filter blur-[5px] grayscale brightness-50' : 'border-[3px] border-blue-400'}`} />
                      {!isUnlocked && <span className="absolute z-10 text-2xl font-black text-white/80">???</span>}
                      {isUnlocked && data.level > 0 && <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white text-xs font-black px-2 py-0.5 rounded-lg border-2 border-black">+{data.level}</div>}
                    </div>
                    {isUnlocked ? (
                      <>
                        <div className="text-[10px] font-black text-yellow-400 mb-1">{getStars(data.pullCount)}</div>
                        <span className="text-[10px] font-bold text-gray-500 mb-1">{streamer.guildName}</span>
                        <span className="text-sm font-black text-white mb-2">{streamer.name}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold text-gray-400 mb-1">???</span>
                        <span className="text-sm font-black text-gray-400 mb-2">미획득</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}