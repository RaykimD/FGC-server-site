'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const MiniProfile = ({ member }: { member: any }) => {
  const [error, setError] = useState(false);
  const firstTwo = member.id ? member.id.substring(0, 2).toLowerCase() : '';
  const url = `https://profile.img.afreecatv.com/LOGO/${firstTwo}/${member.id}/${member.id}.jpg`;

  if (!member.id || error) {
    return (
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-700 flex items-center justify-center shrink-0 shadow-inner border border-slate-300 dark:border-gray-600">
        <span className="text-sm font-black text-slate-500 dark:text-gray-400">
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
      className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-gray-600 shadow-sm"
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
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">길드 및 직업 현황</h1>
          <p className="text-base font-medium text-slate-500 dark:text-gray-400 mt-2">
            구글 시트와 실시간 연동되어 서버 내 인원 및 장비 현황을 보여줍니다. 카드를 클릭하면 상세 현황을 볼 수 있습니다.<br/>해당 페이지에서는 각 길드별 스탯과 현황이 공개되기 때문에 스트리머분들께서는 카드 누르는 것을 삼가주세요.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-slate-400 font-bold text-xl">
            데이터를 불러오는 중입니다...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guildData.map((guild) => {
              const leader = guild.members?.find((m: any) => m.role === '수장');
              const otherMembers = guild.members?.filter((m: any) => m.role !== '수장') || [];

              return (
                <Link href={`/status/${guild.id}`} key={guild.id} className="group block h-full">
                  <div className="bg-[#f8fafc] dark:bg-[#1a1a1a] rounded-3xl p-8 border border-slate-200 dark:border-gray-800 shadow-md hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all h-full flex flex-col">
                    
                    <div className="flex items-center gap-5 mb-6 border-b border-slate-200 dark:border-gray-800 pb-5">
                      <div className="w-16 h-14 rounded-2xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform overflow-hidden">
                        🛡️
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {guild.name}
                        </h2>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-4">
                      {leader && (
                        <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 px-5 py-4 rounded-2xl border border-blue-200 dark:border-blue-500/40">
                          <span className="w-20 shrink-0 text-base font-black text-blue-600 dark:text-blue-400">👑 수장</span>
                          <div className="flex items-center gap-4">
                            <MiniProfile member={leader} />
                            <span className="font-black text-xl text-slate-900 dark:text-gray-100">{leader.name}</span>
                          </div>
                        </div>
                      )}
                      
                      {otherMembers.length > 0 ? (
                        <div className="flex items-start bg-amber-50 dark:bg-amber-900/30 px-5 py-4 rounded-2xl border border-amber-200 dark:border-amber-500/40">
                          <span className="w-20 shrink-0 pt-2 text-base font-black text-amber-600 dark:text-amber-400">🎖️ 멤버</span>
                          <div className="flex-1 flex flex-col gap-4 items-start">
                            {otherMembers.map((m: any) => (
                              <div key={m.name} className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
                                  <MiniProfile member={m} />
                                  <span className="font-black text-lg text-slate-800 dark:text-gray-200">{m.name}</span>
                                </div>
                                {m.role && m.role !== '길드원' && (
                                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-slate-200 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-gray-700">
                                    {m.role}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center bg-slate-100/70 dark:bg-gray-800/30 px-5 py-4 rounded-2xl border border-slate-200 dark:border-gray-700 border-dashed">
                          <span className="text-base font-bold text-slate-400 dark:text-gray-500">합류한 멤버 없음</span>
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