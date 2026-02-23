import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBwVqinePgkAcCiGOoYt5SEOgHyVyprXyc",
  authDomain: "smart-agri-af9b0.firebaseapp.com",
  projectId: "smart-agri-af9b0",
  storageBucket: "smart-agri-af9b0.firebasestorage.app",
  messagingSenderId: "1072695872191",
  appId: "1:1072695872191:web:da38edf9cf166dea83140a"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
