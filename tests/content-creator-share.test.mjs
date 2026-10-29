import test from 'node:test';
import assert from 'node:assert/strict';
import {serveContentCreator} from '../api/content-creator.js';
const id='a'.repeat(32);
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=body;}};}
test('Link preview includes last image and escaped locale name without recording a visit',async()=>{
 const paths=[],res=response();
 await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}`},res,{read:async path=>{paths.push(path);return {published:true,name:'Bistro <One>',photoIds:['first','last']};},shell:'<html><head><title>Default</title></head><body></body></html>'});
 assert.equal(res.statusCode,200);assert.match(res.body,/og:image/);assert.match(res.body,/photo=last/);assert.match(res.body,/Bistro &lt;One&gt;/);assert.equal(paths.length,1);
});
test('Social image endpoint serves the last photo, never the profile logo',async()=>{
 const paths=[],res=response();
 await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}&image=1`},res,{read:async path=>{paths.push(path);return path.includes('/images/')?{data:'data:image/jpeg;base64,YWJj'}:{published:true,photoIds:['first','last'],avatar:'logo'};}});
 assert.equal(res.headers['Content-Type'],'image/jpeg');assert.equal(res.body.toString(),'abc');assert.match(paths[1],/images\/last$/);
});
test('Drafts cannot be shared or read through the image endpoint',async()=>{
 for(const image of ['', '&image=1']){const res=response();await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}${image}`},res,{read:async()=>({published:false})});assert.equal(res.statusCode,404);}
});
