'use client';
import React, { useState } from 'react';

// 💡 패치노트 데이터 타입 정의
type PatchNote = {
  id: string;
  date: string;
  title: string;
  content: React.ReactNode;
};

// =========================================================================
// 📝 패치노트 작성 공간
// 관리자님! 서버가 시작되고 패치노트를 쓰실 땐 아래 주석(/* ... */)을 지우고 
// 양식에 맞춰 작성해 주시면 됩니다. (가장 최신 글을 맨 위에 적어주세요!)
// =========================================================================
const PATCH_NOTES: PatchNote[] = [
  /* 
  {
    id: 'day2',
    date: '6월 19일',
    title: '2일차 밸런스 및 버그 핫픽스',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-black text-blue-500 mb-2">⚖️ 밸런스 패치</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm font-medium text-slate-700 dark:text-gray-300">
            <li>3강 곡괭이 채굴 속도 10% 상향</li>
            <li>보스 몬스터 체력 15% 하향 조절</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-black text-rose-500 mb-2">🐛 버그 수정</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm font-medium text-slate-700 dark:text-gray-300">
            <li>경공비급 스탯이 비정상적으로 높게 적용되던 현상 수정</li>
            <li>특정 상황에서 멀티뷰 로딩이 지연되던 현상 완화</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'day1',
    date: '6월 18일',
    title: '1일차 서버 오픈 및 안정화',
    content: (
      <div className="space-y-6">
        <p className="text-sm font-medium text-slate-700 dark:text-gray-300">
          내수서버가 정식으로 오픈되었습니다! 첫날 발생한 렉 현상을 완화하기 위한 최적화가 진행되었습니다.
        </p>
      </div>
    )
  }
  */
];

export default function PatchNotePage() {
  // 항상 가장 위에 있는(최신) 패치노트를 기본으로 보여줌
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="animate-fade-in pb-10 h-full flex flex-col relative">
      {/* 상단 헤더 */}
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">📝 패치노트</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">서버의 최신 업데이트 및 변경 사항을 확인하세요.</p>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex-1 flex flex-col min-h-0 relative">
        
        {PATCH_NOTES.length === 0 ? (
          // 💡 패치노트가 없을 때 보여주는 빈 화면 (현재 적용되는 화면)
          <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-4 animate-fade-in">
            <div className="w-20 h-20 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
              <span className="text-4xl">🛠️</span>
            </div>
            <p className="text-xl md:text-2xl font-black text-slate-700 dark:text-slate-300">
              서버 시작 후 업데이트 예정입니다.
            </p>
            <p className="text-sm font-medium text-slate-400">
              패치노트가 등록될 때까지 조금만 기다려주세요!
            </p>
          </div>
        ) : (
          // 💡 패치노트가 있을 때 보여주는 탭 분할 화면
          <div className="flex flex-col md:flex-row h-full gap-6">
            
            {/* 좌측(모바일은 상단): 날짜 선택 탭 */}
            <div className="md:w-56 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto custom-scrollbar pb-2 md:pb-0">
              {PATCH_NOTES.map((note, index) => (
                <button
                  key={note.id}
                  onClick={() => setActiveIndex(index)}
                  className={`flex flex-col items-start px-4 py-3 rounded-xl transition-all whitespace-nowrap text-left border ${
                    activeIndex === index
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 shadow-sm'
                      : 'bg-[#f8fafc] dark:bg-[#121212] border-slate-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-gray-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className={`text-xs font-black mb-1 ${activeIndex === index ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-gray-500'}`}>
                    {note.date}
                  </span>
                  <span className={`text-sm font-bold truncate w-full ${activeIndex === index ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-400'}`}>
                    {note.title}
                  </span>
                </button>
              ))}
            </div>

            {/* 우측(모바일은 하단): 패치노트 상세 내용 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc] dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-gray-800 p-6 md:p-8 shadow-inner">
              <div className="mb-8 border-b border-slate-200 dark:border-gray-800 pb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-black rounded-lg mb-3">
                  {PATCH_NOTES[activeIndex].date}
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {PATCH_NOTES[activeIndex].title}
                </h2>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                {PATCH_NOTES[activeIndex].content}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}