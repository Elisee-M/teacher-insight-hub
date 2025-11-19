import { useState, useEffect } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Teacher, AttendanceRecord } from '@/types/teacher';
import { toast } from '@/hooks/use-toast';

// Parse comma-separated status to determine attendance
// Priority: absent > late > left_early > left_on_time > present
function parseAttendanceStatus(status: string): 'present' | 'absent' | 'late' | 'left_early' | 'left_on_time' {
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

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, fetch the list of active teachers from /teachers
        const teachersRef = ref(database, 'teachers');
        const teachersSnapshot = await get(teachersRef);
        const teachersData = teachersSnapshot.val();
        
        if (!teachersData) {
          setTeachers([]);
          setLoading(false);
          return;
        }

        // Get list of active teacher IDs
        const activeTeacherIds = Object.keys(teachersData);
        
        // Now fetch attendance history
        const historyRef = ref(database, 'history/daily');
        
        onValue(
          historyRef,
          (snapshot) => {
            const dailyData = snapshot.val();
            
            if (!dailyData) {
              // Create teachers list with no records
              const teachersList: Teacher[] = activeTeacherIds.map((id) => ({
                id,
                name: teachersData[id].name || 'Unknown',
                trade: teachersData[id].trade || 'Unknown',
                attendanceRecords: [],
              }));
              setTeachers(teachersList);
              setLoading(false);
              return;
            }

            // Map to store teacher data: teacherID -> { name, trade, records[] }
            const teacherMap = new Map<string, {
              id: string;
              name: string;
              trade: string;
              records: AttendanceRecord[];
            }>();

            // Initialize map with active teachers only
            activeTeacherIds.forEach((teacherId) => {
              teacherMap.set(teacherId, {
                id: teacherId,
                name: teachersData[teacherId].name || 'Unknown',
                trade: teachersData[teacherId].trade || 'Unknown',
                records: [],
              });
            });

            // Loop through all dates in history
            Object.keys(dailyData).forEach((date) => {
              const dateRecords = dailyData[date];
              
              // Loop through all teachers in this date
              Object.keys(dateRecords).forEach((teacherId) => {
                // Only process if teacher is in active teachers list
                if (teacherMap.has(teacherId)) {
                  const record = dateRecords[teacherId];
                  
                  // Parse the comma-separated status
                  const parsedStatus = parseAttendanceStatus(record.status || 'absent');
                  
                  const attendanceRecord: AttendanceRecord = {
                    date: record.date || date,
                    id: record.id || teacherId,
                    name: record.name || teacherMap.get(teacherId)!.name,
                    status: parsedStatus,
                    time_in: record.time_in || '',
                    time_out: record.time_out || '',
                    trade: record.trade || teacherMap.get(teacherId)!.trade,
                  };
                  
                  teacherMap.get(teacherId)!.records.push(attendanceRecord);
                }
              });
            });

            // Convert map to array
            const teachersList: Teacher[] = Array.from(teacherMap.values()).map(
              (data) => ({
                id: data.id,
                name: data.name,
                trade: data.trade,
                attendanceRecords: data.records.sort((a, b) => 
                  new Date(a.date).getTime() - new Date(b.date).getTime()
                ),
              })
            );

            setTeachers(teachersList);
            setLoading(false);
          },
          (error) => {
            console.error('Firebase error:', error);
            toast({
              title: 'Connection Error',
              description: 'Failed to connect to Firebase. Please check your connection.',
              variant: 'destructive',
            });
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error fetching teachers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load teachers data.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { teachers, loading };
}
