'use client';
import React from 'react';

export default function ApiListPage() {
  return (
    <div className="animate-fade-in pb-10 h-full flex flex-col relative">
      
      {/* 상단 헤더 */}
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">🖧 서버 API (후원 보상)</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          별풍선 티켓, 지원상자 등 서버 후원 시 지급되는 인게임 보상 목록입니다.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex-1 flex flex-col items-center justify-center min-h-0 relative">
        
        {/* 💡 업데이트 예정 빈 화면 (Empty State) */}
        <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-4 animate-fade-in">
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-2 border border-amber-100 dark:border-amber-800/50 shadow-inner">
            <span className="text-4xl">🎁</span>
          </div>
          <p className="text-xl md:text-2xl font-black text-slate-700 dark:text-slate-300">
            API 목록 업데이트 예정입니다.
          </p>
          <p className="text-sm font-medium text-slate-400 text-center max-w-sm leading-relaxed">
            세부적인 API 보상 내용이 정리되는 대로 <br className="hidden sm:block" />이곳에 상세하게 안내될 예정입니다. 조금만 기다려주세요!
          </p>
        </div>

      </div>
    </div>
  );
}