export function creatorVisitorId(pageId){
 let id;try{id=JSON.parse(localStorage.getItem(`mnyra.content.${pageId}`)||'{}')?.visitorId||localStorage.getItem('mnyra:cc:visitor');}catch{}
 if(!/^[a-f0-9]{32}$/.test(id||'')){id=crypto.randomUUID().replaceAll('-','');try{localStorage.setItem('mnyra:cc:visitor',id);}catch{}}
 return id;
}
