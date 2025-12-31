
export enum ProjectStatus {
  NEGOTIATING = '洽談中',
  QUOTING = '報價中',
  QUOTED = '已報價',
  WAITING_SIGN = '待簽約',
  SIGNED_WAITING_WORK = '已簽約待施工',
  CONSTRUCTING = '施工中',
  COMPLETED = '已完工',
  INSPECTION = '驗收中',
  CLOSED = '結案',
  CANCELLED = '撤案',
  LOST = '未成交'
}

export type ProjectCategory = '室內裝修' | '建築營造' | '水電機電' | '景觀工程' | '設計規劃' | '其他';

export type ProjectSource = 
  | 'BNI' 
  | '台塑集團' 
  | '士林電機' 
  | '信義居家' 
  | '企業' 
  | '新建工程' 
  | '網路客' 
  | '住宅' 
  | 'JW';

export interface Expense {
  id: string;
  date: string;
  name: string;
  category: '材料' | '人工' | '分包' | '其他';
  amount: number;
  status: '待審核' | '已核銷' | '已撥款';
  supplier?: string;
}

export interface WorkAssignment {
  id: string;
  date: string;
  memberId: string;
  memberName: string;
  wagePerDay: number;
  days: number;
  totalCost: number;
}

export interface Department {
  id: string;
  name: string;
  color: string;
  manager: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  status: 'Todo' | 'Doing' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
}

export interface ProjectPhase {
  id: string;
  name: string;
  status: 'Completed' | 'Current' | 'Upcoming';
  progress: number;
  startDate: string;
  endDate: string;
}

export interface ProjectFinancials {
  labor: number;
  material: number;
  subcontractor: number;
  other: number;
}

export interface ProjectComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  text: string;
  timestamp: string;
}

export interface ProjectFile {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'pdf' | 'other';
  uploadedAt: string;
  uploadedBy: string;
  category?: string;
}

export interface ProjectLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface Project {
  id: string;
  departmentId: string; 
  name: string;
  category: ProjectCategory;
  source: ProjectSource; 
  client: string;
  referrer: string; 
  manager: string;
  startDate: string;
  endDate: string;
  createdDate: string;
  budget: number;
  spent: number;
  progress: number;
  status: ProjectStatus;
  tasks: Task[];
  phases: ProjectPhase[];
  financials: ProjectFinancials;
  location?: ProjectLocation;
  lossReason?: string;
  comments?: ProjectComment[];
  expenses?: Expense[];
  workAssignments?: WorkAssignment[];
  files?: ProjectFile[];
}

export interface Customer {
  id: string;
  departmentId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  type: '個人' | '企業' | '政府單位' | '長期夥伴';
  createdDate: string;
  taxId?: string;
}

export interface TeamMember {
  id: string;
  employeeId: string;
  password?: string;
  departmentId: string;
  name: string;
  role: '專案經理' | '工務主管' | '現場工程師' | '行政助理' | '設計師' | '工頭' | '外部協力';
  phone: string;
  email: string;
  specialty: string[];
  status: 'Available' | 'Busy' | 'OnLeave';
  activeProjectsCount: number;
  avatar: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  role: 'SuperAdmin' | 'DeptAdmin' | 'Staff' | 'Guest';
  departmentId?: string; 
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
