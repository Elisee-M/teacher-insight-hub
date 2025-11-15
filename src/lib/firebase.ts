import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBBxW7_6J0Q9Z0Q9Z0Q9Z0Q9Z0Q9Z0Q9Z0", // Replace with your actual API key
  authDomain: "essa-attendance.firebaseapp.com",
  databaseURL: "https://essa-attendance-default-rtdb.firebaseio.com/",
  projectId: "essa-attendance",
  storageBucket: "essa-attendance.appspot.com",
  messagingSenderId: "440307851831",
  appId: "1:440307851831:web:YOUR_APP_ID" // Replace with your actual app ID
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
