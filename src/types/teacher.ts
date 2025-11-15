export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
  timestamp?: number;
}

export interface Teacher {
  id: string;
  name: string;
  attendance: Record<string, AttendanceRecord>;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
}

export type AttendanceCondition = 'excellent' | 'good' | 'weak' | 'critical';

export interface AIAnalysis {
  condition: AttendanceCondition;
  reason: string;
  advice: string;
  latePattern?: string;
}
