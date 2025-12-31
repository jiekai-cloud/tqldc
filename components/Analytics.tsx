
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, Coins, Users, Target, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { Project } from '../types';

interface AnalyticsProps {
  projects: Project[];
}

const Analytics: React.FC<AnalyticsProps> = ({ projects }) => {
  const sourceData = [
    { name: 'BNI', value: projects.filter(p => p.source === 'BNI').length },
    { name: '台塑', value: projects.filter(p => p.source === '台塑集團').length },
    { name: '網路', value: projects.filter(p => p.source === '網路客').length },
    { name: '舊客', value: projects.filter(p => p.source === '住宅').length },
  ].filter(d => d.value > 0);

  const profitData = projects.slice(0, 6).map(p => ({
    name: p.name.substring(0, 4),
    預算: p.budget / 10000,
    支出: p.spent / 10000,
    毛利: (p.budget - p.spent) / 10000
  }));

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">企業級數據分析中心</h1>
          <p className="text-slate-500 text-sm font-medium">深入挖掘工程營運效率與財務績效。</p>
        </div>
        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl shadow-slate-200">
          <Sparkles size={16} className="text-blue-400" />
          AI 已準備好年度盈餘預測
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要財務指標 */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Coins size={20} className="text-blue-600" /> 專案獲利對比 (萬元)
            </h3>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-600 rounded-full"></span> 預算</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> 毛利</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="預算" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="毛利" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 案源轉換分析 */}
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2">
            <Target size={20} className="text-indigo-600" /> 案源管道分佈
          </h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                  {sourceData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{projects.length}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">總案數</span>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {sourceData.map((d, i) => (
              <div key={d.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="font-bold text-slate-600">{d.name}</span>
                </div>
                <span className="font-black text-slate-900">{Math.round((d.value/projects.length)*100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 下方趨勢分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '人均產值', value: '$2.8M', trend: '+12.5%', isUp: true, icon: Users },
          { label: '平均毛利', value: '32.4%', trend: '-2.1%', isUp: false, icon: TrendingUp },
          { label: '材料成本比', value: '45.8%', trend: '+4.3%', isUp: false, icon: Coins },
          { label: '進度準時率', value: '88%', trend: '+5.0%', isUp: true, icon: Target },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-500 transition-all">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <item.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black ${item.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {item.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {item.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-2xl font-black text-slate-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
