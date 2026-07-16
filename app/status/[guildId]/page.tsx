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
    pickaxe5: string;
  };
};

// 🛡️ 길드 마크 컴포넌트
const DetailedGuildLogo = ({ guildName }: { guildName: string }) => {
  const [error, setError] = useState(false);
  const safeName = guildName.replace(/\s+/g, '');

  if (error) {
    return (
      <div className="w-20 h-20 rounded-2xl bg-[#f8fafc] dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700 flex items-center justify-center text-4xl shadow-sm shrink-0">
        🛡️
      </div>
    );
  }

  return (
    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
      <img 
        src={`/guilds/${safeName}.png`} 
        alt={guildName} 
        className="w-full h-full object-cover" 
        onError={() => setError(true)} 
      />
    </div>
  );
};

const MemberProfile = ({ member, size = 'sm' }: { member: MemberData, size?: 'sm' | 'lg' }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!member.id) {
      setImgError(true);
      return;
    }

    const firstTwo = member.id.substring(0, 2).toLowerCase();
    const rawUrl = `https://profile.img.afreecatv.com/LOGO/${firstTwo}/${member.id}/${member.id}.jpg`;
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(rawUrl)}`;

    fetch(proxyUrl)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.blob();
      })
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImgSrc(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => setImgError(true));
  }, [member.id]);

  // 💡 프로필 사진을 살짝 줄여서 표의 위아래 공간을 확 압축했습니다 (w-12 -> w-10)
  const sizeClasses = size === 'lg' ? 'w-24 h-24 text-4xl border-4' : 'w-10 h-10 text-base border-2';

  if (imgError || !imgSrc) {
    return (
      <div className={`${sizeClasses} rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-inner border-slate-300 dark:border-gray-600`}>
        <span className="font-black text-slate-500 dark:text-gray-400">{member.name.charAt(0)}</span>
      </div>
    );
  }
  
  return <img src={imgSrc} alt={member.name} className={`${sizeClasses} rounded-full object-cover shrink-0 border-slate-300 dark:border-gray-600 bg-white dark:bg-[#121212]`} />;
};

export default function GuildDetailPage() {
  const pathname = usePathname();
  const guildId = pathname ? pathname.split('/').pop() : '';
  
  const [guild, setGuild] = useState<GuildData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true' || window.location.hostname === 'localhost') {
        setIsAdmin(true);
      }
    }

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

  const handleCapture = async () => {
    setIsCapturing(true);
    
    try {
      if (typeof window !== 'undefined' && !(window as any).htmlToImage) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const target = document.getElementById('capture-area');
      if (!target) throw new Error('캡처 영역을 찾을 수 없습니다.');

      const bgColor = document.documentElement.classList.contains('dark') ? '#1a1a1a' : '#f8fafc';

      const dataUrl = await (window as any).htmlToImage.toPng(target, {
        backgroundColor: bgColor,
        pixelRatio: 2,
        fontEmbedCSS: '', 
      });
      
      const link = document.createElement('a');
      const date = new Date();
      const dateStr = `${date.getFullYear().toString().slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
      
      link.download = `${guild?.name}_로스터_${dateStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error(error);
      // alert('이미지 저장에 실패했습니다. 관리자에게 문의하세요!'); // 거추장스러운 알림창 제거
    } finally {
      setIsCapturing(false);
    }
  };

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
              <DetailedGuildLogo guildName={guild.name} />
              <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{guild.name}</h1>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">총 인원: {guild.members.length}명</p>
              </div>
            </div>
            
            <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
              <div className="flex gap-3 bg-[#f8fafc] dark:bg-[#1a1a1a] p-3 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm whitespace-nowrap shrink-0">
                <div className="px-5 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700 flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 dark:text-gray-400">5강 곡괭이</span>
                  <span className="text-xl font-black text-red-600 dark:text-rose-500">{guild.tools?.pickaxe5 || '0'}</span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <button 
                onClick={handleCapture}
                disabled={isCapturing}
                className="lg:ml-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 shrink-0 animate-fade-in disabled:opacity-50"
              >
                {isCapturing ? '⏳ 캡처 중...' : '📸 전체 표 캡처하기'}
              </button>
            )}

          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="h-full bg-[#f8fafc] dark:bg-[#1a1a1a] rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto custom-scrollbar">
            
            <div id="capture-area" className="w-max min-w-full bg-[#f8fafc] dark:bg-[#1a1a1a]">
              <table className="w-full text-base text-left whitespace-nowrap min-w-[1400px]">
                {/* 💡 헤더(thead)도 글씨를 키우고 굵게 만들었습니다 */}
                <thead className="text-sm uppercase bg-slate-200/80 dark:bg-[#121212] text-slate-700 dark:text-gray-300 border-b-2 border-slate-300 dark:border-gray-700 sticky top-0 z-10 font-black">
                  <tr>
                    <th className="px-5 py-3 sticky left-0 bg-slate-200/80 dark:bg-[#121212] z-20">이름 / 역할</th>
                    <th className="px-4 py-3 border-r border-slate-300 dark:border-gray-700 text-center">직업</th>
                    <th className="px-4 py-3 text-center text-rose-700 dark:text-red-400">무기</th>
                    <th className="px-4 py-3 text-center text-indigo-700 dark:text-indigo-400">투구</th>
                    <th className="px-4 py-3 text-center text-indigo-700 dark:text-indigo-400">갑옷</th>
                    <th className="px-4 py-3 text-center text-indigo-700 dark:text-indigo-400">벨트</th>
                    <th className="px-4 py-3 text-center text-indigo-700 dark:text-indigo-400 border-r border-slate-300 dark:border-gray-700">신발</th>
                    <th className="px-4 py-3 text-center text-fuchsia-700 dark:text-fuchsia-400">반지 1</th>
                    <th className="px-4 py-3 text-center text-fuchsia-700 dark:text-fuchsia-400 border-r border-slate-300 dark:border-gray-700">반지 2</th>
                    <th className="px-4 py-3 text-center text-cyan-700 dark:text-cyan-400">내공</th>
                    <th className="px-4 py-3 text-center text-emerald-700 dark:text-emerald-400">회피</th>
                    <th className="px-4 py-3 text-center text-emerald-700 dark:text-emerald-400">공속</th>
                    <th className="px-4 py-3 text-center text-blue-600 dark:text-blue-400 font-black">합(회+공)</th>
                    <th className="px-4 py-3 text-center text-red-700 dark:text-rose-400">체력</th>
                    <th className="px-4 py-3 text-center text-amber-700 dark:text-amber-400 border-r border-slate-300 dark:border-gray-700">운</th>
                    <th className="px-4 py-3 text-center text-emerald-600 dark:text-emerald-400">경공비급</th>
                    <th className="px-4 py-3 text-center text-amber-600 dark:text-amber-400">탈것</th>
                  </tr>
                </thead>
                {/* 💡 tbody 전체 텍스트를 text-lg(크게), font-black(아주 굵게)으로 통일했습니다 */}
                <tbody className="divide-y divide-slate-300 dark:divide-gray-800 text-lg font-black text-slate-900 dark:text-gray-100">
                  {guild.members.map((member: MemberData, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-gray-800/50 transition-colors">
                      {/* 💡 py-2.5로 패딩을 줄여서 세로 높이를 확 압축했습니다 */}
                      <td className="px-5 py-2.5 sticky left-0 bg-[#f8fafc] dark:bg-[#1a1a1a] z-10 group-hover:bg-slate-100/50 dark:group-hover:bg-gray-800/50">
                        <div className="flex items-center gap-4">
                          <MemberProfile member={member} size="sm" />
                          <div className="flex flex-col">
                            <span className="font-black text-slate-950 dark:text-white text-lg">{member.name}</span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 leading-none mt-0.5">{member.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 border-r border-slate-300 dark:border-gray-800 text-center">
                        <div className="flex justify-center items-center">
                          {/* 💡 직업 + 차수를 1줄로 통합! (예: "검객 2차") */}
                          <span className={member.job ? 'text-purple-700 dark:text-purple-400 font-black text-lg' : 'text-slate-400 font-black text-lg'}>
                            {member.job ? `${member.job} ${member.jobTier ? (member.jobTier.includes('차') ? member.jobTier : member.jobTier + '차') : ''}`.trim() : '미정'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">{member.equip.weapon}</td>
                      <td className="px-3 py-2.5 text-center">{member.equip.helmet}</td>
                      <td className="px-3 py-2.5 text-center">{member.equip.armor}</td>
                      <td className="px-3 py-2.5 text-center">{member.equip.belt}</td>
                      <td className="px-3 py-2.5 text-center border-r border-slate-300 dark:border-gray-800">{member.equip.shoes}</td>
                      <td className="px-3 py-2.5 text-center">{member.equip.ring1}</td>
                      <td className="px-3 py-2.5 text-center border-r border-slate-300 dark:border-gray-800">{member.equip.ring2}</td>
                      <td className="px-3 py-2.5 text-center">{member.stats.ki}</td>
                      <td className="px-3 py-2.5 text-center">{member.stats.evasion}</td>
                      <td className="px-3 py-2.5 text-center">{member.stats.atkSpeed}</td>
                      {/* 💡 가장 중요한 '합'은 글씨를 좀 더 크게(text-xl) 하고 색을 입혔습니다 */}
                      <td className="px-3 py-2.5 text-center text-xl text-blue-600 dark:text-blue-400">{member.stats.sum}</td>
                      <td className="px-3 py-2.5 text-center">{member.stats.hp}</td>
                      <td className="px-3 py-2.5 text-center border-r border-slate-300 dark:border-gray-800">{member.stats.luck}</td>
                      <td className="px-3 py-2.5 text-center text-emerald-600 dark:text-emerald-400">{member.special.lightfoot}</td>
                      <td className="px-3 py-2.5 text-center text-amber-600 dark:text-amber-400">{member.special.mount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}