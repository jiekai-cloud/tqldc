
import React, { useState, useMemo } from 'react';
import { 
  ClipboardSignature, Plus, User, Briefcase, Calendar, 
  Trash2, Search, FilterX, CreditCard, Users, Hammer, TrendingUp, 
  Sparkles, Loader2, Check, ArrowRight, Info, AlertCircle, AlertTriangle, ChevronDown
} from 'lucide-react';
import { Project, TeamMember, WorkAssignment } from '../types';
import { parseWorkDispatchText } from '../services/geminiService';

interface DispatchManagerProps {
  projects: Project[];
  teamMembers: TeamMember[];
  onAddDispatch: (projectId: string, assignment: WorkAssignment) => void;
  onDeleteDispatch: (projectId: string, assignmentId: string) => void;
}

interface PendingAssignment {
  id: string;
  projectId: string; // AI 抓到的原始 ID
  matchedProjectId: string; // 系統內匹配到的實際 ID (若無則為空)
  date: string;
  memberName: string;
  wagePerDay: string;
  days: string;
  description: string;
}

const DispatchManager: React.FC<DispatchManagerProps> = ({ projects, teamMembers, onAddDispatch, onDeleteDispatch }) => {
  const [activeMode, setActiveMode] = useState<'manual' | 'ai'>('manual');
  const [isParsing, setIsParsing] = useState(false);
  const [rawLog, setRawLog] = useState('');
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
  
  const [filterProject, setFilterProject] = useState('all');
  const [formData, setFormData] = useState({
    projectId: '',
    memberId: '',
    date: new Date().toISOString().split('T')[0],
    wagePerDay: '',
    days: '1'
  });

  // AI 解析處理
  const handleAIParse = async () => {
    if (!rawLog.trim()) return;
    setIsParsing(true);
    try {
      const results = await parseWorkDispatchText(rawLog);
      
      const mapped = results.map((r, idx) => {
        // 嘗試在現有專案中尋找匹配項
        const matched = projects.find(p => 
          p.id.toLowerCase().includes(r.projectId.toLowerCase()) || 
          r.projectId.toLowerCase().includes(p.id.toLowerCase()) ||
          p.name.includes(r.projectId)
        );

        return {
          id: `pending-${idx}-${Date.now()}`,
          projectId: r.projectId,
          matchedProjectId: matched?.id || '',
          date: r.date,
          memberName: r.memberName,
          wagePerDay: '2500', 
          days: '1',
          description: r.description
        };
      });
      setPendingAssignments(mapped);
    } catch (error) {
      alert("AI 解析失敗，請檢查網路或手動輸入。");
    } finally {
      setIsParsing(false);
    }
  };

  const handleBulkImport = () => {
    const validItems = pendingAssignments.filter(item => item.matchedProjectId !== '');
    if (validItems.length === 0) {
      alert("沒有可匯入的項目。請先為標記為紅色的項目選擇正確的專案。");
      return;
    }

    let successCount = 0;
    validItems.forEach(item => {
      const member = teamMembers.find(m => m.name === item.memberName);
      onAddDispatch(item.matchedProjectId, {
        id: Date.now().toString() + Math.random(),
        date: item.date,
        memberId: member?.id || 'EXTERNAL',
        memberName: item.memberName,
        wagePerDay: Number(item.wagePerDay),
        days: Number(item.days),
        totalCost: Number(item.wagePerDay) * Number(item.days)
      });
      successCount++;
    });

    alert(`成功匯入 ${successCount} 筆派工紀錄至案件成本。`);
    if (successCount === pendingAssignments.length) {
      setPendingAssignments([]);
      setRawLog('');
      setActiveMode('manual');
    } else {
      // 留下那些還沒匹配成功的
      setPendingAssignments(prev => prev.filter(p => p.matchedProjectId === ''));
    }
  };

  const updatePendingItem = (id: string, field: keyof PendingAssignment, value: string) => {
    setPendingAssignments(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = projects.find(p => p.id === formData.projectId);
    const member = teamMembers.find(m => m.id === formData.memberId);
    if (!project || !member || !formData.wagePerDay || !formData.days) return;
    onAddDispatch(project.id, {
      id: Date.now().toString(),
      date: formData.date,
      memberId: member.id,
      memberName: member.name,
      wagePerDay: Number(formData.wagePerDay),
      days: Number(formData.days),
      totalCost: Number(formData.wagePerDay) * Number(formData.days)
    });
    setFormData({ ...formData, memberId: '', wagePerDay: '', days: '1' });
  };

  const allAssignments = useMemo(() => {
    const list: (WorkAssignment & { projectName: string, projectId: string })[] = [];
    projects.forEach(p => {
      (p.workAssignments || []).forEach(wa => {
        list.push({ ...wa, projectName: p.name, projectId: p.id });
      });
    });
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [projects]);

  const filteredAssignments = useMemo(() => {
    if (filterProject === 'all') return allAssignments;
    return allAssignments.filter(a => a.projectId === filterProject);
  }, [allAssignments, filterProject]);

  return (
    <div className="p-4 lg:p-8 space-y-6 animate-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-stone-900 tracking-tight">成本管理與派工系統</h1>
          <p className="text-stone-500 text-xs lg:text-sm font-medium">您可以手動輸入或貼上日報，AI 將自動為您計算案件成本。</p>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
           <button 
             onClick={() => setActiveMode('manual')}
             className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeMode === 'manual' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}
           >
             手動單筆錄入
           </button>
           <button 
             onClick={() => setActiveMode('ai')}
             className={`px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all ${activeMode === 'ai' ? 'bg-white text-orange-600 shadow-sm' : 'text-stone-400'}`}
           >
             <Sparkles size={14} /> AI 智慧解析日報
           </button>
        </div>
      </div>

      {activeMode === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95">
          {/* 左側：輸入日報 */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-2 uppercase tracking-widest">
              <ClipboardSignature size={20} className="text-orange-600" /> 第一步：貼上日報文字
            </h3>
            <textarea 
              className="w-full h-80 bg-stone-50 border border-stone-200 rounded-3xl p-6 text-sm font-bold text-black outline-none focus:ring-4 focus:ring-orange-500/10 placeholder:text-stone-300 resize-none leading-relaxed"
              placeholder="請直接貼上 Line 訊息或日報內容..."
              value={rawLog}
              onChange={e => setRawLog(e.target.value)}
            />
            <button 
              onClick={handleAIParse}
              disabled={isParsing || !rawLog.trim()}
              className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isParsing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} className="text-orange-400" />}
              {isParsing ? 'AI 解析中...' : '開始 AI 智慧解析'}
            </button>
          </div>

          {/* 右側：解析預覽與匹配修正 */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm flex flex-col h-full">
             <div className="flex justify-between items-center mb-6 shrink-0">
               <h3 className="text-sm font-black text-stone-900 flex items-center gap-2 uppercase tracking-widest">
                <Check size={20} className="text-emerald-600" /> 第二步：確認並匯入
               </h3>
               {pendingAssignments.length > 0 && (
                 <button 
                   onClick={handleBulkImport} 
                   className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 flex items-center gap-2"
                 >
                   匯入紀錄 ({pendingAssignments.filter(i => i.matchedProjectId !== '').length})
                 </button>
               )}
             </div>

             <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-2 min-h-[450px]">
               {pendingAssignments.length > 0 ? pendingAssignments.map((item) => (
                 <div 
                   key={item.id} 
                   className={`p-5 rounded-2xl border transition-all space-y-3 relative group ${
                     item.matchedProjectId ? 'bg-stone-50 border-stone-100' : 'bg-rose-50 border-rose-100 ring-2 ring-rose-500/20'
                   }`}
                 >
                    <button onClick={() => setPendingAssignments(prev => prev.filter(p => p.id !== item.id))} className="absolute top-4 right-4 text-stone-300 hover:text-rose-500">
                      <Trash2 size={14} />
                    </button>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {item.matchedProjectId ? (
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">匹配成功: {item.matchedProjectId}</span>
                        ) : (
                          <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
                            <AlertTriangle size={10} /> 找不到案號: {item.projectId}
                          </span>
                        )}
                      </div>
                      
                      {/* 專案選擇/修正下拉選單 */}
                      <div className="relative">
                        <select 
                          className={`w-full bg-white border rounded-xl px-3 py-2 text-xs font-black text-black outline-none ${item.matchedProjectId ? 'border-stone-200' : 'border-rose-300 ring-2 ring-rose-500/10'}`}
                          value={item.matchedProjectId}
                          onChange={e => updatePendingItem(item.id, 'matchedProjectId', e.target.value)}
                        >
                          <option value="">請手動指定所屬專案...</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                        </select>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-white border border-stone-200 rounded-lg flex items-center justify-center font-black text-xs text-stone-700">{item.memberName.charAt(0)}</div>
                          <div>
                            <p className="text-xs font-black text-stone-900">{item.memberName}</p>
                            <p className="text-[9px] text-stone-400 font-bold">{item.date}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                      <div>
                        <label className="block text-[8px] font-black text-stone-400 uppercase mb-1">單日薪資 (TWD)</label>
                        <input 
                          type="number" 
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-black text-black outline-none" 
                          value={item.wagePerDay}
                          onChange={e => updatePendingItem(item.id, 'wagePerDay', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-stone-400 uppercase mb-1">派工天數</label>
                        <input 
                          type="number" step="0.5"
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-black text-black outline-none" 
                          value={item.days}
                          onChange={e => updatePendingItem(item.id, 'days', e.target.value)}
                        />
                      </div>
                    </div>
                 </div>
               )) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-stone-400 space-y-3">
                    <AlertCircle size={48} />
                    <p className="text-xs font-black uppercase tracking-widest">AI 解析結果將顯示於此</p>
                 </div>
               )}
             </div>
             
             {pendingAssignments.length > 0 && (
               <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-3">
                  <Info size={16} className="text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-orange-700 font-bold leading-relaxed">
                    如果顯示紅色，表示系統內找不到對應案號。請點擊選單手動選擇正確的案件名稱，否則該筆紀錄將無法匯入。
                  </p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* 手動錄入介面 (與之前相同) */}
      {activeMode === 'manual' && (
        <div className="bg-white p-8 rounded-[2rem] border-2 border-stone-100 shadow-sm animate-in zoom-in-95">
           <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-stone-500 uppercase mb-2">1. 選擇專案</label>
              <select 
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none focus:ring-2 focus:ring-orange-500/20"
                value={formData.projectId}
                onChange={e => setFormData({...formData, projectId: e.target.value})}
              >
                <option value="">請選擇專案...</option>
                {projects.map(p => <option key={p.id} value={p.id} className="text-black">{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-stone-500 uppercase mb-2">2. 派駐成員</label>
              <select 
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none"
                value={formData.memberId}
                onChange={e => setFormData({...formData, memberId: e.target.value})}
              >
                <option value="">選擇人員...</option>
                {teamMembers.map(m => <option key={m.id} value={m.id} className="text-black">{m.name} ({m.role})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-stone-500 uppercase mb-2">3. 薪資 (TWD)</label>
              <input 
                type="number" 
                placeholder="2500"
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none"
                value={formData.wagePerDay}
                onChange={e => setFormData({...formData, wagePerDay: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-stone-500 uppercase mb-2">4. 天數</label>
              <div className="flex gap-2">
                <input 
                  type="number" step="0.5" min="0.5"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none"
                  value={formData.days}
                  onChange={e => setFormData({...formData, days: e.target.value})}
                />
                <button type="submit" className="bg-stone-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-stone-100 hover:bg-black transition-all">確認</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 數據統計與清單 (與之前相同) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Hammer size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">總人天統計</p>
            <p className="text-xl font-black text-stone-900">{filteredAssignments.reduce((acc, curr) => acc + curr.days, 0)} 人天</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><CreditCard size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">總人力開銷</p>
            <p className="text-xl font-black text-stone-900">NT$ {filteredAssignments.reduce((acc, curr) => acc + curr.totalCost, 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">案件人力佔比</p>
            <p className="text-xl font-black text-stone-900">28.5%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <ClipboardSignature size={18} className="text-orange-600" />
             <h3 className="font-black text-stone-900 text-sm uppercase tracking-widest">累積派工紀錄明細</h3>
          </div>
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
             <Briefcase size={14} className="text-stone-400" />
             <select 
               className="bg-transparent text-xs font-bold text-black outline-none cursor-pointer"
               value={filterProject}
               onChange={e => setFilterProject(e.target.value)}
             >
               <option value="all">所有案件紀錄</option>
               {projects.map(p => <option key={p.id} value={p.id} className="text-black">{p.name}</option>)}
             </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50 text-[10px] font-black text-stone-400 uppercase tracking-widest border-b border-stone-100">
                <th className="px-8 py-4">日期</th>
                <th className="px-8 py-4">所屬案件</th>
                <th className="px-8 py-4">成員</th>
                <th className="px-8 py-4 text-right">單日薪資</th>
                <th className="px-8 py-4 text-right">天數</th>
                <th className="px-8 py-4 text-right">成本小計</th>
                <th className="px-8 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredAssignments.length > 0 ? filteredAssignments.map((item) => (
                <tr key={item.id} className="text-sm hover:bg-stone-50/50 transition-colors group">
                  <td className="px-8 py-5 font-mono text-xs text-stone-500">{item.date}</td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-stone-900">{item.projectName}</span>
                      <span className="text-[10px] text-stone-400 font-black">{item.projectId}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-bold text-stone-800">{item.memberName}</td>
                  <td className="px-8 py-5 text-right font-bold text-stone-600">NT$ {item.wagePerDay.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right font-black text-stone-900">{item.days}</td>
                  <td className="px-8 py-5 text-right font-black text-orange-600">NT$ {item.totalCost.toLocaleString()}</td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => onDeleteDispatch(item.projectId, item.id)}
                      className="p-2 text-stone-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-xs font-black uppercase tracking-widest text-stone-300 italic">尚無相關紀錄</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DispatchManager;
