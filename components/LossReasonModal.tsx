
import React, { useState } from 'react';
import { X, MessageSquareWarning, Send } from 'lucide-react';

interface LossReasonModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => void;
  projectName: string;
}

const LossReasonModal: React.FC<LossReasonModalProps> = ({ onClose, onConfirm, projectName }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-rose-600 flex justify-between items-center">
          <h2 className="text-white font-bold flex items-center gap-2 text-lg">
            <MessageSquareWarning size={20} />
            標記為未成交
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-2">專案：{projectName}</p>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">請填寫未成交的原因</label>
            <textarea 
              required
              autoFocus
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all min-h-[120px] resize-none placeholder:text-slate-400"
              placeholder="例如：預算超出業主預期、選擇其他廠商、需求變更..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              className="flex-[2] bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              確認提交並關閉案件
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LossReasonModal;
