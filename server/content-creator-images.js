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
export const DISPLAY_IMAGE_VERSION = 2;
export function displaySize(value) { return ['thumb','medium','large'].includes(value) ? value : 'thumb'; }
export function displayReadFields(size) { return ['displayPreview.version',`displayPreview.${displaySize(size)}`,'name','mime','size','parts']; }
function validDisplay(set, size) {
  return set?.version === DISPLAY_IMAGE_VERSION && ['clean','marked'].every(mode => /^data:image\/(?:webp|jpeg);base64,[A-Za-z0-9+/=]+$/.test(set[size]?.[mode] || ''));
}
function watermarkSvg(width,height) {
  const font=Math.max(7,width/42),stepX=font*13.5,stepY=font*4.7,radius=Math.ceil(Math.hypot(width,height));
  let words='';
  for(let y=-radius;y<radius;y+=stepY)for(let x=-radius;x<radius;x+=stepX)words+=`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}">MNYRA · PREVIEW</text>`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g transform="translate(${width/2} ${height/2}) rotate(-20)" font-family="Arial,sans-serif" font-size="${font}" font-weight="400" fill="white" fill-opacity=".12">${words}</g></svg>`);
}
export async function creatorDisplayImage(path, metadata, repo, {size='thumb', free=false, persist=false}={}) {
  size=displaySize(size);
  let set=metadata?.displayPreview;
  if(!validDisplay(set,size)) {
    const cached=displayCache.get(path);
    if(cached && Date.now()-cached.at<120000) set=cached.set;
    else {
      let task=displayTasks.get(path);
      if(!task){
        task=displayLimited(async()=>{
          const full=metadata?.cleanPreview ? metadata : await repo.read(path,['cleanPreview','name','mime','size','parts']);
          if(!full)throw Error('Fotoja nuk u gjet.');
          const clean=await optimizedShopImage(path,full,repo);
          const source=Buffer.from(clean.data.split(',')[1],'base64');
          const {default:sharp}=await import('sharp');
          const result={version:DISPLAY_IMAGE_VERSION};
          for(const [label,edge,quality] of [['thumb',360,54],['medium',720,66],['large',1080,76]]){
            const resized=await sharp(source,{limitInputPixels:50000000}).rotate().resize({width:edge,height:Math.round(edge*1.5),fit:'inside',withoutEnlargement:true}).flatten({background:'#f1f2ed'}).toBuffer({resolveWithObject:true});
            const cleanBytes=await sharp(resized.data).webp({quality,effort:3}).toBuffer();
            const markedBytes=await sharp(resized.data).composite([{input:watermarkSvg(resized.info.width,resized.info.height)}]).webp({quality,effort:3}).toBuffer();
            result[label]={clean:`data:image/webp;base64,${cleanBytes.toString('base64')}`,marked:`data:image/webp;base64,${markedBytes.toString('base64')}`};
          }
          if(JSON.stringify(result).length>400000)throw Error('Fotoja është tepër e madhe për pamjen paraprake.');
          displayCache.set(path,{set:result,at:Date.now()});
          if(displayCache.size>48)displayCache.delete(displayCache.keys().next().value);
          return result;
        });
        displayTasks.set(path,task);
        task.finally(()=>{if(displayTasks.get(path)===task)displayTasks.delete(path);}).catch(()=>{});
      }
      set=await task;
    }
  }
  if(persist&&!validDisplay(metadata?.displayPreview,size))await repo.write(path,{displayPreview:set});
  const data=set[size][free?'clean':'marked'];
  return {data,bytes:Buffer.from(data.split(',')[1],'base64'),mime:data.startsWith('data:image/webp')?'image/webp':'image/jpeg'};
}
