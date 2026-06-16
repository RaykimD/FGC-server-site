'use client';
import React, { useState, useEffect } from 'react';

// --- 타입 정의 ---
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
];

export default function ReportPage() {
  const [guilds, setGuilds] = useState<GuildData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState<ReportItem[]>([]);

  // 폼 상태
  const [selectedGuild, setSelectedGuild] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [oldValue, setOldValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, reportRes] = await Promise.all([
          fetch('/api/status'),
          fetch('/api/report')
        ]);
        const statusJson = await statusRes.json();
        const reportJson = await reportRes.json();
        
        if (statusJson.success) setGuilds(statusJson.data);
        if (reportJson.success) {
          const formattedReports = reportJson.data.map((item: any) => {
            const catObj = REPORT_CATEGORIES.find(c => c.id === item.categoryName);
            const guildObj = statusJson.data.find((g: any) => g.id === item.guildName);
            return { ...item, guildName: guildObj?.name || item.guildName, categoryName: catObj?.name || item.categoryName };
          });
          setReports(formattedReports);
        }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const currentGuild = guilds.find(g => g.id === selectedGuild);
  const members = currentGuild ? currentGuild.members : [];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuild || !selectedMember || !selectedCategory || !newValue) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guild: selectedGuild, member: selectedMember, category: selectedCategory, oldValue, newValue, proofLink, remarks })
      });
      const result = await res.json();
      if (result.success) {
        alert('제보가 성공적으로 접수되었습니다!');
        setSelectedCategory(''); setOldValue(''); setNewValue(''); setProofLink(''); setRemarks(''); setShowForm(false);
      } else { alert('전송 실패'); }
    } catch { alert('서버 통신 에러'); } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="h-full flex items-center justify-center font-bold text-slate-400">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="animate-fade-in pb-10 max-w-3xl mx-auto mt-4 select-none">
      <div className="mb-8 text-center flex flex-col items-center">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">📢 정보 공유방</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-2">중복 제보를 확인하고 새로운 정보를 제보해주세요!</p>
      </div>

      {!showForm ? (
        <div className="animate-fade-in">
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-lg font-black text-slate-800 dark:text-white">현재 대기 중인 제보</h2>
            <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl shadow-md transition-all">✍️ 제보하기</button>
          </div>
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-slate-200 dark:border-gray-800 p-4 space-y-2">
            {reports.length > 0 ? reports.map((report) => (
              <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#121212] border border-slate-100 dark:border-gray-800 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-gray-400 mb-0.5">[{report.guildName}] {report.memberName}</p>
                  <p className="text-sm font-black text-slate-800 dark:text-gray-200">{report.categoryName}</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-700 shadow-inner">
                  <span className="text-sm font-bold text-slate-500 dark:text-gray-400 line-through">{report.oldValue}</span>
                  <span>➡️</span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400">{report.newValue}</span>
                </div>
              </div>
            )) : <div className="py-12 text-center text-slate-400 font-bold">대기 중인 제보 없음</div>}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-gray-800">
           <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-gray-800 pb-4">
              <h2 className="text-xl font-black text-slate-800 dark:text-white">✍️ 새로운 제보 작성</h2>
              <button onClick={() => setShowForm(false)} className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors">✕ 취소</button>
           </div>
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">1. 길드 선택</label>
                 <select value={selectedGuild} onChange={(e) => { setSelectedGuild(e.target.value); setSelectedMember(''); setSelectedCategory(''); }} className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                   <option value="">길드를 선택하세요</option>
                   {guilds.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">2. 인원 선택</label>
                 <select value={selectedMember} onChange={(e) => { setSelectedMember(e.target.value); setSelectedCategory(''); }} disabled={!selectedGuild} className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                   <option value="">대상을 선택하세요</option>
                   {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                 </select>
               </div>
             </div>
             <div className="pt-2">
               <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">3. 제보할 항목</label>
               <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} disabled={!selectedMember} className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                 <option value="">어떤 정보가 변경되었나요?</option>
                 {REPORT_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
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
             <div className="pt-2">
               <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">4. 증명 링크 (선택)</label>
               <input type="text" value={proofLink} onChange={(e) => setProofLink(e.target.value)} className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm" placeholder="예: 클립 링크" />
             </div>
             <div className="pt-2">
               <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2">5. 남기실 말씀 (선택)</label>
               <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-white rounded-xl p-3 text-sm h-24" placeholder="추가 전달 내용" />
             </div>
             <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 rounded-xl">
               {isSubmitting ? '제보 전송 중...' : '관리자에게 제보하기'}
             </button>
           </form>
        </div>
      )}
    </div>
  );
}