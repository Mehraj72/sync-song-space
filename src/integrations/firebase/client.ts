import { initializeApp } from "firebase/app";
import { getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC56qoVtRtYeXJAyVVvRSTD2e4UJFgDmDQ",
  authDomain: "sync-song-space.firebaseapp.com",
  projectId: "sync-song-space",
  storageBucket: "sync-song-space.appspot.com",
  messagingSenderId: "506053315047",
  appId: "1:506053315047:web:f9665b9dc6d69fead25542",
  measurementId: "G-C8SK7MJVS7"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
