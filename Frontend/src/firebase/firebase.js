// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"; // Importa getStorage

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzYnbJaTGp4JNFslSgfMrdY_kz6uSl-Gw",
  authDomain: "imagenes-c5fa0.firebaseapp.com",
  projectId: "imagenes-c5fa0",
  storageBucket: "imagenes-c5fa0.firebasestorage.app",
  messagingSenderId: "681469370833",
  appId: "1:681469370833:web:8550e1c301d2529d0800f0",
  measurementId: "G-QVSKRNWRZ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app); // Utiliza getStorage(app)