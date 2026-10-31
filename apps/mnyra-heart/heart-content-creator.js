import {creatorBusinessMatches} from '../../shared/creator-analytics.js';
import {normalizeCreatorCrop,creatorHeroCropStyle,creatorHeroFormat} from '../../shared/creator-hero.js';
import {saveShopAsset,initialShopProduct,releaseShopOrder,refreshShopPreviews,savePromoAsset,migrateCreatorPage,saveCreatorCdnAsset,savedCreatorFile} from "./heart-content-creator-shop.js";
import {creatorCdnEnabled} from './heart-creator-cdn.js';
import {creatorPublicMedia} from '../../shared/creator-media.js';
import {CC_CARTS,CC_ORDERS,priceCents} from "../../shared/content-creator-shop.js";
import { auth, db } from "/shared/firebase-config.js";
import { createCreatorReset } from "./heart-creator-reset.js";
import { collection, doc, getDoc, onSnapshot, setDoc, updateDoc, writeBatch, serverTimestamp } from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import { CC_PAGES, CC_VISITS, contentLink } from "../../shared/content-creator.js";

export async function prepareContentImage(file, avatar = false) {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Bitte JPG-, PNG- oder WebP-Bilder wählen.");
  if (file.size > 30 * 1024 * 1024) throw new Error("Ein Bild darf höchstens 30 MB groß sein.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = url; await image.decode();
    const canvas = document.createElement("canvas");
    let edge = avatar ? 240 : 2200;
    for (let attempt = 0; attempt < 7; attempt++) {
      const scale = Math.min(1, edge / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext("2d"); ctx.fillStyle = "white"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(image,0,0,canvas.width,canvas.height);
      const data = canvas.toDataURL("image/jpeg", .88 - attempt * .045);
      if (data.length < (avatar ? 110000 : 700000)) return data;
      edge = Math.round(edge * .8);
    }
    throw new Error("Dieses Bild konnte nicht verarbeitet werden.");
  } finally { URL.revokeObjectURL(url); }
}

export function createContentCreator({root, store, prepareImage = prepareContentImage, saveAsset}) {
  const patch = fields => store.actions.patchContentCreator(fields);
  let resetController;
  function creatorReset() {
    return resetController ||= createCreatorReset({
      getState: () => store.getState().contentCreator,
      patch,
      async request(body) {
        if (!auth.currentUser) throw Error('Bitte erneut in Heart anmelden.');
        const response = await fetch('/api/content-creator-reset', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await auth.currentUser.getIdToken()}` },
          body: JSON.stringify(body), signal: AbortSignal.timeout(60000)
        });
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw Error(result.error || 'Reset fehlgeschlagen.');
        return result;
      },
      refresh: () => { stop(); load(); }
    });
  }
  let liveTimer=null;
  let subscriptions = [], pendingId = "", avatarFile = null, photoFiles = [], draftAvatar = "", draftName = "";
  let busy = false, stopped = true, createdMs = 0;
  let captions = {}, mediaBusy = false, imageEpoch = 0;
  let migrating=false;
  let migrationFinished=Promise.resolve(),finishMigration=()=>{};
  const migrationAttempts=new Set();
  async function migrateExisting(){
    if(stopped||migrating||!await creatorCdnEnabled())return;
    if(stopped||migrating||busy||mediaBusy)return;
    migrating=true;
    migrationFinished=new Promise(resolve=>{finishMigration=resolve;});
    try{
      for(const page of store.getState().contentCreator.pages){
        if(stopped)break;
        if(busy||mediaBusy)break;
        const signature=`${page.id}:${JSON.stringify([page.photoIds,page.products])}`;
        if(migrationAttempts.has(signature))continue;
        const migrationIds=(page.photoIds||[]).filter(id=>page.kind!=='shop'||(page.products||[]).some(product=>product.active!==false&&product.imageIds?.includes(id)));
        if(page.cdnMigrationVersion===1&&migrationIds.every(id=>creatorPublicMedia(page)[id]))continue;
        migrationAttempts.add(signature);
        patch({migrationProgress:`${page.name}: bestehende Fotos werden zu Cloudflare übernommen …`,migrationError:''});
        try{await migrateCreatorPage(page.id,(done,total)=>patch({migrationProgress:`${page.name}: ${done} / ${total} Fotos übernommen`}));}
        catch(error){patch({migrationError:`${page.name}: ${error.message} Die bisherigen Fotos bleiben verfügbar.`});break;}
      }
    }finally{migrating=false;finishMigration();patch({migrationProgress:''});}
  }
  function stop() { subscriptions.forEach(unsubscribe => unsubscribe()); subscriptions = []; stopped = true; clearInterval(liveTimer);liveTimer=null; }
  const activationAttempts=new Set();
  async function activateCompletedEmptyShops(pages){
    for(const page of pages){
      if(stopped)return;
      // Only completed legacy shops have products:[]; interrupted creation drafts do not.
      if(page.kind!=='shop'||page.published!==false||page.workflow!=='working'||!page.name?.trim()||!Array.isArray(page.products)||page.products.length||(page.photoIds||[]).length||activationAttempts.has(page.id))continue;
      activationAttempts.add(page.id);
      try{
        await updateDoc(doc(db,CC_PAGES,page.id),{published:true,updatedAt:serverTimestamp()});
        if(!stopped)patch({pages:store.getState().contentCreator.pages.map(item=>item.id===page.id?{...item,published:true}:item)});
      }catch(error){if(!stopped)patch({error:`Shop konnte nicht aktiviert werden: ${error.message}. Bitte aktualisieren.`});}
    }
  }
  function load() {
    if (!stopped) return;
    stopped = false; activationAttempts.clear(); patch({status:"loading",error:""});
    const errors={};
    function listen(name,key){
      subscriptions.push(onSnapshot(collection(db,name),snap=>{
        delete errors[key];
        patch({[key]:snap.docs.map(d=>({id:d.id,...d.data()})),status:"ready",error:Object.values(errors).join(' ')});
        if(key==='pages'){void activateCompletedEmptyShops(store.getState().contentCreator.pages);void migrateExisting();}
      },error=>{errors[key]=`${key}: ${error.message}`;patch({error:Object.values(errors).join(' ')});}));
    }
    listen(CC_PAGES,'pages');listen(CC_CARTS,'carts');listen(CC_ORDERS,'orders');listen(CC_VISITS,'visits');
    let ticks=0;liveTimer=setInterval(()=>{if(!stopped){patch({now:Date.now()});if(++ticks%2===0)void retryNotifications();}},30000);
    // Snapshots populate pending deliveries before the first retry pass.
    setTimeout(()=>{if(!stopped)void retryNotifications();},1500);
  }
  async function retryNotifications(){
    if (store.getState().contentCreator.resetRunning) return;
    const state=store.getState().contentCreator;
    const pending=[...(state.orders||[]).filter(o=>o.notificationPending&&Date.now()-Date.parse(o.notificationAttemptAt||o.createdAt)>60000&&Date.now()-Date.parse(o.createdAt)<86400000).map(o=>({...o,kind:'order'})),...(state.carts||[]).filter(c=>c.notificationPending&&c.status==='active'&&Date.now()-Date.parse(c.notificationAttemptAt||c.updatedAt)>60000&&Date.now()-Date.parse(c.updatedAt)<86400000).map(c=>({...c,kind:'cart'}))];
    for(const row of pending.slice(0,20)){
      try{await fetch('/api/content-creator-shop',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({op:'notify',kind:row.kind,pageId:row.pageId,cartId:row.cartId||row.id,orderId:row.kind==='order'?row.id:undefined}),signal:AbortSignal.timeout(60000)});}catch{}
    }
  }

  function capture() { const input = root.querySelector('#cc-create-form [name="name"]'); if(input) draftName=input.value; }
  function notice(text) { patch({notice:text}); setTimeout(()=>patch({notice:""}),3500); }
  function toggleCard(key){
    if(!key)return;
    const state=store.getState().contentCreator;
    // Package options start closed; all other cards start expanded.
    const current=state.collapsedCards?.[key]??key.startsWith('package-options-');
    patch({collapsedCards:{...state.collapsedCards,[key]:!current}});
  }
  let previousTap=null,lastTouchCollapse=0;
  function cardFromEvent(event){
    if(event.target.closest('button,input,textarea,select,label,summary,a,form'))return null;
    return event.target.closest('[data-cc-collapse],.cc-hero-editor');
  }
  function collapseCard(card){
    if(card.matches('details'))card.open=!card.open;
    else toggleCard(card.dataset.ccCollapse);
  }
  root.addEventListener('dblclick',event=>{
    if(Date.now()-lastTouchCollapse<500)return;
    const card=cardFromEvent(event);if(card){event.preventDefault();collapseCard(card);}
  });
  root.addEventListener('pointerup',event=>{
    if(event.pointerType!=='touch')return;
    const card=cardFromEvent(event);if(!card){previousTap=null;return;}
    const key=card.dataset.ccCollapse||card.dataset.ccFold,now=Date.now();
    if(previousTap?.key===key&&now-previousTap.at<350&&Math.abs(event.clientX-previousTap.x)<20&&Math.abs(event.clientY-previousTap.y)<20){
      previousTap=null;lastTouchCollapse=now;collapseCard(card);
    }else previousTap={key,at:now,x:event.clientX,y:event.clientY};
  });
  function updateGallery(gallery){
    const width=gallery.clientWidth||1,index=Math.max(0,Math.min(gallery.children.length-1,Math.round(gallery.scrollLeft/width)));
    const position=[...root.querySelectorAll('[data-cc-position]')].find(node=>node.dataset.ccPosition===gallery.dataset.ccGallery);
    if(position)position.textContent=`${index+1} / ${gallery.children.length}`;
  }
  root.addEventListener('scroll',event=>{if(event.target.matches?.('[data-cc-gallery]'))updateGallery(event.target);},true);
  root.addEventListener("keydown", event => {
    const dialog=root.querySelector(".cc-dialog");if(!dialog)return;
    if(event.key==="Escape" && !busy){event.preventDefault();patch({editor:false});root.querySelector('[data-cc-action="new"]')?.focus();}
    if(event.key==="Tab"){
      const fields=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),a[href]')];
      const first=fields[0],last=fields.at(-1);
      if(event.shiftKey && event.target===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey && event.target===last){event.preventDefault();first?.focus();}
    }
  });
  async function detail(id) {
    const epoch=++imageEpoch;
    const previous=store.getState().contentCreator;
    patch({selectedId:id,newPackage:false,images:{},captionDrafts:previous.selectedId===id ? previous.captionDrafts : {},mediaError:"",deletePackageConfirm:""});
    const page=store.getState().contentCreator.pages.find(p=>p.id===id);
    if(!page)return;
    const result=await Promise.all((page.photoIds || []).map(async key=>{
      const snap=await getDoc(doc(db,CC_PAGES,id,"images",key));return [key,snap.data() || {}];
    }));
    if(epoch===imageEpoch)patch({images:Object.fromEntries(result)});
  }
  async function mediaTask(task) {
    if(mediaBusy)return;
    mediaBusy=true;patch({mediaBusy:true,mediaError:""});
    try{await migrationFinished;await task();}catch(error){patch({mediaError:error.message || "Änderung nicht gespeichert."});notice(error.message || "Änderung nicht gespeichert.");}
    finally{mediaBusy=false;patch({mediaBusy:false});void migrateExisting();}
  }
  function cropFromCard(card){
    return normalizeCreatorCrop(Object.fromEntries(['x','y','fit'].map(axis=>[axis,card.querySelector(`[data-cc-hero-adjust="${axis}"]`)?.value])));
  }
  root.addEventListener("input", event => {
    if(event.target.hasAttribute('data-cc-search')){patch({search:event.target.value,businessLimit:20,selectedIds:[]});return;}
    if(event.target.hasAttribute('data-cc-hero-adjust')){
      const card=event.target.closest('[data-cc-hero-card]');if(!card)return;
      const crop=cropFromCard(card),image=card.querySelector('[data-cc-hero-preview]');
      if(image)image.setAttribute('style',creatorHeroCropStyle(crop));
      for(const axis of ['x','y']){const value=card.querySelector(`[data-cc-hero-value="${axis}"]`);if(value)value.textContent=`${crop[axis]}%`;}
      return;
    }
    if(['shopTitle','shopPrice'].includes(event.target.name)){patch({[event.target.name]:event.target.value});return;}
    if(event.target.hasAttribute("data-upload-caption")){
      captions[event.target.dataset.uploadCaption]=event.target.value;
      patch({pendingCaptions:{...captions}});return;
    }
    if(event.target.hasAttribute("data-edit-caption")){
      const state=store.getState().contentCreator;
      patch({captionDrafts:{...state.captionDrafts,[event.target.dataset.editCaption]:event.target.value}});return;
    }
 if(event.target.matches('#cc-create-form [name="name"]')) { draftName=event.target.value; patch({draftName}); } });
  root.addEventListener("change", event => {
    const input=event.target;
    if(input.hasAttribute('data-cc-date')){patch({period:'date',date:input.value,datePicker:false});return;}
    if(input.hasAttribute('data-cc-select')){
      const selected=new Set(store.getState().contentCreator.selectedIds||[]);if(input.checked)selected.add(input.dataset.ccSelect);else selected.delete(input.dataset.ccSelect);
      patch({selectedIds:[...selected]});return;
    }
    if(input.hasAttribute('data-cc-hero-adjust')){
      const card=input.closest('[data-cc-hero-card]');if(!card)return;
      const state=store.getState().contentCreator,key=`${card.dataset.page}:${card.dataset.ccHeroCard}`;
      patch({heroDrafts:{...state.heroDrafts,[key]:cropFromCard(card)}});return;
    }
    if(input.hasAttribute('data-cc-hero-format')){
      const id=input.dataset.ccHeroFormat,heroFormat=creatorHeroFormat({heroFormat:input.value});
      mediaTask(async()=>{await updateDoc(doc(db,CC_PAGES,id),{heroFormat,updatedAt:serverTimestamp()});patch({pages:store.getState().contentCreator.pages.map(page=>page.id===id?{...page,heroFormat}:page)});});return;
    }
    if(input.hasAttribute('data-cc-package-add')){
      const files=Array.from(input.files||[]),id=input.dataset.page,productId=input.dataset.ccPackageAdd;
      if(!files.length)return;
      mediaTask(async()=>{
        const pageRef=doc(db,CC_PAGES,id),snapshot=await getDoc(pageRef),page=snapshot.data();
        const product=page?.products?.find(p=>p.id===productId);
        if(!product||page.kind!=='shop')throw Error('Paket wurde nicht gefunden.');
        if((page.photoIds?.length||0)+files.length>30)throw Error('Maximal 30 Bilder pro Seite.');
        for(const file of files)if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>30*1024*1024)throw Error('JPG, PNG oder WebP bis 30 MB wählen.');
        const keys=[];
        for(const file of files){
          const key=crypto.randomUUID().replaceAll('-','');
          await (saveAsset||saveShopAsset)(id,key,file,await prepareImage(file),{free:product.priceCents===0});keys.push(key);
        }
        const updated={photoIds:[...(page.photoIds||[]),...keys],products:page.products.map(p=>p.id===productId?{...p,imageIds:[...p.imageIds,...keys]}:p)};
        await updateDoc(pageRef,{...updated,updatedAt:serverTimestamp()});
        patch({pages:store.getState().contentCreator.pages.map(p=>p.id===id?{...p,...updated}:p)});
        await detail(id);
      });return;
    }
    if(input.hasAttribute('data-cc-hero-upload')){
      const files=Array.from(input.files||[]),id=input.dataset.ccHeroUpload;if(!files.length)return;
      mediaTask(async()=>{
                const pageRef=doc(db,CC_PAGES,id),snap=await getDoc(pageRef),page=snap.data();
        if((page.heroImages?.length||0)+files.length>6)throw Error('Maximal 6 Titelbilder auswählen.');
        const images=[...(page.heroImages||[])];
        for(const file of files){
          if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>30*1024*1024)throw Error('JPG, PNG oder WebP bis 30 MB wählen.');
          images.push(await saveCreatorCdnAsset(id,`hero_${crypto.randomUUID().replaceAll('-','')}`,file,{hero:true}));
        }
        await updateDoc(pageRef,{heroImages:images,updatedAt:serverTimestamp()});
        patch({pages:store.getState().contentCreator.pages.map(p=>p.id===id?{...p,heroImages:images}:p)});
      });return;
    }
    if(input.hasAttribute('data-cc-hero')){
      const id=input.dataset.ccHero;
      const selected=[...root.querySelectorAll('[data-cc-hero]:checked')].map(node=>node.value);
      if(selected.length>6){input.checked=false;notice('Maximal 6 Header-Bilder auswählen.');return;}
      mediaTask(async()=>{
        const pageRef=doc(db,CC_PAGES,id),snap=await getDoc(pageRef),page=snap.data();
        const allowed=(page?.photoIds||[]).filter(key=>(page.products||[]).some(p=>p.active!==false&&p.imageIds?.includes(key)));
        const heroPhotoIds=selected.filter(key=>allowed.includes(key));
        await updateDoc(pageRef,{heroPhotoIds,updatedAt:serverTimestamp()});
        patch({pages:store.getState().contentCreator.pages.map(p=>p.id===id?{...p,heroPhotoIds}:p)});
      });return;
    }
    if(input.name==='kind'){capture();patch({pageKind:input.value,draftName});return;}
    if(input.hasAttribute("data-cc-add")){
      const files=Array.from(input.files || []),id=input.dataset.ccAdd;if(!files.length)return;
      mediaTask(async()=>{
        const pageRef=doc(db,CC_PAGES,id),snap=await getDoc(pageRef),page=snap.data();
        if(!page)throw new Error("Lokal wurde nicht gefunden.");
        if((page.photoIds?.length || 0)+files.length>30)throw new Error("Maximal 30 Bilder pro Seite.");
        const keys=[];
        for(const file of files){const key=crypto.randomUUID().replaceAll("-","");await savePromoAsset(id,key,file,await prepareImage(file));keys.push(key);}
        await updateDoc(pageRef,{photoIds:[...(page.photoIds || []),...keys],...(!page.published?{published:true}:{}),updatedAt:serverTimestamp()});
        const state=store.getState().contentCreator;
        patch({pages:state.pages.map(p=>p.id===id?{...p,photoIds:[...(page.photoIds || []),...keys],...(!page.published?{published:true}:{})}:p),...(!page.published?{filter:"working"}:{})});
        await detail(id);
      });return;
    }
    if(!input.closest("#cc-create-form"))return;
    capture();
    if(input.name === "avatar") avatarFile=input.files[0] || avatarFile;
    if(input.name === "photos") { photoFiles=Array.from(input.files); captions={}; }
    patch({pendingPhotos:photoFiles.map(f=>f.name),pendingCaptions:{...captions},draftName,avatarName:avatarFile?.name || (draftAvatar ? "Profilbild gespeichert" : ""),photoNames:photoFiles.map(f=>f.name).join(", "),editorError:""});
  });
  root.addEventListener("submit", async event => {
    const form=event.target;
    if(form.id==='cc-add-package' || form.hasAttribute('data-cc-package')){
      event.preventDefault();
      // Read before state changes rebuild the form.
      const id=form.dataset.page,title=form.querySelector('[name="title"]').value.trim(),price=form.querySelector('[name="price"]').value;
      const files=Array.from(form.querySelector('[name="files"]')?.files || []),productId=form.dataset.ccPackage;
      mediaTask(async()=>{
        const cents=priceCents(price),pageRef=doc(db,CC_PAGES,id),snapshot=await getDoc(pageRef),page=snapshot.data();
        if(!title)throw Error('Bitte einen Paketnamen eingeben.');
        if(productId){
          const products=(page.products||[]).map(p=>p.id===productId?{...p,title,priceCents:cents}:p),updated={products,updatedAt:serverTimestamp()};
          if(await creatorCdnEnabled()){
            const after={...page,products},valid=creatorPublicMedia(after);
            for(const key of page.photoIds||[])if(page.media?.[key]&&!valid[key]){
              const free=products.some(p=>p.active!==false&&p.priceCents===0&&p.imageIds?.includes(key));
              const media=await saveCreatorCdnAsset(id,key,await savedCreatorFile(id,key),{free,publish:false});
              const {id:unused,...variants}=media;updated[`media.${key}`]=variants;
            }
          }
          await updateDoc(pageRef,updated);
          patch({pages:store.getState().contentCreator.pages.map(p=>p.id===id?{...p,products}:p)});notice('Paket gespeichert.');return;
        }
        if(!files.length || page.photoIds.length+files.length>30 || (page.products||[]).length>=10)throw Error('Fotos auswählen: maximal 30 Bilder und 10 Pakete pro Shop.');
        const keys=[];
        for(const file of files){
          const key=crypto.randomUUID().replaceAll('-',''),data=await prepareImage(file);
          await (saveAsset||saveShopAsset)(id,key,file,data,{free:cents===0});keys.push(key);
        }
        const product={id:crypto.randomUUID().replaceAll('-',''),title,priceCents:cents,imageIds:keys,active:true};
        const updated={photoIds:[...(page.photoIds||[]),...keys],products:[...(page.products||[]),product],...(!page.published?{published:true}:{})};
        await updateDoc(pageRef,{...updated,updatedAt:serverTimestamp()});
        patch({newPackage:false,pages:store.getState().contentCreator.pages.map(p=>p.id===id?{...p,...updated}:p),...(!page.published?{filter:"working"}:{})});await detail(id);
      });return;
    }
    if(event.target.id!=="cc-create-form")return;
    event.preventDefault(); if(busy)return; capture();
    if(!draftName.trim() || photoFiles.length>30){patch({editorError:"Bitte einen Betriebsnamen eingeben. Fotos sind optional (maximal 30)."});return;}
    const kind=store.getState().contentCreator.pageKind==='shop'?'shop':'promo';
    let product;
    if(kind==='shop'&&photoFiles.length){try{product=initialShopProduct(store.getState().contentCreator,[]);}catch(error){patch({editorError:error.message});return;}}
    busy=true; patch({saving:true,draftName,editorError:"",progress:photoFiles.length?"Bilder vorbereiten …":"Betrieb wird erstellt …"});
    try {
      const avatar=avatarFile ? await prepareImage(avatarFile,true) : (draftAvatar || "");
      pendingId ||= crypto.randomUUID().replaceAll("-","");
      const page=doc(db,CC_PAGES,pendingId);
      createdMs ||= Date.now();
      // The draft is durable; only the final atomic write exposes a complete page.
      await setDoc(page,{kind,name:draftName.trim(),avatar,photoIds:[],workflow:"working",published:false,createdMs,updatedAt:serverTimestamp()});
      const photoIds=[];
      for(let i=0;i<photoFiles.length;i++) {
        patch({progress:`Bild ${i+1} von ${photoFiles.length} …`});
        const data=await prepareImage(photoFiles[i]); const imageId=String(i).padStart(3,"0");
        if(kind==='shop'){
          await (saveAsset||saveShopAsset)(pendingId,imageId,photoFiles[i],data,{free:product.priceCents===0});
          await updateDoc(doc(page,'images',imageId),{caption:String(captions[i] || '').slice(0,1000)});
        }else {await savePromoAsset(pendingId,imageId,photoFiles[i],data);await updateDoc(doc(page,'images',imageId),{caption:String(captions[i] || '').slice(0,1000)});}
        photoIds.push(imageId);
      }
      const completed={kind,name:draftName.trim(),avatar,createdMs,...(kind==='shop'?{products:product?[{...product,imageIds:photoIds}]:[]}:{}),photoIds,published:true,workflow:'working'};
      const batch=writeBatch(db);batch.update(page,{...completed,updatedAt:serverTimestamp()});await batch.commit();
      const completedId=pendingId;
      const pages=store.getState().contentCreator.pages||[];
      patch({pages:[...pages.filter(p=>p.id!==completedId),{id:completedId,...completed}],images:{}});
      pendingId="";photoFiles=[];avatarFile=null;draftAvatar="";draftName="";
      patch({editor:false,saving:false,selectedId:photoIds.length?"":completedId,filter:"working"});notice(photoIds.length?"Business erstellt. Unter Working fertigstellen und anschließend auf Ready setzen.":"Business erstellt und aktiv. Vorschau und Links sind bereit; Fotos und Pakete kannst du später hinzufügen.");
    } catch(error){patch({saving:false,editorError:`Nicht abgeschlossen: ${error.message}. Du kannst es erneut versuchen.`});}
    finally{busy=false;}
  });
  root.addEventListener("click", async event => {
    const button=event.target.closest("[data-cc-action]"); if(!button)return;
    event.preventDefault();
    if(button.disabled)return;
    const action=button.dataset.ccAction,id=button.dataset.id;
    try {
      if (action === 'reset-data') { await creatorReset().reset(); return; }
      if (action === 'cancel-reset') { creatorReset().cancel(); return; }
      if (store.getState().contentCreator.resetRunning) return;
      if (action === 'convert-shop') {
        await mediaTask(async () => {
          const ref = doc(db, CC_PAGES, id), snapshot = await getDoc(ref), page = snapshot.data();
          if (!page) throw Error('Business wurde nicht gefunden.');
          if (page.kind === 'shop') return;
          const fields = { kind: 'shop', ...(!Array.isArray(page.products) ? { products: [] } : {}), updatedAt: serverTimestamp() };
          await updateDoc(ref, fields);
          const current = store.getState().contentCreator;
          patch({ pages: current.pages.map(item => item.id === id ? { ...item, ...fields } : item) });
          notice(`${page.name || 'Business'} ist jetzt ein Shop. Fotopakete kannst du über Plus anlegen.`);
        });
        return;
      }
      if(action==='collapse'){toggleCard(button.dataset.key);return;}
      if(action==='toggle-links'){
        const state=store.getState().contentCreator;
        patch({expandedBusinesses:{...state.expandedBusinesses,[id]:!state.expandedBusinesses?.[id]}});return;
      }
      if(action==='select-business'){
        const chosen=new Set(store.getState().contentCreator.selectedIds||[]);
        if(chosen.has(id))chosen.delete(id);else chosen.add(id);patch({selectedIds:[...chosen]});return;
      }
      if(action==='slide-package'){
        const gallery=[...root.querySelectorAll('[data-cc-gallery]')].find(node=>node.dataset.ccGallery===button.dataset.product);
        if(!gallery)return;
        const width=gallery.clientWidth||1,current=Math.round(gallery.scrollLeft/width),index=Math.max(0,Math.min(gallery.children.length-1,current+Number(button.dataset.direction)));
        if(typeof gallery.scrollTo==='function')gallery.scrollTo({left:index*width,behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
        else gallery.scrollLeft=index*width;
        updateGallery(gallery);return;
      }
      if(action==='refresh'){stop();load();notice('Wird aktualisiert …');}
      if(action==='more'&&['businessLimit','orderLimit','visitLimit'].includes(button.dataset.key))patch({[button.dataset.key]:(store.getState().contentCreator[button.dataset.key]||20)+20});
      if(action==='date-picker')patch({datePicker:!store.getState().contentCreator.datePicker});
      if(action==='period')patch({period:button.dataset.key,datePicker:false});
      if(action==='settings')patch({selecting:!store.getState().contentCreator.selecting,selectedIds:[]});
      if(action==='new-package')patch({newPackage:!store.getState().contentCreator.newPackage});
      if(action==='select-all'){
        const state=store.getState().contentCreator;
        const visible=state.pages.filter(page=>creatorBusinessMatches(page,state)).map(page=>page.id);
        const all=visible.length>0&&visible.every(key=>(state.selectedIds||[]).includes(key));
        patch({selectedIds:all?[]:visible});
      }
      if(action==='bulk-status')await mediaTask(async()=>{
        const state=store.getState().contentCreator,ids=(state.selectedIds||[]).filter(key=>state.pages.some(page=>page.id===key&&creatorBusinessMatches(page,state))),workflow=button.dataset.key;
        if(!['ready','archived'].includes(workflow)||!ids.length)return;
        if(workflow==='ready'&&state.pages.some(page=>ids.includes(page.id)&&!page.photoIds?.length))throw Error('Ready benötigt mindestens ein Foto. Bitte unvollständige Businesses abwählen.');
        const workflowAt=new Date().toISOString();
        for(let offset=0;offset<ids.length;offset+=400){const batch=writeBatch(db);for(const key of ids.slice(offset,offset+400))batch.update(doc(db,CC_PAGES,key),{workflow,workflowAt,updatedAt:serverTimestamp()});await batch.commit();}
        patch({selectedIds:[],selecting:false,filter:workflow,pages:state.pages.map(page=>ids.includes(page.id)?{...page,workflow,workflowAt}:page)});
        queueMicrotask(()=>{const chip=[...root.querySelectorAll('[data-cc-action="filter"]')].find(node=>node.dataset.key===workflow),track=root.querySelector('.cc-business-chips');if(chip&&track)track.scrollLeft=chip.closest('.heart-shopchip-page')?.offsetLeft||0;});
      });
      if(action==='followup')await mediaTask(async()=>{
        const ref=doc(db,CC_PAGES,id),snap=await getDoc(ref),page=snap.data(),key=button.dataset.cart;
        const followups={...page.followups,[key]:!page.followups?.[key]};
        await updateDoc(ref,{followups,updatedAt:serverTimestamp()});
        patch({pages:store.getState().contentCreator.pages.map(page=>page.id===id?{...page,followups}:page)});
      });
      if(action==='followup-copy'){
        const page=store.getState().contentCreator.pages.find(page=>page.id===id);
        await navigator.clipboard.writeText(`Përshëndetje ${page?.name||''}, pakot tuaja të fotove janë gati. Mund t’i shikoni dhe ta përfundoni porosinë këtu: ${contentLink(id)}`);notice('Nachfass-Nachricht kopiert.');
      }
      if(action==="new") {if(busy)return;captions={};patch({pendingPhotos:[],pendingCaptions:{},pageKind:"shop",shopTitle:"",shopPrice:"",selectedId:""});createdMs=0;pendingId="";avatarFile=null;photoFiles=[];draftAvatar="";draftName="";patch({editor:true,draftName:"",avatarName:"",photoNames:"",editorError:""});queueMicrotask(()=>root.querySelector('#cc-create-form [name="name"]')?.focus());}
      if(action==="close" && !busy) patch({editor:false});
      if(action==="filter") patch({filter:button.dataset.key,selectedIds:[],businessLimit:20});
      if(action==='retry-migration'){migrationAttempts.clear();void migrateExisting();}
      if(action==='hero-crop-save'){
        const image=button.dataset.image,card=button.closest('[data-cc-hero-card]'),crop=cropFromCard(card);
        await mediaTask(async()=>{
          const pageRef=doc(db,CC_PAGES,id),snapshot=await getDoc(pageRef),page=snapshot.data();
          const allowed=(page?.heroImages||[]).some(entry=>entry.id===image)||(page?.photoIds||[]).includes(image)&&(page.products||[]).some(product=>product.active!==false&&product.imageIds?.includes(image));
          if(!allowed)throw Error('Titelbild wurde entfernt. Bitte erneut öffnen.');
          await updateDoc(pageRef,{[`heroCrop.${image}`]:crop,updatedAt:serverTimestamp()});
          const state=store.getState().contentCreator,heroDrafts={...state.heroDrafts};delete heroDrafts[`${id}:${image}`];
          patch({heroDrafts,pages:state.pages.map(item=>item.id===id?{...item,heroCrop:{...item.heroCrop,[image]:crop}}:item)});
          notice('Titelbild-Ausschnitt gespeichert.');
        });
      }
      if(action==='hero-delete'||action==='hero-move')await mediaTask(async()=>{
        const pageRef=doc(db,CC_PAGES,id),snap=await getDoc(pageRef),images=[...(snap.data()?.heroImages||[])];
        const index=images.findIndex(image=>image.id===button.dataset.image);if(index<0)return;
        if(action==='hero-delete')images.splice(index,1);
        else{const next=index+Number(button.dataset.direction);if(next<0||next>=images.length)return;[images[index],images[next]]=[images[next],images[index]];}
        await updateDoc(pageRef,{heroImages:images,updatedAt:serverTimestamp()});
        patch({pages:store.getState().contentCreator.pages.map(p=>p.id===id?{...p,heroImages:images}:p)});
      });
      if(action==='cancel-package-delete')patch({deletePackageConfirm:''});
      if(action==='refresh-previews')await mediaTask(async()=>{
        const snap=await getDoc(doc(db,CC_PAGES,id)),page=snap.data();
        if(page?.kind!=='shop')throw Error('Shop wurde nicht gefunden.');
        await refreshShopPreviews(id,page.photoIds||[]);await detail(id);notice('Vorschauen mit dezentem Wasserzeichen aktualisiert.');
      });
      if(action==='delete-package'){
        if(mediaBusy)return;
        const productId=button.dataset.product;
        if(store.getState().contentCreator.deletePackageConfirm!==productId){patch({deletePackageConfirm:productId});return;}
        await mediaTask(async()=>{
          const pageRef=doc(db,CC_PAGES,id),snap=await getDoc(pageRef),page=snap.data();
          if(page?.kind!=='shop')throw Error('Shop wurde nicht gefunden.');
          const product=(page.products||[]).find(p=>p.id===productId);
          if(!product)throw Error('Paket wurde bereits entfernt.');
          const products=page.products.filter(p=>p.id!==productId);
          const retained=new Set(products.flatMap(p=>p.imageIds||[]));
          const removed=(product.imageIds||[]).filter(key=>!retained.has(key));
          const photoIds=(page.photoIds||[]).filter(key=>!removed.includes(key));
          const batch=writeBatch(db);batch.update(pageRef,{products,photoIds,updatedAt:serverTimestamp()});
          for(const key of removed){batch.delete(doc(pageRef,'images',key));batch.delete(doc(pageRef,'previews',key));}
          await batch.commit();
          patch({pages:store.getState().contentCreator.pages.map(p=>p.id===id?{...p,products,photoIds}:p)});
          await detail(id);notice('Paket gelöscht. Bestehende Bestellungen bleiben erhalten.');
        });
      }
      if(action==='release'){
        const order=button.dataset.order;
        if(store.getState().contentCreator.releaseConfirm!==order){patch({releaseConfirm:order});return;}
        await mediaTask(async()=>{await releaseShopOrder(order);patch({releaseConfirm:''});notice('Zahlung bestätigt. Downloads freigegeben.');});
      }
      if(action==="detail") await detail(id);
      if(action==="back") {imageEpoch++;patch({selectedId:"",images:{},captionDrafts:{}});}
      if(action==="preview") {
        const url=contentLink(id,true);
        // Keep Heart in its tab/PWA and avoid iOS standalone navigation replacing it.
        const link=document.createElement("a");link.href=url;link.target="_blank";link.rel="noopener noreferrer external";document.body.appendChild(link);link.click();link.remove();
      }
      if(action==="still") {await navigator.clipboard.writeText(contentLink(id,true));notice("Still-Link kopiert · auch im externen Browser ohne Stats.");}
      if(["caption","move","delete"].includes(action)) await mediaTask(async()=>{
        const pageRef=doc(db,CC_PAGES,id),snapshot=await getDoc(pageRef),page=snapshot.data();
        if(!page)throw new Error("Lokal wurde nicht gefunden.");
        const image=button.dataset.image,ids=[...(page.photoIds || [])],index=ids.indexOf(image);
        if(index<0)throw new Error("Bild wurde bereits entfernt. Bitte neu öffnen.");
        if(action==="caption"){
          const caption=store.getState().contentCreator.captionDrafts?.[image] ?? store.getState().contentCreator.images?.[image]?.caption ?? "";
          await updateDoc(doc(pageRef,"images",image),{caption:String(caption).slice(0,1000)});
          const state=store.getState().contentCreator;
          patch({images:{...state.images,[image]:{...state.images[image],caption}},notice:"Bildunterschrift gespeichert."});
        }else{
          if(action==='delete'&&page.kind==='shop'&&button.dataset.product){
            const productId=button.dataset.product;
            if(!page.products?.some(p=>p.id===productId&&p.imageIds.includes(image)))throw Error('Foto wurde bereits aus dem Paket entfernt.');
            const products=page.products.map(p=>p.id===productId?{...p,imageIds:p.imageIds.filter(key=>key!==image)}:p);
            const shared=products.some(p=>p.imageIds.includes(image));
            const updated={products,photoIds:shared?ids:ids.filter(key=>key!==image),heroPhotoIds:(page.heroPhotoIds||[]).filter(key=>shared||key!==image)};
            const batch=writeBatch(db);batch.update(pageRef,{...updated,updatedAt:serverTimestamp()});
            if(!shared){batch.delete(doc(pageRef,'images',image));batch.delete(doc(pageRef,'previews',image));}
            await batch.commit();
            patch({pages:store.getState().contentCreator.pages.map(p=>p.id===id?{...p,...updated}:p)});
            await detail(id);return;
          }
          if(action==="move") {const next=index+Number(button.dataset.direction);if(next<0||next>=ids.length)return;[ids[index],ids[next]]=[ids[next],ids[index]];}
          if(action==="delete") ids.splice(index,1);
          const products=page.kind==='shop'?(page.products||[]).map(p=>({...p,imageIds:action==='move'?ids.filter(key=>p.imageIds.includes(key)):p.imageIds.filter(key=>ids.includes(key))})).filter(p=>p.imageIds.length):undefined;
          const updated={...(products?{products}:{}),photoIds:ids};
          const batch=writeBatch(db);batch.update(pageRef,{...updated,updatedAt:serverTimestamp()});
          if(action==="delete"){batch.delete(doc(pageRef,"images",image));if(page.kind==='shop')batch.delete(doc(pageRef,'previews',image));}
          await batch.commit();
          const state=store.getState().contentCreator;
          patch({pages:state.pages.map(p=>p.id===id?{...p,...updated}:p)});
          await detail(id);
        }
      });
      if(action==="copy") {await navigator.clipboard.writeText(contentLink(id));notice("Link kopiert.");}
      if(action==="sent") {
        const ref=doc(db,CC_PAGES,id),snapshot=await getDoc(ref),page=snapshot.data();
        if(!page)throw Error('Business wurde nicht gefunden.');
        const workflow=['ready','sent'].includes(page.workflow)?'sent':page.workflow||'working';
        await updateDoc(ref,{workflow,sentAt:serverTimestamp()});
        patch({pages:store.getState().contentCreator.pages.map(item=>item.id===id?{...item,workflow,sentAt:Date.now()}:item)});notice("Als verschickt markiert.");
      }
      if(action==="resume" && !busy){const page=store.getState().contentCreator.pages.find(p=>p.id===id);if(!page)return;pendingId=id;createdMs=page.createdMs;draftName=page.name;draftAvatar=page.avatar;avatarFile=null;photoFiles=[];patch({editor:true,pageKind:page.kind||"promo",draftName,avatarName:"Profilbild gespeichert",photoNames:"Bitte Beispielbilder erneut auswählen.",editorError:""});}
    }catch(error){notice(`Nicht möglich: ${error.message}`);}
  });
  store.subscribe(state=>{if(state.auth.status!=="authenticated" || !state.auth.access?.allowed)stop();});
  return {load,stop};
}

