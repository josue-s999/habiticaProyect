
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

// Configuración de tu proyecto Firebase "mihabiticaapp"
const firebaseConfig = {
  apiKey: "AIzaSyAUZamJjarN21MWEJOKYCgkLAFpdBVUy78",
  authDomain: "mihabiticaapp.firebaseapp.com",
  projectId: "mihabiticaapp",
  storageBucket: "mihabiticaapp.firebasestorage.app",
  messagingSenderId: "780267507747",
  appId: "1:780267507747:web:d5f4736a26e78f4551a196"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators if running in a development environment
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log("Connecting to Firebase Emulators");
  // Descomenta las siguientes líneas si quieres usar los emuladores locales
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, 'localhost', 8080);
}


export { app, auth, db };
