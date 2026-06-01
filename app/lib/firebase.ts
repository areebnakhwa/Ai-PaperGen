import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4ciJHeQnJX_P7UKFZbt_SHSSCGDn4F0Q",
  authDomain: "exam-gen-app.firebaseapp.com",
  projectId: "exam-gen-app",
  storageBucket: "exam-gen-app.firebasestorage.app",
  messagingSenderId: "376187380561",
  appId: "1:376187380561:web:250cb67c4e804e73722970",
};

// Agar app pehle se initialized hai toh wahi use karo, nahi toh naya banao
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Inko hum puri app mein kahin bhi use kar sakte hain
export const auth = getAuth(app);
export const db = getFirestore(app);
