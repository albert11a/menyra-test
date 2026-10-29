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
