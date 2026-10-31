import {creatorVisitorId} from './visits.js';
import {ccEscape as esc,ccImage} from '../../shared/content-creator.js';
import {euro,shopQuote,validShopId} from '../../shared/content-creator-shop.js';
import {creatorIcon,creatorImageUrl,creatorOfferButton,creatorPhoto,renderCreatorCatalog,creatorHowTo,creatorFooter} from '../../shared/content-creator-view.js';
export async function mountCreatorShop({root,page,still=false,track=async()=>{}}){
 const visitorId=still?'':creatorVisitorId(page.id);
 const activity=(event,data={})=>{if(!still)void track(event,{stage:panel==='checkout'?'checkout':panel==='cart'?'cart':'page',cartId,...data}).catch(()=>{});};
 const storageKey=`mnyra:cc:shop:${page.id}${still?':still':''}`;
 let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch{saved={};}
 let ids=Array.isArray(saved.ids)?saved.ids.filter(id=>(page.products||[]).some(p=>p.id===id&&p.priceCents!==0)):[];
 let cartId=validShopId(saved.cartId)?saved.cartId:crypto.randomUUID().replaceAll('-','');
 let orderId=validShopId(saved.pendingOrderId)?saved.pendingOrderId:'',panel='',error='',notice='',submitting=false,downloadBusy='';
 let viewer=null,backgroundLock=null,sheetLock=null,photoSave=null,downloadCancelled=false,fileAbort=null;
 function canDownload(order){return order?.downloadsAvailable===true||order?.approved===true;}
 const originalTheme=document.querySelector('meta[name="theme-color"]')?.getAttribute('content')||'#f7f6f2';
 const prepared=new Map(),imageErrors={},largeImages=new Map();
 function canPrefetch(){const connection=navigator.connection;return !connection?.saveData&&!['slow-2g','2g','3g'].includes(connection?.effectiveType);}
 let neighbourObserver=null,heroIndex=0,heroPaused=!!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const images={},positions={},orders=new Map(),customer={name:'',address:'',country:'Kosovë',phone:''};
 const tokens=still?[]:(Array.isArray(saved.orders)?saved.orders:[]).filter(validShopId).slice(-10);
 const fromLink=new URLSearchParams(location.search).get('order');if(!still&&validShopId(fromLink)&&!tokens.includes(fromLink))tokens.push(fromLink);
 let cartQueue=Promise.resolve();
 function remember(){try{localStorage.setItem(storageKey,JSON.stringify({ids,cartId,orders:tokens,pendingOrderId:orderId}));}catch{}}
 function flash(message){notice=message;setTimeout(()=>{notice='';render();},4500);}
 function quote(){if(!ids.length)return {lines:[],totalCents:0,currency:'EUR'};try{return shopQuote(page,ids);}catch{return {lines:[],totalCents:0,currency:'EUR'};}}
 async function api(op,data={},get=false,keepalive=false){
  const payload={op,pageId:page.id,cartId,visitorId,...data};
  if(still&&op!=='free-download')throw Error('Still-Modus: keine echten Bestellungen.');
  const r=await fetch(`/api/content-creator-shop${get?'?'+new URLSearchParams(payload):''}`,{method:get?'GET':'POST',keepalive,...(!get?{headers:{'content-type':'application/json'},body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(20000)});
  const result=await r.json();if(!r.ok||result.error)throw Object.assign(Error(result.error||'Ju lutemi, provoni përsëri.'),{status:r.status});return result;
 }
 function applyQuote(result){for(const line of result.lines||[]){const product=page.products.find(p=>p.id===line.id);if(product){product.priceCents=line.priceCents;product.title=line.title;}}}
 let checkoutTimer;
 function saveCheckout(keepalive=false){
  if(still||panel!=='checkout')return;
  const snapshot={cartId,customer:{...customer}};
  void cartQueue.catch(()=>{}).then(()=>api('checkout',snapshot,false,keepalive)).catch(()=>{});
 }
 for(const name of ['input','change'])root.addEventListener(name,event=>{if(!event.target.closest('#shop-checkout'))return;clearTimeout(checkoutTimer);checkoutTimer=setTimeout(saveCheckout,700);});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveCheckout(true);});
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
  for(const node of root.querySelectorAll(`[data-photo="${key}"]`))node.outerHTML=img(key,node.getAttribute('data-alt')||page.name,{size:node.dataset.size||'thumb',hero:node.hasAttribute('data-hero-image'),active:true,eager:true});
  const status=root.querySelector('#shop-image-errors');if(status)status.innerHTML=imageStatus();
  watchImages();
 }
 function warmLargeImage(id){
  if(!canPrefetch()||!globalThis.Image||largeImages.has(id))return;
  const image=new globalThis.Image();largeImages.set(id,image);
  image.fetchPriority='low';image.decoding='async';image.src=imageUrl(id,'medium');
  image.decode?.().catch(()=>{largeImages.delete(id);});
 }
 function warmNextImage(node){
  const track=node.closest('[data-track]');if(!track)return;
  const rect=track.getBoundingClientRect?.(),height=globalThis.innerHeight||document.documentElement.clientHeight;
  if(rect&&height>0&&(rect.bottom<=0||rect.top>height+100))return;
  const index=positions[track.dataset.track]||0,slide=track.children[index];
  if(!slide?.contains(node)){if(track.children[index+1]?.contains(node))warmLargeImage(node.dataset.photo);return;}
  // The current photo has arrived: fetch and decode the adjacent photograph
  // now, at low priority, rather than waiting for the swipe to begin.
  const next=track.children[index+1]?.querySelector('img[data-deferred-src]');
  if(next&&canPrefetch()){next.loading='eager';next.fetchPriority='low';next.src=next.dataset.deferredSrc;next.removeAttribute('data-deferred-src');next.decode?.().catch(()=>{});}
  warmLargeImage(node.dataset.photo);
 }
 function watchImages(){
  for(const node of root.querySelectorAll('img[data-photo]')){
   node.onerror=()=>{if(node.dataset.size==='medium'&&!node.hasAttribute('data-hero-image')){node.style.opacity='0';return;}imageErrors[node.dataset.photo]=true;paintImage(node.dataset.photo);};
   node.onload=()=>{if(node.dataset.size==='medium'&&!node.hasAttribute('data-hero-image'))node.style.opacity='1';warmNextImage(node);};
   if(node.dataset.size==='medium'&&!node.hasAttribute('data-hero-image')&&!(node.complete&&node.naturalWidth>0))node.style.opacity='0';
   if(node.complete&&node.naturalWidth>0)warmNextImage(node);
  }
 }
 function imageUrl(key,size='thumb'){return creatorImageUrl(page,key,size);}
 function loadImages(keys){for(const key of keys){delete imageErrors[key];images[key]=`${imageUrl(key)}${imageUrl(key).includes('?')?'&':'?'}retry=${Date.now()}`;paintImage(key);}}
 function activateImages(track,index){
  for(const [i,slide] of [...track.children].entries())if(Math.abs(i-index)<=(track.hasAttribute('data-hero-track')?0:canPrefetch()?1:0))for(const img of slide.querySelectorAll('img[data-deferred-src]')){img.loading='eager';img.fetchPriority=i===index?'high':'low';if(img.dataset.deferredSrcset){img.srcset=img.dataset.deferredSrcset;img.removeAttribute('data-deferred-srcset');}img.src=img.dataset.size==='thumb'&&images[img.dataset.photo]?.startsWith('data:image/')?images[img.dataset.photo]:img.dataset.deferredSrc;img.removeAttribute('data-deferred-src');img.decode?.().catch(()=>{});}
 }
 function updateHeroControls(){
  for(const dot of root.querySelectorAll('.shop-hero-dots [data-index]'))dot.setAttribute('aria-pressed',String(Number(dot.dataset.index)===heroIndex));
  const toggle=root.querySelector('[data-shop="hero-toggle"]');if(toggle){toggle.setAttribute('aria-label',heroPaused?'Fillo nderrimin automatik':'Ndalo nderrimin automatik');toggle.innerHTML=creatorIcon(heroPaused?'play':'pause');}
 }
 function moveHero(index){
  const track=root.querySelector('[data-hero-track]');if(!track)return;
  heroIndex=(index+track.children.length)%track.children.length;activateImages(track,heroIndex);updateHeroControls();
  track.scrollTo({left:heroIndex*track.clientWidth,behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 }
 function bindHero(){
  const track=root.querySelector('[data-hero-track]');if(!track)return;
  activateImages(track,heroIndex);updateHeroControls();if(track.dataset.bound)return;track.dataset.bound='1';
  track.addEventListener('pointerdown',()=>{heroPaused=true;updateHeroControls();},{passive:true});
  track.addEventListener('scroll',()=>{heroIndex=Math.round(track.scrollLeft/(track.clientWidth||1));activateImages(track,heroIndex);updateHeroControls();},{passive:true});
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
  activity('photo',{productId:product,file:packFiles(product)[Number(index)||0]});
  const files=packFiles(product);if(!files.length)return;
  if(!viewer){
   const body=document.body,html=document.documentElement;
   backgroundLock={y:globalThis.scrollY||0,position:body.style.position,top:body.style.top,width:body.style.width,overflow:body.style.overflow,htmlOverflow:html.style.overflow};
   body.style.position='fixed';body.style.top=`-${backgroundLock.y}px`;body.style.width='100%';body.style.overflow='hidden';html.style.overflow='hidden';
  }
  root.querySelector('.shop-viewer')?.remove();
  viewer={product,index:Math.max(0,Math.min(files.length-1,Number(index)||0))};
  root.querySelector('.shop-shell').insertAdjacentHTML('beforeend',viewerMarkup());
  syncBrowserChrome();watchImages();bindViewer();syncInert();
  root.querySelector('[data-shop="viewer-close"]')?.focus({preventScroll:true});
 }
 function closeViewer(){
  if(!viewer)return;const previous=viewer;viewer=null;
  if(backgroundLock){
   const state=backgroundLock,body=document.body;
   for(const key of ['position','top','width','overflow'])body.style[key]=state[key]||'';
   document.documentElement.style.overflow=state.htmlOverflow||'';backgroundLock=null;
   removeViewer();globalThis.scrollTo?.(0,state.y);
  }else removeViewer();
  root.querySelector(`[data-shop="view"][data-product="${previous.product}"][data-index="${positions[previous.product]||0}"]`)?.focus({preventScroll:true});
 }
 function syncInert(){
  for(const child of root.querySelector('.shop-shell').children){
   const overlay=photoSave?'shop-save-overlay':viewer?'shop-viewer':panel?'shop-overlay':'';
   if(overlay&&!child.classList.contains(overlay))child.setAttribute('inert','');else child.removeAttribute('inert');
  }
 }
 function bindViewer(){
  const track=root.querySelector('[data-view-track]');if(!track||!viewer)return;
  for(const node of track.querySelectorAll('img[data-size="medium"]')){
   const cached=largeImages.get(node.dataset.photo);if(!cached?.complete||!cached.naturalWidth)continue;
   for(const attr of node.attributes)if(attr.name!=='src'&&attr.name!=='style')cached.setAttribute(attr.name,attr.value);
   cached.style.opacity='1';node.replaceWith(cached);
  }
  track.scrollLeft=viewer.index*(track.clientWidth||1);
  track.addEventListener('scroll',()=>updateViewer(Math.round(track.scrollLeft/(track.clientWidth||1))),{passive:true});
 }
 function removeViewer(){
  root.querySelector('.shop-viewer')?.remove();syncBrowserChrome();syncInert();
  for(const track of root.querySelectorAll('[data-track]')){
   const index=positions[track.dataset.track]||0;activateImages(track,index);track.scrollLeft=index*(track.clientWidth||1);
   for(const dot of track.parentElement.querySelectorAll('[data-index]'))dot.setAttribute('aria-pressed',String(Number(dot.dataset.index)===index));
  }
 }
 function updateViewer(index){
  if(!viewer)return;
  const files=packFiles(viewer.product);if(index!==viewer.index)activity('photo',{productId:viewer.product,file:files[index]});viewer.index=Math.max(0,Math.min(files.length-1,index));positions[viewer.product]=viewer.index;
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
  const openFaq=[...root.querySelectorAll('details[data-faq][open]')].map(node=>node.dataset.faq);
  // Retain decoded image nodes across cart/status changes; do not restart
  // image requests or show a blank frame every time the UI updates.
  const answerContent=root.querySelector('.answer-message')?.closest('.answer-content');
  const heroGallery=root.querySelector('.shop-hero-gallery');
  const carousels=new Map([...root.querySelectorAll('[data-track]')].map(track=>[track.dataset.track,track.parentElement]));
  const retained=new Map();
  for(const image of root.querySelectorAll('img[data-photo]')){
   if(image.closest('[data-track],[data-hero-track]'))continue;
   const key=`${image.dataset.photo}:${image.dataset.size||'thumb'}:${image.getAttribute('src')||image.dataset.deferredSrc||''}`;
   if(!retained.has(key))retained.set(key,[]);retained.get(key).push(image);
  }
  root.innerHTML=`<div class="shop-shell">${renderCreatorCatalog(page,{ids,positions,offerButton,photo:img})}<div id="shop-image-errors">${imageStatus()}</div>${creatorHowTo(page)}
   <section class="shop-purchases" id="shop-purchases"><h2>Blerjet tuaja</h2>${[...orders.values()].map(order=>`<article class="shop-order"><div class="shop-order-title"><b>Porosia #${esc(order.id.slice(0,8).toUpperCase())}</b><strong>${euro(order.totalCents)}</strong></div><p class="shop-order-state">${order.approved?(order.totalCents===0?'✓ Pako falas · Shkarkimet janë gati':'✓ Pagesa u konfirmua · Shkarkimet janë gati'):(canDownload(order)?`✓ Fotot janë gati · Pagesa më ${order.paymentDueDate?esc(order.paymentDueDate.split('-').reverse().join('.')):'1 të muajit të ardhshëm'}`:(order.totalCents===0?'Në pritje të miratimit':'Në pritje të pagesës / miratimit'))}</p>${order.lines.map(line=>`<div class="shop-purchased-item">${img(line.imageIds[0],line.title)}<div><h3>${esc(line.title)}</h3><p>${line.imageIds.length} foto · ${euro(line.priceCents)}</p><button data-shop="save-photos" data-order="${order.id}" data-product="${line.id}" ${!canDownload(order)||downloadBusy?'disabled':''}>${creatorIcon(canDownload(order)?'save':'shield-check')}${canDownload(order)?'Ruaj fotot':'Në pritje të konfirmimit'}</button></div></div>`).join('')}<div class="shop-order-actions"><button data-shop="refresh" data-order="${order.id}">Kontrollo statusin</button>${still?'':`<button data-shop="receipt-link" data-order="${order.id}">Kopjo linkun e porosisë</button>`}</div></article>`).join('')||'<p>Pas porosisë, artikujt tuaj do të shfaqen këtu.</p>'}</section>
   ${creatorFooter(page)}
   ${notice?`<p class="shop-notice" role="status">${esc(notice)}</p>`:''}
   ${error&&panel!=='checkout'?`<p class="shop-error" role="alert">${esc(error)}</p>`:''}
   ${panel?`<div class="shop-overlay"><section class="shop-drawer" role="dialog" aria-modal="true" aria-labelledby="shop-panel-title"><div class="shop-drawer-head"><h2 id="shop-panel-title">${panel==='checkout'?'Përfundoni porosinë':'Shporta juaj'}</h2><button data-shop="close" aria-label="Mbyll" ${submitting?'disabled':''}>${creatorIcon('x')}</button></div>
    ${cart.lines.map(line=>`<div class="shop-cart-line">${img(line.imageIds[0],line.title)}<div><h3>${esc(line.title)}</h3><p>${line.imageIds.length} foto</p><strong>${euro(line.priceCents)}</strong></div><button data-shop="remove" data-product="${line.id}" aria-label="Hiq pakon" ${submitting?'disabled':''}>${creatorIcon('x')}</button></div>`).join('')||'<p>Shporta juaj është bosh.</p>'}
    <div class="shop-total"><span>Totali</span><strong>${euro(cart.totalCents)}</strong></div>
    ${panel==='cart'?`<p class="shop-fine">${cart.totalCents===0?'Falas · Shkarkim pas miratimit':'Fotot sot · Pagesa më 1 të muajit të ardhshëm'}</p><button class="shop-buy" data-shop="checkout" ${!cart.lines.length?'disabled':''}>Vazhdo te porosia →</button>`:`<form id="shop-checkout"><label>Emri dhe mbiemri<input id="shop-name" name="name" value="${esc(customer.name)}" autocomplete="name" required minlength="3" maxlength="120"></label><label>Adresa e plotë<textarea id="shop-address" name="address" autocomplete="street-address" required minlength="5" maxlength="300">${esc(customer.address)}</textarea></label><label>Shteti<select id="shop-country" name="country">${['Kosovë','Shqipëri','Austri','Gjermani','Zvicër','Maqedoni e Veriut','Mal i Zi','Itali','Francë','Serbi','Slloveni','Kroaci'].map(country=>`<option ${customer.country===country?'selected':''}>${country}</option>`).join('')}</select></label><label>Numri i telefonit<input id="shop-phone" type="tel" name="phone" value="${esc(customer.phone)}" autocomplete="tel" required minlength="6" maxlength="40"></label><div class="shop-payment">${cart.totalCents===0?'<strong>Falas · 0 €</strong><p>Nuk kërkohet pagesë. Shkarkimet hapen pas miratimit nga MNYRA.</p>':'<strong>Merrni sot, paguani më 1 të muajit të ardhshëm</strong><p>Fotot mund t’i ruani menjëherë pas porosisë. Për pagesën vijmë te lokali juaj në fillim të muajit të ardhshëm.</p>'}</div>${error?`<p role="alert" class="shop-inline-error">${esc(error)}</p>`:''}<button class="shop-buy" type="submit" ${submitting?'disabled':''}>${submitting?'Duke dërguar…':`Porosit · ${euro(cart.totalCents)}`}</button></form>`}
   </section></div>`:''}${viewerMarkup()}${photoSaveMarkup()}</div>`;
  for(const image of root.querySelectorAll('img[data-photo]')){
   if(image.closest('[data-track],[data-hero-track]'))continue;
   const key=`${image.dataset.photo}:${image.dataset.size||'thumb'}:${image.getAttribute('src')||image.dataset.deferredSrc||''}`;
   const previous=retained.get(key)?.shift();if(previous)image.replaceWith(previous);
  }
  for(const track of root.querySelectorAll('[data-track]')){const old=carousels.get(track.dataset.track);if(old)track.parentElement.replaceWith(old);}
  if(answerContent)root.querySelector('.answer-content')?.replaceWith(answerContent);
  if(heroGallery)root.querySelector('.shop-hero-gallery')?.replaceWith(heroGallery);
  for(const key of openFaq)root.querySelector(`details[data-faq="${key}"]`)?.setAttribute('open','');
  bindHero();syncBrowserChrome();watchImages();
  for(const track of root.querySelectorAll('[data-track]')){
   track.scrollLeft=(positions[track.dataset.track]||0)*track.clientWidth;
   if(track.dataset.bound)continue;track.dataset.bound='1';
   track.addEventListener('scroll',()=>{const index=Math.round(track.scrollLeft/(track.clientWidth||1));if(index!==positions[track.dataset.track])activity('photo',{productId:track.dataset.track,file:packFiles(track.dataset.track)[index]});positions[track.dataset.track]=index;activateImages(track,index);for(const dot of track.parentElement.querySelectorAll('[data-index]'))dot.setAttribute('aria-pressed',String(Number(dot.dataset.index)===index));},{passive:true});
  }
  neighbourObserver?.disconnect();
  if(typeof globalThis.IntersectionObserver==='function'){
   neighbourObserver=new globalThis.IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){const track=entry.target,current=track.children[positions[track.dataset.track]||0]?.querySelector('img');if(current?.complete&&current.naturalWidth>0)warmNextImage(current);}
   },{rootMargin:'100px 0px'});
   for(const track of root.querySelectorAll('[data-track]'))neighbourObserver.observe(track);
  }
  bindViewer();syncInert();watchSaveButtons();
  if(focusId){const field=root.querySelector(`#${focusId}`);if(field){field.focus({preventScroll:true});try{field.setSelectionRange(selection,selection);}catch{ /* select/tel */ }}}
 }
 async function refreshOrder(id){if(still)return;const order=await api('receipt',{orderId:id},true);if(order.pageId!==page.id)return;orders.set(id,order);render();}
 root.addEventListener('input',event=>{if(event.target.closest('#shop-checkout')&&event.target.name)customer[event.target.name]=event.target.value;});
 root.addEventListener('change',event=>{if(event.target.closest('#shop-checkout')&&event.target.name)customer[event.target.name]=event.target.value;});
 root.addEventListener('click',async event=>{
  const button=event.target.closest('[data-shop]');if(!button||button.disabled)return;
  const action=button.dataset.shop,product=button.dataset.product;
  try{
   if(action==='hero-dot'){heroPaused=true;moveHero(Number(button.dataset.index));return;}
   if(action==='hero-toggle'){heroPaused=!heroPaused;updateHeroControls();return;}
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
    activity('photo',{productId:product,file:packFiles(product)[target]});positions[product]=target;activateImages(track,target);track.scrollTo({left:target*track.clientWidth,behavior:'smooth'});return;
   }
   error='';
   if(action==='add'){activity('add',{productId:product});if(page.products.find(p=>p.id===product)?.priceCents===0){await download('',product,'photos');return;}if(!ids.includes(product)){ids.push(product);flash('Pakoja u shtua në shportë.');render();saveCart();}}
   if(action==='cart'){panel='cart';activity('cart');render();}
   if(action==='close'&&!submitting){panel='';activity('close');render();}
   if(action==='checkout'){panel='checkout';activity('checkout');saveCheckout();render();root.querySelector('#shop-name')?.focus();}
   if(action==='remove'&&!submitting){activity('remove',{productId:product});ids=ids.filter(id=>id!==product);render();saveCart();}
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
   orderId ||= crypto.randomUUID().replaceAll('-','');remember();
   let result=await (async()=>{try{return still?{id:orderId,pageId:page.id,...quote(),status:'pending',approved:false,downloadsAvailable:true,paymentMethod:'cod'}:await api('order',{orderId,ids:[...ids],expectedTotalCents:quote().totalCents,customer});}catch(error){
    const receipt=await api('receipt',{orderId},true).catch(()=>null);
    if(receipt?.pageId===page.id)return receipt;throw error;
   }})();
   if(result.priceChanged){applyQuote(result);throw Error('Çmimi u përditësua. Kontrolloni totalin dhe konfirmoni përsëri.');}
   orders.set(result.id,result);if(!still&&!tokens.includes(result.id))tokens.push(result.id);
   if(result.notified===false)api('notify',{kind:'order',orderId:result.id}).catch(()=>{});
   activity('order',{stage:'ordered'});
   ids=[];cartId=crypto.randomUUID().replaceAll('-','');orderId='';remember();panel='';notice='Faleminderit! Porosia u pranua. Artikujt tuaj janë më poshtë.';
   render();root.querySelector('#shop-purchases')?.scrollIntoView({behavior:'smooth'});
  }catch(e){error=e.message;}finally{submitting=false;render();}
 });
 let activePreparation=null;
 function prepareFiles(receipt,product,progress=()=>{}){
  const key=`${receipt}:${product}`,cached=prepared.get(key);
  if(cached)return {promise:Promise.resolve(cached),controller:null};
  if(activePreparation){
   if(activePreparation.key!==key)return null;
   activePreparation.listeners.add(progress);progress(activePreparation);return activePreparation;
  }
  const order=orders.get(receipt),line=receipt?order?.lines.find(p=>p.id===product):page.products.find(p=>p.id===product&&p.active!==false&&p.priceCents===0);
  if(!line||(receipt&&!canDownload(order)))return null;
  const keys=receipt?line.imageIds:packFiles(product),controller=new AbortController();
  const task={key,controller,listeners:new Set([progress]),files:new Array(keys.length),urls:new Array(keys.length)};
  activePreparation=task;
  const operation=receipt?'download':'free-download',access=receipt?{orderId:receipt}:{productId:product};
  const timer=setTimeout(()=>controller.abort(),120000);
  task.promise=(async()=>{
   let cursor=0,bytesTotal=0;
   async function worker(){
    while(cursor<keys.length){
     const index=cursor++,file=keys[index];
     const direct=!receipt&&line.priceCents===0?ccImage(page.media?.[file]?.download):'';
     const target=direct||`/api/content-creator-shop?${new URLSearchParams({op:operation,pageId:page.id,...access,file,format:'file'})}`;
     const response=await fetch(target,{method:'GET',signal:controller.signal});
     if(!response.ok){const result=await response.json();throw Error(result.error||'Ruajtja u ndërpre. Provoni përsëri.');}
     const bytes=new Uint8Array(await response.arrayBuffer());if(controller.signal.aborted)throw Error('Ruajtja u ndërpre.');
     bytesTotal+=bytes.length;if(bytesTotal>150*1024*1024)throw Error('Ruajini fotot veçmas në këtë pajisje.');
     const expected=Number(response.headers.get('Content-Length'));if(expected>0&&expected!==bytes.length)throw Error('Fotoja nuk u ngarkua e plotë. Provoni përsëri.');
     const mime=response.headers.get('Content-Type')||'image/jpeg',name=decodeURIComponent(response.headers.get('X-File-Name')||`${file}.jpg`);
     task.files[index]=new File([bytes],`${index+1}-${name}`,{type:mime});task.urls[index]=URL.createObjectURL(task.files[index]);
     for(const listener of task.listeners)listener(task);
    }
   }
   try{
    await Promise.all([worker(),worker()]);
    const entry={shareFiles:task.files,urls:task.urls};
    for(const old of prepared.values())for(const url of old.urls||[])URL.revokeObjectURL(url);
    prepared.clear();prepared.set(key,entry);return entry;
   }catch(error){controller.abort();for(const url of task.urls)if(url)URL.revokeObjectURL(url);throw error;}
   finally{clearTimeout(timer);if(activePreparation===task)activePreparation=null;}
  })();
  return task;
 }
 function warmSave(button,intent=false){
  if(!button||photoSave||panel||downloadBusy||document.visibilityState==='hidden')return;
  const receipt=button.dataset.order||'',product=button.dataset.product;
  if(!product||button.disabled)return;
  if(!intent){
   if(still||!canPrefetch())return;
   const keys=receipt?orders.get(receipt)?.lines.find(line=>line.id===product)?.imageIds:packFiles(product);
   if(!keys?.length||keys.some(id=>!page.media?.[id]?.bytes))return;
   if(keys.reduce((sum,id)=>sum+page.media[id].bytes,0)>12*1024*1024)return;
  }
  const task=prepareFiles(receipt,product);task?.promise.catch(()=>{});
 }
 root.addEventListener('pointerdown',event=>warmSave(event.target.closest('[data-shop="free-save"],[data-shop="save-photos"]'),true),{passive:true});
 root.addEventListener('focusin',event=>warmSave(event.target.closest('[data-shop="free-save"],[data-shop="save-photos"]'),true));
 let saveObserver=null;
 function watchSaveButtons(){
  if(!globalThis.IntersectionObserver)return;
  saveObserver?.disconnect();
  saveObserver=new globalThis.IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)warmSave(entry.target);},{rootMargin:'0px',threshold:.5});
  for(const button of root.querySelectorAll('[data-shop="free-save"],[data-shop="save-photos"]'))saveObserver.observe(button);
 }
 async function download(receipt,product){
  activity('download',{productId:product});
  if(downloadBusy)return;
  discardSave();downloadBusy=product;downloadCancelled=false;
  photoSave={receipt,product,files:[],urls:[],loading:true,total:receipt?orders.get(receipt)?.lines.find(line=>line.id===product)?.imageIds.length:packFiles(product).length};render();
  try{
   // A tap joins preparation already started by visibility, focus or touch.
   const task=prepareFiles(receipt,product,entry=>{
    if(!photoSave||downloadCancelled)return;
    photoSave.files=entry.files.filter(Boolean);photoSave.urls=entry.urls.filter(Boolean);render();
   });
   if(!task)throw Error('Provoni përsëri pas përgatitjes së pakos tjetër.');
   fileAbort=task.controller;
   const entry=await task.promise;if(downloadCancelled)return;
   photoSave={receipt,product,files:entry.shareFiles,urls:entry.urls,total:entry.shareFiles.length};
  }catch(error){
   if(!downloadCancelled&&photoSave){photoSave.loading=false;photoSave.message='Fotot nuk u përgatitën të gjitha. Mbylleni dhe provoni përsëri.';}
  }finally{downloadBusy='';fileAbort=null;render();}
 }
 // Reuse server-embedded first covers; they already arrived with the HTML.
 for(const image of root.querySelectorAll('img[data-photo][src]'))if(image.dataset.size==='thumb'&&image.src?.startsWith('data:image/'))images[image.dataset.photo]=image.getAttribute('src');
 for(const key of page.photoIds)images[key] ||= imageUrl(key);
 render();remember();
 // A reload after a lost response must recover the committed order as well.
 if(!still&&orderId){
  const receipt=await api('receipt',{orderId},true).catch(()=>null);
  if(receipt?.pageId===page.id){orders.set(receipt.id,receipt);if(!tokens.includes(receipt.id))tokens.push(receipt.id);ids=[];orderId='';cartId=crypto.randomUUID().replaceAll('-','');remember();render();}
 }
 await Promise.all(tokens.map(id=>refreshOrder(id).catch(()=>{})));
 const heroTimer=globalThis.setInterval(()=>{const track=root.querySelector('[data-hero-track]');if(canPrefetch()&&!heroPaused&&!viewer&&!panel&&!photoSave&&document.visibilityState!=='hidden'&&track?.children.length>1)moveHero(heroIndex+1);},5500);
 const poll=globalThis.setInterval(()=>{if(still||document.visibilityState==='hidden')return;for(const order of orders.values())if(!order.approved)refreshOrder(order.id).catch(()=>{});},20000);
 globalThis.addEventListener?.('pagehide',event=>{if(!event.persisted){neighbourObserver?.disconnect();saveObserver?.disconnect();activePreparation?.controller.abort();globalThis.clearInterval(poll);globalThis.clearInterval(heroTimer);fileAbort?.abort();discardSave();for(const entry of prepared.values())for(const url of entry.urls||[])URL.revokeObjectURL(url);}});
}

