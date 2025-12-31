
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  HelpCircle, Search, BookOpen, MessageSquare, 
  Settings, ShieldCheck, Zap, ChevronRight, 
  ExternalLink, PlayCircle, Bot, Mail, X, CheckCircle2, ArrowRight,
  Info, Sparkles, Send, Loader2, Navigation, MessageCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface TutorialContent {
  title: string;
  steps: { title: string; desc: string }[];
}

interface GuideMessage {
  role: 'user' | 'ai';
  text: string;
}

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialContent | null>(null);
  
  // 智慧引導模式狀態
  const [isAIGuideOpen, setIsAIGuideOpen] = useState(false);
  const [guideInput, setGuideInput] = useState('');
  const [guideMessages, setGuideMessages] = useState<GuideMessage[]>([
    { role: 'ai', text: '您好！我是「生活品質工程管理系統」智慧導引助手。您可以直接問我關於系統操作的任何問題，例如：「如何修改案件預算？」' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const guideEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    guideEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guideMessages]);

  const TUTORIAL_DATA: Record<string, TutorialContent> = {
    '建立第一個工程案件': {
      title: '如何建立第一個工程案件',
      steps: [
        { title: '前往案件清單', desc: '點擊左側導航欄的「專案管理」圖示。' },
        { title: '點擊新增按鈕', desc: '點擊頁面右上角的藍色「新增」按鈕。' },
        { title: '填寫核心資訊', desc: '輸入名稱、預算、來源與負責經理。' },
        { title: '完成建立', desc: '確認無誤後點擊儲存，系統將自動生成專案 ID。' }
      ]
    },
    '匯入舊有客戶資料': {
      title: '匯入舊有客戶資料',
      steps: [
        { title: '準備資料', desc: '確保您的客戶清單具備姓名、電話與聯繫人欄位。' },
        { title: '進入客戶中心', desc: '導航至左側選單的「客戶資料」分頁。' },
        { title: '點擊新增客戶', desc: '目前版本請使用「新增客戶」手動輸入，大宗 CSV 匯入功能將於 v2.6 更新。' }
      ]
    },
    '設定 AI 助理性格': {
      title: '自定義您的 AI 營造顧問',
      steps: [
        { title: '導航至設定', desc: '點擊左側最下方的「設定」圖示。' },
        { title: '進入 AI 助理設定', desc: '在左側設定選單中選擇「AI 助理設定」。' },
        { title: '選擇性格', desc: '在三種性格模式（嚴謹、合作、效率）中挑選適合您團隊的風格。' }
      ]
    },
    '編輯施工階段': {
      title: '管理與編輯施工階段',
      steps: [
        { title: '進入案件詳情', desc: '在專案清單中點擊您想修改的案件名稱。' },
        { title: '定位階段追蹤', desc: '在詳情頁面上方可見「工程階段追蹤」區塊。' },
        { title: '更新進度', desc: '點擊階段對應的進度條即可即時調整完成百分比。' }
      ]
    },
    '任務指派與優先順序': {
      title: '任務指派與優先級設定',
      steps: [
        { title: '開啟任務面板', desc: '進入專案詳情頁後，確保下方切換至「任務追蹤」視圖。' },
        { title: '新增待辦', desc: '在輸入框輸入任務名稱並按 Enter。' },
        { title: '設定負責人', desc: '點擊任務卡片中的用戶圖示，選擇負責的團隊成員。' }
      ]
    },
    '進度條自動計算規則': {
      title: '瞭解進度條計算邏輯',
      steps: [
        { title: '權重說明', desc: '系統會根據所有施工階段的權重平均值計算總體進度。' },
        { title: '任務聯動', desc: '若開啟自動模式，當底部所有「任務清單」勾選完成，該階段進度會自動跳至 100%。' }
      ]
    },
    '設定預算警戒值': {
      title: '設定預算超支警報',
      steps: [
        { title: '進入工程參數', desc: '前往「設定」>「工程參數」。' },
        { title: '滑動百分比', desc: '調整「執行率警戒線」滑桿。' },
        { title: '監控儀表板', desc: '當支出超過此比例，儀表板的「AI 風險監測器」會自動發出紅燈警告。' }
      ]
    },
    '匯出 CSV 報表技巧': {
      title: '高效匯出財務報表',
      steps: [
        { title: '全域匯出', desc: '在專案清單頁面點擊「匯出」，可下載所有進行中案件的彙整表。' },
        { title: '中文編碼處理', desc: '系統已自動加入 BOM 編碼，確保您用 Excel 開啟不會出現亂碼。' }
      ]
    },
    '解讀財務雷達圖': {
      title: '如何閱讀財務結構分析',
      steps: [
        { title: '切換財務視圖', desc: '在專案詳情頁點擊「財務分析」按鈕。' },
        { title: '查看比例分佈', desc: '雷達圖（圓餅圖）顯示了人工、材料、分包與雜支的佔比。' },
        { title: '檢查異常區塊', desc: '若某一區塊明顯異常擴大，請點擊「查看明細」核對傳票。' }
      ]
    },
    'OAuth Client ID 設定': {
      title: 'Google 登入權限設定',
      steps: [
        { title: '複製網域', desc: '在登入頁面複製您的系統網域來源。' },
        { title: '前往 Google Console', desc: '將網域貼上至 Google OAuth 的「已授權來源」。' },
        { title: '填寫 Client ID', desc: '將取得的 ID 填入程式碼中的設定區塊以啟用正式認證。' }
      ]
    },
    '重置系統資料的影響': {
      title: '資料重置安全警告',
      steps: [
        { title: '了解風險', desc: '重置將清除瀏覽器本地快取中的所有案件與客戶資料。' },
        { title: '執行方式', desc: '前往「設定」>「資料與安全」，點擊紅色的「重置系統資料」。' },
        { title: '不可逆轉', desc: '此操作不可撤回，執行前請確保已下載過 JSON 備份檔。' }
      ]
    },
    '離線模式運作機制': {
      title: '離線作業與同步說明',
      steps: [
        { title: '本地儲存', desc: '所有操作會優先儲存在您設備的 LocalStorage 中。' },
        { title: '無網作業', desc: '即使現場沒有網路，您仍可新增任務與查看圖表。' },
        { title: '自動持久化', desc: '關閉瀏覽器後資料依然存在，直到您手動點擊「清除快取」。' }
      ]
    }
  };

  const categories = [
    { 
      id: 'getting-started', 
      title: '新手入門', 
      icon: PlayCircle, 
      desc: '了解 生活品質工程管理系統 的核心流程與基本操作設定。',
      items: ['建立第一個工程案件', '匯入舊有客戶資料', '設定 AI 助理性格']
    },
    { 
      id: 'project-mgmt', 
      title: '專案管理', 
      icon: BookOpen, 
      desc: '如何追蹤施工進度、管理階段任務與工務提醒。',
      items: ['編輯施工階段', '任務指派與優先順序', '進度條自動計算規則']
    },
    { 
      id: 'financial', 
      title: '預算與分析', 
      icon: Zap, 
      desc: '掌握案場成本結構、毛利預估與預警機制。',
      items: ['設定預算警戒值', '匯出 CSV 報表技巧', '解讀財務雷達圖']
    },
    { 
      id: 'security', 
      title: '資料安全', 
      icon: ShieldCheck, 
      desc: '關於 Google 登入、備份與本地資料清除說明。',
      items: ['OAuth Client ID 設定', '重置系統資料的影響', '離線模式運作機制']
    }
  ];

  const handleGuideSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!guideInput.trim() || isTyping) return;

    const userText = guideInput;
    setGuideMessages(prev => [...prev, { role: 'user', text: userText }]);
    setGuideInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: `妳是「生活品質工程管理系統」的官方技術支援助手。
            妳的任務是協助使用者解決系統操作問題。
            請簡短、明確地回答。若問題與系統無關，請禮貌地引導回系統操作。`
        }
      });
      
      setGuideMessages(prev => [...prev, { role: 'ai', text: response.text || "抱歉，我現在無法回答這個問題。" }]);
    } catch (err) {
      setGuideMessages(prev => [...prev, { role: 'ai', text: "連線異常，請稍後再試，或查看下方的常見問題解答。" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase()) || 
        cat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.items.length > 0);
  }, [searchQuery]);

  const handleItemClick = (item: string) => {
    const tutorial = TUTORIAL_DATA[item];
    if (tutorial) {
      setSelectedTutorial(tutorial);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto animate-in fade-in duration-500 space-y-12 relative">
      <section className="text-center space-y-6 py-8">
        <div className="inline-flex p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-4">
          <HelpCircle size={32} className="text-white" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">您需要什麼協助？</h1>
        
        <div className="max-w-2xl mx-auto relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="搜尋關鍵字，或在右下角開啟智慧引導..." 
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button 
          onClick={() => setIsAIGuideOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <Sparkles size={16} className="text-orange-400" />
          開啟 AI 智慧操作引導
        </button>
      </section>

      {/* 教學分類 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCategories.map((cat) => (
          <div key={cat.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <cat.icon size={24} />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-xl font-bold text-slate-900">{cat.title}</h3>
                <div className="space-y-2 pt-2 border-t border-slate-50 mt-4">
                  {cat.items.map((item, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleItemClick(item)}
                      className="flex items-center justify-between w-full text-left p-3 hover:bg-blue-50 rounded-xl transition-all group/item border border-transparent hover:border-blue-100"
                    >
                      <span className="text-sm font-bold text-black">{item}</span>
                      <ChevronRight size={12} className="text-slate-400 group-hover:text-blue-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 教學細節彈窗 */}
      {selectedTutorial && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-900">{selectedTutorial.title}</h2>
              <button onClick={() => setSelectedTutorial(null)} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              {selectedTutorial.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-black text-sm">{i+1}</div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">{step.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-slate-50 text-center">
              <button onClick={() => setSelectedTutorial(null)} className="px-10 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">了解，關閉視窗</button>
            </div>
          </div>
        </div>
      )}

      {/* AI 智慧導引彈窗 */}
      {isAIGuideOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-2xl h-[80vh] rounded-[3rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight leading-none">智慧操作導引</h2>
                  <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Official Support</span>
                </div>
              </div>
              <button onClick={() => setIsAIGuideOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {guideMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-3xl ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-xl' 
                      : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                 <div className="flex justify-start">
                   <div className="bg-white/5 border border-white/5 p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                     <Loader2 size={16} className="text-blue-500 animate-spin" />
                     <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">思考中...</span>
                   </div>
                 </div>
              )}
              <div ref={guideEndRef} />
            </div>

            <div className="p-8 bg-black/40 border-t border-white/5">
              <form onSubmit={handleGuideSubmit} className="flex gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="問我任何關於系統操作的問題..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 py-5 text-sm text-white font-bold placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                    value={guideInput}
                    onChange={(e) => setGuideInput(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    disabled={!guideInput.trim() || isTyping}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-20 transition-all active:scale-90"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpCenter;
