
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import ProjectList from './components/ProjectList.tsx';
import DispatchManager from './components/DispatchManager.tsx';
import CustomerList from './components/CustomerList.tsx';
import TeamList from './components/TeamList.tsx';
import Analytics from './components/Analytics.tsx';
import Settings from './components/Settings.tsx';
import HelpCenter from './components/HelpCenter.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import ProjectModal from './components/ProjectModal.tsx';
import ProjectDetail from './components/ProjectDetail.tsx';
import CustomerModal from './components/CustomerModal.tsx';
import TeamModal from './components/TeamModal.tsx';
import Login from './components/Login.tsx';
import { Menu, LogOut, Layers, Globe, Sparkles, Activity, ShieldAlert, CheckCircle, RefreshCw, CloudOff, AlertCircle, Database, Zap } from 'lucide-react';
import { MOCK_PROJECTS, MOCK_DEPARTMENTS } from './constants.ts';
import { Project, ProjectStatus, Customer, TeamMember, User, ProjectComment } from './types.ts';
import { googleDriveService, DEFAULT_CLIENT_ID } from './services/googleDriveService.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewingDeptId, setViewingDeptId] = useState<string>('all'); 
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [lastCloudSync, setLastCloudSync] = useState<string | null>(null);
  const [lastLocalSave, setLastLocalSave] = useState<string>(new Date().toLocaleTimeString());
  const [isInitializing, setIsInitializing] = useState(true);
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  useEffect(() => {
    const startup = async () => {
      const savedUser = localStorage.getItem('bt_user');
      if (savedUser) {
         const parsedUser = JSON.parse(savedUser);
         setUser(parsedUser);
         setViewingDeptId(parsedUser.role === 'SuperAdmin' || parsedUser.role === 'Guest' ? 'all' : (parsedUser.departmentId || 'DEPT-1'));
      }
      
      const savedProjects = localStorage.getItem('bt_projects');
      const initialProjects = savedProjects ? JSON.parse(savedProjects) : MOCK_PROJECTS;
      setProjects(initialProjects.map((p: Project) => ({ 
        ...p, 
        expenses: p.expenses || [], 
        workAssignments: p.workAssignments || [],
        files: p.files || [],
        phases: p.phases || []
      })));
      setCustomers(JSON.parse(localStorage.getItem('bt_customers') || '[]'));
      setTeamMembers(JSON.parse(localStorage.getItem('bt_team') || '[]'));
      
      try {
        await googleDriveService.init(DEFAULT_CLIENT_ID);
        if (localStorage.getItem('bt_cloud_connected') === 'true' && user?.role !== 'Guest') {
            await autoConnectCloud();
        }
      } catch (e) {
        console.warn('Google SDK 初始化延遲');
      } finally {
        setInitialSyncDone(true);
        setTimeout(() => setIsInitializing(false), 1200);
      }
    };
    startup();
  }, []);

  const autoConnectCloud = async () => {
    try {
      await googleDriveService.authenticate('none');
      setIsCloudConnected(true);
      setCloudError(null);
      
      const cloudData = await googleDriveService.loadFromCloud();
      if (cloudData) {
          if (cloudData.projects) setProjects(cloudData.projects);
          if (cloudData.customers) setCustomers(cloudData.customers);
          if (cloudData.teamMembers) setTeamMembers(cloudData.teamMembers);
          setLastCloudSync(new Date().toLocaleTimeString());
      }
    } catch (e) {
      setCloudError('會話已過期');
    }
  };

  const handleCloudSync = useCallback(async () => {
    if (!isCloudConnected || isSyncing || user?.role === 'Guest') return;
    setIsSyncing(true);
    try {
      const success = await googleDriveService.saveToCloud({
        projects,
        customers,
        teamMembers,
        lastUpdated: new Date().toISOString(),
        userEmail: user?.email
      });
      if (success) {
          setLastCloudSync(new Date().toLocaleTimeString());
          setCloudError(null);
      } else {
          setCloudError('同步中斷');
      }
    } catch (err) {
      setCloudError('連線異常');
    } finally {
      setIsSyncing(false);
    }
  }, [projects, customers, teamMembers, isCloudConnected, isSyncing, user]);

  const handleConnectCloud = async () => {
    if (user?.role === 'Guest') return;
    try {
      setIsSyncing(true);
      setCloudError(null);
      await googleDriveService.authenticate('consent');
      localStorage.setItem('bt_cloud_connected', 'true');
      setIsCloudConnected(true);
      
      const cloudData = await googleDriveService.loadFromCloud();
      if (cloudData && cloudData.projects && confirm('雲端發現現有數據，是否要切換為雲端版本？')) {
          setProjects(cloudData.projects);
          setCustomers(cloudData.customers);
          setTeamMembers(cloudData.teamMembers);
          setLastCloudSync(new Date().toLocaleTimeString());
      } else {
          await handleCloudSync();
      }
    } catch (err: any) {
      setCloudError('驗證失敗');
    } finally {
        setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!initialSyncDone || !user) return;
    if (user.role !== 'Guest') {
      localStorage.setItem('bt_projects', JSON.stringify(projects));
      localStorage.setItem('bt_customers', JSON.stringify(customers));
      localStorage.setItem('bt_team', JSON.stringify(teamMembers));
      setLastLocalSave(new Date().toLocaleTimeString());
    }
    if (isCloudConnected && !cloudError && user.role !== 'Guest') {
      const timer = setTimeout(() => {
          handleCloudSync();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [projects, customers, teamMembers, isCloudConnected, cloudError, initialSyncDone, handleCloudSync, user]);

  const handleUpdateStatus = (projectId: string, status: ProjectStatus) => {
    if (user?.role === 'Guest') return;
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p));
  };

  const handleDeleteItems = (ids: string | string[]) => {
    if (user?.role === 'Guest') return;
    const idArray = Array.isArray(ids) ? ids : [ids];
    if (confirm(`確定要刪除這 ${idArray.length} 個項目嗎？此操作不可撤回。`)) {
      setProjects(prev => prev.filter(p => !idArray.includes(p.id)));
      if (selectedProjectId && idArray.includes(selectedProjectId)) {
        setSelectedProjectId(null);
      }
    }
  };

  const handleAddComment = (projectId: string, text: string) => {
    if (!user || user.role === 'Guest') return;
    const newComment: ProjectComment = {
      id: Date.now().toString(),
      authorName: user.name,
      authorAvatar: user.picture,
      authorRole: user.role === 'SuperAdmin' ? '管理總監' : '成員',
      text,
      timestamp: new Date().toLocaleString('zh-TW', { hour12: false })
    };
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, comments: [newComment, ...(p.comments || [])] } : p));
  };

  const handleLogout = () => {
    if (confirm('確定要安全登出生產系統嗎？')) {
      setUser(null);
      localStorage.removeItem('bt_user');
      setActiveTab('dashboard');
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const filteredData = useMemo(() => {
    const filterByDept = (item: any) => viewingDeptId === 'all' || item.departmentId === viewingDeptId;
    return {
      projects: projects.filter(filterByDept),
      customers: customers.filter(filterByDept),
      teamMembers: teamMembers.filter(filterByDept)
    };
  }, [projects, customers, teamMembers, viewingDeptId]);

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-[#1c1917] flex flex-col items-center justify-center space-y-8 animate-in fade-in">
        <div className="relative">
          <div className="w-20 h-20 bg-orange-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-orange-500/20 animate-pulse">
            <Globe className="text-white w-10 h-10" />
          </div>
          <div className="absolute inset-0 bg-orange-500 rounded-[2.5rem] blur-2xl opacity-20 animate-ping"></div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-white font-black text-2xl uppercase tracking-[0.4em] ml-[0.4em]">Life Quality</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></span>
            <p className="text-stone-500 text-[10px] font-black uppercase tracking-[0.2em]">正在啟動智慧營造生產環境</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Login onLoginSuccess={(u, d) => {
    const fullUser: User = { ...u, departmentId: d };
    setUser(fullUser);
    setViewingDeptId(fullUser.role === 'SuperAdmin' || fullUser.role === 'Guest' ? 'all' : d);
    localStorage.setItem('bt_user', JSON.stringify(fullUser));
  }} />;

  return (
    <div className="flex h-screen w-screen bg-[#fafaf9] overflow-hidden">
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static transition-transform duration-500 z-[101] w-64 h-full shrink-0`}>
        <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} user={user} />
      </div>
      
      <main className="flex-1 flex flex-col h-full w-full min-0 relative">
        <header className="h-16 shrink-0 bg-white/80 backdrop-blur-xl border-b border-stone-200 px-4 lg:px-8 flex items-center justify-between no-print z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg"><Menu size={24} /></button>
            
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl shadow-lg ${user.role === 'Guest' ? 'bg-stone-900 text-orange-400' : 'bg-stone-900 text-white'}`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${user.role === 'Guest' ? 'bg-orange-500' : 'bg-emerald-400'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{user.role === 'Guest' ? '訪客唯讀模式' : '生產環境 已上線'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user.role === 'SuperAdmin' || user.role === 'Guest' ? (
              <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
                <Layers size={14} className="text-stone-400" />
                <select className="bg-transparent text-[11px] font-black text-stone-900 outline-none" value={viewingDeptId} onChange={(e) => setViewingDeptId(e.target.value)}>
                  <option value="all">全公司視野</option>
                  {MOCK_DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            ) : <span className="text-[11px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">{MOCK_DEPARTMENTS.find(d => d.id === user.departmentId)?.name}</span>}
            <button onClick={handleLogout} className="p-2 text-stone-400 hover:text-rose-600 transition-colors"><LogOut size={20} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto touch-scroll">
          {selectedProject ? (
            <ProjectDetail 
              project={selectedProject} user={user} teamMembers={teamMembers}
              onBack={() => setSelectedProjectId(null)} 
              onEdit={(p) => { setEditingProject(p); setIsModalOpen(true); }}
              onDelete={(id) => handleDeleteItems(id)}
              onUpdateStatus={(status) => handleUpdateStatus(selectedProject.id, status)}
              onAddComment={(text) => handleAddComment(selectedProject.id, text)}
              onUpdateTasks={() => {}} onUpdateProgress={() => {}} onUpdateExpenses={() => {}} onUpdateWorkAssignments={() => {}} onLossClick={() => {}}
            />
          ) : (
            <div className="pb-32">
              {activeTab === 'dashboard' && <Dashboard projects={filteredData.projects} onProjectClick={(p) => setSelectedProjectId(p.id)} />}
              {activeTab === 'projects' && (
                <ProjectList 
                  projects={filteredData.projects} 
                  user={user} 
                  onAddClick={() => { setEditingProject(null); setIsModalOpen(true); }} 
                  onEditClick={(p) => { setEditingProject(p); setIsModalOpen(true); }} 
                  onDeleteClick={handleDeleteItems} 
                  onDetailClick={(p) => setSelectedProjectId(p.id)} 
                  onLossClick={() => {}} 
                />
              )}
              {activeTab === 'settings' && (
                <Settings 
                  user={user} projects={projects} customers={customers} teamMembers={teamMembers} 
                  onResetData={() => { if(confirm('注意：這將清除所有數據，確定嗎？')) { localStorage.clear(); window.location.reload(); } }} 
                  onImportData={() => {}} 
                  isCloudConnected={isCloudConnected}
                  onConnectCloud={handleConnectCloud}
                  onDisconnectCloud={() => { setIsCloudConnected(false); localStorage.removeItem('bt_cloud_connected'); }}
                  lastSyncTime={lastCloudSync}
                />
              )}
              {activeTab === 'team' && <TeamList members={filteredData.teamMembers} onAddClick={() => setIsTeamModalOpen(true)} onEditClick={setEditingMember} onDeleteClick={() => {}} />}
              {activeTab === 'customers' && <CustomerList customers={filteredData.customers} user={user} onAddClick={() => setIsCustomerModalOpen(true)} onEditClick={setEditingCustomer} onDeleteClick={() => {}} />}
              {activeTab === 'dispatch' && <DispatchManager projects={filteredData.projects} teamMembers={filteredData.teamMembers} onAddDispatch={(pid, ass) => setProjects(prev => prev.map(p => p.id === pid ? { ...p, workAssignments: [ass, ...(p.workAssignments || [])] } : p))} onDeleteDispatch={(pid, aid) => setProjects(prev => prev.map(p => p.id === pid ? { ...p, workAssignments: (p.workAssignments || []).filter(a => a.id !== aid) } : p))} />}
              {activeTab === 'analytics' && <Analytics projects={filteredData.projects} />}
              {activeTab === 'help' && <HelpCenter />}
            </div>
          )}
        </div>
        
        <div className="no-print"><AIAssistant projects={filteredData.projects} /></div>
      </main>

      {isModalOpen && user.role !== 'Guest' && <ProjectModal onClose={() => setIsModalOpen(false)} onConfirm={(data) => {
        if (editingProject) setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...data } : p));
        else setProjects(prev => [{ ...data, id: 'PJ' + Date.now().toString().slice(-6), status: ProjectStatus.NEGOTIATING, progress: 0, workAssignments: [], expenses: [], comments: [], files: [], phases: [] } as any, ...prev]);
        setIsModalOpen(false);
      }} initialData={editingProject} />}
    </div>
  );
};

export default App;
