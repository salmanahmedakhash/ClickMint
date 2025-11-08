import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHdEG-jEIZFlv9aPm-ex8GH_VCN6-lNgk",
  authDomain: "earn-x-e06db.firebaseapp.com",
  projectId: "earn-x-e06db",
  storageBucket: "earn-x-e06db.firebasestorage.app",
  messagingSenderId: "309340784883",
  appId: "1:309340784883:web:bb7b416407b869c90a0f86",
  measurementId: "G-WKBL6LH27G"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

export { auth, db, messaging };