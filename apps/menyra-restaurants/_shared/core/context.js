import { getLang, setLang } from "../../../../shared/i18n/i18n.js";
export function getContext(){
  const u=new URL(location.href);
  const r=(u.searchParams.get("r")||"").trim();
  const t=(u.searchParams.get("t")||"").trim();
  const lang=(u.searchParams.get("lang")||getLang("de")).trim();
  if(lang) setLang(lang);
  return { restaurantId:r, tableId:t||null, lang };
}
export function requireRestaurant(ctx){ return ctx.restaurantId?{ok:true}:{ok:false,error:"Missing restaurantId (?r=...)"}; }
