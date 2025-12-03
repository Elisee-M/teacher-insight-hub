import { useState, useEffect } from 'react';
import { ref, get, set, update, remove, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface AppUser {
  id: string;
  name: string;
  role: string;
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const usersRef = ref(database, 'users');
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Check if current user is admin
        const currentUserData = data[user.uid];
        setIsAdmin(currentUserData?.role === 'admin');
        
        // Get all users
        const usersList: AppUser[] = Object.keys(data).map((id) => ({
          id,
          name: data[id].name || '',
          role: data[id].role || 'user',
        }));
        setUsers(usersList);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addUser = async (userId: string, name: string, role: string) => {
    const userRef = ref(database, `users/${userId}`);
    await set(userRef, { name, role });
  };

  const updateUser = async (userId: string, name: string, role: string) => {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, { name, role });
  };

  const deleteUser = async (userId: string) => {
    const userRef = ref(database, `users/${userId}`);
    await remove(userRef);
  };

  return { isAdmin, loading, users, addUser, updateUser, deleteUser };
}
