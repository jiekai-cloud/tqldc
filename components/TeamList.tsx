
import React, { useState } from 'react';
import { 
  Search, UserPlus, Phone, Mail, MoreHorizontal, Pencil, 
  Trash2, Award, Briefcase, Activity, ExternalLink, Sparkles, Hash
} from 'lucide-react';
import { TeamMember } from '../types';

interface TeamListProps {
  members: TeamMember[];
  onAddClick: () => void;
  onEditClick: (member: TeamMember) => void;
  onDeleteClick: (id: string) => void;
}

const TeamList: React.FC<TeamListProps> = ({ members, onAddClick, onEditClick, onDeleteClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.specialty.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'Available': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Busy': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'OnLeave': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusText = (status: TeamMember['status']) => {
    switch (status) {
      case 'Available': return '待命中';
      case 'Busy': return '執行任務中';
      case 'OnLeave': return '請假中';
      default: return '未知';
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">工程團隊成員</h1>
          <p className="text-slate-500 text-sm font-medium">管理內部員工與外部協力廠商的人力分佈與登入權限。</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
            <Sparkles size={16} className="text-orange-500" />
            AI 負載分析
          </button>
          <button 
            onClick={onAddClick}
            className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-100 active:scale-95 font-bold text-xs"
          >
            <UserPlus size={18} />
            新增成員
          </button>
        </div>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜尋姓名、員工編號、職位、專長..." 
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 outline-none text-sm text-slate-900 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      member.status === 'Available' ? 'bg-emerald-500' : member.status === 'Busy' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{member.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <Hash size={10} className="text-orange-500" />
                       <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                         {member.employeeId || '未設定'}
                       </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{member.role}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${getStatusBadge(member.status)}`}>
                    {getStatusText(member.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <Phone size={14} className="text-slate-400" />
                  <span className="font-bold font-mono">{member.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <Mail size={14} className="text-slate-400" />
                  <span className="font-medium truncate">{member.email}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {member.specialty.map(s => (
                  <span key={s} className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-100 flex items-center gap-1">
                    <Award size={10} className="text-orange-500" />
                    {s}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">目前案場負載</span>
                  <span className="text-xs font-black text-slate-900">{member.activeProjectsCount} 案進行中</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${
                    member.activeProjectsCount > 5 ? 'bg-rose-500' : member.activeProjectsCount > 3 ? 'bg-amber-500' : 'bg-orange-600'
                  }`} style={{ width: `${Math.min(member.activeProjectsCount * 20, 100)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <button 
                  onClick={() => onEditClick(member)}
                  className="p-2 text-slate-400 hover:text-orange-600 transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => onDeleteClick(member.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <button className="text-[10px] font-black text-orange-600 flex items-center gap-1 hover:underline">
                權限設定 <ExternalLink size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamList;
