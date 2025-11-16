import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Teacher, AttendanceRecord } from '@/types/teacher';
import { toast } from '@/hooks/use-toast';

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const historyRef = ref(database, 'history/daily');
    
    const unsubscribe = onValue(
      historyRef,
      (snapshot) => {
        const dailyData = snapshot.val();
        
        if (!dailyData) {
          setTeachers([]);
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

        // Loop through all dates
        Object.keys(dailyData).forEach((date) => {
          const dateRecords = dailyData[date];
          
          // Loop through all teachers in this date
          Object.keys(dateRecords).forEach((teacherId) => {
            const record = dateRecords[teacherId] as AttendanceRecord;
            
            if (!teacherMap.has(teacherId)) {
              teacherMap.set(teacherId, {
                id: teacherId,
                name: record.name,
                trade: record.trade,
                records: [],
              });
            }
            
            teacherMap.get(teacherId)!.records.push(record);
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

    return () => unsubscribe();
  }, []);

  return { teachers, loading };
}
