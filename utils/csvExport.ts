
import { Project } from '../types';

export const exportProjectsToCSV = (projects: Project[]) => {
  // 定義 CSV 標頭
  const headers = ['案件編號', '案件來源', '建立日期', '專案名稱', '案件類別', '業主', '具體說明', '負責人', '開始日期', '結束日期', '預算', '進度(%)', '狀態'];
  
  // 轉換資料列
  const rows = projects.map(p => [
    p.id,
    p.source,
    p.createdDate,
    `"${p.name}"`, 
    p.category,
    `"${p.client}"`,
    `"${p.referrer}"`,
    p.manager,
    p.startDate,
    p.endDate,
    p.budget,
    p.progress,
    p.status
  ]);

  // 合併標頭與內容
  const csvContent = [
    '\uFEFF' + headers.join(','), // 添加 BOM 以支援 Excel/Google Sheets 中文顯示
    ...rows.map(e => e.join(','))
  ].join('\n');

  // 建立下載連結
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().split('T')[0];
  
  link.setAttribute('href', url);
  link.setAttribute('download', `BuildTrack_Projects_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
