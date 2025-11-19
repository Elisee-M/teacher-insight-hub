import { AttendanceRecord, AttendanceStats, AIAnalysis, AttendanceCondition } from '@/types/teacher';

export function calculateAttendanceStats(records: AttendanceRecord[]): AttendanceStats {
  const totalDays = records.length;
  const absentDays = records.filter(r => r.status === 'absent').length;
  const lateDays = records.filter(r => r.status === 'late').length;
  const leftEarlyDays = records.filter(r => r.status === 'left_early').length;
  const leftOnTimeDays = records.filter(r => r.status === 'left_on_time').length;
  
  // Anyone who came to school (present, late, left_early, left_on_time) counts as present
  const presentDays = records.filter(r => 
    r.status === 'present' || r.status === 'late' || r.status === 'left_early' || r.status === 'left_on_time'
  ).length;
  
  // Calculate weighted attendance rate to differentiate quality
  // Perfect attendance (present/left_on_time): 1.0 point
  // Late arrival: 0.75 points (penalize 25%)
  // Left early: 0.75 points (penalize 25%)
  // Absent: 0 points
  let attendancePoints = 0;
  records.forEach(r => {
    if (r.status === 'present' || r.status === 'left_on_time') {
      attendancePoints += 1.0;
    } else if (r.status === 'late' || r.status === 'left_early') {
      attendancePoints += 0.75;
    }
    // absent = 0 points
  });
  
  const attendanceRate = totalDays > 0 ? (attendancePoints / totalDays) * 100 : 0;

  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    leftEarlyDays,
    leftOnTimeDays,
    attendanceRate,
  };
}

export function analyzeAttendance(stats: AttendanceStats): AIAnalysis {
  const { attendanceRate, lateDays, totalDays, absentDays, leftEarlyDays } = stats;
  
  // Determine condition based on weighted attendance rate
  let condition: AttendanceCondition;
  let reason: string;
  let advice: string;

  // Check if attendance is perfect (no late, no early leave, no absent)
  const isPerfectAttendance = lateDays === 0 && leftEarlyDays === 0 && absentDays === 0;

  if (attendanceRate >= 95 && isPerfectAttendance) {
    condition = 'excellent';
    reason = `Perfect attendance rate of ${attendanceRate.toFixed(1)}% with no lateness or early departures`;
    advice = 'Outstanding! Perfect attendance record. Exemplary role model.';
  } else if (attendanceRate >= 90) {
    condition = 'excellent';
    reason = `Outstanding attendance rate of ${attendanceRate.toFixed(1)}%`;
    if (lateDays > 0 || leftEarlyDays > 0) {
      advice = 'Excellent attendance, but minimize late arrivals and early departures for perfect record.';
    } else {
      advice = 'Keep up the strong consistency! Great role model.';
    }
  } else if (attendanceRate >= 75) {
    condition = 'good';
    reason = `Good attendance rate of ${attendanceRate.toFixed(1)}%`;
    advice = 'Good performance—improve punctuality and reduce absences to reach excellence.';
  } else if (attendanceRate >= 60) {
    condition = 'weak';
    reason = `Below average attendance rate of ${attendanceRate.toFixed(1)}%`;
    advice = 'Attendance is dropping. Recommend meeting with the teacher.';
  } else {
    condition = 'critical';
    reason = `Poor attendance rate of ${attendanceRate.toFixed(1)}%`;
    advice = 'Serious attendance problem. Requires urgent intervention.';
  }

  // Check for late pattern
  let latePattern: string | undefined;
  if (totalDays > 0 && lateDays > totalDays * 0.30) {
    latePattern = 'Frequent lateness detected. Over 30% of attendance shows late arrivals.';
  } else if (totalDays > 0 && lateDays > 0) {
    latePattern = `${lateDays} late arrival${lateDays > 1 ? 's' : ''} recorded. Encourage punctuality.`;
  }

  // Check for early departure pattern
  if (totalDays > 0 && leftEarlyDays > totalDays * 0.20) {
    advice += ' Frequent early departures noticed. Address this pattern.';
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
