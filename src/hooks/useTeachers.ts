import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Teacher } from '@/types/teacher';
import { toast } from '@/hooks/use-toast';

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teachersRef = ref(database, 'teachers');
    
    const unsubscribe = onValue(
      teachersRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const teachersList = Object.entries(data).map(([id, value]: [string, any]) => ({
            id,
            name: value.name || `Teacher ${id}`,
            attendance: value.attendance || {},
          }));
          setTeachers(teachersList);
        } else {
          setTeachers([]);
        }
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
