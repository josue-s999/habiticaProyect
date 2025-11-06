
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

// =================================================================
// ¡IMPORTANTE! INSERTA TU PROPIA CONFIGURACIÓN DE FIREBASE AQUÍ
// =================================================================
// 1. Ve a la consola de Firebase: https://console.firebase.google.com/
// 2. Crea un nuevo proyecto (o selecciona uno existente).
// 3. En la configuración de tu proyecto (icono de engranaje), ve a "Configuración del proyecto".
// 4. En la pestaña "General", desplázate hacia abajo hasta "Tus apps".
// 5. Selecciona o crea una aplicación web.
// 6. Elige la opción "CDN" para ver el objeto de configuración.
// 7. Copia los valores y pégalos aquí abajo.
// =================================================================
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
  measurementId: "TU_MEASUREMENT_ID" // Opcional
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
