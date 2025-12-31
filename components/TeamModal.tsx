
import React, { useState, useEffect, useRef } from 'react';
import { X, User, Shield, Phone, Mail, Award, Save, Camera, Loader2, Key, Hash } from 'lucide-react';
import { TeamMember } from '../types';

interface TeamModalProps {
  onClose: () => void;
  onConfirm: (data: Partial<TeamMember>) => void;
  initialData?: TeamMember | null;
}

const TeamModal: React.FC<TeamModalProps> = ({ onClose, onConfirm, initialData }) => {
  const roles: TeamMember['role'][] = ['專案經理', '工務主管', '現場工程師', '行政助理', '設計師', '工頭', '外部協力'];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    employeeId: '',
    password: '',
    name: '',
    role: '現場工程師',
    phone: '',
    email: '',
    specialty: [],
    status: 'Available',
    avatar: `https://picsum.photos/seed/${Math.random()}/200/200`,
    activeProjectsCount: 0
  });

  const [specialtyInput, setSpecialtyInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('檔案過大，請選擇小於 2MB 的圖片');
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          avatar: reader.result as string
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSpecialty = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && specialtyInput.trim()) {
      e.preventDefault();
      if (!formData.specialty?.includes(specialtyInput.trim())) {
        setFormData({
          ...formData,
          specialty: [...(formData.specialty || []), specialtyInput.trim()]
        });
      }
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (s: string) => {
    setFormData({
      ...formData,
      specialty: formData.specialty?.filter(item => item !== s)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.employeeId) return;
    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 bg-stone-900 flex justify-between items-center">
          <h2 className="text-white font-bold flex items-center gap-3 text-lg">
            <Shield className="text-orange-500" />
            {initialData ? '修改成員權限與資訊' : '加入新團隊成員'}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          {/* 大頭照與基本帳號資訊 */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-4">
            <div className="flex flex-col items-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
              <div 
                onClick={handleAvatarClick}
                className="relative group cursor-pointer"
              >
                <img 
                  src={formData.avatar} 
                  className={`w-28 h-28 rounded-3xl object-cover border-4 border-slate-100 shadow-md transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'}`} 
                  alt="Avatar" 
                />
                <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? <Loader2 size={24} className="text-white animate-spin" /> : <Camera size={24} className="text-white" />}
                </div>
              </div>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">員工編號 (登入帳號) *</label>
                <div className="relative">
                  <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    required
                    placeholder="例如: EMP001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-black text-black outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    value={formData.employeeId}
                    onChange={e => setFormData({...formData, employeeId: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">登入密碼</label>
                <div className="relative">
                  <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="password"
                    placeholder={initialData ? "留空則不修改" : "請設定初始密碼"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-black text-black outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">真實姓名 *</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-black font-bold"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">職稱角色</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-black font-bold appearance-none"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as any})}
              >
                {roles.map(role => <option key={role} value={role} className="text-black">{role}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">聯繫電話 *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-black font-bold font-mono"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">電子信箱</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-black font-bold"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">專長與證照 (Enter 新增)</label>
              <div className="relative">
                <Award size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-black font-bold"
                  value={specialtyInput}
                  onChange={e => setSpecialtyInput(e.target.value)}
                  onKeyDown={handleAddSpecialty}
                  placeholder="例如: 甲種電匠、室內設計乙級"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.specialty?.map(s => (
                  <span key={s} className="bg-orange-50 text-orange-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-orange-100">
                    {s}
                    <button type="button" onClick={() => removeSpecialty(s)} className="hover:text-rose-500"><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">人員狀態</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-black font-bold appearance-none"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="Available" className="text-black">待命/可用</option>
                <option value="Busy" className="text-black">忙碌中</option>
                <option value="OnLeave" className="text-black">休假中</option>
              </select>
            </div>
          </div>

          <div className="pt-8 flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              disabled={isUploading}
              className="flex-[2] bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-stone-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              儲存人員帳號與資料
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;
