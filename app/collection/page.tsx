'use client';
import React, { useState, useEffect } from 'react';

type Streamer = { id: string; name: string; guildName: string; };
type UnlockedData = { level: number; pullCount: number; };
type CollectionState = Record<string, UnlockedData>;

const GUILDS = ['전체', '성태 길드', '만식 길드', '오아 길드', '수피 길드', '사장 길드', '도현 길드'];
const ENHANCE_PROBS = [100, 81, 64, 50, 26, 15, 10, 8, 7, 6, 5, 4, 3];
const MAX_LEVEL = 13;

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
  const [activeTab, setActiveTab] = useState<'shop' | 'gacha' | 'enhance' | 'collection'>('shop');
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
  const [enhanceResult, setEnhanceResult] = useState<'success' | 'fail' | null>(null);

  const [guildFilter, setGuildFilter] = useState('전체');
  const [logMsg, setLogMsg] = useState('');

  useEffect(() => {
    const fetchStreamers = async () => {
      try {
        const res = await fetch('/api/status');
        const json = await res.json();
        if (json.success) {
          const list: Streamer[] = [];
          json.data.forEach((g: any) => {
            g.members.forEach((m: any) => list.push({ id: m.id, name: m.name, guildName: g.name }));
          });
          list.sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
          setStreamers(list);
        }
      } catch (e) {
      } finally {
        setIsLoading(false);
      }

      const saved = localStorage.getItem('minigame_data_final');
      if (saved) {
        const data = JSON.parse(saved);
        setPoints(data.points || 0);
        setTickets(data.tickets || 0);
        setStones(data.stones || 0);
        setLuckyStones(data.luckyStones || 0);
        setPremiumStones(data.premiumStones || 0);
        setCollection(data.collection || {});

        const today = new Date().toDateString();
        if (data.lastAttendance !== today) setIsAttended(false);
        else setIsAttended(data.isAttended);
      }
    };
    fetchStreamers();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    localStorage.setItem('minigame_data_final', JSON.stringify({
      points, tickets, stones, luckyStones, premiumStones, collection, isAttended, lastAttendance: new Date().toDateString()
    }));
  }, [points, tickets, stones, luckyStones, premiumStones, collection, isAttended, isLoading]);

  const showLog = (msg: string) => {
    setLogMsg(msg);
    setTimeout(() => setLogMsg(''), 3000);
  };

  const handleAttendance = () => {
    if (isAttended) return;
    const randomPoints = Math.floor(Math.random() * 50001) + 50000;
    setPoints(prev => prev + randomPoints);
    setIsAttended(true);
    showLog(`출석 완료! ${randomPoints.toLocaleString()}P 획득`);
  };

  const handlePull = (isMulti: boolean) => {
    const pullCount = isMulti ? Math.min(tickets, 10) : 1;
    if (tickets < pullCount || tickets === 0) {
      showLog('뽑기권이 부족합니다!');
      return;
    }

    setTickets(prev => prev - pullCount);
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

        if (currentStar > oldStar) {
          newStars = currentStar;
        }
      } else {
        tempCollection[randomStreamer.id] = { level: 0, pullCount: 1 };
      }
      results.push({ streamer: randomStreamer, isDuplicate, newStars: newStars > 1 ? newStars : undefined });
    }

    setTimeout(() => {
      setCollection(tempCollection);
      setGachaResults(results);
      setIsPulling(false);
    }, 1200);
  };

  const handleEnhance = (stoneType: 'normal' | 'lucky' | 'premium') => {
    if (!enhanceTarget || isEnhancing) return;

    let hasStone = false;
    if (stoneType === 'normal' && stones > 0) { setStones(p => p - 1); hasStone = true; }
    if (stoneType === 'lucky' && luckyStones > 0) { setLuckyStones(p => p - 1); hasStone = true; }
    if (stoneType === 'premium' && premiumStones > 0) { setPremiumStones(p => p - 1); hasStone = true; }

    if (!hasStone) {
      showLog('선택한 강화석이 부족합니다!');
      return;
    }

    const targetData = collection[enhanceTarget];

    if (targetData.level >= MAX_LEVEL) {
      showLog(`이미 최고 레벨(${MAX_LEVEL}강) 입니다!`);
      if (stoneType === 'normal') setStones(p => p + 1);
      if (stoneType === 'lucky') setLuckyStones(p => p + 1);
      if (stoneType === 'premium') setPremiumStones(p => p + 1);
      return;
    }

    setIsEnhancing(true);
    setEnhanceResult(null);

    const baseProb = ENHANCE_PROBS[targetData.level];
    let bonus = 0;
    if (stoneType === 'lucky') bonus = 3;
    if (stoneType === 'premium') bonus = 5;
    const finalProb = Math.min(100, baseProb + bonus);

    setTimeout(() => {
      const roll = Math.random() * 100;
      if (roll <= finalProb) {
        setCollection(prev => ({
          ...prev,
          [enhanceTarget]: { ...targetData, level: targetData.level + 1 }
        }));
        setEnhanceResult('success');
        showLog(`SUCCESS! +${targetData.level + 1}강 성공!`);
      } else {
        setEnhanceResult('fail');
        showLog(`FAILED... 강화 실패. (등급 유지)`);
      }

      setIsEnhancing(false);
      setTimeout(() => setEnhanceResult(null), 2000);
    }, 1500);
  };

  const filteredStreamers = streamers.filter(s => guildFilter === '전체' || s.guildName === guildFilter);
  const unlockedCount = Object.keys(collection).length;

  return (
    <div className="h-full flex flex-col relative pb-10">

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        
        @keyframes tension {
          0% { transform: scale(1) translate(0, 0); filter: brightness(1); }
          25% { transform: scale(1.02) translate(1px, -1px); filter: brightness(1.2); }
          50% { transform: scale(1.04) translate(-2px, 1px); filter: brightness(1.5); }
          75% { transform: scale(1.06) translate(2px, -2px); filter: brightness(1.8); }
          100% { transform: scale(1.08) translate(1px, -1px); filter: brightness(2.5); }
        }
        .animate-tension {
          animation: tension 1.5s ease-in-out forwards;
        }
      `}</style>

      {logMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-black/90 backdrop-blur-md text-white px-8 py-4 rounded-full font-black text-sm shadow-[0_0_20px_rgba(0,0,0,0.5)] animate-bounce border border-gray-700">
          {logMsg}
        </div>
      )}

      <div className="mb-6 shrink-0 bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">🃏 스트리머 덱 메이커</h1>
          <p className="text-xs font-bold text-slate-500 mt-1">포인트로 뽑고, 13강까지 한계를 돌파하세요!</p>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto flex-wrap xl:flex-nowrap">
          <div className="flex flex-wrap gap-4 bg-slate-50 dark:bg-black/30 px-5 py-3 rounded-xl border border-slate-200 dark:border-gray-700 justify-center flex-1 xl:flex-none">
            <span className="text-sm font-black text-amber-500">💰 {points.toLocaleString()}</span>
            <span className="text-sm font-black text-blue-500">🎫 {tickets}</span>
            <span className="text-sm font-black text-purple-500">💎 {stones}</span>
            <span className="text-sm font-black text-emerald-500">🍀 {luckyStones}</span>
            <span className="text-sm font-black text-rose-500">🌟 {premiumStones}</span>
          </div>

          <button 
            onClick={handleAttendance}
            disabled={isAttended}
            className={`shrink-0 px-6 py-3 w-full xl:w-auto rounded-xl font-black text-sm transition-all ${
              isAttended 
                ? 'bg-slate-200 dark:bg-gray-800 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white shadow-md hover:scale-105'
            }`}
          >
            {isAttended ? '출석 완료' : '📅 출석체크'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 shrink-0 overflow-x-auto custom-scrollbar pb-2">
        {[
          { id: 'shop', name: '🛒 포인트 상점' },
          { id: 'gacha', name: '🎒 가챠 (뽑기)' },
          { id: 'enhance', name: '⚒️ 전용 강화소' },
          { id: 'collection', name: '🃏 스트리머 도감' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setGachaResults(null); setIsPulling(false); setEnhanceTarget(null); }}
            className={`px-5 py-3 rounded-xl font-black text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-md'
                : 'bg-white dark:bg-[#1e1e1e] text-slate-500 border border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800'
              }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm overflow-y-auto custom-scrollbar relative">

        {activeTab === 'shop' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-fade-in">
            <div className="p-5 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 flex flex-col items-center text-center">
              <span className="text-5xl mb-3">🎫</span>
              <h3 className="text-lg font-black mb-1">뽑기권</h3>
              <p className="text-[11px] font-bold text-slate-500 mb-4 flex-1">랜덤 멤버 영입 (조각 누적 시 7성 진화)</p>
              <button onClick={() => { if (points >= 1000) { setPoints(p => p - 1000); setTickets(t => t + 1); showLog('뽑기권 구매!'); } else showLog('포인트 부족!'); }} className="w-full py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-black text-sm">1,000 P</button>
            </div>
            <div className="p-5 rounded-2xl border-2 border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-900/10 flex flex-col items-center text-center">
              <span className="text-5xl mb-3">💎</span>
              <h3 className="text-lg font-black mb-1">일반 강화석</h3>
              <p className="text-[11px] font-bold text-slate-500 mb-4 flex-1">기본 성공 확률로 강화 시도</p>
              <button onClick={() => { if (points >= 100) { setPoints(p => p - 100); setStones(s => s + 1); showLog('강화석 구매!'); } else showLog('포인트 부족!'); }} className="w-full py-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-black text-sm">100 P</button>
            </div>
            <div className="p-5 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 flex flex-col items-center text-center">
              <span className="text-5xl mb-3">🍀</span>
              <h3 className="text-lg font-black mb-1">행운 강화석</h3>
              <p className="text-[11px] font-bold text-slate-500 mb-4 flex-1">기본 확률 + <strong className="text-emerald-500">3%p</strong></p>
              <button onClick={() => { if (points >= 500) { setPoints(p => p - 500); setLuckyStones(s => s + 1); showLog('행운석 구매!'); } else showLog('포인트 부족!'); }} className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm">500 P</button>
            </div>
            <div className="p-5 rounded-2xl border-2 border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 flex flex-col items-center text-center">
              <span className="text-5xl mb-3">🌟</span>
              <h3 className="text-lg font-black mb-1">고급 행운 강화석</h3>
              <p className="text-[11px] font-bold text-slate-500 mb-4 flex-1">기본 확률 + <strong className="text-rose-500">5%p</strong></p>
              <button onClick={() => { if (points >= 1000) { setPoints(p => p - 1000); setPremiumStones(s => s + 1); showLog('고급 행운석 구매!'); } else showLog('포인트 부족!'); }} className="w-full py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-black text-sm">1,000 P</button>
            </div>
          </div>
        )}

        {activeTab === 'gacha' && (
          <div className="h-full flex flex-col items-center justify-center animate-fade-in pb-10">
            <div className="flex-1 w-full flex items-center justify-center min-h-[300px] mb-8 relative">
              {gachaResults ? (
                <div className={`grid gap-3 w-full max-w-4xl px-4 animate-fade-in ${gachaResults.length > 1 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5' : 'grid-cols-1 max-w-xs'}`}>
                  {gachaResults.map((res, i) => (
                    <div key={i} className={`rounded-2xl border-2 flex flex-col items-center p-4 shadow-xl ${res.newStars ? 'bg-gradient-to-b from-yellow-100 to-amber-300 border-yellow-400' :
                        res.isDuplicate ? 'bg-gradient-to-b from-slate-200 to-slate-400 dark:from-gray-700 dark:to-gray-900 border-gray-400' :
                          'bg-gradient-to-b from-blue-50 to-blue-200 dark:from-blue-900 dark:to-[#0f172a] border-blue-400'
                      }`}>
                      {res.newStars && <div className="text-2xl animate-bounce absolute -top-4">🌟</div>}
                      <img src={`https://profile.img.afreecatv.com/LOGO/${res.streamer.id.substring(0, 2).toLowerCase()}/${res.streamer.id}/${res.streamer.id}.jpg`} className="w-16 h-16 rounded-full border-2 border-white/50 mb-2 object-cover bg-slate-800" />
                      <span className="text-[10px] font-black opacity-60 mb-0.5">{res.streamer.guildName}</span>
                      <h3 className={`text-sm font-black ${res.isDuplicate ? 'text-slate-800 dark:text-gray-300' : 'text-slate-900 dark:text-white'} mb-1`}>{res.streamer.name}</h3>
                      <div className="text-[9px] font-black text-amber-500 tracking-widest bg-black/10 dark:bg-black/40 px-2 py-0.5 rounded-full">
                        {getStars(collection[res.streamer.id]?.pullCount || 1)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-56 h-72 bg-slate-800 rounded-2xl border-4 border-slate-600 flex items-center justify-center shadow-2xl relative overflow-hidden">
                  {isPulling ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                      <span className="text-6xl animate-spin">🌀</span>
                    </div>
                  ) : <span className="text-7xl opacity-50">🃏</span>}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={() => handlePull(false)} disabled={isPulling} className="px-8 py-3 rounded-full bg-slate-800 dark:bg-white text-white dark:text-black font-black hover:scale-105 transition-transform shadow-lg disabled:opacity-50">
                🎫 1회 뽑기
              </button>
              <button onClick={() => handlePull(true)} disabled={isPulling || tickets === 0} className="px-8 py-3 rounded-full bg-blue-600 text-white font-black hover:scale-105 transition-transform shadow-lg shadow-blue-500/30 disabled:opacity-50">
                🎟️ {tickets >= 10 ? '10회 연속 뽑기' : `${tickets}회 모두 뽑기`}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'enhance' && (
          <div className="animate-fade-in flex flex-col md:flex-row h-full gap-8">
            <div className="w-full md:w-1/2 lg:w-1/3 bg-slate-50 dark:bg-[#121212] rounded-2xl p-4 border border-slate-200 dark:border-gray-800 overflow-y-auto custom-scrollbar h-[300px] md:h-full shrink-0">
              <h3 className="font-black text-slate-700 dark:text-gray-300 mb-4">강화할 카드 선택</h3>
              {unlockedCount === 0 ? (
                <div className="text-center text-sm font-bold text-slate-400 mt-10">보유한 카드가 없습니다.<br />가챠를 먼저 진행해주세요.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3">
                  {streamers.filter(s => collection[s.id]).map(s => (
                    <button
                      key={s.id}
                      onClick={() => !isEnhancing && setEnhanceTarget(s.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${enhanceTarget === s.id
                          ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-400 shadow-md scale-105'
                          : 'bg-white dark:bg-black/40 border-slate-200 dark:border-gray-700 hover:border-purple-300'
                        }`}
                    >
                      <img src={`https://profile.img.afreecatv.com/LOGO/${s.id.substring(0, 2).toLowerCase()}/${s.id}/${s.id}.jpg`} className="w-12 h-12 rounded-full object-cover" />
                      <span className="text-xs font-black truncate w-full text-center">{s.name}</span>
                      <span className="text-[10px] font-bold text-purple-500 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">+{collection[s.id].level}강</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0f] rounded-2xl p-6 relative overflow-hidden border-2 border-slate-800 shadow-inner">
              {enhanceTarget ? (
                <div className="flex flex-col items-center z-10 w-full max-w-sm">
                  <div className="text-purple-400 font-black mb-6 tracking-widest text-lg">⚒️ 스트리머 모루 ⚒️</div>

                  <div className={`relative w-40 h-56 bg-slate-800 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300
                    ${isEnhancing ? 'animate-tension border-white shadow-[0_0_40px_rgba(255,255,255,0.8)]' : 'border-slate-500 shadow-2xl'}
                    ${enhanceResult === 'success' ? 'scale-110 border-yellow-400 shadow-[0_0_60px_rgba(250,204,21,1)] bg-amber-900' : ''}
                    ${enhanceResult === 'fail' ? 'grayscale opacity-60 translate-y-4 border-gray-700' : ''}
                  `}>
                    {isEnhancing && <div className="absolute inset-0 bg-white opacity-20 animate-pulse rounded-2xl"></div>}

                    <img src={`https://profile.img.afreecatv.com/LOGO/${enhanceTarget.substring(0, 2).toLowerCase()}/${enhanceTarget}/${enhanceTarget}.jpg`} className={`w-20 h-20 rounded-full border-2 border-white/50 mb-4 object-cover ${isEnhancing ? 'animate-pulse' : ''}`} />
                    <h3 className="text-white font-black text-lg">{streamers.find(s => s.id === enhanceTarget)?.name}</h3>
                    <div className={`font-black text-xl mt-2 drop-shadow-md bg-black/50 px-4 py-1 rounded-full ${enhanceResult === 'success' ? 'text-yellow-400' : 'text-purple-300'}`}>
                      +{collection[enhanceTarget].level}
                    </div>

                    {enhanceResult === 'success' && <div className="absolute inset-0 flex items-center justify-center z-30"><span className="text-5xl font-black text-yellow-300 drop-shadow-[0_0_10px_rgba(0,0,0,1)] -rotate-12 animate-bounce">SUCCESS!</span></div>}
                    {enhanceResult === 'fail' && <div className="absolute inset-0 flex items-center justify-center z-30"><span className="text-4xl font-black text-gray-400 drop-shadow-[0_0_10px_rgba(0,0,0,1)] rotate-12">FAILED</span></div>}
                  </div>

                  <div className="mt-8 w-full flex flex-col items-center">
                    <p className="text-slate-400 text-xs font-bold mb-3">다음 단계 성공 확률: <span className="text-white font-black">{collection[enhanceTarget].level >= MAX_LEVEL ? 'MAX' : `${ENHANCE_PROBS[collection[enhanceTarget].level]}%`}</span></p>

                    <div className="w-full flex flex-col gap-2">
                      <button onClick={() => handleEnhance('normal')} disabled={isEnhancing || collection[enhanceTarget].level >= MAX_LEVEL} className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-md disabled:opacity-40 flex justify-between px-4">
                        <span>💎 일반 강화석 (보유: {stones})</span>
                        <span className="text-purple-200">기본 확률</span>
                      </button>
                      <button onClick={() => handleEnhance('lucky')} disabled={isEnhancing || collection[enhanceTarget].level >= MAX_LEVEL} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md disabled:opacity-40 flex justify-between px-4">
                        <span>🍀 행운 강화석 (보유: {luckyStones})</span>
                        <span className="text-emerald-200">+3%p</span>
                      </button>
                      <button onClick={() => handleEnhance('premium')} disabled={isEnhancing || collection[enhanceTarget].level >= MAX_LEVEL} className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm shadow-md disabled:opacity-40 flex justify-between px-4">
                        <span>🌟 고급 행운석 (보유: {premiumStones})</span>
                        <span className="text-rose-200">+5%p</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 font-bold flex flex-col items-center gap-4">
                  <span className="text-5xl opacity-50">⚒️</span>
                  <span>좌측에서 강화할 카드를 선택해주세요.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'collection' && (
          <div className="animate-fade-in flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
              <h2 className="text-lg font-black flex items-center gap-2">
                스트리머 컬렉션 <span className="text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full text-sm">달성도: {unlockedCount} / {streamers.length}</span>
              </h2>
              <select
                value={guildFilter}
                onChange={e => setGuildFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-[#121212] text-sm font-bold w-full sm:w-auto"
              >
                {GUILDS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-10">
              {filteredStreamers.map(streamer => {
                const data = collection[streamer.id];
                const isUnlocked = !!data;
                const firstTwo = streamer.id.substring(0, 2).toLowerCase();

                return (
                  <div key={streamer.id} className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all ${isUnlocked
                      ? 'bg-gradient-to-b from-white to-slate-50 dark:from-[#1e1e1e] dark:to-[#121212] border-blue-200 dark:border-blue-900/50 hover:shadow-lg hover:-translate-y-1'
                      : 'bg-slate-100 dark:bg-black/40 border-slate-200 dark:border-gray-800'
                    }`}>

                    <div className="relative mb-3 w-20 h-20 flex items-center justify-center">
                      <img
                        src={`https://profile.img.afreecatv.com/LOGO/${firstTwo}/${streamer.id}/${streamer.id}.jpg`}
                        className={`w-full h-full rounded-full object-cover transition-all ${!isUnlocked ? 'filter blur-[5px] grayscale brightness-50' : 'border-[3px] border-blue-400 shadow-md'}`}
                      />
                      {!isUnlocked && (
                        <span className="absolute z-10 text-2xl font-black text-white/80 drop-shadow-md">???</span>
                      )}

                      {isUnlocked && data.level > 0 && (
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-black px-2 py-0.5 rounded-lg border-2 border-white dark:border-black shadow-sm">
                          +{data.level}
                        </div>
                      )}
                    </div>

                    {isUnlocked ? (
                      <>
                        <div className="text-[10px] sm:text-xs font-black tracking-widest text-yellow-400 mb-1">{getStars(data.pullCount)}</div>
                        <span className="text-[10px] font-bold text-slate-500 mb-1">{streamer.guildName}</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white mb-2">{streamer.name}</span>

                        <div className="w-full bg-slate-100 dark:bg-black/50 rounded-lg py-1.5 px-2 flex flex-col items-center">
                          <span className="text-[9px] text-slate-400 font-bold mb-0.5">직업</span>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-gray-300">현재 직업이 없습니다</span>
                        </div>
                        <div className="mt-3 text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-gray-800 px-2 py-1 rounded">조각: {getNextStarReq(data.pullCount)}</div>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold text-slate-400 mb-1">???</span>
                        <span className="text-sm font-black text-slate-400 mb-2">미획득</span>
                        <div className="w-full bg-slate-200/50 dark:bg-gray-800/50 rounded-lg py-3 px-2 flex flex-col items-center opacity-50">
                          <span className="text-[10px] font-bold text-slate-500">알 수 없음</span>
                        </div>
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