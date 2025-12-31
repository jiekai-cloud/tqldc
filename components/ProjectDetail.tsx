
import React, { useState, useMemo, useRef } from 'react';
import { 
  ArrowLeft, CheckCircle2, Clock, DollarSign, Pencil, Sparkles, Trash2, Activity, 
  MessageSquare, Send, Receipt, X, ZoomIn, FileText, ImageIcon, Upload, MapPin, 
  Navigation, ShoppingBag, Utensils, Building2, ExternalLink, CalendarDays, Loader2, Check, DownloadCloud, ShieldAlert
} from 'lucide-react';
import { Project, ProjectStatus, Task, ProjectComment, Expense, WorkAssignment, TeamMember, ProjectFile, ProjectPhase, User } from '../types';
import { suggestProjectSchedule, searchNearbyResources } from '../services/geminiService';

interface ProjectDetailProps {
  project: Project;
  user: User;
  teamMembers: TeamMember[];
  onBack: () => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onLossClick: (project: Project) => void;
  onUpdateTasks: (tasks: Task[]) => void;
  onUpdateProgress: (progress: number) => void;
  onUpdateStatus: (status: ProjectStatus) => void;
  onAddComment: (text: string) => void;
  onUpdateExpenses: (expenses: Expense[], newSpent: number) => void;
  onUpdateWorkAssignments: (assignments: WorkAssignment[], newSpent: number) => void;
  onUpdateFiles?: (files: ProjectFile[]) => void;
  onUpdatePhases?: (phases: ProjectPhase[]) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  project, user, teamMembers, onBack, onEdit, onDelete, onLossClick, 
  onUpdateTasks, onUpdateProgress, onUpdateStatus, onAddComment, 
  onUpdateExpenses, onUpdateWorkAssignments, onUpdateFiles, onUpdatePhases
}) => {
  const [newComment, setNewComment] = useState('');
  const [activeView, setActiveView] = useState<'tasks' | 'financials' | 'logs' | 'photos' | 'schedule' | 'map'>('logs');
  const [selectedImage, setSelectedImage] = useState<ProjectFile | null>(null);
  const [isReportMode, setIsReportMode] = useState(false);
  const [isAIScheduling, setIsAIScheduling] = useState(false);
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [nearbyResults, setNearbyResults] = useState<{text: string, links: any[]} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isReadOnly = user.role === 'Guest';
  const statusOptions = Object.values(ProjectStatus);
  const expenses = project.expenses || [];
  const assignments = project.workAssignments || [];
  const files = project.files || [];
  
  const totalLaborCost = assignments.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalExpenseCost = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const currentSpent = totalLaborCost + totalExpenseCost;
  const margin = project.budget - currentSpent;

  const handleNearbySearch = async (resourceType: string) => {
    if (!project.location) return;
    setIsSearchingNearby(true);
    setNearbyResults(null);
    try {
      const result = await searchNearbyResources(
        project.location.address,
        project.location.lat,
        project.location.lng,
        resourceType
      );
      setNearbyResults(result);
    } catch (error) {
      console.error("AI 搜尋附近資源失敗:", error);
    } finally {
      setIsSearchingNearby(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500 overflow-hidden">
      {/* 固定標頭資訊 */}
      <div className="p-4 lg:p-8 space-y-4 shrink-0 bg-white/50 border-b border-stone-100">
        <div className="flex justify-between items-center no-print">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">返回</span>
          </button>
          <div className="flex gap-2">
            {!isReadOnly && (
              <>
                <button onClick={() => setIsReportMode(true)} className="flex items-center gap-2 bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-xl text-[10px] font-black"><FileText size={14} /> 報表</button>
                <button onClick={() => onEdit(project)} className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-black"><Pencil size={14} /> 編輯</button>
              </>
            )}
            {isReadOnly && (
              <div className="flex items-center gap-2 bg-stone-100 text-stone-400 px-3 py-1.5 rounded-xl text-[10px] font-black border border-stone-200">
                <ShieldAlert size={14} /> 訪客唯讀權限
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">{project.id}</span>
            <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-blue-100 uppercase">{project.category}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">{project.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-bold uppercase">
            <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400" /> {project.location?.address || '無地址'}</span>
            <div className="flex items-center gap-1">
              <Activity size={12} />
              <select 
                disabled={isReadOnly}
                className={`bg-transparent outline-none appearance-none text-blue-600 font-black ${isReadOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                value={project.status}
                onChange={(e) => onUpdateStatus(e.target.value as ProjectStatus)}
              >
                {statusOptions.map(opt => <option key={opt} value={opt} className="text-black font-bold">{opt}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 導覽標籤列 */}
      <div className="px-4 py-3 bg-white border-b border-stone-100 shrink-0 no-print">
        <div className="flex gap-2 overflow-x-auto no-scrollbar touch-scroll pb-1">
          {[
            { id: 'logs', label: '處理紀錄', icon: MessageSquare },
            { id: 'schedule', label: '施工排程', icon: CalendarDays },
            { id: 'financials', label: '財務分析', icon: DollarSign },
            { id: 'map', label: '案場定位', icon: Navigation },
            { id: 'photos', label: '照片庫', icon: ImageIcon },
            { id: 'tasks', label: '任務追蹤', icon: CheckCircle2 }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveView(item.id as any)} 
              className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all flex items-center gap-2 whitespace-nowrap shadow-sm border ${activeView === item.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-stone-100 hover:border-stone-300'}`}
            >
              <item.icon size={14} /> {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 視圖內容區 */}
      <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 overflow-hidden">
        {activeView === 'logs' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col h-full animate-in fade-in overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-600" />
                <h3 className="font-black text-xs uppercase tracking-widest">現場紀錄留言板</h3>
              </div>
              {isReadOnly && <span className="text-[10px] font-black text-stone-400 uppercase">唯讀視圖</span>}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 touch-scroll no-scrollbar">
              {(project.comments || []).length > 0 ? (
                (project.comments || []).map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center font-black text-stone-400 text-[10px] shrink-0">
                      {comment.authorName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-black text-stone-900 truncate mr-2">{comment.authorName}</span>
                        <span className="text-[9px] text-stone-400 shrink-0">{comment.timestamp}</span>
                      </div>
                      <div className="bg-stone-50 p-3 rounded-2xl rounded-tl-none border border-stone-100 text-[11px] font-medium leading-relaxed text-stone-700 shadow-sm">
                        {comment.text}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-300 gap-2 opacity-50">
                  <MessageSquare size={40} />
                  <p className="text-[10px] font-black uppercase tracking-widest">目前尚無現場紀錄</p>
                </div>
              )}
            </div>

            {/* 留言輸入框 - 唯讀模式下隱藏或變更樣式 */}
            {!isReadOnly ? (
              <div className="p-4 bg-white border-t border-stone-100 shrink-0 no-print">
                <form 
                  onSubmit={(e) => { e.preventDefault(); if(!newComment.trim()) return; onAddComment(newComment); setNewComment(''); }} 
                  className="flex gap-2"
                >
                  <input 
                    type="text" 
                    placeholder="輸入現場狀況紀錄..." 
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-blue-600/20 placeholder:text-stone-300" 
                    value={newComment} 
                    onChange={e => setNewComment(e.target.value)} 
                  />
                  <button 
                    type="submit" 
                    disabled={!newComment.trim()} 
                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 disabled:opacity-20"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-5 bg-stone-50 border-t border-stone-100 text-center">
                 <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest italic">訪客帳號無法發送訊息</p>
              </div>
            )}
          </div>
        )}

        {activeView !== 'logs' && (
          <div className="flex-1 overflow-y-auto touch-scroll space-y-4 pr-1 no-scrollbar">
            {activeView === 'financials' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
                      <p className="text-[9px] font-black text-stone-400 uppercase mb-2">預算執行率</p>
                      <p className="text-2xl font-black text-stone-900">{((currentSpent/project.budget)*100).toFixed(1)}%</p>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full mt-2 overflow-hidden"><div className="bg-blue-600 h-full" style={{ width: `${(currentSpent/project.budget)*100}%` }}></div></div>
                   </div>
                   <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
                      <p className="text-[9px] font-black text-stone-400 uppercase mb-2">預估剩餘資金</p>
                      <p className="text-2xl font-black text-emerald-600">NT$ {margin.toLocaleString()}</p>
                   </div>
                </div>
              </div>
            )}
            
            {activeView === 'map' && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-6 animate-in fade-in shadow-sm">
                 <h3 className="font-black text-stone-900 uppercase text-xs flex items-center gap-2"><MapPin size={16} className="text-blue-600" /> 地理定位</h3>
                 <div className="aspect-video bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 border border-stone-100"><MapPin size={40} className="text-blue-600 opacity-20" /></div>
                 <div className="space-y-3">
                    <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-widest">附近資源搜尋</h4>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleNearbySearch('五金行')} 
                        disabled={isSearchingNearby || isReadOnly}
                        className="bg-blue-50 text-blue-600 px-3 py-2 rounded-xl text-[10px] font-black border border-blue-100 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSearchingNearby ? <Loader2 size={12} className="animate-spin" /> : '五金行'}
                      </button>
                      <button 
                        onClick={() => handleNearbySearch('建材行')} 
                        disabled={isSearchingNearby || isReadOnly}
                        className="bg-amber-50 text-amber-600 px-3 py-2 rounded-xl text-[10px] font-black border border-amber-100 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSearchingNearby ? <Loader2 size={12} className="animate-spin" /> : '建材行'}
                      </button>
                    </div>

                    {nearbyResults && (
                      <div className="mt-4 p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-3 animate-in fade-in">
                        <p className="text-[11px] font-medium text-stone-700 leading-relaxed whitespace-pre-wrap">{nearbyResults.text}</p>
                        <div className="flex flex-wrap gap-2">
                          {nearbyResults.links.map((link, i) => (
                            <a 
                              key={i} 
                              href={link.uri} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-1.5 bg-white border border-stone-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-blue-600 hover:border-blue-300 transition-colors shadow-sm"
                            >
                              <ExternalLink size={10} /> {link.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
