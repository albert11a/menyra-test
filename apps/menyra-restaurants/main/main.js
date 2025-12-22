import { getContext, requireRestaurant } from "@s1/core/context.js";
import { getPublicMeta } from "@s1/firebase/public.js";
import { buildUrl } from "@s1/core/nav.js";
const ctx=getContext(); const ok=requireRestaurant(ctx);
const nameEl=document.getElementById("mainName");
const subEl=document.getElementById("mainSub");
const openMenuBtn=document.getElementById("openMenuBtn");
const openStoryBtn=document.getElementById("openStoryBtn");
if(!ok.ok){ subEl.textContent=ok.error; }
else{
  openMenuBtn.href=buildUrl("apps/menyra-restaurants/guest/karte/index.html",{r:ctx.restaurantId});
  openStoryBtn.href=buildUrl("apps/menyra-restaurants/guest/story/index.html",{r:ctx.restaurantId});
  (async()=>{const meta=await getPublicMeta(ctx.restaurantId); nameEl.textContent=meta?.name||"Main"; subEl.textContent=meta?.type?`Typ: ${meta.type}`:`RestaurantId: ${ctx.restaurantId}`;})();
}
