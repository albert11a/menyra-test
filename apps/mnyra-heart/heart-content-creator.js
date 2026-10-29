import { db } from "/shared/firebase-config.js";
import { collection, doc, onSnapshot, setDoc, updateDoc, writeBatch, serverTimestamp } from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
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

export function createContentCreator({root, store, prepareImage = prepareContentImage}) {
  const patch = fields => store.actions.patchContentCreator(fields);
  let subscriptions = [], pendingId = "", avatarFile = null, photoFiles = [], draftAvatar = "", draftName = "";
  let busy = false, stopped = true, createdMs = 0;
  function stop() { subscriptions.forEach(unsubscribe => unsubscribe()); subscriptions = []; stopped = true; }
  function load() {
    if (!stopped) return;
    stopped = false; patch({status:"loading",error:""});
    const fail = error => { stop(); patch({status:"error",error:`Lokale konnten nicht geladen werden: ${error.message}`}); };
    subscriptions.push(onSnapshot(collection(db,CC_PAGES), snap => patch({pages:snap.docs.map(d=>({id:d.id,...d.data()})),status:"ready",error:""}), fail));
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
  root.addEventListener("input", event => { if(event.target.matches('#cc-create-form [name="name"]')) { draftName=event.target.value; patch({draftName}); } });
  root.addEventListener("change", event => {
    const input=event.target;
    if(!input.closest("#cc-create-form"))return;
    capture();
    if(input.name === "avatar") avatarFile=input.files[0] || avatarFile;
    if(input.name === "photos") photoFiles=Array.from(input.files);
    patch({draftName,avatarName:avatarFile?.name || (draftAvatar ? "Profilbild gespeichert" : ""),photoNames:photoFiles.map(f=>f.name).join(", "),editorError:""});
  });
  root.addEventListener("submit", async event => {
    if(event.target.id!=="cc-create-form")return;
    event.preventDefault(); if(busy)return; capture();
    if(!draftName.trim() || !(avatarFile || draftAvatar) || !photoFiles.length || photoFiles.length>30){patch({editorError:"Bitte Lokalname, Profilbild und 1 bis 30 Bilder auswählen."});return;}
    busy=true; patch({saving:true,draftName,editorError:"",progress:"Bilder vorbereiten …"});
    try {
      const avatar=avatarFile ? await prepareImage(avatarFile,true) : draftAvatar;
      pendingId ||= crypto.randomUUID().replaceAll("-","");
      const page=doc(db,CC_PAGES,pendingId);
      createdMs ||= Date.now();
      // The draft is durable; only the final atomic write exposes a complete page.
      await setDoc(page,{name:draftName.trim(),avatar,photoIds:[],workflow:"working",published:false,createdMs,updatedAt:serverTimestamp()});
      const photoIds=[];
      for(let i=0;i<photoFiles.length;i++) {
        patch({progress:`Bild ${i+1} von ${photoFiles.length} …`});
        const data=await prepareImage(photoFiles[i]); const imageId=String(i).padStart(3,"0");
        await setDoc(doc(page,"images",imageId),{data}); photoIds.push(imageId);
      }
      const batch=writeBatch(db);batch.update(page,{photoIds,published:true,workflow:"ready",updatedAt:serverTimestamp()});await batch.commit();
      pendingId="";photoFiles=[];avatarFile=null;draftAvatar="";draftName="";
      patch({editor:false,saving:false,filter:"ready"});notice("Seite erstellt. Der Link ist bereit.");
    } catch(error){patch({saving:false,editorError:`Nicht abgeschlossen: ${error.message}. Du kannst es erneut versuchen.`});}
    finally{busy=false;}
  });
  root.addEventListener("click", async event => {
    const button=event.target.closest("[data-cc-action]"); if(!button)return;
    const action=button.dataset.ccAction,id=button.dataset.id;
    try {
      if(action==="new") {if(busy)return;createdMs=0;pendingId="";avatarFile=null;photoFiles=[];draftAvatar="";draftName="";patch({editor:true,draftName:"",avatarName:"",photoNames:"",editorError:""});queueMicrotask(()=>root.querySelector('#cc-create-form [name="name"]')?.focus());}
      if(action==="close" && !busy) patch({editor:false});
      if(action==="filter") patch({filter:button.dataset.key});
      if(action==="copy") {await navigator.clipboard.writeText(contentLink(id));notice("Link kopiert.");}
      if(action==="sent") {await updateDoc(doc(db,CC_PAGES,id),{workflow:"sent",sentAt:serverTimestamp()});notice("Als verschickt markiert.");}
      if(action==="resume" && !busy){const page=store.getState().contentCreator.pages.find(p=>p.id===id);if(!page)return;pendingId=id;createdMs=page.createdMs;draftName=page.name;draftAvatar=page.avatar;avatarFile=null;photoFiles=[];patch({editor:true,draftName,avatarName:"Profilbild gespeichert",photoNames:"Bitte Beispielbilder erneut auswählen.",editorError:""});}
    }catch(error){notice(`Nicht möglich: ${error.message}`);}
  });
  store.subscribe(state=>{if(state.auth.status!=="authenticated" || !state.auth.access?.allowed)stop();});
  return {load,stop};
}
