
import React, { useState } from 'react';
import { HardHat, ShieldCheck, Sparkles, User, Lock, ArrowRight, Layers, Check, AlertCircle, Hash, Info, UserCheck } from 'lucide-react';
import { MOCK_DEPARTMENTS } from '../constants';

interface LoginProps {
  onLoginSuccess: (userData: any, departmentId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDeptId) {
      setError('請先選擇您所屬的部門');
      return;
    }
    if (!employeeId || !password) {
      setError('請輸入員工編號與密碼');
      return;
    }

    setIsLoading(true);

    // 模擬驗證流程
    setTimeout(() => {
      // 1. 檢查管理員
      if (employeeId.toLowerCase() === 'admin' && password === '1234') {
        onLoginSuccess({
          id: 'ADMIN-ROOT',
          name: "管理總監",
          email: "admin@lifequality.ai",
          picture: `https://ui-avatars.com/api/?name=Admin&background=ea580c&color=fff`,
          role: 'SuperAdmin'
        }, selectedDeptId);
        return;
      }

      // 2. 檢查團隊成員
      const savedTeam = localStorage.getItem('bt_team');
      const team = savedTeam ? JSON.parse(savedTeam) : [];
      const member = team.find((m: any) => m.employeeId === employeeId.toUpperCase());

      if (member) {
        const expectedPassword = member.password || '1234';
        if (password === expectedPassword) {
          onLoginSuccess({
            id: member.id,
            name: member.name,
            email: member.email,
            picture: member.avatar,
            role: member.role === '工務主管' || member.role === '專案經理' ? 'DeptAdmin' : 'Staff'
          }, selectedDeptId);
        } else {
          setError('密碼輸入錯誤');
          setIsLoading(false);
        }
      } else {
        setError('找不到該員工編號');
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleQuickAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess({
        id: 'GUEST-USER',
        name: "體驗帳戶",
        email: "guest@lifequality.ai",
        picture: `https://ui-avatars.com/api/?name=Guest&background=1e293b&color=fff`,
        role: 'Guest'
      }, 'DEPT-1');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans">
      {/* 動態背景裝飾 */}
      <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-orange-600/10 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-amber-600/10 blur-[150px] rounded-full animate-pulse [animation-delay:2s]"></div>
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-stone-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
        
        {/* 左側：品牌形象區 (佔 5 格) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-16 bg-gradient-to-br from-stone-900 to-stone-950 border-r border-white/5 relative">
          <div className="relative z-10">
            <div className="bg-orange-600 w-16 h-16 rounded-3xl flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] mb-10 group hover:scale-110 transition-transform duration-500">
              <HardHat className="text-white w-9 h-9" />
            </div>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tighter mb-6">
              生活品質<br />
              <span className="text-orange-500">工程管理系統</span>
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-8">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">2026 Professional Edition</span>
            </div>
            <p className="text-stone-400 font-medium leading-relaxed text-sm max-w-xs">
              為現代工程人打造的數位大腦。整合預算控制、派工追蹤與 AI 智慧分析，全面提升施工效率。
            </p>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3 text-stone-300">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <ShieldCheck size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white">安全連線中心</p>
                <p className="text-[10px] text-stone-500 font-medium">資料受 256-bit 加密保護</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：登錄操作區 (佔 7 格) */}
        <div className="lg:col-span-7 p-8 lg:p-20 flex flex-col justify-center">
          <form onSubmit={handleLogin} className="space-y-8 max-w-md mx-auto w-full">
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">系統登入</h2>
              <p className="text-stone-500 text-sm">歡迎回來，請選擇部門並驗證您的身份。</p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-rose-500 shrink-0" size={18} />
                <p className="text-rose-200 text-xs font-bold">{error}</p>
              </div>
            )}

            {/* 單位選擇 */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-stone-500 text-[10px] font-black uppercase tracking-[0.25em] pl-1">
                <Layers size={14} className="text-orange-500" /> 選擇所屬單位 Department
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto no-scrollbar pr-1">
                {MOCK_DEPARTMENTS.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
                      selectedDeptId === dept.id 
                        ? 'border-orange-600 bg-orange-600/10 shadow-[0_0_30px_-10px_rgba(234,88,12,0.3)]' 
                        : 'border-white/5 bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                        selectedDeptId === dept.id ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-500'
                      }`}>
                        {dept.id.split('-')[1]}
                      </div>
                      <span className={`text-sm font-bold transition-colors ${selectedDeptId === dept.id ? 'text-white' : 'text-stone-400'}`}>
                        {dept.name}
                      </span>
                    </div>
                    {selectedDeptId === dept.id && (
                      <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 帳號密碼 */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-stone-500 text-[10px] font-black uppercase tracking-[0.25em] pl-1 flex items-center gap-2">
                  <Hash size={14} className="text-orange-500" /> 員工編號 Employee ID
                </label>
                <div className="group relative">
                  <input 
                    type="text"
                    placeholder="例如: ADMIN"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white font-bold outline-none focus:ring-2 focus:ring-orange-600/50 focus:border-orange-600/50 transition-all placeholder:text-stone-700 uppercase"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-stone-500 text-[10px] font-black uppercase tracking-[0.25em] pl-1 flex items-center gap-2">
                  <Lock size={14} className="text-orange-500" /> 登入密碼 Password
                </label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white font-bold outline-none focus:ring-2 focus:ring-orange-600/50 focus:border-orange-600/50 transition-all placeholder:text-stone-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-sm tracking-[0.2em] uppercase transition-all shadow-2xl active:scale-[0.98] ${
                  isLoading 
                    ? 'bg-stone-800 text-stone-600 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20 hover:shadow-orange-600/30'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    驗證中
                  </>
                ) : (
                  <>
                    進入系統
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <button 
                type="button"
                onClick={handleQuickAccess}
                disabled={isLoading}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-[0.3em] text-stone-500 hover:text-white border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300"
              >
                <Sparkles size={14} className="text-amber-500" />
                訪客模式預覽 (唯讀)
              </button>
            </div>

            <div className="flex flex-col items-center gap-2 pt-6">
              <p className="text-stone-700 text-[10px] font-black uppercase tracking-[0.3em]">
                © 2026 Life Quality Engineering Management
              </p>
              <div className="flex gap-4">
                <span className="text-stone-800 text-[9px] font-bold">服務條款</span>
                <span className="text-stone-800 text-[9px] font-bold">隱私政策</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
