'use client';
import React, { useState, useEffect, useMemo } from 'react';

type MemberData = {
  name: string; id: string; role: string; job: string; jobTier: string;
  equip: { weapon: string; weaponAtk: string; helmet: string; armor: string; belt: string; shoes: string; ring1: string; ring2: string; };
  stats: { ki: string; evasion: string; atkSpeed: string; sum: string; hp: string; luck: string; };
  special: { lightfoot: string; mount: string; };
};

type GuildData = { id: string; name: string; members: MemberData[] };

type ReportItem = {
  id: string; guildName: string; memberName: string; categoryName: string; oldValue: string; newValue: string; timestamp: string;
};

const REPORT_CATEGORIES = [
  { id: 'weapon', name: '무기 강화 단계' },
  { id: 'helmet', name: '투구 강화 단계' },
  { id: 'armor', name: '갑옷 강화 단계' },
  { id: 'belt', name: '벨트 강화 단계' },
  { id: 'shoes', name: '신발 강화 단계' },
  { id: 'ring1', name: '반지1 강화 단계' },
  { id: 'ring2', name: '반지2 강화 단계' },
  { id: 'ki', name: '내공 스탯' },
  { id: 'evasion', name: '회피 스탯' },
  { id: 'atkSpeed', name: '공속 스탯' },
  { id: 'hp', name: '체력 스탯' },
  { id: 'luck', name: '운 스탯' },
  { id: 'lightfoot', name: '경공비급' },
  { id: 'mount', name: '탈것' },
  { id: 'boss', name: '보스 루팅 제보' },
];

const getTodayStr = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}/${day}`;
};
const TODAY_STR = getTodayStr();

const formatDisplayValue = (val: string) => {
  if (!val) return '';
  if (val.includes('T') && val.endsWith('Z')) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    }
  }
  return val;
};

export default function ReportPage() {
  const [guilds, setGuilds] = useState<GuildData[]>([]);
  const [bosses, setBosses] = useState<string[]>([]);
  const [guildMap, setGuildMap] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState<ReportItem[]>([]);
  
  const [activeTab, setActiveTab] = useState<'boss' | 'info' | 'bug'>('boss');

  const [selectedGuild, setSelectedGuild] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [oldValue, setOldValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bossDate, setBossDate] = useState(TODAY_STR);
  const [bossTime, setBossTime] = useState('');
  const [bossType, setBossType] = useState('');
  const [bossGuild, setBossGuild] = useState('');
  const [bossPlayer, setBossPlayer] = useState('');
  const [isBossSubmitting, setIsBossSubmitting] = useState(false);

  const [bugTitle, setBugTitle] = useState('');
  const [bugContent, setBugContent] = useState('');
  const [isBugSubmitting, setIsBugSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, reportRes, optionsRes] = await Promise.all([
          fetch('/api/status').catch(() => null),
          fetch('/api/report').catch(() => null),
          fetch('/api/report-options').catch(() => null)
        ]);
        
        let fetchedGuilds: any[] = [];
        
        if (statusRes && statusRes.ok) {
          const statusJson = await statusRes.json();
          if (statusJson.success) {
            fetchedGuilds = statusJson.data;
            setGuilds(fetchedGuilds);
          }
        }
        
        if (reportRes && reportRes.ok) {
          const reportJson = await reportRes.json();
          if (reportJson.success) {
            const formattedReports = reportJson.data.map((item: any) => {
              const catObj = REPORT_CATEGORIES.find(c => c.id === item.categoryName);
              const guildObj = fetchedGuilds.find((g: any) => g.id === item.guildName);
              return { ...item, guildName: guildObj?.name || item.guildName, categoryName: catObj?.name || item.categoryName };
            });
            setReports(formattedReports);
          }
        }

        if (optionsRes && optionsRes.ok) {
          const optionsJson = await optionsRes.json();
          if (optionsJson.bosses) setBosses(optionsJson.bosses);
          if (optionsJson.guildMap) {
            setGuildMap(optionsJson.guildMap);
            const availableGuilds = Object.keys(optionsJson.guildMap);
            if (availableGuilds.length > 0) {
              setBossGuild(availableGuilds[0]);
            }
          }
          if (optionsJson.bosses?.length > 0) setBossType(optionsJson.bosses[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentGuild = guilds.find(g => g.id === selectedGuild);
  const members = currentGuild ? currentGuild.members : [];

  const filteredPlayers: string[] = useMemo(() => {
    return guildMap[bossGuild] || [];
  }, [guildMap, bossGuild]);

  useEffect(() => {
    if (filteredPlayers.length > 0) {
      setBossPlayer(filteredPlayers[0]);
    } else {
      setBossPlayer('');
    }
  }, [filteredPlayers]);

  useEffect(() => {
    if (selectedGuild && selectedMember && selectedCategory) {
      const memberData = currentGuild?.members.find(m => m.name === selectedMember);
      if (memberData) {
        let val = '';
        switch (selectedCategory) {
          case 'weapon': val = memberData.equip?.weapon; break;
          case 'helmet': val = memberData.equip?.helmet; break;
          case 'armor': val = memberData.equip?.armor; break;
          case 'belt': val = memberData.equip?.belt; break;
          case 'shoes': val = memberData.equip?.shoes; break;
          case 'ring1': val = memberData.equip?.ring1; break;
          case 'ring2': val = memberData.equip?.ring2; break;
          case 'ki': val = memberData.stats?.ki; break;
          case 'evasion': val = memberData.stats?.evasion; break;
          case 'atkSpeed': val = memberData.stats?.atkSpeed; break;
          case 'hp': val = memberData.stats?.hp; break;
          case 'luck': val = memberData.stats?.luck; break;
          case 'lightfoot': val = memberData.special?.lightfoot; break;
          case 'mount': val = memberData.special?.mount; break;
        }
        setOldValue(val || '기록 없음');
      }
    } else {
      setOldValue('');
    }
  }, [selectedGuild, selectedMember, selectedCategory, currentGuild]);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuild || !selectedMember || !selectedCategory || !newValue) {
      alert('필수 항목을 모두 입력해주세요.'); return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'stat', 
          guild: selectedGuild, 
          member: selectedMember, 
          category: selectedCategory, 
          oldValue, 
          newValue, 
          proofLink, 
          remarks 
        })
      });
      const result = await res.json();
      if (result.success) {
        alert('제보가 성공적으로 접수되었습니다!');
        window.location.reload();
      } else { alert('전송 실패'); }
    } catch { alert('서버 통신 에러'); } finally { setIsSubmitting(false); }
  };

  const handleBossSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bossDate || !bossTime || !bossType || !bossGuild || !bossPlayer) {
      alert('모든 항목을 입력해주세요.'); return;
    }
    setIsBossSubmitting(true);
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'boss',
          category: 'boss', 
          date: bossDate,
          time: bossTime,
          bossName: bossType,
          guild: bossGuild,
          player: bossPlayer
        })
      });

      alert('보스 루팅 제보가 완료되었습니다!');
      window.location.reload();
    } catch { alert('서버 통신 에러'); } finally { setIsBossSubmitting(false); }
  };

  const handleBugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle || !bugContent) {
      alert('제목과 상세 내용을 모두 입력해주세요.'); return;
    }
    setIsBugSubmitting(true);
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'bug', 
          category: 'bug',
          title: bugTitle, 
          content: bugContent 
        })
      });
      alert('버그/건의 제보가 성공적으로 전송되었습니다! 감사합니다.');
      setBugTitle(''); setBugContent(''); setShowForm(false);
    } catch { alert('서버 통신 에러'); } finally { setIsBugSubmitting(false); }
  };

  if (isLoading) return <div className="h-full flex items-center justify-center font-bold text-slate-400">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="animate-fade-in pb-10 max-w-3xl mx-auto mt-4 select-none">
      <div className="mb-8 text-center flex flex-col items-center">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">📢 정보 공유방</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-2">인게임 현황 및 보스 루팅, 웹사이트 오류를 제보해주세요!</p>
      </div>

      {!showForm ? (
        <div className="animate-fade-in">
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-lg font-black text-slate-800 dark:text-white">현재 대기 중인 제보</h2>
            <button onClick={() => { setShowForm(true); setActiveTab('boss'); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl shadow-md transition-all">✍️ 제보하기</button>
          </div>
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-slate-200 dark:border-gray-800 p-4 space-y-2">
            {reports.length > 0 ? reports.map((report) => (
              <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#121212] border border-slate-100 dark:border-gray-800 gap-4">
                
                {/* 💡 보스 제보일 때의 특수 UI 디자인 (화살표 제거, 루팅유저 추가) */}
                {report.categoryName === '보스 루팅 제보' || report.categoryName === 'boss' ? (
                  <>
                    <div>
                      <p className="text-xs font-bold text-purple-500 dark:text-purple-400 mb-0.5">[{report.guildName}] 보스 루팅</p>
                      <p className="text-sm font-black text-slate-800 dark:text-gray-200">⚔️ {report.newValue}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 px-4 py-2.5 rounded-lg border border-purple-200 dark:border-purple-800/50 shadow-inner">
                      <span className="text-sm font-bold text-slate-600 dark:text-gray-300">{formatDisplayValue(report.oldValue)}</span>
                      <span className="text-sm font-black text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded-md shadow-sm">
                        👤 {report.memberName}
                      </span>
                    </div>
                  </>
                ) : (
                  /* 기존 인게임 스탯 제보 UI */
                  <>
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-gray-400 mb-0.5">[{report.guildName}] {report.memberName}</p>
                      <p className="text-sm font-black text-slate-800 dark:text-gray-200">{report.categoryName}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-700 shadow-inner">
                      <span className="text-sm font-bold text-slate-500 dark:text-gray-400">{formatDisplayValue(report.oldValue)}</span>
                      <span>➡️</span>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400">{report.newValue}</span>
                    </div>
                  </>
                )}

              </div>
            )) : <div className="py-12 text-center text-slate-400 font-bold">대기 중인 제보 없음</div>}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-gray-800">
           
           <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <button onClick={() => setActiveTab('boss')} className={`text-lg font-black pb-2 px-1 transition-all border-b-2 ${activeTab === 'boss' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400'}`}>🐉 보스 루팅</button>
                <button onClick={() => setActiveTab('info')} className={`text-lg font-black pb-2 px-1 transition-all border-b-2 ${activeTab === 'info' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400'}`}>📊 인게임 스탯 갱신</button>
                <button onClick={() => setActiveTab('bug')} className={`text-lg font-black pb-2 px-1 transition-all border-b-2 ${activeTab === 'bug' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-gray-400'}`}>🐛 사이트 버그제보</button>
              </div>
              <button onClick={() => setShowForm(false)} className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors mt-1 border border-slate-200 dark:border-gray-700 px-3 py-1 rounded-lg">✕ 취소</button>
           </div>

           {activeTab === 'info' && (
             <form onSubmit={handleInfoSubmit} className="space-y-6 animate-fade-in">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">1. 길드 선택</label>
                   <select value={selectedGuild} onChange={(e) => { setSelectedGuild(e.target.value); setSelectedMember(''); setSelectedCategory(''); }} className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm font-bold outline-none">
                     <option value="">길드를 선택하세요</option>
                     {guilds.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">2. 인원 선택</label>
                   <select value={selectedMember} onChange={(e) => { setSelectedMember(e.target.value); setSelectedCategory(''); }} disabled={!selectedGuild} className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm font-bold outline-none">
                     <option value="">대상을 선택하세요</option>
                     {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                   </select>
                 </div>
               </div>
               <div className="pt-2">
                 <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">3. 제보할 항목</label>
                 <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} disabled={!selectedMember} className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm font-bold outline-none">
                   <option value="">어떤 정보가 변경되었나요?</option>
                   {REPORT_CATEGORIES.filter(c => c.id !== 'boss').map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                 </select>
               </div>
               <div className="grid grid-cols-2 gap-4 pt-2">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">기존 수치</label>
                   <input type="text" value={oldValue} readOnly className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 rounded-xl p-3 text-sm font-bold cursor-not-allowed" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-blue-500 dark:text-blue-400 mb-2">새로운 수치 (필수)</label>
                   <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} required disabled={!selectedCategory} className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-100 rounded-xl p-3 text-sm font-black" placeholder="예: 5강" />
                 </div>
               </div>
               <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 rounded-xl">
                 {isSubmitting ? '제보 전송 중...' : '관리자에게 제보하기'}
               </button>
             </form>
           )}

           {activeTab === 'boss' && (
             <form onSubmit={handleBossSubmit} className="space-y-6 animate-fade-in pt-2">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">처치 날짜</label>
                   <input type="text" value={bossDate} onChange={(e) => setBossDate(e.target.value)} placeholder="ex) 06/24" required className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm font-bold outline-none" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">처치 시간대</label>
                   <input type="text" placeholder="ex) 15:30" value={bossTime} onChange={(e) => setBossTime(e.target.value)} required className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm font-bold outline-none" />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">보스 종류</label>
                   <select value={bossType} onChange={(e) => setBossType(e.target.value)} required className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm font-bold outline-none">
                     <option value="">선택하세요</option>
                     {bosses.map((b, idx) => <option key={idx} value={b}>{b}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">처치/루팅 길드</label>
                   <select value={bossGuild} onChange={(e) => { setBossGuild(e.target.value); }} required className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm font-bold outline-none">
                     {Object.keys(guildMap).map((gName, idx) => <option key={idx} value={gName}>{gName}</option>)}
                   </select>
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">최종 루팅 플레이어</label>
                 <select value={bossPlayer} onChange={(e) => setBossPlayer(e.target.value)} required className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm font-bold outline-none">
                   {filteredPlayers.map((pName, idx) => <option key={idx} value={pName}>{pName}</option>)}
                   {filteredPlayers.length === 0 && <option value="">선택한 길드에 인원이 없습니다</option>}
                 </select>
               </div>
               <button type="submit" disabled={isBossSubmitting} className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-black text-lg py-4 rounded-xl shadow-md transition-all">
                 {isBossSubmitting ? '전송 중...' : '보스 루팅 제보하기'}
               </button>
             </form>
           )}

           {activeTab === 'bug' && (
             <form onSubmit={handleBugSubmit} className="space-y-6 animate-fade-in pt-2">
               <div>
                 <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">제보 제목</label>
                 <input type="text" value={bugTitle} onChange={(e) => setBugTitle(e.target.value)} required className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm font-bold outline-none" placeholder="예: 무기 강화 시뮬레이터 수치 오류 제보" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">상세 내용 (메모장)</label>
                 <textarea value={bugContent} onChange={(e) => setBugContent(e.target.value)} required className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm min-h-[200px] outline-none" placeholder="오류 내용이나 건의사항을 적어주세요!" />
               </div>
               <button type="submit" disabled={isBugSubmitting} className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-black text-lg py-4 rounded-xl transition-all shadow-md">
                 {isBugSubmitting ? '전송 중...' : '관리자에게 제보하기'}
               </button>
             </form>
           )}
        </div>
      )}
    </div>
  );
}