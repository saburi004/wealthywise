// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_O272GcYKdkF8QzSGtguYcORBkWIOYBM",
  authDomain: "wealthywise-c7318.firebaseapp.com",
  projectId: "wealthywise-c7318",
  storageBucket: "wealthywise-c7318.firebasestorage.app",
  messagingSenderId: "95468244758",
  appId: "1:95468244758:web:7687346ee0c49cb91b8a37",
  measurementId: "G-DD51CJHKL7"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
