import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import ffmpeg from 'ffmpeg-static';
import {creatorVideoCompressionArgs,encodeCreatorWebVideo,optimizeCreatorVideo} from '../server/creator-video-optimize.js';
import {serveCreatorVideoOptimize} from '../api/content-creator-video-optimize.js';
import {CREATOR_MEDIA_ORIGIN} from '../shared/creator-media.js';
import {MEDIA_TICKET_ENDPOINT} from '../shared/bunny-edge.js';
const source=CREATOR_MEDIA_ORIGIN+'/media/stories/owner/source.mp4';
function harness({saving=true,uploadFailure=false,oversized=false}={}){
 const calls=[];let encoded=0;
 const fetchFn=async(url,options)=>{
  calls.push({url,options});
  if(url===MEDIA_TICKET_ENDPOINT){assert.equal(options.headers.Authorization,'Bearer TOKEN');assert.deepEqual(JSON.parse(options.body),{action:'story_upload',restaurantId:'owner'});return Response.json({ticket:'TICKET'});}
  if(url===source)return new Response(Buffer.alloc(1000,3),{headers:{'content-type':'video/mp4',...(oversized?{'content-length':String(49*1024*1024)}:{})}});
  assert.equal(url,CREATOR_MEDIA_ORIGIN+'/story/upload');assert.equal(options.headers.Authorization,'Bearer TICKET');assert.equal(options.body.get('restaurantId'),'owner');assert.equal(options.body.get('file').type,'video/mp4');
  return uploadFailure?Response.json({error:'denied'},{status:403}):Response.json({url:CREATOR_MEDIA_ORIGIN+'/media/stories/owner/web.mp4'});
 };
 return {calls,options:{fetchFn,encode:async bytes=>{assert.equal(bytes.length,1000);encoded++;return Buffer.alloc(saving?400:990);}},get encoded(){return encoded;}};
}
test('Optimizer publishes a smaller R2 derivative with a fresh upload ticket, never private originals',async()=>{
 const h=harness(),r=await optimizeCreatorVideo({video:source,owner:'owner'},'TOKEN',h.options);
 assert.deepEqual(r,{video:CREATOR_MEDIA_ORIGIN+'/media/stories/owner/web.mp4',webVideoVersion:1,videoBytes:400,videoSourceBytes:1000});
 assert.deepEqual(h.calls.map(c=>c.url),[MEDIA_TICKET_ENDPOINT,source,MEDIA_TICKET_ENDPOINT,CREATOR_MEDIA_ORIGIN+'/story/upload']);assert.equal(h.encoded,1);
});
test('No worthwhile saving keeps the old URL and records a completed attempt without another upload',async()=>{
 const h=harness({saving:false});const r=await optimizeCreatorVideo({video:source,owner:'owner'},'TOKEN',h.options);
 assert.equal(r.video,source);assert.equal(r.webVideoVersion,1);assert.equal(h.calls.length,2);
});
test('Untrusted, query-bearing, other-owner and non-video inputs are rejected before network/CPU work',async()=>{
 for(const video of ['https://evil.invalid/movie.mp4',source+'?x=1',source.replace('/owner/','/other/'),CREATOR_MEDIA_ORIGIN+'/media/social/owner/a.jpg']){
  const h=harness();await assert.rejects(optimizeCreatorVideo({video,owner:'owner'},'TOKEN',h.options),/Ungültige/);assert.equal(h.calls.length,0);
 }
});
test('Oversized and rejected upload responses never yield a publishable replacement',async()=>{
 const h=harness({oversized:true});await assert.rejects(optimizeCreatorVideo({video:source,owner:'owner'},'TOKEN',h.options),/zu groß/);assert.equal(h.encoded,0);
 const failed=harness({uploadFailure:true});await assert.rejects(optimizeCreatorVideo({video:source,owner:'owner'},'TOKEN',failed.options),/gespeichert/);
});
test('Denied ownership prevents reading or encoding the video',async()=>{
 let calls=0;await assert.rejects(optimizeCreatorVideo({video:source,owner:'owner'},'TOKEN',{fetchFn:async()=>{calls++;return Response.json({error:'no'},{status:403});},encode:()=>assert.fail('must not encode')}),/freigegeben/);assert.equal(calls,1);
});
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=body;}};}
test('API requires POST and CEO authorization before invoking encoder',async()=>{
 let calls=0;const deps={authorize:async()=>false,optimize:()=>{calls++;}};
 const get=response();await serveCreatorVideoOptimize({method:'GET'},get,deps);assert.equal(get.statusCode,405);
 const denied=response();await serveCreatorVideoOptimize({method:'POST'},denied,deps);assert.equal(denied.statusCode,403);assert.equal(calls,0);
 const ok=response();await serveCreatorVideoOptimize({method:'POST',headers:{authorization:'Bearer token'},body:{video:source,owner:'owner'}},ok,{authorize:async()=>true,optimize:async(input,token)=>{assert.equal(token,'token');assert.equal(input.video,source);return {video:source};}});assert.equal(ok.statusCode,200);assert.equal(ok.headers['Cache-Control'],'no-store');
});
test('Real packaged encoder preserves synthetic video dimensions and sound and writes MP4 startup metadata first',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'creator-encode-test-'));
 try{
  const input=join(directory,'fixture.mp4');
  await promisify(execFile)(ffmpeg,['-nostdin','-y','-v','error','-f','lavfi','-i','testsrc2=size=320x480:rate=30','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','1','-c:v','libx264','-threads','2','-c:a','aac',input]);
  const output=await encodeCreatorWebVideo(await readFile(input));assert.ok(output.length>1000);
  const moov=output.indexOf(Buffer.from('moov')),mdat=output.indexOf(Buffer.from('mdat'));assert.ok(moov>0&&moov<mdat);
  const {writeFile}=await import('node:fs/promises');const file=join(directory,'result.mp4');await writeFile(file,output);
  const check=await promisify(execFile)(ffmpeg,['-v','info','-i',file,'-f','null','-']);
  assert.match(check.stderr,/Video: h264.*320x480/);assert.match(check.stderr,/Audio: aac/);
  const args=creatorVideoCompressionArgs('in','out');assert.ok(!args.includes('-vf')&&!args.includes('-s')&&!args.includes('-r'));
 }finally{await rm(directory,{recursive:true,force:true});}
});

test('Lowercase Worker key keeps the actual mixed-case restaurant ID for ticket authorization and upload',async()=>{
 const actual='MiXeD',video=CREATOR_MEDIA_ORIGIN+'/media/stories/mixed/source.mp4',calls=[];
 const fetchFn=async(url,options)=>{
  calls.push(url);
  if(url===MEDIA_TICKET_ENDPOINT){assert.equal(JSON.parse(options.body).restaurantId,actual);return Response.json({ticket:'TICKET'});}
  if(url===video)return new Response(Buffer.alloc(1000),{headers:{'content-type':'video/mp4'}});
  assert.equal(options.body.get('restaurantId'),actual);
  return Response.json({url:CREATOR_MEDIA_ORIGIN+'/media/stories/mixed/optimized.mp4'});
 };
 const result=await optimizeCreatorVideo({video,owner:actual},'TOKEN',{fetchFn,encode:async()=>Buffer.alloc(400)});
 assert.equal(result.video,CREATOR_MEDIA_ORIGIN+'/media/stories/mixed/optimized.mp4');assert.equal(calls.length,4);
});
