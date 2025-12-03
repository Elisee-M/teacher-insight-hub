import { useState, useEffect } from 'react';
import { ref, set, update, remove, onValue, push } from 'firebase/database';
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
      setUsers([]);
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
      } else {
        setUsers([]);
      }
      setLoading(false);
    }, (error) => {
      // Silently handle errors when user logs out
      console.log('Firebase listener detached');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addUser = async (name: string, role: string) => {
    const usersRef = ref(database, 'users');
    const newUserRef = push(usersRef);
    await set(newUserRef, { name, role });
  };

  const updateUser = async (userId: string, name: string, role: string) => {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, { name, role });
  };

  const deleteUser = async (userId: string) => {
    // Check if user is admin - prevent deletion
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'admin') {
      throw new Error('Cannot delete admin users');
    }
    const userRef = ref(database, `users/${userId}`);
    await remove(userRef);
  };

  return { isAdmin, loading, users, addUser, updateUser, deleteUser };
}
