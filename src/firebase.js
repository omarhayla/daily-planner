import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDoW9-g4AECnbJTtpaDZEeBXdC4VsOkdyo",
  authDomain: "daily-planner-b9456.firebaseapp.com",
  projectId: "daily-planner-b9456",
  storageBucket: "daily-planner-b9456.firebasestorage.app",
  messagingSenderId: "992167674049",
  appId: "1:992167674049:web:411f83fd496ab587631440"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);