// Die oeffentliche Web-Konfiguration des Firebase-Projekts - fuer Seiten,
// die NUR Firestore brauchen (der Chat auf /lifeskinshop) und deshalb
// shared/firebase-config.js (mit Auth, ~150 KB mehr) nicht laden sollen.
// Dieselben Werte wie dort; sie sind oeffentlich (stehen in jedem Browser).
export const FIREBASE_WEB_KONFIG = Object.freeze({
  apiKey: "AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",
  authDomain: "menyra-c0e68.firebaseapp.com",
  projectId: "menyra-c0e68",
  storageBucket: "menyra-c0e68.firebasestorage.app",
  messagingSenderId: "528471049588",
  appId: "1:528471049588:web:c507d87c0832562a855821"
});
export const FIREBASE_SDK_BASIS = "/shared/vendor/firebase/11.0.0";
