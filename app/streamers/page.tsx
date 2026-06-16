'use client';
import React, { useState, useEffect } from 'react';

// 데이터 타입
type Streamer = {
  name: string;
  id: string;
};

type StreamersData = {
  regular: Streamer[];
  veteran: Streamer[];
};

type TabType = 'regular' | 'veteran';

// 💡 프로필 이미지를 담당하는 개별 컴포넌트 (에러 발생 시 글자로 대체)
const StreamerProfile = ({ streamer, activeTab }: { streamer: Streamer, activeTab: TabType }) => {
  const [imgError, setImgError] = useState(false);
  
  // SOOP 프로필 이미지 URL 공식
  const firstTwo = streamer.id.substring(0, 2).toLowerCase();
  const profileUrl = `https://profile.img.afreecatv.com/LOGO/${firstTwo}/${streamer.id}/${streamer.id}.jpg`;

  if (imgError) {
    // 이미지 로드 실패 시 기존의 첫 글자 동그라미 반환
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeTab === 'veteran' ? 'bg-amber-50 dark:bg-yellow-900/20 group-hover:bg-amber-100 dark:group-hover:bg-yellow-900/40' : 'bg-slate-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30'}`}>
        <span className={`text-xs font-black ${activeTab === 'veteran' ? 'text-amber-600 dark:text-amber-500' : 'text-slate-400 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`}>
          {streamer.name.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <img 
      src={profileUrl} 
      alt={streamer.name} 
      className={`w-8 h-8 rounded-full object-cover shrink-0 border transition-colors ${activeTab === 'veteran' ? 'border-amber-200 dark:border-amber-700/50' : 'border-slate-200 dark:border-gray-600'}`}
      onError={() => setImgError(true)} // 에러 발생 시 imgError를 true로 변경
    />
  );
};

export default function StreamersPage() {
  const [streamers, setStreamers] = useState<StreamersData>({ regular: [], veteran: [] });
  const [activeTab, setActiveTab] = useState<TabType>('regular');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    const fetchStreamers = async () => {
      try {
        const res = await fetch('/api/streamers');
        const json = await res.json();
        
        if (json.success) {
          // 이름(name)을 기준으로 가나다순 정렬
          const sortKorean = (arr: Streamer[]) => [...arr].sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
          
          setStreamers({
            regular: sortKorean(json.data.regular),
            veteran: sortKorean(json.data.veteran)
          });
          setLastUpdated(json.lastUpdated);
        }
      } catch (error) {
        console.error('명단을 불러오는 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreamers();
  }, []);

  // 검색 필터링 (이름으로 검색)
  const currentList = streamers[activeTab];
  const filteredStreamers = currentList.filter(streamer => 
    streamer.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="animate-fade-in pb-10 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">스트리머 명단</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">SOOP 모집 게시글에 댓글로 신청한 스트리머들의 전체 명단입니다.</p>
        </div>
        
        <div className="w-full md:w-72">
          <div className="relative">
            <input
              type="text"
              placeholder="스트리머 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-gray-800 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all placeholder:text-slate-400"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex-1 flex flex-col min-h-0">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-gray-800">
            <button 
              onClick={() => setActiveTab('regular')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'regular' 
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-gray-300'
              }`}
            >
              일반 신청자 ({streamers.regular.length})
            </button>
            <button 
              onClick={() => setActiveTab('veteran')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'veteran' 
                  ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-500 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-gray-300'
              }`}
            >
              퇴역군인 신청자 ({streamers.veteran.length})
            </button>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 mb-1">카드 클릭 시 방송국으로 이동합니다</p>
            {lastUpdated && (
              <p className="text-xs font-medium text-slate-400">
                업데이트: {new Date(lastUpdated).toLocaleTimeString('ko-KR')}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar bg-slate-50/80 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-gray-800 p-5 shadow-inner">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-bold">
              명단을 불러오는 중입니다...
            </div>
          ) : filteredStreamers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredStreamers.map((streamer, index) => (
                <a 
                  key={`${activeTab}-${index}`}
                  href={`https://ch.sooplive.co.kr/${streamer.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl p-3 flex items-center gap-3 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transform hover:-translate-y-0.5 transition-all cursor-pointer group"
                >
                  {/* 💡 새로 추가된 프로필 이미지 컴포넌트 */}
                  <StreamerProfile streamer={streamer} activeTab={activeTab} />
                  
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-sm text-slate-700 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {streamer.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {streamer.id}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-3xl mb-2">🤔</span>
              <p className="font-bold text-sm">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}