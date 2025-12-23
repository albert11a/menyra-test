import { db } from "/shared/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
export async function getPublicMeta(restaurantId){
  const ref=doc(db,"restaurants",restaurantId,"public","meta");
  const snap=await getDoc(ref);
  return snap.exists()?snap.data():null;
}
