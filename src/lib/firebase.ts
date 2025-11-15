import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDH0AJ2n4vvNewipDmXMwh5_kac0d7orCo",
  authDomain: "essa-attendance.firebaseapp.com",
  databaseURL: "https://essa-attendance-default-rtdb.firebaseio.com",
  projectId: "essa-attendance",
  storageBucket: "essa-attendance.firebasestorage.app",
  messagingSenderId: "440307851831",
  appId: "1:440307851831:web:46a9f05bdaee52cad655b2",
  measurementId: "G-RJ1J0XLM9H"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
