// Small display images are separate from byte-exact downloadable originals.
const pending=new Map();
let active=0;
const waiting=[];
async function limited(task){
 if(active>=2)await new Promise(resolve=>waiting.push(resolve));
 else active++;
 try{return await task();}finally{if(waiting.length)waiting.shift()();else active--;}
}
function validPreview(preview){return preview?.version===1&&typeof preview.data==='string'&&preview.data.length<500000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(preview.data);}
export async function optimizedShopImage(path,metadata,repo,persist=false){
 if(validPreview(metadata.cleanPreview))return metadata.cleanPreview;
 let task=pending.get(path);
 if(!task){
  task=limited(async()=>{
   const parts=[];let size=0;
   for(let start=0;start<metadata.parts;start+=8){
    const chunks=await Promise.all(Array.from({length:Math.min(8,metadata.parts-start)},(_,i)=>repo.read(`${path}/chunks/${String(start+i).padStart(3,'0')}`)));
    for(const chunk of chunks){if(!chunk?.data)throw Error('Skedari nuk është i plotë.');const bytes=Buffer.from(chunk.data,'base64');size+=bytes.length;if(size>30*1024*1024)throw Error('Skedari është shumë i madh.');parts.push(bytes);}
   }
   if(size!==metadata.size)throw Error('Skedari nuk është i plotë.');
   const {default:sharp}=await import('sharp');
   const original=Buffer.concat(parts);
   for(const [edge,quality] of [[1200,78],[960,72],[720,65]]){
    const bytes=await sharp(original,{limitInputPixels:50000000}).rotate().resize({width:edge,height:edge,fit:'inside',withoutEnlargement:true}).flatten({background:'#ffffff'}).jpeg({quality,mozjpeg:true}).toBuffer();
    const data=`data:image/jpeg;base64,${bytes.toString('base64')}`;
    if(data.length<500000)return {version:1,data};
   }
   throw Error('Fotoja nuk mund të përgatitet. Provoni përsëri.');
  });
  pending.set(path,task);
  task.finally(()=>{if(pending.get(path)===task)pending.delete(path);}).catch(()=>{});
 }
 const preview=await task;
 // Only the explicit preparation POST persists a derived image, never a GET.
 if(persist)await repo.write(path,{cleanPreview:preview}).catch(()=>{});
 return preview;
}

// Persisted display derivatives are private; callers check current publication,
// product membership and price before selecting clean versus watermarked bytes.
const displayTasks = new Map();
let displayActive=0;const displayWaiting=[];
async function displayLimited(task){
 if(displayActive>=2)await new Promise(resolve=>displayWaiting.push(resolve));else displayActive++;
 try{return await task();}finally{if(displayWaiting.length)displayWaiting.shift()();else displayActive--;}
}
const displayCache = new Map();
export const DISPLAY_IMAGE_VERSION = 3;
export function displaySize(value) { return ['thumb','medium','large'].includes(value) ? value : 'thumb'; }
function validDisplay(record, mode) {
  return record?.version === DISPLAY_IMAGE_VERSION && (mode ? [mode] : ['clean','marked']).every(mode => /^data:image\/(?:webp|jpeg);base64,[A-Za-z0-9+/=]+$/.test(record[mode] || ''));
}
async function originalDisplaySource(path,metadata,repo){
 if(!metadata||!Number.isInteger(metadata.parts)||metadata.parts<1||metadata.parts>100||!Number.isSafeInteger(metadata.size)||metadata.size<1||metadata.size>30*1024*1024)throw Error('Fotoja nuk u gjet.');
 const chunks=[];let total=0;
 for(let start=0;start<metadata.parts;start+=8){
  const rows=await Promise.all(Array.from({length:Math.min(8,metadata.parts-start)},(_,i)=>repo.read(`${path}/chunks/${String(start+i).padStart(3,'0')}`)));
  for(const row of rows){if(!row?.data)throw Error('Skedari nuk është i plotë.');const bytes=Buffer.from(row.data,'base64');total+=bytes.length;if(total>metadata.size)throw Error('Skedari nuk është i plotë.');chunks.push(bytes);}
 }
 if(total!==metadata.size)throw Error('Skedari nuk është i plotë.');
 return Buffer.concat(chunks);
}
function watermarkSvg(width,height) {
  const font=Math.max(7,width/42),stepX=font*13.5,stepY=font*4.7,radius=Math.ceil(Math.hypot(width,height));
  let words='';
  for(let y=-radius;y<radius;y+=stepY)for(let x=-radius;x<radius;x+=stepX)words+=`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}">MNYRA · PREVIEW</text>`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g transform="translate(${width/2} ${height/2}) rotate(-20)" font-family="Arial,sans-serif" font-size="${font}" font-weight="400" fill="white" fill-opacity=".12">${words}</g></svg>`);
}
export async function creatorDisplayImage(path, metadata, repo, {size='thumb', free=false, persist=false}={}) {
 size=displaySize(size);
 const recordPath=label=>`${path}/displays/${label}`;
 const mode=free?'clean':'marked';
 let record=await repo.read(recordPath(size),persist?undefined:['version',mode]);
 if(persist&&validDisplay(record)){
  const siblings=await Promise.all(['thumb','medium','large'].filter(label=>label!==size).map(label=>repo.read(recordPath(label))));
  if(!siblings.every(row=>validDisplay(row)))record=null;
 }
 if(!validDisplay(record,persist?undefined:mode)){
  const cached=displayCache.get(path);
  let set=cached&&Date.now()-cached.at<120000?cached.set:null;
  if(!set){
   let task=displayTasks.get(path);
   if(!task){
    task=displayLimited(async()=>{
     const meta=metadata||await repo.read(path,['name','mime','size','parts']);
     // Never derive new display images from an already compressed JPEG preview.
     const source=await originalDisplaySource(path,meta,repo);
     const {default:sharp}=await import('sharp');const result={};
     for(const [label,edge,quality] of [['thumb',640,82],['medium',1280,84],['large',1600,88]]){
      let width=edge,height=Math.round(edge*1.5),entry;
      for(let attempt=0;attempt<6;attempt++){
       const resized=await sharp(source,{limitInputPixels:50000000}).rotate().resize({width,height,fit:'inside',withoutEnlargement:true}).flatten({background:'#f1f2ed'}).raw().toBuffer({resolveWithObject:true});
       const image=()=>sharp(resized.data,{raw:{width:resized.info.width,height:resized.info.height,channels:resized.info.channels}});
       const q=attempt===0?quality:Math.max(78,quality-6);
       const clean=await image().webp({quality:q,smartSubsample:true,effort:5}).toBuffer();
       const marked=await image().composite([{input:watermarkSvg(resized.info.width,resized.info.height)}]).webp({quality:q,smartSubsample:true,effort:5}).toBuffer();
       entry={version:DISPLAY_IMAGE_VERSION,width:resized.info.width,height:resized.info.height,clean:`data:image/webp;base64,${clean.toString('base64')}`,marked:`data:image/webp;base64,${marked.toString('base64')}`};
       const length=JSON.stringify(entry).length;
       if(length<=950000)break;
       if(attempt===5)throw Error('Fotoja nuk mund te pergatitet. Provoni perseri.');
       if(attempt>0){const factor=Math.min(.9,Math.max(.5,Math.sqrt(900000/length)*.94));width=Math.max(1,Math.round(resized.info.width*factor));height=Math.max(1,Math.round(resized.info.height*factor));}
      }
      result[label]=entry;
     }
     displayCache.set(path,{set:result,at:Date.now()});if(displayCache.size>16)displayCache.delete(displayCache.keys().next().value);
     return result;
    });
    displayTasks.set(path,task);task.finally(()=>{if(displayTasks.get(path)===task)displayTasks.delete(path);}).catch(()=>{});
   }
   set=await task;
  }
  if(persist)for(const label of ['thumb','medium','large'])await repo.write(recordPath(label),set[label]);
  record=set[size];
 }
 const data=record[free?'clean':'marked'];
 return {data,bytes:Buffer.from(data.split(',')[1],'base64'),mime:data.startsWith('data:image/webp')?'image/webp':'image/jpeg'};
}
