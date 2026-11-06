export function moveCreatorPhoto(files, from, to) {
 const next=[...files];
 next.splice(to,0,next.splice(from,1)[0]);
 return next;
}

export function bindCreatorPhotoOrder(root, save) {
 let drag;
 const figures=track=>[...track.querySelectorAll(':scope > [data-cc-sort-file]')];
 function finish(event, commit) {
  if(!drag||event.pointerId!==drag.pointer)return;
  const {track,handle,files,from,to,card,ghost}=drag;
  drag=null;
  if(handle.hasPointerCapture?.(event.pointerId))handle.releasePointerCapture(event.pointerId);
  track.classList.remove('cc-sorting');
  card.classList.remove('cc-sort-source');
  ghost?.remove();
  track.querySelector('.cc-sort-target')?.classList.remove('cc-sort-target');
  if(commit&&from!==to&&root.contains(track))void save(track,files,moveCreatorPhoto(files,from,to));
 }
 root.addEventListener('pointerdown',event=>{
  const handle=event.target.closest('[data-cc-drag-photo]');
  if(!handle||handle.disabled||event.button!==0||drag)return;
  const track=handle.closest('[data-cc-sort]'),cards=figures(track);
  const from=cards.indexOf(handle.closest('figure'));
  if(from<0)return;
  drag={track,handle,card:cards[from],pointer:event.pointerId,files:cards.map(card=>card.dataset.ccSortFile),from,to:from,x:event.clientX,y:event.clientY};
  handle.setPointerCapture?.(event.pointerId);
  track.classList.add('cc-sorting');
 });
 root.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.pointer)return;
  const doc=root.ownerDocument,track=drag.track,win=doc.defaultView;
  if(!root.contains(track)){finish(event,false);return;}
  if(!drag.ghost&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>5){
   const original=drag.card.querySelector('img');
   if(original?.currentSrc){
    const ghost=doc.createElement('img');
    ghost.className='cc-sort-ghost';ghost.src=original.currentSrc;ghost.alt='';
    ghost.setAttribute('aria-hidden','true');
    doc.body.append(ghost);drag.ghost=ghost;
   }
   drag.card.classList.add('cc-sort-source');
  }
  if(drag.ghost)drag.ghost.style.transform=`translate(${event.clientX+12}px,${event.clientY+12}px)`;
  if(event.clientY>win.innerHeight-70)win.scrollBy(0,20);
  if(event.clientY<70)win.scrollBy(0,-20);
  const target=doc.elementFromPoint(event.clientX,event.clientY)?.closest('[data-cc-sort-file]');
  if(!target||target.parentElement!==track)return;
  drag.to=figures(track).indexOf(target);
  track.querySelector('.cc-sort-target')?.classList.remove('cc-sort-target');
  target.classList.toggle('cc-sort-target',drag.to!==drag.from);
 });
 root.addEventListener('pointerup',event=>finish(event,true));
 root.addEventListener('pointercancel',event=>finish(event,false));
 root.addEventListener('lostpointercapture',event=>finish(event,false));
 root.addEventListener('click',event=>{
  const button=event.target.closest('[data-cc-sort-step],[data-cc-sort-retry]');
  if(!button||button.disabled)return;
  const track=button.closest('[data-cc-package]')?.querySelector('[data-cc-sort]');
  if(!track)return;
  if(button.hasAttribute('data-cc-sort-retry')){void save(track);return;}
  const cards=figures(track),from=cards.indexOf(button.closest('figure')),to=from+Number(button.dataset.ccSortStep);
  if(from<0||to<0||to>=cards.length)return;
  const files=cards.map(card=>card.dataset.ccSortFile);
  void save(track,files,moveCreatorPhoto(files,from,to));
 });
}
