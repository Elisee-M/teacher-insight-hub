// Parse comma-separated status to determine attendance
// Priority: absent > late > left_early > left_on_time > present
export function parseAttendanceStatus(status: string): 'present' | 'absent' | 'late' | 'left_early' | 'left_on_time' {
  const statusLower = status.toLowerCase();
  
  // Check for absent first (highest priority)
  if (statusLower.includes('absent')) {
    return 'absent';
  }
  
  // Check for late (important for attendance quality)
  if (statusLower.includes('late')) {
    return 'late';
  }
  
  // Check for left_early
  if (statusLower.includes('left_early') || statusLower.includes('left early')) {
    return 'left_early';
  }
  
  // Check for left_on_time
  if (statusLower.includes('left_on_time') || statusLower.includes('left on time')) {
    return 'left_on_time';
  }
  
  // Check for present
  if (statusLower.includes('present')) {
    return 'present';
  }
  
  // Default to absent if status is unclear
  return 'absent';
}
