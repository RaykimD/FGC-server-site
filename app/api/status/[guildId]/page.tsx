'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type MemberData = {
  name: string;
  id: string;
  role: string;
  job: string;
  jobTier: string;
  equip: {
    weapon: string; weaponAtk: string; helmet: string; armor: string;
    belt: string; shoes: string; ring1: string; ring2: string;
  };
  stats: {
    ki: string; evasion: string; atkSpeed: string; sum: string; hp: string; luck: string;
  };
  special: {
    lightfoot: string; mount: string;
  };
};

type GuildData = {
  id: string;
  name: string;
  members: MemberData[];
  tools: {
    pickaxe4: string; pickaxe5: string;
  };
};

const MemberProfile = ({ member, size = 'lg' }: { member: MemberData, size?: 'sm' | 'lg' }) => {
  const [imgError, setImgError] = useState(false);
  const firstTwo = member.id ? member.id.substring(0, 2).toLowerCase() : '';
  const profileUrl = `https://profile.img.afreecatv.com/LOGO/${firstTwo}/${member.id}/${member.id}.jpg`;
  
  const sizeClasses = size === 'lg' ? 'w-24 h-24 text-4xl border-4' : 'w-12 h-12 text-lg border-2';

  if (!member.id || imgError) {
    return (
      <div className={`${sizeClasses} rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-inner border-slate-300 dark:border-gray-600`}>
        <span className="font-black text-slate-500 dark:text-gray-400">{member.name.charAt(0)}</span>
      </div>
    );
  }
  return <img src={profileUrl} alt={member.name} className={`${sizeClasses} rounded-full object-cover shrink-0 border-slate-300 dark:border-gray-600 bg-white dark:bg-[#121212]`} onError={() => setImgError(true)} />;
};

type StatVariant = 'weapon' | 'armor' | 'ring' | 'cyan' | 'emerald' | 'red' | 'amber' | 'highlight' | 'default';

const StatBox = ({ icon, label, value, subValue, variant = 'default' }: { icon?: string, label: string, value: string | number, subValue?: string, variant?: StatVariant }) => {
  let colors = 'bg-slate-100/70 dark:bg-gray-800/50 border-slate-200 dark:border-gray-700 text-slate-800 dark:text-gray-200';
  if (variant === 'weapon') colors = 'bg-rose-50 dark:bg-red-950/30 border-rose-200/60 dark:border-red-500/50 text-rose-800 dark:text-red-400';
  if (variant === 'armor') colors = 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-500/50 text-indigo-800 dark:text-indigo-400';
  if (variant === 'ring') colors = 'bg-fuchsia-50 dark:bg-fuchsia-950/30 border-fuchsia-200/60 dark:border-fuchsia-500/50 text-fuchsia-800 dark:text-fuchsia-400';
  if (variant === 'cyan') colors = 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200/60 dark:border-cyan-500/50 text-cyan-800 dark:text-cyan-400';
  if (variant === 'emerald') colors = 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-400';
  if (variant === 'red') colors = 'bg-red-50 dark:bg-rose-950/30 border-red-200/60 dark:border-rose-500/50 text-red-800 dark:text-rose-400';
  if (variant === 'amber') colors = 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-500/50 text-amber-800 dark:text-amber-400';
  if (variant === 'highlight') colors = 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-500/60 text-blue-900 dark:text-blue-300 font-black ring-1 ring-blue-300/30 dark:ring-blue-500/30';

  return (
    <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all shadow-sm ${colors}`}>
      <span className="text-xs sm:text-sm font-bold opacity-80 tracking-tight">{icon ? `${icon} ` : ''}{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-base sm:text-lg font-black tracking-tight">{value}</span>
        {subValue && <span className="text-[10px] sm:text-xs opacity-70 font-bold">{subValue}</span>}
      </div>
    </div>
  );
};

export default function GuildDetailPage() {
  const pathname = usePathname();
  const guildId = pathname ? pathname.split('/').pop() : '';
  
  const [guild, setGuild] = useState<GuildData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListView, setIsListView] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/status');
        const json = await res.json();
        if (json.success) {
          const found = json.data.find((g: GuildData) => g.id === guildId);
          setGuild(found);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [guildId]);

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-slate-400 font-bold animate-fade-in text-lg">시트 데이터를 불러오는 중입니다...</div>;
  }

  if (!guild) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in">
        <span className="text-6xl mb-4">🔍</span>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">길드 정보를 찾을 수 없습니다.</h1>
        <Link href="/status" className="mt-6 px-8 py-3 bg-blue-500 text-white font-bold text-lg rounded-xl hover:bg-blue-600 transition-colors shadow-sm">길드 목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10 h-full flex flex-col">
      <div className="mb-8 shrink-0 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="flex-1 w-full overflow-hidden">
          <Link href="/status" className="text-sm font-black text-slate-400 hover:text-blue-500 transition-colors mb-3 inline-block">← 길드 현황 목록</Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 mt-1">
            <div className="flex items-center gap-5 shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-[#f8fafc] dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700 flex items-center justify-center text-4xl shadow-sm">🛡️</div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{guild.name}</h1>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">총 인원: {guild.members.length}명</p>
              </div>
            </div>
            
            <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
              <div className="flex gap-3 bg-[#f8fafc] dark:bg-[#1a1a1a] p-3 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm whitespace-nowrap shrink-0">
                <div className="px-5 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700 flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 dark:text-gray-400">4강 곡괭이</span>
                  <span className="text-xl font-black text-amber-600">{guild.tools.pickaxe4}</span>
                </div>
                <div className="px-5 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700 flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 dark:text-gray-400">5강 곡괭이</span>
                  <span className="text-xl font-black text-red-600">{guild.tools.pickaxe5}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        <button onClick={() => setIsListView(!isListView)} className="shrink-0 flex items-center gap-3 px-6 py-3.5 bg-[#f8fafc] dark:bg-gray-800/80 border border-slate-300 dark:border-gray-700 rounded-xl text-base font-black text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700 transition-all shadow-sm">
          {isListView ? '🃏 카드형으로 보기' : '📊 한눈에 보기'}
        </button>
      </div>

      <div className="flex-1 min-h-0">
        {!isListView && (
          <div className="h-full overflow-y-auto pr-3 custom-scrollbar">
            <div className="flex flex-col gap-6">
              {guild.members.map((member: MemberData, idx: number) => (
                <div key={idx} className="bg-[#f8fafc] dark:bg-[#1a1a1a] rounded-3xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm flex flex-col xl:flex-row gap-6 hover:border-blue-400 transition-all">
                  <div className="flex items-center xl:flex-col xl:items-start gap-5 xl:w-64 shrink-0 xl:border-r border-b xl:border-b-0 border-slate-200 dark:border-gray-800 pb-5 xl:pb-0 xl:pr-6">
                    <MemberProfile member={member} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-black text-3xl text-slate-950 dark:text-white truncate tracking-tight">{member.name}</span>
                        {member.role && member.role !== '길드원' && (
                          <span className="text-sm font-black px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 shrink-0 border border-blue-200 dark:border-blue-700/50">
                            {member.role}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold px-4 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/40 text-purple-700 border border-purple-100 dark:border-purple-700/50 shadow-sm">
                          {member.job ? `${member.job} (${member.jobTier})` : '직업 미정'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row gap-5 min-w-0">
                    <div className="flex-1 flex flex-col justify-center gap-3.5">
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                        <StatBox icon="⚔️" label="무기" value={member.equip.weapon} subValue={`Atk ${member.equip.weaponAtk}`} variant="weapon" />
                        <StatBox icon="🪖" label="투구" value={member.equip.helmet} variant="armor" />
                        <StatBox icon="👕" label="갑옷" value={member.equip.armor} variant="armor" />
                        <StatBox icon="👖" label="벨트" value={member.equip.belt} variant="armor" />
                        <StatBox icon="👟" label="신발" value={member.equip.shoes} variant="armor" />
                        <StatBox icon="💍" label="반지 1" value={member.equip.ring1} variant="ring" />
                        <StatBox icon="💍" label="반지 2" value={member.equip.ring2} variant="ring" />
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        <StatBox label="내공" value={member.stats.ki} variant="cyan" />
                        <StatBox label="회피" value={member.stats.evasion} variant="emerald" />
                        <StatBox label="공속" value={member.stats.atkSpeed} variant="emerald" />
                        <StatBox label="회피+공속" value={member.stats.sum} variant="highlight" />
                        <StatBox icon="❤️" label="체력" value={member.stats.hp} variant="red" />
                        <StatBox icon="🍀" label="운" value={member.stats.luck} variant="amber" />
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-40 shrink-0 justify-center">
                      <div className="flex-1 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/60 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-bold mb-2">🏃 경공비급</span>
                        <span className="text-base sm:text-xl font-black text-emerald-800 dark:text-emerald-300">{member.special.lightfoot}</span>
                      </div>
                      <div className="flex-1 bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/60 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 font-bold mb-2">🐎 탈것</span>
                        <span className="text-base sm:text-xl font-black text-amber-800 dark:text-amber-300">{member.special.mount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isListView && (
          <div className="h-full bg-[#f8fafc] dark:bg-[#1a1a1a] rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-base text-left whitespace-nowrap min-w-[1400px]">
                <thead className="text-xs uppercase bg-slate-100 dark:bg-[#121212] text-slate-600 dark:text-gray-400 border-b border-slate-200 dark:border-gray-800 sticky top-0 z-10 font-black">
                  <tr>
                    <th className="px-5 py-4 sticky left-0 bg-slate-100 dark:bg-[#121212] z-20">이름 / 역할</th>
                    <th className="px-5 py-4 border-r border-slate-200 dark:border-gray-800">직업</th>
                    <th className="px-4 py-4 text-center text-rose-700 dark:text-red-400">무기</th>
                    <th className="px-4 py-4 text-center text-indigo-700 dark:text-indigo-400">투구</th>
                    <th className="px-4 py-4 text-center text-indigo-700 dark:text-indigo-400">갑옷</th>
                    <th className="px-4 py-4 text-center text-indigo-700 dark:text-indigo-400">벨트</th>
                    <th className="px-4 py-4 text-center text-indigo-700 dark:text-indigo-400 border-r border-slate-200 dark:border-gray-800">신발</th>
                    <th className="px-4 py-4 text-center text-fuchsia-700 dark:text-fuchsia-400">반지 1</th>
                    <th className="px-4 py-4 text-center text-fuchsia-700 dark:text-fuchsia-400 border-r border-slate-200 dark:border-gray-800">반지 2</th>
                    <th className="px-4 py-4 text-center text-cyan-700 dark:text-cyan-400">내공</th>
                    <th className="px-4 py-4 text-center text-emerald-700 dark:text-emerald-400">회피</th>
                    <th className="px-4 py-4 text-center text-emerald-700 dark:text-emerald-400">공속</th>
                    <th className="px-4 py-4 text-center text-blue-600 dark:text-blue-400 font-black">합(회+공)</th>
                    <th className="px-4 py-4 text-center text-red-700 dark:text-rose-400">체력</th>
                    <th className="px-4 py-4 text-center text-amber-700 dark:text-amber-400 border-r border-slate-200 dark:border-gray-800">운</th>
                    <th className="px-4 py-4 text-center text-emerald-600 dark:text-emerald-400">경공비급</th>
                    <th className="px-4 py-4 text-center text-amber-600 dark:text-amber-400">탈것</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-gray-800 text-sm font-bold text-slate-800 dark:text-gray-300">
                  {guild.members.map((member: MemberData, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-3.5 sticky left-0 bg-[#f8fafc] dark:bg-[#1a1a1a] z-10 group-hover:bg-slate-100/50 dark:group-hover:bg-gray-800/50">
                        <div className="flex items-center gap-4">
                          <MemberProfile member={member} size="sm" />
                          <div className="flex flex-col">
                            <span className="font-black text-slate-950 dark:text-white text-base">{member.name}</span>
                            <span className="text-xs text-blue-500">{member.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 border-r border-slate-200 dark:border-gray-800">
                        <div className="flex flex-col">
                          <span className={member.job ? 'text-purple-600 dark:text-purple-400 font-black text-base' : 'text-slate-400 text-base'}>{member.job || '미정'}</span>
                          <span className="text-xs text-slate-400">{member.jobTier}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-700 dark:text-gray-300">{member.equip.weapon}</td>
                      <td className="px-4 py-3.5 text-center text-slate-700 dark:text-gray-300">{member.equip.helmet}</td>
                      <td className="px-4 py-3.5 text-center text-slate-700 dark:text-gray-300">{member.equip.armor}</td>
                      <td className="px-4 py-3.5 text-center text-slate-700 dark:text-gray-300">{member.equip.belt}</td>
                      <td className="px-4 py-3.5 text-center text-slate-700 dark:text-gray-300 border-r border-slate-200 dark:border-gray-800">{member.equip.shoes}</td>
                      <td className="px-4 py-3.5 text-center text-slate-700 dark:text-gray-300">{member.equip.ring1}</td>
                      <td className="px-4 py-3.5 text-center text-slate-700 dark:text-gray-300 border-r border-slate-200 dark:border-gray-800">{member.equip.ring2}</td>
                      <td className="px-4 py-3.5 text-center text-slate-700 dark:text-gray-300">{member.stats.ki}</td>
                      <td className="px-4 py-3.5 text-center text-slate-700 dark:text-gray-300">{member.stats.evasion}</td>
                      <td className="px-4 py-3.5 text-center text-slate-700 dark:text-gray-300">{member.stats.atkSpeed}</td>
                      <td className="px-4 py-3.5 text-center font-black text-lg text-blue-600 dark:text-blue-400">{member.stats.sum}</td>
                      <td className="px-4 py-3.5 text-center text-slate-700 dark:text-gray-300">{member.stats.hp}</td>
                      <td className="px-4 py-3.5 text-center text-slate-700 dark:text-gray-300 border-r border-slate-200 dark:border-gray-800">{member.stats.luck}</td>
                      <td className="px-4 py-3.5 text-center text-emerald-600 dark:text-emerald-400 font-black text-base">{member.special.lightfoot}</td>
                      <td className="px-4 py-3.5 text-center text-amber-500 dark:text-amber-400 font-black text-base">{member.special.mount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}