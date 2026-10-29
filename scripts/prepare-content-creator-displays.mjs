// Explicit, bounded cache preparation. Does not create visits, carts or orders.
const args=process.argv.slice(2);
const pageId=args[args.indexOf('--page')+1];
const origin=args.includes('--origin')?args[args.indexOf('--origin')+1]:'https://mnyra.com';
if(!/^[a-f0-9]{32}$/.test(pageId||''))throw Error('Use --page <32-character page ID>');
const base=new URL(origin);if(base.protocol!=='https:')throw Error('HTTPS origin required');
const response=await fetch(new URL(`/api/content-creator?${new URLSearchParams({id:pageId,format:'json'})}`,base),{signal:AbortSignal.timeout(30000)});
if(!response.ok)throw Error(`Page is unavailable (${response.status})`);
const page=await response.json();if(page.kind!=='shop'||!page.published)throw Error('Published shop required');
const files=[...new Set(page.products.filter(p=>p.active!==false).flatMap(p=>p.imageIds))].filter(key=>page.photoIds.includes(key)&&/^[a-zA-Z0-9_-]{1,64}$/.test(key)).slice(0,30);
let cursor=0,ready=0;
async function worker(){
 while(cursor<files.length){
  const file=files[cursor++];
  const result=await fetch(new URL('/api/content-creator-shop',base),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({op:'prepare-image',pageId,file}),signal:AbortSignal.timeout(120000)});
  const payload=await result.json();if(!result.ok||!payload.ok)throw Error(`Image ${file}: ${payload.error||result.status}`);
  console.log(`Prepared ${++ready}/${files.length}: ${file}`);
 }
}
await Promise.all([worker(),worker()]);
console.log('Finished. No originals were changed.');
