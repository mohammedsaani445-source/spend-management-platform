import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBTj9jFKQlLuJD7U_Pu8BKXC_iVni7dzPY",
  authDomain: "spend-management-platform.firebaseapp.com",
  databaseURL: "https://spend-management-platform-default-rtdb.firebaseio.com", // Typical format, may need verification
  projectId: "spend-management-platform",
  storageBucket: "spend-management-platform.firebasestorage.app",
  messagingSenderId: "357613361639",
  appId: "1:357613361639:web:4d6c518be69a8969120542",
  measurementId: "G-0TBPB171J8"
};

// Initialize Firebase (Singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app); // Realtime Database instance
const storage = getStorage(app);

// PRODUCTION REALIZATION: Reset Namespace
// Rotation of this prefix effectively "wipes" the platform for new users
// by pointing the application to a fresh, empty root in the database.
const DB_PREFIX = "v2_production";

export { app, auth, db, storage, DB_PREFIX };
