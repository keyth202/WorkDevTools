import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

if (!apiKey) {
  throw new Error("Missing VITE_GOOGLE_API_KEY environment variable");
}

const firebaseConfig = {
    apiKey: apiKey,
    projectId: projectId,
    authDomain: authDomain,
    storageBucket: storageBucket,
    appId: appId,
    messagingSenderId: messagingSenderId,
};

//const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };