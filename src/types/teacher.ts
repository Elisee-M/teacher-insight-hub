export interface AttendanceRecord {
  date: string;
  id: string;
  name: string;
  status: 'present' | 'absent' | 'late';
  time_in: string;
  time_out: string;
  trade: string;
}

export interface Teacher {
  id: string;
  name: string;
  trade: string;
  attendanceRecords: AttendanceRecord[];
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
