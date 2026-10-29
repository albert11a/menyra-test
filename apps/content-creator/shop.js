import {db} from './firebase.js';
import {doc,getDoc} from '/shared/vendor/firebase/11.0.0/firebase-firestore.js';
import {ccEscape as esc,ccImage,CC_PAGES} from '../../shared/content-creator.js';
import {euro,shopQuote,validShopId} from '../../shared/content-creator-shop.js';
import {zipBlob} from '../../shared/content-creator-zip.js';
export async function mountCreatorShop({root,page,still=false}){
 const storageKey=`mnyra:cc:shop:${page.id}${still?':still':''}`;
 let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch{saved={};}
 let ids=Array.isArray(saved.ids)?saved.ids.filter(id=>(page.products||[]).some(p=>p.id===id)):[];
 let cartId=validShopId(saved.cartId)?saved.cartId:crypto.randomUUID().replaceAll('-','');
 let orderId='',panel='',error='',notice='',submitting=false,downloadBusy='';
 let viewer=null,backgroundLock=null;
 const images={},positions={},orders=new Map(),customer={name:'',address:'',country:'Kosovë',phone:''};
 const tokens=still?[]:(Array.isArray(saved.orders)?saved.orders:[]).filter(validShopId).slice(-10);
 const fromLink=new URLSearchParams(location.search).get('order');if(!still&&validShopId(fromLink)&&!tokens.includes(fromLink))tokens.push(fromLink);
 let cartQueue=Promise.resolve();
 function remember(){try{localStorage.setItem(storageKey,JSON.stringify({ids,cartId,orders:tokens}));}catch{}}
 function flash(message){notice=message;setTimeout(()=>{notice='';render();},4500);}
 function quote(){if(!ids.length)return {lines:[],totalCents:0,currency:'EUR'};try{return shopQuote(page,ids);}catch{return {lines:[],totalCents:0,currency:'EUR'};}}
 async function api(op,data={},get=false){
  const payload={op,pageId:page.id,cartId,...data};
  if(still)throw Error('Still-Modus: keine echten Bestellungen.');
  const r=await fetch(`/api/content-creator-shop${get?'?'+new URLSearchParams(payload):''}`,{method:get?'GET':'POST',...(!get?{headers:{'content-type':'application/json'},body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(20000)});
  const result=await r.json();if(!r.ok||result.error)throw Error(result.error||'Ju lutemi, provoni përsëri.');return result;
 }
 function applyQuote(result){for(const line of result.lines||[]){const product=page.products.find(p=>p.id===line.id);if(product){product.priceCents=line.priceCents;product.title=line.title;}}}
 function saveCart(){
  remember();if(still)return;
  const snapshot=[...ids],snapshotCart=cartId;
  cartQueue=cartQueue.catch(()=>{}).then(async()=>{
   const result=await api('cart',{ids:snapshot,cartId:snapshotCart});
   if(snapshot.join(',')===ids.join(',')){applyQuote(result);render();}
   if(result.notified===false)api('notify',{kind:'cart',cartId:snapshotCart}).catch(()=>{});
  }).catch(()=>{notice='Shporta u ruajt në këtë pajisje. Kontrolloni lidhjen për të vazhduar.';render();});
 }
 function img(id,alt,extra=''){return images[id]?`<img src="${images[id]}" alt="${esc(alt)}" ${extra}>`:'<span class="shop-image-loading">MNYRA</span>';}
 function packFiles(product){return page.photoIds.filter(id=>(page.products.find(p=>p.id===product)?.imageIds||[]).includes(id));}
 function viewerMarkup(){
  if(!viewer)return '';
  const product=page.products.find(p=>p.id===viewer.product),files=packFiles(viewer.product);
  return `<section class="shop-viewer" role="dialog" aria-modal="true" aria-labelledby="shop-viewer-title">
   <header class="shop-viewer-header"><div><h2 id="shop-viewer-title">${esc(product.title)}</h2><span data-view-count aria-live="polite">${viewer.index+1} / ${files.length}</span></div><button type="button" data-shop="viewer-close" id="shop-viewer-close" aria-label="Mbyll pamjen e madhe">×</button></header>
   <div class="shop-viewer-stage"><div class="shop-viewer-track" data-view-track>${files.map((id,i)=>`<div class="shop-viewer-slide">${img(id,`${product.title} · ${i+1}`,'draggable="false"')}</div>`).join('')}</div>
   ${files.length>1?`<button type="button" class="shop-viewer-arrow shop-viewer-prev" data-shop="viewer-step" data-step="-1" aria-label="Fotoja paraprake">‹</button><button type="button" class="shop-viewer-arrow shop-viewer-next" data-shop="viewer-step" data-step="1" aria-label="Fotoja tjetër">›</button>`:''}</div>
   <footer class="shop-viewer-footer"><div class="shop-viewer-dots">${files.map((_,i)=>`<button type="button" data-shop="viewer-dot" data-index="${i}" aria-label="Foto ${i+1}" aria-pressed="${viewer.index===i}"></button>`).join('')}</div><div class="shop-viewer-buy"><strong>${product.priceCents===0?'Falas':euro(product.priceCents)}</strong><button type="button" class="shop-buy" data-shop="add" data-product="${product.id}" ${ids.includes(product.id)?'disabled':''}>${ids.includes(product.id)?'Në shportë ✓':'Shto në shportë'}</button></div></footer>
  </section>`;
 }
 function openViewer(product,index){
  const files=packFiles(product);if(!files.length)return;
  if(!viewer){
   const body=document.body,html=document.documentElement;
   backgroundLock={y:globalThis.scrollY||0,position:body.style.position,top:body.style.top,width:body.style.width,overflow:body.style.overflow,htmlOverflow:html.style.overflow};
   body.style.position='fixed';body.style.top=`-${backgroundLock.y}px`;body.style.width='100%';body.style.overflow='hidden';html.style.overflow='hidden';
  }
  viewer={product,index:Math.max(0,Math.min(files.length-1,Number(index)||0))};render();
  root.querySelector('[data-shop="viewer-close"]')?.focus({preventScroll:true});
 }
 function closeViewer(){
  if(!viewer)return;const previous=viewer;viewer=null;
  if(backgroundLock){
   const state=backgroundLock,body=document.body;
   for(const key of ['position','top','width','overflow'])body.style[key]=state[key]||'';
   document.documentElement.style.overflow=state.htmlOverflow||'';backgroundLock=null;
   render();globalThis.scrollTo?.(0,state.y);
  }else render();
  root.querySelector(`[data-shop="view"][data-product="${previous.product}"][data-index="${positions[previous.product]||0}"]`)?.focus({preventScroll:true});
 }
 function updateViewer(index){
  if(!viewer)return;
  const files=packFiles(viewer.product);viewer.index=Math.max(0,Math.min(files.length-1,index));positions[viewer.product]=viewer.index;
  const count=root.querySelector('[data-view-count]');if(count)count.textContent=`${viewer.index+1} / ${files.length}`;
  for(const dot of root.querySelectorAll('.shop-viewer-dots [data-index]'))dot.setAttribute('aria-pressed',String(Number(dot.dataset.index)===viewer.index));
 }
 function moveViewer(index){
  const track=root.querySelector('[data-view-track]');if(!viewer||!track)return;
  updateViewer(index);track.scrollTo({left:viewer.index*(track.clientWidth||1),behavior:'smooth'});
 }
 function render(){
  const active=root.ownerDocument?.activeElement,focusId=active?.id,selection=active?.selectionStart;
  const cart=quote();
  root.innerHTML=`<div class="shop-shell">${still?'<div class="preview">Still · Demo pa statistika, pa porosi dhe pa njoftime reale.</div>':''}
   <header class="shop-header"><a href="#" class="shop-logo">MNYRA<span>CONTENT STUDIO</span></a><button data-shop="cart" class="shop-cart" aria-label="Hap shportën">Shporta <b>${ids.length}</b></button></header>
   <section class="shop-hero"><div><p class="eyebrow">Krijuar për ju</p><h1>${esc(page.name)}</h1><p>Fotot që i japin jetë biznesit tuaj.</p></div>${ccImage(page.avatar)?`<img class="avatar" src="${ccImage(page.avatar)}" alt="">`:''}</section>
   <div class="shop-section-title"><h2>Zgjidhni pakon tuaj</h2><span>Foto digjitale · EUR</span></div>
   <section class="shop-products">${(page.products||[]).filter(p=>p.active!==false).map(product=>{
    const files=page.photoIds.filter(id=>product.imageIds.includes(id));if(!files.length)return '';
    return `<article class="shop-product"><div class="shop-carousel"><div class="shop-track" data-track="${product.id}">${files.map((id,i)=>`<button type="button" class="shop-slide" data-shop="view" data-product="${product.id}" data-index="${i}" aria-label="Shiko foton ${i+1} të pakos ${esc(product.title)}">${img(id,`${product.title} · ${i+1}`,'draggable="false"')}<span class="shop-watermark">Pamje paraprake</span></button>`).join('')}</div>${files.length>1?`<button class="shop-arrow shop-prev" data-shop="slide" data-product="${product.id}" data-step="-1" aria-label="Fotoja paraprake">‹</button><button class="shop-arrow shop-next" data-shop="slide" data-product="${product.id}" data-step="1" aria-label="Fotoja tjetër">›</button><div class="shop-dots">${files.map((_,i)=>`<button data-shop="dot" data-product="${product.id}" data-index="${i}" aria-label="Foto ${i+1}" aria-pressed="${(positions[product.id]||0)===i}"></button>`).join('')}</div>`:''}<span class="shop-photo-count">${files.length} foto</span></div>
    <div class="shop-product-info"><h3>${esc(product.title)}</h3><p>Paketa e plotë · ${files.length} foto origjinale</p><div class="shop-price-row"><strong>${product.priceCents===0?'Falas':euro(product.priceCents)}</strong></div><button class="shop-buy" data-shop="add" data-product="${product.id}" ${ids.includes(product.id)?'disabled':''}>${ids.includes(product.id)?'Në shportë ✓':'Shto në shportë'}</button></div></article>`;
   }).join('')}</section>
   <section class="shop-how"><h2>Si funksionon?</h2><div><p><b>01 · Zgjidhni</b>Pakot që ju pëlqejnë.</p><p><b>02 · Pagesa te postieri</b>Plotësoni të dhënat tuaja.</p><p><b>03 · Shkarkoni</b>Pas konfirmimit të pagesës nga MNYRA.</p></div><p class="shop-fine">Produkte digjitale. Fotot e paraqitura janë pamje paraprake me shenjë uji. Origjinalet pa shenjë uji hapen vetëm pas pagesës dhe miratimit.</p></section>
   <section class="shop-purchases" id="shop-purchases"><h2>Blerjet tuaja</h2>${[...orders.values()].map(order=>`<article class="shop-order"><div class="shop-order-title"><b>Porosia #${esc(order.id.slice(0,8).toUpperCase())}</b><strong>${euro(order.totalCents)}</strong></div><p class="shop-order-state">${order.approved?(order.totalCents===0?'✓ Pako falas · Shkarkimet janë gati':'✓ Pagesa u konfirmua · Shkarkimet janë gati'):(order.totalCents===0?'Në pritje të miratimit':'Në pritje të pagesës / miratimit')}</p>${order.lines.map(line=>`<div class="shop-purchased-item">${img(line.imageIds[0],line.title)}<div><h3>${esc(line.title)}</h3><p>${line.imageIds.length} foto · ${euro(line.priceCents)}</p><button data-shop="download" data-order="${order.id}" data-product="${line.id}" ${!order.approved||downloadBusy?'disabled':''}>${downloadBusy===line.id?'Duke përgatitur…':order.approved?'Shkarko pakon ZIP':'Shkarkimi i kyçur'}</button></div></div>`).join('')}<div class="shop-order-actions"><button data-shop="refresh" data-order="${order.id}">Kontrollo statusin</button>${still?'':`<button data-shop="receipt-link" data-order="${order.id}">Kopjo linkun e porosisë</button>`}</div></article>`).join('')||'<p>Pas porosisë, artikujt tuaj do të shfaqen këtu.</p>'}</section>
   <footer class="shop-footer">MNYRA · Krijuar për biznesin tuaj</footer>
   ${notice?`<p class="shop-notice" role="status">${esc(notice)}</p>`:''}
   ${error&&panel!=='checkout'?`<p class="shop-error" role="alert">${esc(error)}</p>`:''}
   ${panel?`<div class="shop-overlay"><section class="shop-drawer" role="dialog" aria-modal="true" aria-labelledby="shop-panel-title"><div class="shop-drawer-head"><h2 id="shop-panel-title">${panel==='checkout'?'Përfundoni porosinë':'Shporta juaj'}</h2><button data-shop="close" aria-label="Mbyll" ${submitting?'disabled':''}>×</button></div>
    ${cart.lines.map(line=>`<div class="shop-cart-line">${img(line.imageIds[0],line.title)}<div><h3>${esc(line.title)}</h3><p>${line.imageIds.length} foto</p><strong>${euro(line.priceCents)}</strong></div><button data-shop="remove" data-product="${line.id}" aria-label="Hiq pakon" ${submitting?'disabled':''}>×</button></div>`).join('')||'<p>Shporta juaj është bosh.</p>'}
    <div class="shop-total"><span>Totali</span><strong>${euro(cart.totalCents)}</strong></div>
    ${panel==='cart'?`<p class="shop-fine">${cart.totalCents===0?'Falas · Shkarkim pas miratimit':'Pagesa te postieri · Shkarkim pas miratimit'}</p><button class="shop-buy" data-shop="checkout" ${!cart.lines.length?'disabled':''}>Vazhdo te porosia →</button>`:`<form id="shop-checkout"><label>Emri dhe mbiemri<input id="shop-name" name="name" value="${esc(customer.name)}" autocomplete="name" required minlength="3" maxlength="120"></label><label>Adresa e plotë<textarea id="shop-address" name="address" autocomplete="street-address" required minlength="5" maxlength="300">${esc(customer.address)}</textarea></label><label>Shteti<select id="shop-country" name="country">${['Kosovë','Shqipëri','Austri','Gjermani','Zvicër','Maqedoni e Veriut','Mal i Zi','Itali','Francë','Serbi','Slloveni','Kroaci'].map(country=>`<option ${customer.country===country?'selected':''}>${country}</option>`).join('')}</select></label><label>Numri i telefonit<input id="shop-phone" type="tel" name="phone" value="${esc(customer.phone)}" autocomplete="tel" required minlength="6" maxlength="40"></label><div class="shop-payment">${cart.totalCents===0?'<strong>Falas · 0 €</strong><p>Nuk kërkohet pagesë. Shkarkimet hapen pas miratimit nga MNYRA.</p>':'<strong>Pagesa te postieri</strong><p>Pagesë në dorë (Cash on Delivery). Shkarkimet hapen pasi MNYRA të konfirmojë pagesën.</p>'}</div>${error?`<p role="alert" class="shop-inline-error">${esc(error)}</p>`:''}<button class="shop-buy" type="submit" ${submitting?'disabled':''}>${submitting?'Duke dërguar…':`Porosit · ${euro(cart.totalCents)}`}</button></form>`}
   </section></div>`:''}${viewerMarkup()}</div>`;
  for(const track of root.querySelectorAll('[data-track]')){
   track.scrollLeft=(positions[track.dataset.track]||0)*track.clientWidth;
   track.addEventListener('scroll',()=>{const index=Math.round(track.scrollLeft/(track.clientWidth||1));positions[track.dataset.track]=index;for(const dot of track.parentElement.querySelectorAll('[data-index]'))dot.setAttribute('aria-pressed',String(Number(dot.dataset.index)===index));},{passive:true});
  }
  const viewerTrack=root.querySelector('[data-view-track]');
  if(viewerTrack&&viewer){
   viewerTrack.scrollLeft=viewer.index*(viewerTrack.clientWidth||1);
   viewerTrack.addEventListener('scroll',()=>updateViewer(Math.round(viewerTrack.scrollLeft/(viewerTrack.clientWidth||1))),{passive:true});
  }
  for(const child of root.querySelector('.shop-shell').children){
   if(!child.classList.contains('shop-viewer')&&viewer)child.setAttribute('inert','');
  }
  if(focusId){const field=root.querySelector(`#${focusId}`);if(field){field.focus({preventScroll:true});try{field.setSelectionRange(selection,selection);}catch{ /* select/tel */ }}}
 }
 async function refreshOrder(id){if(still)return;const order=await api('receipt',{orderId:id},true);if(order.pageId!==page.id)return;orders.set(id,order);render();}
 root.addEventListener('input',event=>{if(event.target.closest('#shop-checkout')&&event.target.name)customer[event.target.name]=event.target.value;});
 root.addEventListener('change',event=>{if(event.target.closest('#shop-checkout')&&event.target.name)customer[event.target.name]=event.target.value;});
 root.addEventListener('click',async event=>{
  const button=event.target.closest('[data-shop]');if(!button||button.disabled)return;
  const action=button.dataset.shop,product=button.dataset.product;
  try{
   if(action==='view'){openViewer(product,button.dataset.index);return;}
   if(action==='viewer-close'){closeViewer();return;}
   if(action==='viewer-step'){moveViewer((viewer?.index||0)+Number(button.dataset.step));return;}
   if(action==='viewer-dot'){moveViewer(Number(button.dataset.index));return;}
   if(action==='slide'||action==='dot'){
    const track=root.querySelector(`[data-track="${product}"]`),max=track.children.length-1;
    const target=action==='dot'?Number(button.dataset.index):Math.min(max,Math.max(0,(positions[product]||0)+Number(button.dataset.step)));
    positions[product]=target;track.scrollTo({left:target*track.clientWidth,behavior:'smooth'});return;
   }
   error='';
   if(action==='add'){if(!ids.includes(product)){ids.push(product);flash('Pakoja u shtua në shportë.');render();saveCart();}}
   if(action==='cart'){panel='cart';render();}
   if(action==='close'&&!submitting){panel='';render();}
   if(action==='checkout'){panel='checkout';render();root.querySelector('#shop-name')?.focus();}
   if(action==='remove'&&!submitting){ids=ids.filter(id=>id!==product);render();saveCart();}
   if(action==='refresh')await refreshOrder(button.dataset.order);
   if(action==='receipt-link'){await navigator.clipboard.writeText(`${location.origin}/content-creator/${page.id}?order=${button.dataset.order}`);notice='Linku i porosisë u kopjua. Ruajeni për shkarkimet tuaja.';render();}
   if(action==='download')await download(button.dataset.order,product);
  }catch(e){error=e.message;render();}
 });
 root.addEventListener('keydown',event=>{
  if(viewer){
   if(event.key==='Escape'){event.preventDefault();closeViewer();return;}
   if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();moveViewer(viewer.index+(event.key==='ArrowLeft'?-1:1));return;}
   if(event.key==='Tab'){
    const fields=[...root.querySelectorAll('.shop-viewer button:not(:disabled)')];
    if(event.shiftKey&&event.target===fields[0]){event.preventDefault();fields.at(-1)?.focus();}
    else if(!event.shiftKey&&event.target===fields.at(-1)){event.preventDefault();fields[0]?.focus();}
   }
   return;
  }
  if(!panel)return;
  if(event.key==='Escape'&&!submitting){panel='';render();}
  if(event.key==='Tab'){
   const fields=[...root.querySelectorAll('.shop-drawer button:not(:disabled),.shop-drawer input,.shop-drawer textarea,.shop-drawer select')];
   if(event.shiftKey&&event.target===fields[0]){event.preventDefault();fields.at(-1)?.focus();}
   else if(!event.shiftKey&&event.target===fields.at(-1)){event.preventDefault();fields[0]?.focus();}
  }
 });
 root.addEventListener('submit',async event=>{
  if(event.target.id!=='shop-checkout')return;event.preventDefault();if(submitting)return;
  if(!ids.length)return;
  submitting=true;error='';render();
  try{
   await cartQueue;
   orderId ||= crypto.randomUUID().replaceAll('-','');
   const result=still?{id:orderId,pageId:page.id,...quote(),status:'pending',approved:false,paymentMethod:'cod'}:await api('order',{orderId,ids:[...ids],expectedTotalCents:quote().totalCents,customer});
   if(result.priceChanged){applyQuote(result);throw Error('Çmimi u përditësua. Kontrolloni totalin dhe konfirmoni përsëri.');}
   orders.set(result.id,result);if(!still&&!tokens.includes(result.id))tokens.push(result.id);
   if(result.notified===false)api('notify',{kind:'order',orderId:result.id}).catch(()=>{});
   ids=[];cartId=crypto.randomUUID().replaceAll('-','');orderId='';remember();panel='';notice=still?'Demo: porosia nuk u dërgua.':'Faleminderit! Porosia u pranua. Shkarkimet shfaqen pas miratimit.';
   render();root.querySelector('#shop-purchases')?.scrollIntoView({behavior:'smooth'});
  }catch(e){error=e.message;}finally{submitting=false;render();}
 });
 async function download(receipt,product){
  const order=orders.get(receipt),line=order?.lines.find(p=>p.id===product);if(!order?.approved||!line)return;
  downloadBusy=product;render();
  try{
   const files=[];let bytesTotal=0;
   for(const [index,file] of line.imageIds.entries()){
    const meta=await api('download',{orderId:receipt,file},true);bytesTotal+=meta.size;
    if(bytesTotal>150*1024*1024)throw Error('Pakoja është shumë e madhe për këtë pajisje. Kontaktoni MNYRA për dorëzimin e skedarëve.');
    const parts=[];
    for(let part=0;part<meta.parts;part++){
     const data=await api('download',{orderId:receipt,file,part},true),binary=atob(data.data),bytes=new Uint8Array(binary.length);
     for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);parts.push(bytes);
    }
    const bytes=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
    files.push({name:`${index+1}-${meta.name}`,bytes});
   }
   const url=URL.createObjectURL(zipBlob(files)),link=document.createElement('a');link.href=url;link.download=`MNYRA-${line.title.replace(/[^\p{L}\p{N}_-]/gu,'_')}.zip`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }finally{downloadBusy='';render();}
 }
 render();remember();
 await Promise.all(page.photoIds.map(async key=>{
  try{const snap=await getDoc(doc(db,CC_PAGES,page.id,'previews',key)),data=ccImage(snap.data()?.data);if(data)images[key]=data;}catch{ /* cards remain usable */ }
 }));render();
 await Promise.all(tokens.map(id=>refreshOrder(id).catch(()=>{})));
 const poll=globalThis.setInterval(()=>{if(still||document.visibilityState==='hidden')return;for(const order of orders.values())if(!order.approved)refreshOrder(order.id).catch(()=>{});},20000);
 globalThis.addEventListener?.('pagehide',event=>{if(!event.persisted)globalThis.clearInterval(poll);});
}

