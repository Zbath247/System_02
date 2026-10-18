export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STAFF' | 'STUDENT';
export type UserCategory = 'STUDENT' | 'TEACHER' | 'STAFF' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
export type EventType = 'CHECK_IN' | 'CHECK_OUT';

export interface User {
  id: string;
  identifier: string;
  nameKh: string;
  nameEn: string;
  category: UserCategory;
  role: UserRole;
  faculty: string;
  major?: string | null;
  classGroup?: string | null;
  email?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Location {
  id: string;
  code: string;
  nameKh: string;
  nameEn: string;
  description?: string | null;
  category: string;
  canCheckIn: boolean;
  canCheckOut: boolean;
  isActive: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceEvent {
  id: string;
  userId: string;
  user?: User;
  eventType: EventType;
  locationId: string;
  location: Location;
  timestamp: string;
  note?: string | null;
  durationMinutes?: number | null;
  isCorrection?: boolean;
  correctionReason?: string | null;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  suspendedUsers: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  currentlyOpenSessions: number;
}
