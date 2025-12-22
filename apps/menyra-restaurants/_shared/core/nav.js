export function projectRoot(){const h=location.href;const i=h.indexOf("/apps/");if(i!==-1)return h.slice(0,i+1);return h.replace(/index\.html.*$/,"");}
export function buildUrl(pathFromRoot, params={}){
  const root=projectRoot();
  const u=new URL(root+pathFromRoot.replace(/^\//,''));
  Object.entries(params||{}).forEach(([k,v])=>{ if(v!==undefined&&v!==null&&String(v).length) u.searchParams.set(k,String(v)); });
  return u.toString();
}
