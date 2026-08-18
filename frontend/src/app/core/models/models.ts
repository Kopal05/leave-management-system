export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type UserRole = 'ADMIN' | 'USER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface UserRequest {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export type LeaveStatus = 'PLANNED' | 'CANCELLED';

export interface Leave {
  id: number;
  title: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
  editable: boolean;
  overlapWarning?: string | null;
}

export interface LeaveRequest {
  title: string;
  reason: string;
  startDate: string;
  endDate: string;
}

export interface CalendarEntry {
  leaveId: number;
  employeeName: string;
  title: string;
  startDate: string;
  endDate: string;
}

export interface OverlapWarning {
  employeeOneName: string;
  employeeTwoName: string;
  overlapStart: string;
  overlapEnd: string;
}

export interface DashboardResponse {
  upcomingLeaves: Leave[];
  teamCalendar: CalendarEntry[];
  allEmployees: AppUser[] | null;
  overlapWarnings: OverlapWarning[] | null;
}
