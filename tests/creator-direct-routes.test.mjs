import test from 'node:test';
import assert from 'node:assert/strict';
import {creatorDirectPath} from '../shared/creator-direct-routes.js';
import {checkCreatorDirectRoutes} from '../scripts/check-creator-direct-routes.mjs';
import {serveContentCreator} from '../api/content-creator.js';
const id='a'.repeat(32),routes={'bistro-one':id};
const config={rewrites:[{source:'/bistro-one',destination:`/api/content-creator?id=${id}`},{source:'/:landingSlug',destination:'/social.html'}]};
test('Only registered customer IDs get a name route',()=>{
 assert.equal(creatorDirectPath(id,routes),'/bistro-one');
 assert.equal(creatorDirectPath('b'.repeat(32),routes),'');
 checkCreatorDirectRoutes(config,routes);
});
test('Build rejects reserved names, redirects, missing or shadowed rewrites',()=>{
 assert.throws(()=>checkCreatorDirectRoutes(config,{heart:id}));
 assert.throws(()=>checkCreatorDirectRoutes({rewrites:[]},routes));
 assert.throws(()=>checkCreatorDirectRoutes({...config,rewrites:[...config.rewrites].reverse()},routes));
 assert.throws(()=>checkCreatorDirectRoutes({...config,redirects:[{source:'/bistro-one',destination:'/other'}]},routes));
});
test('Rewritten cold name request uses one original page read and returns HTML without Location',async()=>{
 const reads=[],headers={};let html;
 const res={setHeader:(key,value)=>headers[key]=value,end:body=>{html=body;}};
 await serveContentCreator({method:'GET',url:'/bistro-one',query:{id}},res,{
  read:async path=>{reads.push(path);return {name:'Bistro One',published:true,photoIds:[]};},
  shell:'<html><head><title>Page</title></head><body><main id="content-app"></main></body></html>'
 });
 assert.equal(res.statusCode,200);assert.equal(headers.Location,undefined);
 assert.deepEqual(reads,[`contentCreatorPages/${id}`]);
 assert.match(html,new RegExp(`"id":"${id}"`));
});
