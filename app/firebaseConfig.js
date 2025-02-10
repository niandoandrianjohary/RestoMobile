import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import messaging from "@react-native-firebase/messaging";

// Votre configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDPTaxVE6IHn_cSQZczAICL5q5pok5d4Q4",
  authDomain: "restoapp-556c8.firebaseapp.com",
  databaseURL: "https://restoapp-556c8-default-rtdb.firebaseio.com", // Assurez-vous que cette URL est correcte
  projectId: "restoapp-556c8",
  storageBucket: "restoapp-556c8.firebasestorage.app",
  messagingSenderId: "415984929063",
  appId: "1:415984929063:web:2ffe4288c43826e4fd8102",
  measurementId: "G-79WL520CYV"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Initialisation de la base de données

export { db }; // Export de la base de données pour l'utiliser ailleurs
