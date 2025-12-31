
import { Project, ProjectStatus, Department } from './types';

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'DEPT-1', name: '第一工程部', color: '#ea580c', manager: '張部主任' }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'BNI202601001',
    departmentId: 'DEPT-1',
    name: '台北信義室內裝修案',
    category: '室內裝修',
    source: 'BNI',
    client: '王先生',
    referrer: '網站預約',
    manager: '陳志明',
    startDate: '2026-01-10',
    endDate: '2026-05-30',
    createdDate: '2026-01-01',
    budget: 2500000,
    spent: 1200000,
    progress: 45,
    status: ProjectStatus.CONSTRUCTING,
    tasks: [],
    phases: [],
    financials: { labor: 35, material: 45, subcontractor: 15, other: 5 }
  },
  {
    id: 'CO202603001',
    departmentId: 'DEPT-1',
    name: '台中商業辦公室擴建',
    category: '室內裝修',
    source: '企業',
    client: '科技公司',
    referrer: '舊客介紹',
    manager: '林靜宜',
    startDate: '2026-02-15',
    endDate: '2026-08-20',
    createdDate: '2026-01-20',
    budget: 8800000,
    spent: 2100000,
    progress: 15,
    status: ProjectStatus.CONSTRUCTING,
    tasks: [],
    phases: [],
    financials: { labor: 25, material: 55, subcontractor: 15, other: 5 }
  },
  {
    id: 'RE202604001',
    departmentId: 'DEPT-1',
    name: '高雄住宅景觀工程',
    category: '景觀工程',
    source: '住宅',
    client: '李女士',
    referrer: '直客',
    manager: '郭俊宏',
    startDate: '2026-03-01',
    endDate: '2026-06-15',
    createdDate: '2026-02-15',
    budget: 1500000,
    spent: 0,
    progress: 0,
    status: ProjectStatus.NEGOTIATING,
    tasks: [],
    phases: [],
    financials: { labor: 40, material: 30, subcontractor: 20, other: 10 }
  }
];
