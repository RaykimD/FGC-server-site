'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 💡 메인 페이지용 미니 프로필 컴포넌트
const MiniProfile = ({ member }: { member: any }) => {
  const [error, setError] = useState(false);
  const firstTwo = member.id ? member.id.substring(0, 2).toLowerCase() : '';
  const url = `https://profile.img.afreecatv.com/LOGO/${firstTwo}/${member.id}/${member.id}.jpg`;

  if (!member.id || error) {
    return (
      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center shrink-0 shadow-inner border border-slate-300 dark:border-gray-600">
        <span className="text-[10px] font-black text-slate-500 dark:text-gray-400">
          {member.name ? member.name.charAt(0) : '?'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={member.name}
      onError={() => setError(true)}
      className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-gray-600 shadow-sm"
    />
  );
};

export default function StatusPage() {
  const [guildData, setGuildData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/status');
        const json = await res.json();
        if (json.success) {
          setGuildData(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in pb-10 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">길드 및 직업 현황</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-2">
            구글 시트와 실시간 연동되어 서버 내 인원 및 장비 현황을 보여줍니다. 카드를 클릭하면 상세 현황을 볼 수 있습니다.<br/>해당 페이지에서는 각 길드별 스탯과 현황이 공개되기 때문에 스트리머분들께서는 카드 누르는 것을 삼가주세요.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-slate-400 font-bold">
            데이터를 불러오는 중입니다...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guildData.map((guild) => {
              const leader = guild.members?.find((m: any) => m.role === '수장');
              const otherMembers = guild.members?.filter((m: any) => m.role !== '수장') || [];

              return (
                <Link href={`/status/${guild.id}`} key={guild.id} className="group block h-full">
                  <div className="bg-[#f8fafc] dark:bg-[#1a1a1a] rounded-2xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all h-full flex flex-col">
                    
                    {/* 길드 마크 & 이름 */}
                    <div className="flex items-center gap-4 mb-6 border-b border-slate-200 dark:border-gray-800 pb-4">
                      {/* 💡 추후 이 div 부분을 img 태그로 변경하여 로고를 넣으시면 됩니다! */}
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform overflow-hidden">
                        🛡️
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {guild.name}
                        </h2>
                        {/* 💡 요청하신 대로 '총 인원' 텍스트는 삭제했습니다. */}
                      </div>
                    </div>

                    {/* 주요 인원 요약 */}
                    <div className="flex-1 flex flex-col justify-center space-y-3">
                      {leader && (
                        <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-500/40">
                          {/* 💡 역할 글자에 고정 너비(w-16)를 주어 기준점을 잡습니다. */}
                          <span className="w-16 shrink-0 text-xs font-black text-blue-600 dark:text-blue-400">👑 수장</span>
                          {/* 💡 오른쪽으로 밀던(justify-end) 코드를 지우고 왼쪽으로 바짝 당겨서 배치합니다. */}
                          <div className="flex items-center gap-2">
                            <MiniProfile member={leader} />
                            <span className="font-black text-slate-900 dark:text-gray-100">{leader.name}</span>
                          </div>
                        </div>
                      )}
                      
                      {otherMembers.length > 0 ? (
                        <div className="flex items-start bg-amber-50 dark:bg-amber-900/30 px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-500/40">
                          <span className="w-16 shrink-0 pt-0.5 text-xs font-black text-amber-600 dark:text-amber-400">🎖️ 멤버</span>
                          {/* 💡 items-end를 items-start로 변경하여 모든 멤버가 왼쪽 라인에 정렬되도록 수정했습니다. */}
                          <div className="flex-1 flex flex-col gap-2 items-start">
                            {otherMembers.map((m: any) => (
                              <div key={m.name} className="flex items-center gap-2">
                                <MiniProfile member={m} />
                                <span className="font-black text-sm text-slate-800 dark:text-gray-200">{m.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center bg-slate-100/70 dark:bg-gray-800/30 px-4 py-3 rounded-lg border border-slate-200 dark:border-gray-700 border-dashed">
                          <span className="text-xs font-bold text-slate-400 dark:text-gray-500">합류한 멤버 없음</span>
                        </div>
                      )}
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
