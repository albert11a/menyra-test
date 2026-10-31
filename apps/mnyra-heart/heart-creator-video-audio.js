// Resume during the administrator's tap, before asynchronous upload work.
// The graph records into a MediaStreamDestination, never the speakers.
let context;
export function unlockCreatorVideoAudio(){
 const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
 if(!Audio)return;
 context ||= new Audio();
 void context.resume().catch(()=>{});
}
export function creatorVideoAudioContext(){return context;}
