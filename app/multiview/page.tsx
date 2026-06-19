'use client';
import React, { useState, useEffect, useRef } from 'react';

type Streamer = {
  name: string;
  id: string;
  guildName: string;
  isLive: boolean;
};

type GuildData = {
  id: string;
  name: string;
  members: any[];
};

const GUILDS_INFO = [
  { id: 'SEONGTAE', name: '성태 길드' },
  { id: 'MANSIK', name: '만식 길드' },
  { id: 'OAH', name: '오아 길드' },
  { id: 'SOOPI', name: '수피 길드' },
  { id: 'CEOPARK', name: '사장 길드' },
  { id: 'DOHYUN', name: '도현 길드' }
];

export default function MultiViewPage() {
  const [allStreamers, setAllStreamers] = useState<Streamer[]>([]);
  const [selectedStreamers, setSelectedStreamers] = useState<Streamer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuildFilter, setSelectedGuildFilter] = useState('전체');
  const [isLoading, setIsLoading] = useState(true);

  // 전체화면을 제어하기 위한 ref 레퍼런스
  const playerAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGuildMembers = async () => {
      try {
        const res = await fetch('/api/status');
        const json = await res.json();
        
        if (json.success) {
          const list: Streamer[] = [];
          json.data.forEach((guild: GuildData) => {
            guild.members.forEach((m) => {
              list.push({
                name: m.name,
                id: m.id,
                guildName: guild.name,
                isLive: m.isLive || false,
              });
            });
          });

          // 💡 정렬 변경: LIVE 중인 스트리머가 맨 위로 오고, 그 안에서는 가나다순으로 정렬
          list.sort((a, b) => {
            if (a.isLive && !b.isLive) return -1;
            if (!a.isLive && b.isLive) return 1;
            return a.name.localeCompare(b.name, 'ko-KR');
          });

          setAllStreamers(list);
        }
      } catch (error) {
        console.error('멤버 정보를 불러오지 못했습니다.', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuildMembers();
  }, []);

  // 브라우저 창 전체화면 토글 기능 구현
  const toggleFullscreen = () => {
    if (!playerAreaRef.current) return;
    
    if (!document.fullscreenElement) {
      playerAreaRef.current.requestFullscreen().catch((err) => {
        alert(`전체화면 모드를 켤 수 없습니다: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // 길드 필터 및 이름 검색 필터링
  const filteredStreamers = allStreamers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
    const matchesGuild = selectedGuildFilter === '전체' || s.guildName === selectedGuildFilter;
    return matchesSearch && matchesGuild;
  });

  // 총 생방송 중인 크루 인원 카운트
  const totalLiveCount = allStreamers.filter(s => s.isLive).length;

  const toggleStreamer = (streamer: Streamer) => {
    const isSelected = selectedStreamers.some(s => s.id === streamer.id);
    if (isSelected) {
      setSelectedStreamers(prev => prev.filter(s => s.id !== streamer.id));
    } else {
      if (selectedStreamers.length >= 9) {
        alert('멀티뷰는 최대 9명까지만 동시 시청이 가능합니다! 📺');
        return;
      }
      setSelectedStreamers(prev => [...prev, streamer]);
    }
  };

  const getGridClasses = (count: number) => {
    if (count === 0) return 'flex items-center justify-center';
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 6) return 'grid-cols-2 lg:grid-cols-3 grid-rows-2';
    return 'grid-cols-3 grid-rows-3';
  };

  return (
    <div className="animate-fade-in h-full flex flex-col md:flex-row gap-6 pb-6">
      
      {/* 👈 좌측 컨트롤 사이드바 패널 */}
      <div className="w-full md:w-72 lg:w-80 flex flex-col shrink-0 h-[450px] md:h-full">
        <div className="mb-4 shrink-0">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            📺 커스텀 멀티뷰
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            LIVE 중 <span className="text-red-500 font-extrabold">{totalLiveCount}명</span> / 선택한 방송 ({selectedStreamers.length}/9)
          </p>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/40 dark:shadow-none flex-1 flex flex-col overflow-hidden min-h-0">
          
          <div className="p-4 border-b border-slate-100 dark:border-gray-800 shrink-0 space-y-2.5">
            {/* 검색바 */}
            <div className="relative">
              <input
                type="text"
                placeholder="스트리머 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-9 rounded-lg bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            </div>

            {/* 길드 선택 드롭다운 필터 */}
            <select
              value={selectedGuildFilter}
              onChange={(e) => setSelectedGuildFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-xs font-black text-slate-700 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="전체">🛡️ 크루 선택: 전체</option>
              {GUILDS_INFO.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
            
            {selectedStreamers.length > 0 && (
              <div className="flex justify-end pt-1">
                <button onClick={() => setSelectedStreamers([])} className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors">
                  🔄 선택 초기화
                </button>
              </div>
            )}
          </div>

          {/* 스트리머 리스트 출력부 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-slate-50/50 dark:bg-black/10">
            {isLoading ? (
              <div className="text-center py-10 text-sm font-bold text-slate-400 animate-pulse">최종 멤버 및 라이브 상태 동기화 중...</div>
            ) : filteredStreamers.length > 0 ? (
              <div className="space-y-1">
                {filteredStreamers.map(streamer => {
                  const isSelected = selectedStreamers.some(s => s.id === streamer.id);
                  const firstTwo = streamer.id.substring(0, 2).toLowerCase();
                  
                  return (
                    <button
                      key={streamer.id}
                      onClick={() => toggleStreamer(streamer)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl transition-all relative ${
                        isSelected 
                          ? 'bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/60 shadow-inner' 
                          : 'hover:bg-white dark:hover:bg-gray-800/60 border border-transparent hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img 
                          src={`https://profile.img.afreecatv.com/LOGO/${firstTwo}/${streamer.id}/${streamer.id}.jpg`}
                          alt={streamer.name}
                          className="w-8 h-8 rounded-full object-cover bg-slate-200 dark:bg-gray-700 shrink-0 border border-slate-100 dark:border-gray-800"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-700 hidden items-center justify-center shrink-0">
                          <span className="text-xs font-black text-slate-500">{streamer.name.charAt(0)}</span>
                        </div>
                        <div className="flex flex-col items-start truncate">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-gray-200'}`}>
                              {streamer.name}
                            </span>
                            {/* 💡 시청자 수 숫자를 지우고 빨간색 글씨로 숨 쉬듯 깜빡이는 LIVE 뱃지 추가 */}
                            {streamer.isLive && (
                              <span className="text-[10px] font-black text-red-500 animate-pulse shrink-0 tracking-tighter bg-red-500/10 dark:bg-red-500/20 px-1.5 py-0.5 rounded">
                                LIVE
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold truncate">{streamer.guildName}</span>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mr-1 shadow-sm">
                          <span className="text-[9px] font-black">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-sm font-bold text-slate-400">일치하는 멤버가 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          👉 우측: 멀티뷰 플레이어 영역 (전체화면 타겟)
          ========================================== */}
      <div 
        ref={playerAreaRef} 
        className="flex-1 bg-[#0c0c0c] rounded-2xl overflow-hidden border border-slate-200 dark:border-gray-800 shadow-xl relative min-h-[400px] md:min-h-0 flex flex-col group/player"
      >
        
        {selectedStreamers.length > 0 && (
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2 opacity-30 group-hover/player:opacity-100 transition-opacity duration-300">
            <button 
              onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-gray-700 hover:bg-black text-white text-xs font-black shadow-md transition-all flex items-center gap-1"
            >
              🖥️ 전체화면 모드
            </button>
          </div>
        )}

        {selectedStreamers.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#0f0f0f]">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-2xl shadow-inner">🎛️</div>
            <h2 className="text-lg font-black text-white mb-2">커스텀 멀티뷰 극장</h2>
            <div className="space-y-1.5 text-xs font-bold text-gray-400 max-w-sm">
              <p className="text-blue-400">🛡️ 길드 현황에 투입된 최종 멤버들만 표시됩니다.</p>
              <p>📺 원하는 방송을 클릭하면 즉시 다중 중계 창이 열립니다.</p>
              <p>🖥️ 영상이 로드되면 우측 상단의 전체화면을 활용해 보세요.</p>
            </div>
          </div>
        ) : (
          <div className={`w-full h-full grid gap-0.5 bg-gray-900 p-0.5 flex-1 ${getGridClasses(selectedStreamers.length)}`}>
            {selectedStreamers.map((streamer) => (
              <div key={streamer.id} className="relative w-full h-full bg-black group/box">
                <div className="absolute top-0 left-0 right-0 p-2.5 bg-gradient-to-b from-black/90 to-transparent opacity-0 group-hover/box:opacity-100 transition-opacity z-10 flex justify-between items-center pointer-events-none">
                  <span className="text-white font-black text-xs drop-shadow-md bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {streamer.name} ({streamer.guildName})
                  </span>
                  <button 
                    onClick={() => toggleStreamer(streamer)}
                    className="w-5 h-5 rounded-md bg-red-500/90 hover:bg-red-500 text-white flex items-center justify-center text-[10px] font-black transition-colors pointer-events-auto"
                  >
                    ✕
                  </button>
                </div>
                <iframe
                  src={`https://play.afreecatv.com/${streamer.id}/embed`}
                  className="w-full h-full border-none"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}