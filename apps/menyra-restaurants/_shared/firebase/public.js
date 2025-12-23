import { db } from "../../../../shared/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

function normalizeMeta(primary, fallback){
  const pick=(...vals)=>vals.find(v=>v!==undefined&&v!==null&&v!=="");
  const merged={ ...(fallback||{}), ...(primary||{}) };
  const name=pick(primary?.restaurantName,primary?.name,fallback?.restaurantName,fallback?.name,fallback?.slug);
  if (name){
    merged.name=merged.name||name;
    merged.restaurantName=merged.restaurantName||name;
  }
  const logoUrl=pick(primary?.logoUrl,primary?.logo,fallback?.logoUrl,fallback?.logo);
  if (logoUrl) merged.logoUrl=logoUrl;
  return merged;
}

export async function getPublicMeta(restaurantId){
  const ref=doc(db,"restaurants",restaurantId,"public","meta");
  const snap=await getDoc(ref);
  const meta=snap.exists()?(snap.data()||{}):null;

  let restDoc=null;
  const missingName=!meta||(!meta.name&&!meta.restaurantName);
  const missingLogo=!meta||(!meta.logoUrl&&!meta.logo);

  if (missingName||missingLogo){
    try{
      const restSnap=await getDoc(doc(db,"restaurants",restaurantId));
      if (restSnap.exists()) restDoc=restSnap.data()||{};
    }catch{}
  }

  const normalized=normalizeMeta(meta,restDoc);
  return Object.keys(normalized).length?normalized:null;
}
