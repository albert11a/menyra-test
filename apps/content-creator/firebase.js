// Public content never touches Heart's authentication persistence.
import { initializeApp } from "/shared/vendor/firebase/11.0.0/firebase-app.js";
import { getFirestore } from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
const app = initializeApp({apiKey:"AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",projectId:"menyra-c0e68",appId:"1:528471049588:web:c507d87c0832562a855821"}, "mnyra-content-public");
export const db = getFirestore(app);
