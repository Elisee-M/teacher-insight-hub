import { AttendanceRecord, AttendanceStats, AIAnalysis, AttendanceCondition } from '@/types/teacher';

export function calculateAttendanceStats(attendance: Record<string, AttendanceRecord>): AttendanceStats {
  const records = Object.values(attendance || {});
  const totalDays = records.length;
  const presentDays = records.filter(r => r.status === 'present').length;
  const absentDays = records.filter(r => r.status === 'absent').length;
  const lateDays = records.filter(r => r.status === 'late').length;
  const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    attendanceRate,
  };
}

export function analyzeAttendance(stats: AttendanceStats): AIAnalysis {
  const { attendanceRate, lateDays, totalDays, absentDays } = stats;
  
  // Determine condition based on attendance rate
  let condition: AttendanceCondition;
  let reason: string;
  let advice: string;

  if (attendanceRate >= 95) {
    condition = 'excellent';
    reason = `Outstanding attendance rate of ${attendanceRate.toFixed(1)}%`;
    advice = 'Strong performance. Consider recognition reward.';
  } else if (attendanceRate >= 85) {
    condition = 'good';
    reason = `Good attendance rate of ${attendanceRate.toFixed(1)}%`;
    advice = 'Stable attendance. Keep encouraging.';
  } else if (attendanceRate >= 70) {
    condition = 'weak';
    reason = `Below average attendance rate of ${attendanceRate.toFixed(1)}%`;
    advice = 'Irregular attendance detected. Monitor closely.';
  } else {
    condition = 'critical';
    reason = `Poor attendance rate of ${attendanceRate.toFixed(1)}%`;
    advice = 'Serious attendance issue. Consider intervention.';
  }

  // Check for late pattern
  let latePattern: string | undefined;
  if (totalDays > 0 && lateDays > totalDays * 0.30) {
    latePattern = 'Frequent lateness detected. Over 30% of attendance shows late arrivals.';
  }

  // Check for declining pattern (simple heuristic: more absences in recent records)
  if (absentDays > totalDays * 0.15) {
    advice += ' Declining pattern noticed. Investigate cause.';
  }

  return {
    condition,
    reason,
    advice,
    latePattern,
  };
}

export function getConditionColor(condition: AttendanceCondition): string {
  const colors = {
    excellent: 'success',
    good: 'info',
    weak: 'warning',
    critical: 'destructive',
  };
  return colors[condition];
}

export function getConditionLabel(condition: AttendanceCondition): string {
  return condition.charAt(0).toUpperCase() + condition.slice(1);
}
