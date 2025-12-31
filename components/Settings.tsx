
import React, { useState, useMemo } from 'react';
import { 
  User, ChevronRight, Download, ShieldCheck, 
  Cloud, CloudOff, RefreshCw, Database, HardDrive, FileJson, UploadCloud, RotateCcw, Zap, Info, AlertTriangle, Github, Globe, Copy, Check, ShieldAlert
} from 'lucide-react';
import { Project, Customer, TeamMember, User as UserType } from '../types';
import { BACKUP_FILENAME } from '../services/googleDriveService';

interface SettingsProps {
  user: UserType;
  projects: Project[];
  customers: Customer[];
  teamMembers: TeamMember[];
  onResetData: () => void;
  onImportData: (jsonData: string, mode: 'overwrite' | 'merge') => void;
  isCloudConnected: boolean;
  onConnectCloud: () => void;
  onDisconnectCloud: () => void;
  lastSyncTime: string | null;
}

const Settings: React.FC<SettingsProps> = ({ 
  user, projects, customers, teamMembers, onResetData, 
  isCloudConnected, onConnectCloud, onDisconnectCloud, lastSyncTime
}) => {
  const [activeSection, setActiveSection] = useState('cloud');
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isReadOnly = user.role === 'Guest';
  const currentUrl = window.location.origin + window.location.pathname;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const backupData = {
        version: "2026.1.0",
        exportDate: new Date().toISOString(),
        projects,
        customers,
        teamMembers
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `生活品質工程系統_備份_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 800);
  };

  const sections = [
    { id: 'profile', label: '個人帳戶', icon: User },
    { id: 'cloud', label: '雲端同步', icon: Cloud },
    { id: 'deploy', label: '部署助手', icon: Github },
    { id: 'data', label: '資料安全', icon: ShieldCheck },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">系統配置</h1>
        <p className="text-stone-500 text-sm font-medium">針對生產環境與 GitHub Pages 最佳化。</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 space-y-1 shrink-0">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${
                activeSection === section.id 
                  ? 'bg-stone-900 text-white shadow-xl shadow-stone-200' 
                  : 'text-stone-500 hover:bg-white hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <section.icon size={18} className={activeSection === section.id ? 'text-orange-400' : 'text-stone-400'} />
                <span className="font-black text-xs uppercase tracking-widest">{section.label}</span>
              </div>
              <ChevronRight size={14} className={activeSection === section.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden min-h-[550px]">
          <div className="p-6 lg:p-12">
            
            {activeSection === 'deploy' && (
              <div className="space-y-8 animate-in slide-in-from-right-4">
                <div className="flex items-center gap-5">
                  <div className="p-5 rounded-[2rem] bg-stone-900 text-white shadow-lg">
                    <Github size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">GitHub Pages 部署助手</h3>
                    <p className="text-sm text-stone-500 font-medium">協助您完成雲端授權與發佈設定。</p>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2rem] space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="text-orange-600 mt-1" size={18} />
                    <div className="space-y-2">
                      <p className="text-sm font-black text-orange-900">為什麼需要設定授權來源？</p>
                      <p className="text-xs text-orange-700 leading-relaxed font-bold">
                        為了防止他人惡意存取您的 Google Drive，Google 要求必須在後台手動核准您的網站網址。
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">您的系統網址</p>
                    <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-orange-200 shadow-inner">
                      <Globe size={14} className="text-stone-400" />
                      <code className="text-xs font-black text-stone-900 flex-1 truncate">{currentUrl}</code>
                      <button 
                        onClick={handleCopyUrl}
                        className="p-2 hover:bg-stone-50 rounded-lg text-orange-600 transition-all active:scale-90"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'cloud' && (
              <div className="space-y-8 animate-in slide-in-from-right-4">
                <div className="flex items-center gap-5">
                  <div className={`p-5 rounded-[2rem] ${isCloudConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'}`}>
                    {isCloudConnected ? <Cloud size={32} /> : <CloudOff size={32} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">Google Drive 雲端同步</h3>
                    <p className="text-sm text-stone-500 font-medium">跨設備數據存取的唯一核心路徑。</p>
                  </div>
                </div>

                {isReadOnly ? (
                  <div className="bg-stone-50 p-10 rounded-[2.5rem] border border-stone-200 text-center flex flex-col items-center gap-4">
                    <ShieldAlert size={48} className="text-stone-300" />
                    <div>
                      <h4 className="text-lg font-black text-stone-900 uppercase">權限受限</h4>
                      <p className="text-sm text-stone-500 max-w-sm mx-auto mt-2">訪客帳號無法進行雲端連線設定。</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {!isCloudConnected ? (
                      <div className="bg-stone-50 p-10 rounded-[2.5rem] border border-stone-200 text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <Zap size={32} className="text-orange-500" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-stone-900 uppercase">啟動智慧同步</h4>
                            <p className="text-sm text-stone-500 max-w-sm mx-auto mt-2">一旦啟用，您的所有更動都會立即加密儲存至您的 Google Drive 專屬檔案中。</p>
                        </div>
                        <button 
                          onClick={onConnectCloud}
                          className="w-full max-w-xs mx-auto bg-orange-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-orange-100 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                          授權並啟動同步
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <ShieldCheck size={28} className="text-emerald-500" />
                            <div>
                              <p className="text-sm font-black text-emerald-900">連線穩定</p>
                              <p className="text-xs text-emerald-600 font-bold">同步檔案：{BACKUP_FILENAME}</p>
                            </div>
                          </div>
                          <button 
                            onClick={onDisconnectCloud}
                            className="text-xs font-black text-emerald-700 hover:text-rose-600 transition-colors underline underline-offset-4"
                          >
                            中斷連線
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeSection === 'data' && (
              <div className="space-y-8 animate-in slide-in-from-right-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-orange-50 text-orange-600 rounded-[1.5rem]">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight">資料安全中心</h3>
                    <p className="text-sm text-stone-500 font-medium">管理本地與雲端的數據持久化策略。</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm space-y-4 group hover:border-orange-200 transition-all">
                    <div className="flex items-center gap-3">
                      <Download size={20} className="text-blue-500" />
                      <h4 className="text-sm font-black text-stone-900">導出 JSON 備份</h4>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed font-bold">
                      將所有資料存為本地檔案，適合在無網路環境下進行遷移。
                    </p>
                    <button 
                      onClick={handleManualExport}
                      disabled={isExporting}
                      className="w-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-900 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                      {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <FileJson size={14} />}
                      開始導出
                    </button>
                  </div>

                  {!isReadOnly && (
                    <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm space-y-4 group hover:border-emerald-200 transition-all">
                      <div className="flex items-center gap-3">
                        <UploadCloud size={20} className="text-emerald-500" />
                        <h4 className="text-sm font-black text-stone-900">匯入現有資料</h4>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-bold">
                        從現有的備份檔恢復數據。
                      </p>
                      <button 
                        className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                      >
                        <RotateCcw size={14} />
                        選擇檔案匯入
                      </button>
                    </div>
                  )}
                </div>

                {!isReadOnly && (
                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={onResetData}
                      className="flex items-center gap-2 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 px-4 py-2 rounded-xl transition-all"
                    >
                      <AlertTriangle size={14} />
                      清除所有本地快取
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <img src={user.picture} className="w-24 h-24 rounded-[2rem] border-4 border-stone-100 shadow-xl" alt="user" />
                <div className="text-center">
                  <h3 className="text-xl font-black text-stone-900">{user.name}</h3>
                  <p className="text-sm text-stone-500 font-bold">{user.email}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${isReadOnly ? 'bg-stone-900 text-orange-400' : 'bg-stone-100 text-stone-500'}`}>
                  權限角色：{isReadOnly ? '訪客 (唯讀)' : user.role}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
