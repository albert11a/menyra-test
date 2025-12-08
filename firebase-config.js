// firebase-config.js
// Zentrale Firebase-Config für MENYRA (App + Firestore + Storage)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";

import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  collectionGroup,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

// MENYRA-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",
  authDomain: "menyra-c0e68.firebaseapp.com",
  projectId: "menyra-c0e68",
  storageBucket: "menyra-c0e68.firebasestorage.app",
  messagingSenderId: "528471049588",
  appId: "1:528471049588:web:c507d87c0832562a855821",
  measurementId: "G-YLFKC8726B"
};

// App initialisieren
const app = initializeApp(firebaseConfig);

// Firestore & Storage Instanzen
const db = getFirestore(app);
const storage = getStorage(app);

// Alles exportieren, was wir in den einzelnen UIs brauchen
export {
  db,
  storage,
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  collectionGroup,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc
};
