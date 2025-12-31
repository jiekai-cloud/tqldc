
import React, { useState } from 'react';
import { Search, Plus, User, Phone, Mail, MapPin, MoreHorizontal, Pencil, Trash2, Building2, ShieldAlert } from 'lucide-react';
import { Customer, User as UserType } from '../types';

interface CustomerListProps {
  customers: Customer[];
  user?: UserType;
  onAddClick: () => void;
  onEditClick: (customer: Customer) => void;
  onDeleteClick: (id: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, user, onAddClick, onEditClick, onDeleteClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isReadOnly = user?.role === 'Guest';

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const getTypeBadge = (type: Customer['type']) => {
    switch (type) {
      case '企業': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case '政府單位': return 'bg-amber-50 text-amber-700 border-amber-100';
      case '長期夥伴': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">客戶資料中心</h1>
          <p className="text-slate-500 text-sm">管理所有往來業主、合作企業與政府單位聯絡窗口。</p>
        </div>
        {!isReadOnly ? (
          <button 
            onClick={onAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95 font-bold"
          >
            <Plus size={20} />
            <span>新增客戶</span>
          </button>
        ) : (
          <div className="bg-stone-100 text-stone-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-stone-200">
            <ShieldAlert size={16} /> 訪客唯讀模式
          </div>
        )}
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜尋客戶名稱、聯絡人或電話..." 
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 outline-none text-sm text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">客戶名稱 / 類型</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">主要聯絡人</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">聯繫電話</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">電子信箱</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">通訊地址</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      {customer.type === '企業' ? <Building2 size={14} className="text-slate-400" /> : <User size={14} className="text-slate-400" />}
                      {customer.name}
                    </span>
                    <span className={`w-fit text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${getTypeBadge(customer.type)}`}>
                      {customer.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-medium text-slate-700">{customer.contactPerson}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} className="text-slate-300" />
                    {customer.phone}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={14} className="text-slate-300" />
                    {customer.email}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 max-w-[200px] truncate">
                    <MapPin size={14} className="text-slate-300 shrink-0" />
                    {customer.address}
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  {!isReadOnly ? (
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEditClick(customer)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteClick(customer.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[9px] font-black text-stone-300 uppercase italic tracking-widest">唯讀</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <Building2 size={40} className="text-slate-200" />
                    <p className="text-sm font-medium">尚未建立客戶資料</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;
