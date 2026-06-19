'use client';
import React, { useState, useEffect } from 'react';

// 💡 일정 데이터 타입
type ScheduleItem = {
  date: string;
  day: string;
  title: string;
  desc: string;
  status: 'open' | 'empty' | 'close'; // 타입에 따라 색상과 아이콘이 바뀝니다
};

// 💡 서버 전체 일정 데이터 (나중에 여기서 내용만 수정하시면 됩니다!)
const SCHEDULE_DATA: ScheduleItem[] = [
  { date: '7월 14일', day: '화', title: '🚀 서버 오픈', desc: '총겜동 내수서버가 정식으로 오픈합니다.', status: 'open' },
  { date: '7월 15일', day: '수', title: '추후 업데이트 예정입니다.', desc: '', status: 'empty' },
  { date: '7월 16일', day: '목', title: '추후 업데이트 예정입니다.', desc: '', status: 'empty' },
  { date: '7월 17일', day: '금', title: '추후 업데이트 예정입니다.', desc: '', status: 'empty' },
  { date: '7월 18일', day: '토', title: '추후 업데이트 예정입니다.', desc: '', status: 'empty' },
  { date: '7월 19일', day: '일', title: '추후 업데이트 예정입니다.', desc: '', status: 'empty' },
  { date: '7월 20일', day: '월', title: '추후 업데이트 예정입니다.', desc: '', status: 'empty' },
  { date: '7월 21일', day: '화', title: '🏁 서버 종료', desc: '일주일 간의 내수서버 대장정이 마무리됩니다.', status: 'close' },
];

export default function SchedulePage() {
  const [dDayText, setDDayText] = useState('계산 중...');

  // 💡 D-Day 계산 로직 (클라이언트 사이드 렌더링)
  useEffect(() => {
    const calculateDday = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 시간 단위를 자정으로 초기화하여 순수 날짜만 비교
      
      const targetDate = new Date('2026-07-14T00:00:00+09:00'); // 서버 오픈일
      targetDate.setHours(0, 0, 0, 0);
      
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        setDDayText(`D-${diffDays}`);
      } else if (diffDays === 0) {
        setDDayText('D-DAY');
      } else {
        // 오픈일이 지났을 경우 진행 중인 일차(Day) 표시 또는 종료 표시
        const isEnded = new Date('2026-07-21T00:00:00+09:00').getTime() - today.getTime() < 0;
        if (isEnded) {
          setDDayText('서버 종료');
        } else {
          setDDayText(`Day ${Math.abs(diffDays) + 1}`);
        }
      }
    };

    calculateDday();
    // 매 자정마다 D-Day가 갱신되도록 세팅할 수도 있으나, 보통 페이지 접속 시 계산으로 충분합니다.
  }, []);

  // 상태별 스타일 지정 함수
  const getStatusStyles = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'open':
        return {
          dot: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
          card: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50',
          title: 'text-blue-700 dark:text-blue-400',
        };
      case 'close':
        return {
          dot: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]',
          card: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50',
          title: 'text-rose-700 dark:text-rose-400',
        };
      default:
        return {
          dot: 'bg-slate-300 dark:bg-gray-700',
          card: 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800',
          title: 'text-slate-500 dark:text-gray-400',
        };
    }
  };

  return (
    <div className="animate-fade-in pb-10 h-full flex flex-col relative">
      
      {/* 상단 헤더 & D-Day 뱃지 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">🗓️ 서버 일정</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            7월 14일부터 7월 21일까지 진행되는 전체 스케줄입니다.
          </p>
        </div>
        
        {/* 💡 D-Day 강조 뱃지 */}
        <div className="bg-[#1e1e1e] dark:bg-black px-6 py-3 rounded-2xl border border-gray-800 shadow-xl flex items-center gap-3 transform hover:scale-105 transition-transform">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">서버 오픈까지</span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tighter">
              {dDayText}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
            <span className="text-xl">⏳</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-gray-800 shadow-sm shadow-slate-200/50 dark:shadow-none flex-1 overflow-y-auto custom-scrollbar relative">
        
        {/* 💡 수직 타임라인 디자인 */}
        <div className="relative max-w-3xl mx-auto py-4">
          {/* 가운데 기준선 (막대기) */}
          <div className="absolute top-8 bottom-8 left-[27px] sm:left-1/2 w-0.5 bg-slate-200 dark:bg-gray-800 -translate-x-1/2"></div>

          <div className="space-y-6">
            {SCHEDULE_DATA.map((item, index) => {
              const styles = getStatusStyles(item.status);
              const isEven = index % 2 === 0; // PC 화면에서 지그재그 배치를 위한 변수

              return (
                <div key={index} className="relative flex items-center sm:justify-between flex-col sm:flex-row w-full group">
                  
                  {/* 중앙 동그라미 (Dot) */}
                  <div className={`absolute left-[27px] sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white dark:border-[#1e1e1e] z-10 transition-transform duration-300 group-hover:scale-150 ${styles.dot}`}></div>

                  {/* 좌측 콘텐츠 (짝수 인덱스일 때 좌측에 배치) */}
                  <div className={`w-full sm:w-[45%] pl-14 sm:pl-0 ${isEven ? 'sm:text-right sm:pr-8' : 'sm:order-2 sm:text-left sm:pl-8'}`}>
                    <div className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${styles.card}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isEven ? 'sm:justify-end' : 'sm:justify-start'}`}>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-black/30 text-xs font-black text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-700/50">
                          {item.date} ({item.day})
                        </span>
                      </div>
                      <h3 className={`text-lg font-black mb-1 tracking-tight ${styles.title}`}>
                        {item.title}
                      </h3>
                      {item.desc && (
                        <p className="text-sm font-medium text-slate-600 dark:text-gray-400 leading-relaxed">
                          {item.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 빈 공간 (레이아웃 맞춤용) */}
                  <div className={`hidden sm:block w-[45%] ${isEven ? 'order-2' : ''}`}></div>
                  
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}