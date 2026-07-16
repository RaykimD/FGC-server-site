'use client';
import React from 'react';

// 💡 요약(title)을 모두 제거하고, 16일은 지나간 일정(true), 17일을 최신(false)으로 설정했습니다!
const SCHEDULE_DATA = [
  {
    date: '7월 14일',
    day: '화',
    items: ['내수서버 정식 오픈'],
    isPast: true, 
  },
  {
    date: '7월 15일',
    day: '수',
    items: [
      '쥐 보스 등장',
      '2차 전직',
      '초월자 천살성 추가'
    ],
    isPast: true,
  },
  {
    date: '7월 16일',
    day: '목',
    items: [
      '산삼보스 등장',
      '경공비급(마나코어) 추가',
      '초월자 뇌신 추가',
      '배 추가'
    ],
    isPast: true, // 16일 안 빛나게 처리
  },
  {
    date: '7월 17일',
    day: '금',
    items: [
      '오공보스 추가 (6시간 단위 젠)',
      '3차전직 추가',
      '상선 등장'
    ],
    isPast: false, // 17일만 빛나게 강조 처리
  }
];

export default function SchedulePage() {
  return (
    <div className="animate-fade-in pb-10 h-full flex flex-col max-w-4xl mx-auto w-full">
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">🗓️ 서버 일정</h1>
        <p className="text-sm font-medium text-slate-500 mt-2">
          서버의 주요 이벤트, 보스 등장 및 업데이트 스케줄입니다.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
        {/* 타임라인 왼쪽의 쭉 이어지는 세로 선 */}
        <div className="absolute left-6 sm:left-[5.5rem] top-4 bottom-4 w-1 bg-slate-200 dark:bg-gray-800 rounded-full z-0"></div>

        <div className="space-y-8 relative z-10 py-4">
          {SCHEDULE_DATA.map((schedule, idx) => (
            <div key={idx} className={`flex flex-col sm:flex-row gap-4 sm:gap-8 group ${schedule.isPast ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}`}>
              
              {/* 날짜 표시 영역 */}
              <div className="flex items-center sm:items-start sm:w-24 shrink-0 sm:pt-4 pl-1 sm:pl-0 gap-3 sm:gap-0">
                <div className={`w-4 h-4 rounded-full border-4 shadow-sm shrink-0 sm:hidden z-10 ${schedule.isPast ? 'bg-slate-300 border-white dark:border-[#121212] dark:bg-gray-600' : 'bg-emerald-500 border-white dark:border-[#121212] animate-pulse'}`}></div>
                <div className="flex flex-col sm:items-end">
                  <span className={`text-lg font-black ${schedule.isPast ? 'text-slate-500 dark:text-gray-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {schedule.date}
                  </span>
                  <span className="text-sm font-bold text-slate-400 dark:text-gray-500">
                    ({schedule.day}요일)
                  </span>
                </div>
              </div>

              {/* 중앙 타임라인 동그라미 포인트 (PC화면) */}
              <div className="hidden sm:flex flex-col items-center pt-5">
                <div className={`w-4 h-4 rounded-full border-4 shadow-sm z-10 ${schedule.isPast ? 'bg-slate-300 border-white dark:bg-[#121212] dark:border-gray-700' : 'bg-emerald-500 border-white dark:border-[#121212] ring-4 ring-emerald-500/20'}`}></div>
              </div>

              {/* 내용 카드 영역 */}
              <div className={`flex-1 bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl border shadow-sm transition-all ${schedule.isPast ? 'border-slate-200 dark:border-gray-800 bg-slate-50/50' : 'border-emerald-200 dark:border-emerald-900/50 shadow-emerald-900/5'}`}>
                {/* 💡 타이틀(h3)을 삭제하여 내용만 심플하게 남겼습니다. */}
                <ul className="space-y-3">
                  {schedule.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3">
                      <span className={`text-sm mt-0.5 ${schedule.isPast ? 'text-slate-400' : 'text-emerald-500'}`}>✔️</span>
                      <span className={`text-base font-bold ${schedule.isPast ? 'text-slate-600 dark:text-gray-400' : 'text-slate-800 dark:text-gray-200'}`}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}