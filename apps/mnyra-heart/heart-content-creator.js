import {saveShopAsset,initialShopProduct,releaseShopOrder,refreshShopPreviews} from "./heart-content-creator-shop.js";
import {CC_CARTS,CC_ORDERS,priceCents} from "../../shared/content-creator-shop.js";
import { db } from "/shared/firebase-config.js";
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
  let subscriptions = [], pendingId = "", avatarFile = null, photoFiles = [], draftAvatar = "", draftName = "";
  let busy = false, stopped = true, createdMs = 0;
  let captions = {}, mediaBusy = false, imageEpoch = 0;
  function stop() { subscriptions.forEach(unsubscribe => unsubscribe()); subscriptions = []; stopped = true; }
  function load() {
    if (!stopped) return;
    stopped = false; patch({status:"loading",error:""});
    const fail = error => { stop(); patch({status:"error",error:`Lokale konnten nicht geladen werden: ${error.message}`}); };
    subscriptions.push(onSnapshot(collection(db,CC_PAGES), snap => patch({pages:snap.docs.map(d=>({id:d.id,...d.data()})),status:"ready",error:""}), fail));
    subscriptions.push(onSnapshot(collection(db,CC_CARTS), snap => patch({carts:snap.docs.map(d=>({id:d.id,...d.data()}))}), fail));
    subscriptions.push(onSnapshot(collection(db,CC_ORDERS), snap => patch({orders:snap.docs.map(d=>({id:d.id,...d.data()}))}), fail));
    subscriptions.push(onSnapshot(collection(db,CC_VISITS), snap => patch({visits:snap.docs.map(d=>d.data())}), fail));
  }
  function capture() { const input = root.querySelector('#cc-create-form [name="name"]'); if(input) draftName=input.value; }
  function notice(text) { patch({notice:text}); setTimeout(()=>patch({notice:""}),3500); }
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
    patch({selectedId:id,images:{},captionDrafts:previous.selectedId===id ? previous.captionDrafts : {},mediaError:"",deletePackageConfirm:""});
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
    try{await task();}catch(error){patch({mediaError:error.message || "Änderung nicht gespeichert."});}
    finally{mediaBusy=false;patch({mediaBusy:false});}
  }
  root.addEventListener("input", event => {
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
        for(const file of files){const key=crypto.randomUUID().replaceAll("-","");await setDoc(doc(pageRef,"images",key),{data:await prepareImage(file),caption:""});keys.push(key);}
        await updateDoc(pageRef,{photoIds:[...(page.photoIds || []),...keys],...(!page.published?{published:true,workflow:"ready"}:{}),updatedAt:serverTimestamp()});
        const state=store.getState().contentCreator;
        patch({pages:state.pages.map(p=>p.id===id?{...p,photoIds:[...(page.photoIds || []),...keys],...(!page.published?{published:true,workflow:"ready"}:{})}:p),...(!page.published?{filter:"ready"}:{})});
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
        if(productId){await updateDoc(pageRef,{products:(page.products||[]).map(p=>p.id===productId?{...p,title,priceCents:cents}:p),updatedAt:serverTimestamp()});return;}
        if(!files.length || page.photoIds.length+files.length>30 || (page.products||[]).length>=10)throw Error('Fotos auswählen: maximal 30 Bilder und 10 Pakete pro Shop.');
        const keys=[];
        for(const file of files){
          const key=crypto.randomUUID().replaceAll('-',''),data=await prepareImage(file);
          await (saveAsset||saveShopAsset)(id,key,file,data);keys.push(key);
        }
        const product={id:crypto.randomUUID().replaceAll('-',''),title,priceCents:cents,imageIds:keys,active:true};
        const updated={photoIds:[...(page.photoIds||[]),...keys],products:[...(page.products||[]),product],...(!page.published?{published:true,workflow:'ready'}:{})};
        await updateDoc(pageRef,{...updated,updatedAt:serverTimestamp()});
        patch({pages:store.getState().contentCreator.pages.map(p=>p.id===id?{...p,...updated}:p),...(!page.published?{filter:"ready"}:{})});await detail(id);
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
          await (saveAsset||saveShopAsset)(pendingId,imageId,photoFiles[i],data);
          await updateDoc(doc(page,'images',imageId),{caption:String(captions[i] || '').slice(0,1000)});
        }else await setDoc(doc(page,"images",imageId),{data,caption:String(captions[i] || "").slice(0,1000)});
        photoIds.push(imageId);
      }
      const completed={kind,name:draftName.trim(),avatar,createdMs,...(kind==='shop'?{products:product?[{...product,imageIds:photoIds}]:[]}:{}),photoIds,published:photoIds.length>0,workflow:photoIds.length?'ready':'working'};
      const batch=writeBatch(db);batch.update(page,{...completed,updatedAt:serverTimestamp()});await batch.commit();
      const completedId=pendingId;
      const pages=store.getState().contentCreator.pages||[];
      patch({pages:[...pages.filter(p=>p.id!==completedId),{id:completedId,...completed}],images:{}});
      pendingId="";photoFiles=[];avatarFile=null;draftAvatar="";draftName="";
      patch({editor:false,saving:false,selectedId:photoIds.length?"":completedId,filter:photoIds.length?"ready":"working"});notice(photoIds.length?"Seite erstellt. Der Link ist bereit.":"Betrieb erstellt. Fotos und Pakete kannst du jetzt oder später hinzufügen.");
    } catch(error){patch({saving:false,editorError:`Nicht abgeschlossen: ${error.message}. Du kannst es erneut versuchen.`});}
    finally{busy=false;}
  });
  root.addEventListener("click", async event => {
    const button=event.target.closest("[data-cc-action]"); if(!button)return;
    const action=button.dataset.ccAction,id=button.dataset.id;
    try {
      if(action==="new") {if(busy)return;captions={};patch({pendingPhotos:[],pendingCaptions:{},pageKind:"shop",shopTitle:"",shopPrice:"",selectedId:""});createdMs=0;pendingId="";avatarFile=null;photoFiles=[];draftAvatar="";draftName="";patch({editor:true,draftName:"",avatarName:"",photoNames:"",editorError:""});queueMicrotask(()=>root.querySelector('#cc-create-form [name="name"]')?.focus());}
      if(action==="close" && !busy) patch({editor:false});
      if(action==="filter") patch({filter:button.dataset.key});
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
      if(action==="sent") {await updateDoc(doc(db,CC_PAGES,id),{workflow:"sent",sentAt:serverTimestamp()});notice("Als verschickt markiert.");}
      if(action==="resume" && !busy){const page=store.getState().contentCreator.pages.find(p=>p.id===id);if(!page)return;pendingId=id;createdMs=page.createdMs;draftName=page.name;draftAvatar=page.avatar;avatarFile=null;photoFiles=[];patch({editor:true,pageKind:page.kind||"promo",draftName,avatarName:"Profilbild gespeichert",photoNames:"Bitte Beispielbilder erneut auswählen.",editorError:""});}
    }catch(error){notice(`Nicht möglich: ${error.message}`);}
  });
  store.subscribe(state=>{if(state.auth.status!=="authenticated" || !state.auth.access?.allowed)stop();});
  return {load,stop};
}

