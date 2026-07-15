'use client';
import React, { useState, useEffect } from 'react';

// 데이터 타입
type Streamer = {
  name: string;
  id: string;
};

// 💡 1. 1차 합격자 데이터 타입 추가
type StreamersData = {
  firstRound: Streamer[];
  regular: Streamer[];
  veteran: Streamer[];
};

type TabType = 'firstRound' | 'regular' | 'veteran';

// 프로필 이미지를 담당하는 개별 컴포넌트
const StreamerProfile = ({ streamer, activeTab }: { streamer: Streamer, activeTab: TabType }) => {
  const [imgError, setImgError] = useState(false);
  
  const firstTwo = streamer.id.substring(0, 2).toLowerCase();
  const profileUrl = `https://profile.img.afreecatv.com/LOGO/${firstTwo}/${streamer.id}/${streamer.id}.jpg`;

  // 💡 탭별 색상 테마 정의 (1차 합격자는 에메랄드색)
  const styles = {
    firstRound: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40',
      text: 'text-emerald-600 dark:text-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-700/50'
    },
    regular: {
      bg: 'bg-slate-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30',
      text: 'text-slate-400 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400',
      border: 'border-slate-200 dark:border-gray-600'
    },
    veteran: {
      bg: 'bg-amber-50 dark:bg-yellow-900/20 group-hover:bg-amber-100 dark:group-hover:bg-yellow-900/40',
      text: 'text-amber-600 dark:text-amber-500',
      border: 'border-amber-200 dark:border-amber-700/50'
    }
  };

  if (imgError) {
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${styles[activeTab].bg}`}>
        <span className={`text-xs font-black ${styles[activeTab].text}`}>
          {streamer.name.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <img 
      src={profileUrl} 
      alt={streamer.name} 
      className={`w-8 h-8 rounded-full object-cover shrink-0 border transition-colors ${styles[activeTab].border}`}
      onError={() => setImgError(true)} 
    />
  );
};

export default function StreamersPage() {
  const [streamers, setStreamers] = useState<StreamersData>({ firstRound: [], regular: [], veteran: [] });
  // 💡 기본 활성 탭을 '1차 합격자'로 설정
  const [activeTab, setActiveTab] = useState<TabType>('firstRound');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  // 💡 2. 시간 잠금 장치 상태 (기본은 false: 잠김)
  const [isReleased, setIsReleased] = useState(false);

  // 시간 체크 로직 (2026년 6월 20일 18시 00분 기준)
  useEffect(() => {
    const checkReleaseTime = () => {
      const releaseDate = new Date('2026-06-20T18:00:00+09:00').getTime();
      const now = new Date().getTime();
      setIsReleased(now >= releaseDate);
    };
    
    checkReleaseTime(); // 첫 화면 렌더링 시 1번 체크
    
    // 만약 사용자가 사이트를 켜두고 기다린다면, 1분마다 시간을 체크해서 정각에 자동으로 열리게 함
    const timer = setInterval(checkReleaseTime, 1000 * 60); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStreamers = async () => {
      try {
        const res = await fetch('/api/streamers');
        const json = await res.json();
        
        if (json.success) {
          const sortKorean = (arr: Streamer[]) => [...arr].sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
          
          setStreamers({
            firstRound: sortKorean(json.data.firstRound || []), // 1차 데이터 맵핑
            regular: sortKorean(json.data.regular || []),
            veteran: sortKorean(json.data.veteran || [])
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
          {/* 💡 3. 탭 메뉴에 1차 합격자 버튼 추가 */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-gray-800 overflow-x-auto custom-scrollbar w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('firstRound')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'firstRound' 
                  ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-gray-300'
              }`}
            >
              🎉 1차 합격자 {!isReleased ? '(비공개)' : `(${streamers.firstRound.length})`}
            </button>
            <button 
              onClick={() => setActiveTab('regular')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'regular' 
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-gray-300'
              }`}
            >
              일반 신청자 ({streamers.regular.length})
            </button>
            <button 
              onClick={() => setActiveTab('veteran')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'veteran' 
                  ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-500 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-gray-300'
              }`}
            >
              퇴역군인 ({streamers.veteran.length})
            </button>
          </div>
          
          <div className="text-right shrink-0">
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
          ) : activeTab === 'firstRound' && !isReleased ? (
            // 💡 4. 시간이 안 지났을 때 보여주는 거대한 자물쇠 화면
            <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-4 animate-fade-in">
              <span className="text-6xl animate-bounce">🔒</span>
              <p className="text-xl md:text-2xl font-black text-slate-700 dark:text-slate-300">6월 20일 오후 6시 1차 합격자 공개 예정</p>
              <p className="text-sm font-bold text-slate-400">명단 공개 후 바로 업데이트 예정입니다.</p>
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