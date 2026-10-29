import {ccEscape as esc,ccImage} from '../../shared/content-creator.js';
import {euro,shopQuote,validShopId} from '../../shared/content-creator-shop.js';
import {creatorIcon,creatorImageUrl,creatorOfferButton,creatorPhoto,renderCreatorCatalog,creatorHowTo} from '../../shared/content-creator-view.js';
export async function mountCreatorShop({root,page,still=false}){
 const storageKey=`mnyra:cc:shop:${page.id}${still?':still':''}`;
 let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch{saved={};}
 let ids=Array.isArray(saved.ids)?saved.ids.filter(id=>(page.products||[]).some(p=>p.id===id&&p.priceCents!==0)):[];
 let cartId=validShopId(saved.cartId)?saved.cartId:crypto.randomUUID().replaceAll('-','');
 let orderId='',panel='',error='',notice='',submitting=false,downloadBusy='';
 let viewer=null,backgroundLock=null,sheetLock=null,photoSave=null,downloadCancelled=false,fileAbort=null;
 const originalTheme=document.querySelector('meta[name="theme-color"]')?.getAttribute('content')||'#f7f6f2';
 const prepared=new Map(),imageErrors={};
 let neighbourObserver=null;
 const images={},positions={},orders=new Map(),customer={name:'',address:'',country:'Kosovë',phone:''};
 const tokens=still?[]:(Array.isArray(saved.orders)?saved.orders:[]).filter(validShopId).slice(-10);
 const fromLink=new URLSearchParams(location.search).get('order');if(!still&&validShopId(fromLink)&&!tokens.includes(fromLink))tokens.push(fromLink);
 let cartQueue=Promise.resolve();
 function remember(){try{localStorage.setItem(storageKey,JSON.stringify({ids,cartId,orders:tokens}));}catch{}}
 function flash(message){notice=message;setTimeout(()=>{notice='';render();},4500);}
 function quote(){if(!ids.length)return {lines:[],totalCents:0,currency:'EUR'};try{return shopQuote(page,ids);}catch{return {lines:[],totalCents:0,currency:'EUR'};}}
 async function api(op,data={},get=false){
  const payload={op,pageId:page.id,cartId,...data};
  if(still&&op!=='free-download')throw Error('Still-Modus: keine echten Bestellungen.');
  const r=await fetch(`/api/content-creator-shop${get?'?'+new URLSearchParams(payload):''}`,{method:get?'GET':'POST',...(!get?{headers:{'content-type':'application/json'},body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(20000)});
  const result=await r.json();if(!r.ok||result.error)throw Object.assign(Error(result.error||'Ju lutemi, provoni përsëri.'),{status:r.status});return result;
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
 function img(id,alt,options={}){
  if(typeof options!=='object')options={};
  if(imageErrors[id])return `<span data-photo="${esc(id)}" data-alt="${esc(alt)}" class="shop-image-loading">Fotoja nuk u ngarkua</span>`;
  const size=options.size||'thumb';
  return creatorPhoto(page,id,alt,{...options,size,src:size==='thumb'?images[id]:undefined});
 }
 function imageStatus(){const count=Object.keys(imageErrors).length;return count?`<p role="alert">${count} foto nuk u ngarkuan. <button type="button" data-shop="retry-images">Provo përsëri</button></p>`:'';}
 function paintImage(key){
  for(const node of root.querySelectorAll(`[data-photo="${key}"]`))node.outerHTML=img(key,node.getAttribute('data-alt')||page.name,{size:node.dataset.size||'thumb',active:true,eager:true});
  const status=root.querySelector('#shop-image-errors');if(status)status.innerHTML=imageStatus();
  watchImages();
 }
 function warmNextImage(node){
  const track=node.closest('[data-track]');if(!track)return;
  const rect=track.getBoundingClientRect?.(),height=globalThis.innerHeight||document.documentElement.clientHeight;
  if(rect&&height>0&&(rect.bottom<=0||rect.top>height+100))return;
  const index=positions[track.dataset.track]||0,slide=track.children[index];
  if(!slide?.contains(node))return;
  // The current photo has arrived: fetch and decode the adjacent photograph
  // now, at low priority, rather than waiting for the swipe to begin.
  const next=track.children[index+1]?.querySelector('img[data-deferred-src]');
  if(next){next.loading='eager';next.fetchPriority='low';next.src=next.dataset.deferredSrc;next.removeAttribute('data-deferred-src');next.decode?.().catch(()=>{});}
 }
 function watchImages(){
  for(const node of root.querySelectorAll('img[data-photo]')){
   node.onerror=()=>{if(node.dataset.size==='medium'){node.style.opacity='0';return;}imageErrors[node.dataset.photo]=true;paintImage(node.dataset.photo);};
   node.onload=()=>warmNextImage(node);
   if(node.complete&&node.naturalWidth>0)warmNextImage(node);
  }
 }
 function imageUrl(key,size='thumb'){return creatorImageUrl(page,key,size);}
 function loadImages(keys){for(const key of keys){delete imageErrors[key];images[key]=`${imageUrl(key)}&retry=${Date.now()}`;paintImage(key);}}
 function activateImages(track,index){
  for(const [i,slide] of [...track.children].entries())if(Math.abs(i-index)<=1)for(const img of slide.querySelectorAll('img[data-deferred-src]')){img.loading='eager';img.fetchPriority=i===index?'high':'low';img.src=img.dataset.deferredSrc;img.removeAttribute('data-deferred-src');img.decode?.().catch(()=>{});}
 }
 function offerButton(product){return creatorOfferButton(product,{busy:downloadBusy,selected:product.priceCents!==0&&ids.includes(product.id)});}
 function discardSave(){
  const cached=new Set([...prepared.values()].flatMap(entry=>entry.urls||[]));
  for(const url of photoSave?.urls||[])if(!cached.has(url))URL.revokeObjectURL(url);
  photoSave=null;
 }
 function syncBrowserChrome(){
  const sheet=!!(photoSave||panel);
  if(sheet&&!viewer&&!backgroundLock&&!sheetLock){
   const body=document.body;sheetLock={y:globalThis.scrollY||0,position:body.style.position,top:body.style.top,width:body.style.width,overflow:body.style.overflow};
   body.style.position='fixed';body.style.top=`-${sheetLock.y}px`;body.style.width='100%';body.style.overflow='hidden';
  }else if(!sheet&&sheetLock){
   const saved=sheetLock;sheetLock=null;for(const key of ['position','top','width','overflow'])document.body.style[key]=saved[key]||'';globalThis.scrollTo?.(0,saved.y);
  }
  document.documentElement.dataset.ccViewer=viewer?'1':'0';
  const theme=document.querySelector('meta[name="theme-color"]');if(theme)theme.setAttribute('content',viewer?'#101813':originalTheme);
 }
 function photoSaveMarkup(){
  if(!photoSave)return '';
  const files=photoSave.receipt?orders.get(photoSave.receipt)?.lines.find(p=>p.id===photoSave.product)?.imageIds:packFiles(photoSave.product);
  return `<div class="shop-save-overlay"><section class="shop-drawer shop-save-sheet" role="dialog" aria-modal="true" aria-labelledby="shop-save-title"><div class="shop-sheet-handle"></div><div class="shop-drawer-head"><div><span class="eyebrow">${creatorIcon('save')} Fotot tuaja</span><h2 id="shop-save-title">Ruajini në telefon.</h2></div><button type="button" data-shop="save-close" aria-label="Mbyll">${creatorIcon('x')}</button></div><p class="shop-save-description">${photoSave.loading?`Duke përgatitur origjinalet · ${photoSave.files.length} / ${photoSave.total}`:'Fotot janë gati. Prekni butonin dhe zgjidhni “Ruaj imazhet” në menynë e telefonit.'}</p><div class="shop-save-files">${(files||[]).map((id,i)=>{const ready=photoSave.files.find(f=>f.name.startsWith(`${i+1}-`)),index=photoSave.files.indexOf(ready);return `<a ${ready?`href="${photoSave.urls[index]}" target="_blank" rel="noopener"`:'aria-disabled="true"'}>${img(id,`Foto ${i+1}`)}<span>Foto ${i+1}${ready?creatorIcon('check'):''}</span></a>`;}).join('')}</div><button type="button" class="shop-buy" data-shop="save-ready" ${photoSave.loading||!photoSave.files.length?'disabled':''}>${creatorIcon('save')}<span>${photoSave.loading?'Duke përgatitur…':'Ruaj fotot në album'}</span></button><p class="shop-save-tip">Mund ta hapni edhe një foto veçmas dhe ta mbani të shtypur për ta ruajtur.</p>${photoSave.message?`<p role="status">${esc(photoSave.message)}</p>`:''}</section></div>`;
 }
 function packFiles(product){return page.photoIds.filter(id=>(page.products.find(p=>p.id===product)?.imageIds||[]).includes(id));}
 function viewerMarkup(){
  if(!viewer)return '';
  const product=page.products.find(p=>p.id===viewer.product),files=packFiles(viewer.product);
  return `<section class="shop-viewer" role="dialog" aria-modal="true" aria-labelledby="shop-viewer-title">
   <header class="shop-viewer-header"><div><h2 id="shop-viewer-title">${esc(product.title)}</h2><span data-view-count aria-live="polite">${viewer.index+1} / ${files.length}</span></div><button type="button" data-shop="viewer-close" id="shop-viewer-close" aria-label="Mbyll pamjen e madhe">${creatorIcon('x')}</button></header>
   <div class="shop-viewer-stage"><div class="shop-viewer-track" data-view-track>${files.map((id,i)=>`<div class="shop-viewer-slide">${img(id,'',{size:'thumb',active:Math.abs(i-viewer.index)<=1,eager:i===viewer.index}).replace('<img ','<img class="shop-viewer-preview" aria-hidden="true" ')}${img(id,`${product.title} · ${i+1}`,{size:'medium',active:Math.abs(i-viewer.index)<=1,eager:i===viewer.index})}</div>`).join('')}</div>
   ${files.length>1?`<button type="button" class="shop-viewer-arrow shop-viewer-prev" data-shop="viewer-step" data-step="-1" aria-label="Fotoja paraprake">${creatorIcon('chevron-left')}</button><button type="button" class="shop-viewer-arrow shop-viewer-next" data-shop="viewer-step" data-step="1" aria-label="Fotoja tjetër">${creatorIcon('chevron-right')}</button>`:''}</div>
   <footer class="shop-viewer-footer"><div class="shop-viewer-dots">${files.map((_,i)=>`<button type="button" data-shop="viewer-dot" data-index="${i}" aria-label="Foto ${i+1}" aria-pressed="${viewer.index===i}"></button>`).join('')}</div><div class="shop-viewer-buy"><strong>${product.priceCents===0?'Falas':euro(product.priceCents)}</strong>${offerButton(product)}</div></footer>
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
  const track=root.querySelector('[data-view-track]');if(track)activateImages(track,viewer.index);
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
  // Retain decoded image nodes across cart/status changes; do not restart
  // image requests or show a blank frame every time the UI updates.
  const retained=new Map();
  for(const image of root.querySelectorAll('img[data-photo]')){
   const key=`${image.dataset.photo}:${image.dataset.size||'thumb'}:${image.getAttribute('src')||image.dataset.deferredSrc||''}`;
   if(!retained.has(key))retained.set(key,[]);retained.get(key).push(image);
  }
  root.innerHTML=`<div class="shop-shell">${renderCreatorCatalog(page,{ids,positions,offerButton,photo:img})}<div id="shop-image-errors">${imageStatus()}</div>${creatorHowTo(page)}
   <section class="shop-purchases" id="shop-purchases" ${orders.size?'':'hidden'}><h2>Blerjet tuaja</h2>${[...orders.values()].map(order=>`<article class="shop-order"><div class="shop-order-title"><b>Porosia #${esc(order.id.slice(0,8).toUpperCase())}</b><strong>${euro(order.totalCents)}</strong></div><p class="shop-order-state">${order.approved?(order.totalCents===0?'✓ Pako falas · Shkarkimet janë gati':'✓ Pagesa u konfirmua · Shkarkimet janë gati'):(order.totalCents===0?'Në pritje të miratimit':'Në pritje të pagesës / miratimit')}</p>${order.lines.map(line=>`<div class="shop-purchased-item">${img(line.imageIds[0],line.title)}<div><h3>${esc(line.title)}</h3><p>${line.imageIds.length} foto · ${euro(line.priceCents)}</p><button data-shop="save-photos" data-order="${order.id}" data-product="${line.id}" ${!order.approved||downloadBusy?'disabled':''}>${creatorIcon(order.approved?'save':'shield-check')}${order.approved?'Ruaj fotot':'Në pritje të konfirmimit'}</button></div></div>`).join('')}<div class="shop-order-actions"><button data-shop="refresh" data-order="${order.id}">Kontrollo statusin</button>${still?'':`<button data-shop="receipt-link" data-order="${order.id}">Kopjo linkun e porosisë</button>`}</div></article>`).join('')||'<p>Pas porosisë, artikujt tuaj do të shfaqen këtu.</p>'}</section>
   <footer class="shop-footer">MNYRA · Krijuar për biznesin tuaj</footer>
   ${notice?`<p class="shop-notice" role="status">${esc(notice)}</p>`:''}
   ${error&&panel!=='checkout'?`<p class="shop-error" role="alert">${esc(error)}</p>`:''}
   ${panel?`<div class="shop-overlay"><section class="shop-drawer" role="dialog" aria-modal="true" aria-labelledby="shop-panel-title"><div class="shop-drawer-head"><h2 id="shop-panel-title">${panel==='checkout'?'Përfundoni porosinë':'Shporta juaj'}</h2><button data-shop="close" aria-label="Mbyll" ${submitting?'disabled':''}>${creatorIcon('x')}</button></div>
    ${cart.lines.map(line=>`<div class="shop-cart-line">${img(line.imageIds[0],line.title)}<div><h3>${esc(line.title)}</h3><p>${line.imageIds.length} foto</p><strong>${euro(line.priceCents)}</strong></div><button data-shop="remove" data-product="${line.id}" aria-label="Hiq pakon" ${submitting?'disabled':''}>${creatorIcon('x')}</button></div>`).join('')||'<p>Shporta juaj është bosh.</p>'}
    <div class="shop-total"><span>Totali</span><strong>${euro(cart.totalCents)}</strong></div>
    ${panel==='cart'?`<p class="shop-fine">${cart.totalCents===0?'Falas · Shkarkim pas miratimit':'Pagesa te postieri · Shkarkim pas miratimit'}</p><button class="shop-buy" data-shop="checkout" ${!cart.lines.length?'disabled':''}>Vazhdo te porosia →</button>`:`<form id="shop-checkout"><label>Emri dhe mbiemri<input id="shop-name" name="name" value="${esc(customer.name)}" autocomplete="name" required minlength="3" maxlength="120"></label><label>Adresa e plotë<textarea id="shop-address" name="address" autocomplete="street-address" required minlength="5" maxlength="300">${esc(customer.address)}</textarea></label><label>Shteti<select id="shop-country" name="country">${['Kosovë','Shqipëri','Austri','Gjermani','Zvicër','Maqedoni e Veriut','Mal i Zi','Itali','Francë','Serbi','Slloveni','Kroaci'].map(country=>`<option ${customer.country===country?'selected':''}>${country}</option>`).join('')}</select></label><label>Numri i telefonit<input id="shop-phone" type="tel" name="phone" value="${esc(customer.phone)}" autocomplete="tel" required minlength="6" maxlength="40"></label><div class="shop-payment">${cart.totalCents===0?'<strong>Falas · 0 €</strong><p>Nuk kërkohet pagesë. Shkarkimet hapen pas miratimit nga MNYRA.</p>':'<strong>Pagesa te postieri</strong><p>Pagesë në dorë (Cash on Delivery). Shkarkimet hapen pasi MNYRA të konfirmojë pagesën.</p>'}</div>${error?`<p role="alert" class="shop-inline-error">${esc(error)}</p>`:''}<button class="shop-buy" type="submit" ${submitting?'disabled':''}>${submitting?'Duke dërguar…':`Porosit · ${euro(cart.totalCents)}`}</button></form>`}
   </section></div>`:''}${viewerMarkup()}${photoSaveMarkup()}</div>`;
  for(const image of root.querySelectorAll('img[data-photo]')){
   const key=`${image.dataset.photo}:${image.dataset.size||'thumb'}:${image.getAttribute('src')||image.dataset.deferredSrc||''}`;
   const previous=retained.get(key)?.shift();if(previous)image.replaceWith(previous);
  }
  syncBrowserChrome();watchImages();
  for(const track of root.querySelectorAll('[data-track]')){
   track.scrollLeft=(positions[track.dataset.track]||0)*track.clientWidth;
   track.addEventListener('scroll',()=>{const index=Math.round(track.scrollLeft/(track.clientWidth||1));positions[track.dataset.track]=index;activateImages(track,index);for(const dot of track.parentElement.querySelectorAll('[data-index]'))dot.setAttribute('aria-pressed',String(Number(dot.dataset.index)===index));},{passive:true});
  }
  neighbourObserver?.disconnect();
  if(typeof globalThis.IntersectionObserver==='function'){
   neighbourObserver=new globalThis.IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){const track=entry.target,current=track.children[positions[track.dataset.track]||0]?.querySelector('img');if(current?.complete&&current.naturalWidth>0)warmNextImage(current);}
   },{rootMargin:'100px 0px'});
   for(const track of root.querySelectorAll('[data-track]'))neighbourObserver.observe(track);
  }
  const viewerTrack=root.querySelector('[data-view-track]');
  if(viewerTrack&&viewer){
   viewerTrack.scrollLeft=viewer.index*(viewerTrack.clientWidth||1);
   viewerTrack.addEventListener('scroll',()=>updateViewer(Math.round(viewerTrack.scrollLeft/(viewerTrack.clientWidth||1))),{passive:true});
  }
  for(const child of root.querySelector('.shop-shell').children){
   const overlay=photoSave?'shop-save-overlay':viewer?'shop-viewer':panel?'shop-overlay':'';if(overlay&&!child.classList.contains(overlay))child.setAttribute('inert','');
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
   if(action==='retry-images'){void loadImages(Object.keys(imageErrors));return;}
   if(action==='save-close'){downloadCancelled=true;fileAbort?.abort();discardSave();render();return;}
   if(action==='save-ready'){
    if(!photoSave)return;
    if(typeof navigator!=='undefined'&&navigator.share&&navigator.canShare?.({files:photoSave.files})){try{await navigator.share({files:photoSave.files});}catch(error){if(error.name!=='AbortError'){photoSave.message='Prekni fotot veçmas më poshtë për t’i ruajtur.';render();}}}
    else{photoSave.message='Hapni fotot veçmas më poshtë dhe zgjidhni ruajtjen e imazhit.';render();}
    return;
   }
   if(action==='free-save'||action==='save-photos'){const ready=prepared.get(`${button.dataset.order||''}:${product}`)?.shareFiles;if(ready?.length&&navigator.share&&navigator.canShare?.({files:ready})){try{await navigator.share({files:ready});}catch(error){if(error.name!=='AbortError')throw error;}return;}if(viewer)closeViewer();await download(button.dataset.order||'',product,'photos');return;}
   if(action==='view'){openViewer(product,button.dataset.index);return;}
   if(action==='viewer-close'){closeViewer();return;}
   if(action==='viewer-step'){moveViewer((viewer?.index||0)+Number(button.dataset.step));return;}
   if(action==='viewer-dot'){moveViewer(Number(button.dataset.index));return;}
   if(action==='slide'||action==='dot'){
    const track=root.querySelector(`[data-track="${product}"]`),max=track.children.length-1;
    const target=action==='dot'?Number(button.dataset.index):Math.min(max,Math.max(0,(positions[product]||0)+Number(button.dataset.step)));
    positions[product]=target;activateImages(track,target);track.scrollTo({left:target*track.clientWidth,behavior:'smooth'});return;
   }
   error='';
   if(action==='add'){if(page.products.find(p=>p.id===product)?.priceCents===0){await download('',product,'photos');return;}if(!ids.includes(product)){ids.push(product);flash('Pakoja u shtua në shportë.');render();saveCart();}}
   if(action==='cart'){panel='cart';render();}
   if(action==='close'&&!submitting){panel='';render();}
   if(action==='checkout'){panel='checkout';render();root.querySelector('#shop-name')?.focus();}
   if(action==='remove'&&!submitting){ids=ids.filter(id=>id!==product);render();saveCart();}
   if(action==='refresh')await refreshOrder(button.dataset.order);
   if(action==='receipt-link'){await navigator.clipboard.writeText(`${location.origin}/content-creator/${page.id}?order=${button.dataset.order}`);notice='Linku i porosisë u kopjua. Ruajeni për shkarkimet tuaja.';render();}
  }catch(e){error=e.message;render();}
 });
 root.addEventListener('keydown',event=>{
  if(photoSave){
   if(event.key==='Escape'){event.preventDefault();downloadCancelled=true;fileAbort?.abort();discardSave();render();return;}
   if(event.key==='Tab'){const fields=[...root.querySelectorAll('.shop-save-overlay button,.shop-save-overlay a')];if(event.shiftKey&&event.target===fields[0]){event.preventDefault();fields.at(-1)?.focus();}else if(!event.shiftKey&&event.target===fields.at(-1)){event.preventDefault();fields[0]?.focus();}}
   return;
  }
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
   ids=[];cartId=crypto.randomUUID().replaceAll('-','');orderId='';remember();panel='';notice='Faleminderit! Porosia u pranua. Fotot hapen pas konfirmimit.';
   render();root.querySelector('#shop-purchases')?.scrollIntoView({behavior:'smooth'});
  }catch(e){error=e.message;}finally{submitting=false;render();}
 });
 async function download(receipt,product){
  const order=orders.get(receipt),line=receipt?order?.lines.find(p=>p.id===product):page.products.find(p=>p.id===product&&p.active!==false&&p.priceCents===0);
  if(!line||(receipt&&!order?.approved)||downloadBusy)return;
  const operation=receipt?'download':'free-download',access=receipt?{orderId:receipt}:{productId:product};
  const cacheKey=`${receipt}:${product}`,keys=receipt?line.imageIds:packFiles(product);
  discardSave();downloadBusy=product;downloadCancelled=false;fileAbort=new AbortController();
  photoSave={receipt,product,files:[],urls:[],loading:true,total:keys.length};render();
  let timer;const controller=fileAbort;
  try{
   let entry=prepared.get(cacheKey);
   if(!entry){
    for(const old of prepared.values())for(const url of old.urls||[])URL.revokeObjectURL(url);prepared.clear();
    const files=new Array(keys.length);let cursor=0,bytesTotal=0;
    timer=setTimeout(()=>controller.abort(),120000);
    async function worker(){
     while(cursor<keys.length&&!downloadCancelled){
      const index=cursor++,file=keys[index];
      const response=await fetch(`/api/content-creator-shop?${new URLSearchParams({op:operation,pageId:page.id,...access,file,format:'file'})}`,{method:'GET',signal:controller.signal});
      if(!response.ok){const result=await response.json();throw Error(result.error||'Ruajtja u ndërpre. Provoni përsëri.');}
      const bytes=new Uint8Array(await response.arrayBuffer());if(downloadCancelled||controller.signal.aborted)return;
      bytesTotal+=bytes.length;if(bytesTotal>150*1024*1024)throw Error('Ruajini fotot veçmas në këtë pajisje.');
      const expected=Number(response.headers.get('Content-Length'));if(expected>0&&expected!==bytes.length)throw Error('Fotoja nuk u ngarkua e plotë. Provoni përsëri.');
      const mime=response.headers.get('Content-Type')||'image/jpeg';
      const name=decodeURIComponent(response.headers.get('X-File-Name')||`${file}.jpg`);
      const ready=new File([bytes],`${index+1}-${name}`,{type:mime});files[index]=ready;
      if(photoSave){photoSave.files.push(ready);photoSave.urls.push(URL.createObjectURL(ready));render();}
     }
    }
    await Promise.all([worker(),worker()]);if(downloadCancelled)return;
    entry={shareFiles:files,urls:files.map(file=>{const index=photoSave?.files.indexOf(file);return index>=0?photoSave.urls[index]:URL.createObjectURL(file);})};
    prepared.set(cacheKey,entry);
   }
   photoSave={receipt,product,files:entry.shareFiles,urls:entry.urls,total:keys.length};
  }catch(error){
   controller.abort();
   if(!downloadCancelled&&photoSave){photoSave.loading=false;photoSave.message='Fotot nuk u përgatitën të gjitha. Mbylleni dhe provoni përsëri.';}
  }finally{if(timer)clearTimeout(timer);downloadBusy='';fileAbort=null;render();}
 }
 // Reuse server-embedded first covers; they already arrived with the HTML.
 for(const image of root.querySelectorAll('img[data-photo][src]'))if(image.dataset.size==='thumb'&&image.src?.startsWith('data:image/'))images[image.dataset.photo]=image.getAttribute('src');
 for(const key of page.photoIds)images[key] ||= imageUrl(key);
 render();remember();
 await Promise.all(tokens.map(id=>refreshOrder(id).catch(()=>{})));
 const poll=globalThis.setInterval(()=>{if(still||document.visibilityState==='hidden')return;for(const order of orders.values())if(!order.approved)refreshOrder(order.id).catch(()=>{});},20000);
 globalThis.addEventListener?.('pagehide',event=>{if(!event.persisted){neighbourObserver?.disconnect();globalThis.clearInterval(poll);fileAbort?.abort();discardSave();for(const entry of prepared.values())for(const url of entry.urls||[])URL.revokeObjectURL(url);}});
}

