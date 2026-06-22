'use client';
import React, { useState, useEffect } from 'react';

type Streamer = { id: string; name: string; guildName: string; };
type JobType = 'base' | 'hidden';

interface JobClass {
  id: string;
  name: string;
  type: JobType;
  max: number;
  headerColor: string;
  zoneColor: string;
  ringColor: string;
}

const GUILDS = ['성태 길드', '만식 길드', '오아 길드', '수피 길드', '사장 길드', '도현 길드'];

const JOB_PAIRS: { base: JobClass, hidden: JobClass }[] = [
  { 
    base: { id: 'sword', name: '검객', type: 'base', max: 3, headerColor: 'bg-slate-600 text-white', zoneColor: 'bg-slate-700/50', ringColor: 'border-slate-400' },
    hidden: { id: 'h_sword', name: '빙천마제', type: 'hidden', max: 1, headerColor: 'bg-slate-100 text-slate-900', zoneColor: 'bg-slate-200/20', ringColor: 'border-white shadow-[0_0_12px_rgba(255,255,255,0.8)]' }
  },
  { 
    base: { id: 'assassin', name: '자객', type: 'base', max: 3, headerColor: 'bg-slate-600 text-white', zoneColor: 'bg-slate-700/50', ringColor: 'border-slate-400' },
    hidden: { id: 'h_assassin', name: '천살성', type: 'hidden', max: 1, headerColor: 'bg-black text-slate-100', zoneColor: 'bg-black/40', ringColor: 'border-slate-500 shadow-[0_0_12px_rgba(0,0,0,0.6)]' }
  },
  { 
    base: { id: 'spear', name: '창술사', type: 'base', max: 3, headerColor: 'bg-slate-600 text-white', zoneColor: 'bg-slate-700/50', ringColor: 'border-slate-400' },
    hidden: { id: 'h_spear', name: '나타태자', type: 'hidden', max: 1, headerColor: 'bg-red-600 text-white', zoneColor: 'bg-red-900/20', ringColor: 'border-red-400 shadow-[0_0_12px_rgba(220,38,38,0.8)]' }
  },
  { 
    base: { id: 'archer', name: '궁사', type: 'base', max: 3, headerColor: 'bg-slate-600 text-white', zoneColor: 'bg-slate-700/50', ringColor: 'border-slate-400' },
    hidden: { id: 'h_archer', name: '염라귀궁', type: 'hidden', max: 1, headerColor: 'bg-purple-600 text-white', zoneColor: 'bg-purple-900/20', ringColor: 'border-purple-400 shadow-[0_0_12px_rgba(147,51,234,0.8)]' }
  },
  { 
    base: { id: 'taoist', name: '도사', type: 'base', max: 3, headerColor: 'bg-slate-600 text-white', zoneColor: 'bg-slate-700/50', ringColor: 'border-slate-400' },
    hidden: { id: 'h_taoist', name: '뇌신', type: 'hidden', max: 1, headerColor: 'bg-sky-400 text-white', zoneColor: 'bg-sky-900/20', ringColor: 'border-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.8)]' }
  }
];

export default function JobMakerPage() {
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<string>('성태 길드');
  const [assignments, setAssignments] = useState<Record<string, Streamer[]>>({});
  const [logMsg, setLogMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  const [draggedStreamer, setDraggedStreamer] = useState<{ streamer: Streamer, source: string } | null>(null);

  useEffect(() => {
    const fetchStreamers = async () => {
      try {
        const res = await fetch('/api/status');
        const json = await res.json();
        if (json.success) {
          const list: Streamer[] = [];
          json.data.forEach((g: any) => g.members.forEach((m: any) => list.push({ id: m.id, name: m.name, guildName: g.name })));
          setStreamers(list);
        }
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchStreamers();
  }, []);

  useEffect(() => { setAssignments({}); }, [selectedGuild]);

  const showLog = (msg: string) => {
    setLogMsg(msg);
    setTimeout(() => setLogMsg(''), 3000);
  };

  const getGuildMembers = () => streamers.filter(s => s.guildName === selectedGuild);

  const getUnassignedMembers = () => {
    const allAssignedIds = Object.values(assignments).flat().map(s => s.id);
    return getGuildMembers().filter(s => !allAssignedIds.includes(s.id));
  };

  const onDragStart = (e: React.DragEvent, streamer: Streamer, source: string) => {
    setDraggedStreamer({ streamer, source });
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, targetJobId: string) => {
    e.preventDefault();
    if (!draggedStreamer) return;

    const { streamer, source } = draggedStreamer;
    if (source === targetJobId) return;

    const targetJob = [...JOB_PAIRS.map(p => p.base), ...JOB_PAIRS.map(p => p.hidden)].find(j => j.id === targetJobId);
    
    if (targetJobId !== 'pool' && targetJob) {
      const currentAssigned = assignments[targetJobId] || [];
      if (currentAssigned.length >= targetJob.max) {
        showLog(`❌ ${targetJob.name} 직업은 최대 ${targetJob.max}명까지만 가능합니다.`);
        setDraggedStreamer(null);
        return;
      }
    }

    setAssignments(prev => {
      const next = { ...prev };
      if (source !== 'pool' && next[source]) {
        next[source] = next[source].filter(s => s.id !== streamer.id);
      }
      if (targetJobId !== 'pool') {
        const targetArray = next[targetJobId] ? [...next[targetJobId]] : [];
        if (!targetArray.some(s => s.id === streamer.id)) targetArray.push(streamer);
        next[targetJobId] = targetArray;
      }
      return next;
    });

    setDraggedStreamer(null);
  };

  const removeFromJob = (jobId: string, streamerId: string) => {
    setAssignments(prev => {
      const next = { ...prev };
      if (next[jobId]) next[jobId] = next[jobId].filter(s => s.id !== streamerId);
      return next;
    });
  };

  const handleDownloadImage = async () => {
    setIsCapturing(true);
    showLog('📸 이미지를 생성하는 중입니다...');
    
    try {
      if (!document.getElementById('html2canvas-script')) {
        const script = document.createElement('script');
        script.id = 'html2canvas-script';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }
      
      const element = document.getElementById('roster-board');
      if (!element) throw new Error('캡처 대상을 찾을 수 없습니다.');
      
      // 💡 옵션 보강: allowTaint, logging 등 캡처 안정성 강화
      const canvas = await (window as any).html2canvas(element, {
        backgroundColor: '#1e293b',
        scale: 2, 
        useCORS: true, 
        allowTaint: true
      });
      
      const link = document.createElement('a');
      link.download = `총겜동_${selectedGuild}_로스터.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      showLog('✅ 이미지가 성공적으로 저장되었습니다!');
    } catch (err) {
      console.error(err);
      showLog('❌ 이미지 저장에 실패했습니다. (CORS 권한 문제일 수 있습니다)');
    } finally {
      setIsCapturing(false);
    }
  };

  if (isLoading) return <div className="h-full flex items-center justify-center text-white font-black text-xl">데이터를 불러오는 중...</div>;

  return (
    <div className="h-full flex flex-col relative pb-4 gap-4">
      {logMsg && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-blue-500 text-white px-8 py-4 rounded-full font-black text-sm shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-fade-in">{logMsg}</div>}

      <div className="bg-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 text-white border border-slate-700 shadow-md shrink-0">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">⚔️ 길드 직업 로스터 메이커</h1>
          <p className="text-[11px] font-bold text-slate-300 mt-1">드래그해서 로스터를 짜고, 이미지로 저장해 방송국에 공유해보세요!</p>
        </div>
        <div className="flex gap-2 items-center">
          <select 
            value={selectedGuild} 
            onChange={e => setSelectedGuild(e.target.value)} 
            className="px-4 py-2.5 rounded-lg bg-slate-700 text-white text-xs font-black border border-slate-500 focus:border-blue-400 outline-none cursor-pointer shadow-sm"
          >
            {GUILDS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          
          <button 
            onClick={handleDownloadImage} 
            disabled={isCapturing}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-colors shadow-md flex items-center gap-1 disabled:opacity-50"
          >
            {isCapturing ? '⏳ 캡처 중...' : '📸 이미지 저장'}
          </button>
          
          <button onClick={() => setAssignments({})} className="px-4 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-black text-xs transition-colors border border-slate-500 shadow-md">
            초기화
          </button>
        </div>
      </div>

      <div id="roster-board" className="bg-slate-800 rounded-xl border border-slate-600 flex flex-col overflow-hidden shadow-xl shrink-0 p-1">
        <div className="px-5 py-3 bg-slate-800 flex justify-between items-center rounded-t-xl border-b border-slate-700">
          <h2 className="text-lg font-black text-white">🏆 {selectedGuild} 로스터 예측</h2>
          <span className="text-[10px] font-bold text-slate-400">총겜동 내수서버 시뮬레이터</span>
        </div>

        <div className="grid grid-cols-5 border-b border-slate-600 divide-x divide-slate-600">
          {JOB_PAIRS.map(pair => (
            <div key={pair.base.id} className="flex flex-col">
              <div className={`text-center py-2 ${pair.base.headerColor} border-b border-slate-600`}>
                <span className="text-[13px] font-black">{pair.base.name} <span className="opacity-70 font-mono text-[11px]">({(assignments[pair.base.id] || []).length}/{pair.base.max})</span></span>
              </div>
              <div 
                className={`flex-1 p-3 min-h-[140px] flex flex-wrap content-start gap-2 justify-center transition-colors ${pair.base.zoneColor}`}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, pair.base.id)}
              >
                {(assignments[pair.base.id] || []).map(streamer => {
                  const firstTwo = streamer.id.substring(0, 2).toLowerCase();
                  return (
                    <div key={streamer.id} draggable onDragStart={(e) => onDragStart(e, streamer, pair.base.id)} onClick={() => removeFromJob(pair.base.id, streamer.id)} className="relative group cursor-grab active:cursor-grabbing flex flex-col items-center w-16 hover:-translate-y-1 transition-transform">
                      {/* 💡 crossOrigin="anonymous" 속성 추가! */}
                      <img crossOrigin="anonymous" src={`https://profile.img.afreecatv.com/LOGO/${firstTwo}/${streamer.id}/${streamer.id}.jpg`} className={`w-14 h-14 rounded-full object-cover border-2 ${pair.base.ringColor} shadow-md bg-slate-800`} />
                      <div className="absolute top-0 w-14 h-14 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-[10px] font-black">빼기</span></div>
                      <span className="mt-1.5 text-[11px] font-black text-white bg-slate-900/80 px-2 py-0.5 rounded shadow-sm w-full text-center truncate">{streamer.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 divide-x divide-slate-600">
          {JOB_PAIRS.map(pair => (
            <div key={pair.hidden.id} className="flex flex-col">
              <div className={`text-center py-2 ${pair.hidden.headerColor}`}>
                <span className="text-[12px] font-black">{pair.hidden.name} <span className="opacity-80 font-mono text-[10px]">({(assignments[pair.hidden.id] || []).length}/{pair.hidden.max})</span></span>
              </div>
              <div 
                className={`flex-1 p-3 min-h-[140px] flex flex-wrap content-center gap-2 justify-center transition-colors ${pair.hidden.zoneColor}`}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, pair.hidden.id)}
              >
                {(assignments[pair.hidden.id] || []).map(streamer => {
                  const firstTwo = streamer.id.substring(0, 2).toLowerCase();
                  return (
                    <div key={streamer.id} draggable onDragStart={(e) => onDragStart(e, streamer, pair.hidden.id)} onClick={() => removeFromJob(pair.hidden.id, streamer.id)} className="relative group cursor-grab active:cursor-grabbing flex flex-col items-center w-20 hover:-translate-y-1 transition-transform">
                      {/* 💡 crossOrigin="anonymous" 속성 추가! */}
                      <img crossOrigin="anonymous" src={`https://profile.img.afreecatv.com/LOGO/${firstTwo}/${streamer.id}/${streamer.id}.jpg`} className={`w-16 h-16 rounded-full object-cover border-[3px] ${pair.hidden.ringColor} bg-slate-800`} />
                      <div className="absolute top-0 w-16 h-16 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-[11px] font-black">빼기</span></div>
                      <span className="mt-1.5 text-[12px] font-black text-white bg-black px-2.5 py-0.5 rounded shadow-sm border border-current w-full text-center truncate" style={{ borderColor: 'inherit' }}>{streamer.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div 
        className="bg-slate-800 rounded-xl border border-slate-600 flex flex-col flex-1 min-h-[110px] shadow-lg overflow-hidden"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, 'pool')}
      >
        <div className="px-5 py-2 border-b border-slate-600 bg-slate-700 flex justify-between items-center shrink-0">
          <span className="text-[13px] font-black text-white flex items-center gap-2">👇 남은 길드원 목록 (드래그해서 위로 올리세요)</span>
          <span className="text-[11px] font-bold text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded-full">{getUnassignedMembers().length}명 대기중</span>
        </div>
        
        <div className="p-3 flex-1 overflow-y-auto custom-scrollbar flex flex-wrap content-start gap-2 bg-slate-900/40">
          {getUnassignedMembers().length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-sm">
              ✨ 모든 멤버 배치가 완료되었습니다! 📸 이미지로 저장해보세요.
            </div>
          ) : (
            getUnassignedMembers().map(streamer => {
              const firstTwo = streamer.id.substring(0, 2).toLowerCase();
              return (
                <div 
                  key={streamer.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, streamer, 'pool')}
                  className="w-14 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform p-1 rounded hover:bg-slate-700"
                >
                  {/* 💡 crossOrigin="anonymous" 속성 추가! */}
                  <img crossOrigin="anonymous" src={`https://profile.img.afreecatv.com/LOGO/${firstTwo}/${streamer.id}/${streamer.id}.jpg`} className="w-10 h-10 rounded-full object-cover pointer-events-none border border-slate-500 bg-slate-800" />
                  <span className="text-[10px] font-bold text-slate-300 w-full text-center truncate pointer-events-none">{streamer.name}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
