import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {CREATOR_LIVE_WINDOW_MS,creatorOverview,creatorBusinessMatches,creatorBusinessStatus,creatorFollowups,creatorInPeriod} from '../shared/creator-analytics.js';
import {shopAction} from '../server/content-creator-shop.js';
import {serveCreatorShop} from '../api/content-creator-shop.js';
import {renderContentCreator} from '../apps/mnyra-heart/heart-content-creator-render.js';
import {renderHeartApp} from '../apps/mnyra-heart/heart-render.js';
import {LIVE_FENSTER_MS,istGeradeAktiv} from '../apps/mnyra-heart/heart-lifeskin-live.js';
import {createHeartInitialState} from '../apps/mnyra-heart/heart-state.js';
const pageId='a'.repeat(32),visitorId='b'.repeat(32),cartId='c'.repeat(32),orderId='d'.repeat(32);
function fixture(){
 const page={id:pageId,published:true,kind:'shop',name:'Cafe',photoIds:['one'],products:[{id:'pack',title:'Paket',imageIds:['one'],priceCents:2900}]};
 const docs=new Map([[`contentCreatorPages/${pageId}`,page],[`contentCreatorPages/${pageId}/originals/one`,{parts:1}]]);
 const repo={read:async key=>docs.get(key),write:async(key,data,create=false)=>{if(create&&docs.has(key))return false;docs.set(key,{...docs.get(key),...structuredClone(data)});return true;},notify:async()=>true};return {page,docs,repo};
}
test('Vienna day boundaries, returning visitors, live expiry and totals share consistent definitions',()=>{
 const now=Date.parse('2026-10-31T23:30:00Z'); // November 1 in Vienna
 assert.equal(creatorInPeriod('2026-10-31T23:10:00Z','today',now),true);
 assert.equal(creatorInPeriod('2026-10-31T22:59:59Z','today',now),false);
 assert.equal(creatorInPeriod('2026-10-31T22:59:59Z','yesterday',now),true);
 assert.equal(creatorInPeriod('2026-10-26T14:00:00Z','7',now),true);
 const visits=[{visitorId,pageId,days:['2026-10-31','2026-11-01'],updatedAt:now-30000,stage:'cart'},
 {visitorId,pageId:'other',days:['2026-11-01'],updatedAt:now-120000,stage:'page'},
 {visitorId:'offline',updatedAt:now,stage:'checkout',online:false}];
 const stats=creatorOverview({visits,orders:[{createdAt:now,totalCents:2900},{createdAt:now,totalCents:9900,status:'cancelled'},{createdAt:now-86400000,totalCents:5000}]},now);
 assert.deepEqual(stats,{live:3,visitors:1,orders:1,value:2900,stages:[1,2,0]});
});
test('Archive, real customers and explicit Ready transitions route businesses correctly',()=>{
 const page={id:pageId,workflow:'working'};assert.equal(creatorBusinessStatus(page),'working');
 const visits=[{pageId,opened:true,updatedAt:'2026-10-30T10:00:00Z'}];
 assert.equal(creatorBusinessStatus(page,visits),'working');
 assert.equal(creatorBusinessStatus({...page,workflow:'ready'},visits),'working');
 assert.equal(creatorBusinessStatus({...page,workflow:'ready',workflowAt:'2026-10-29T10:00:00Z'},visits),'seen');
 assert.equal(creatorBusinessStatus({...page,workflow:'ready',workflowAt:'2026-10-31T10:00:00Z'},visits),'ready');
 assert.equal(creatorBusinessStatus(page,visits,[{pageId}]),'customer');
 assert.equal(creatorBusinessStatus({...page,workflow:'archived'},visits,[{pageId}]),'archived');
});
test('Visit endpoint validates public membership, bounds journeys, preserves answers and never returns customer data',async()=>{
 const {repo,docs}=fixture();const input={op:'visit',pageId,visitorId,event:'photo',file:'one',productId:'pack',stage:'page'};
 for(let i=0;i<105;i++)await shopAction(input,repo);
 const path=`contentCreatorVisits/${pageId}_${visitorId}`;
 assert.equal(docs.get(path).events.length,100);assert.equal(docs.get(path).events[0].file,'one');
 await shopAction({...input,event:'yes'},repo);await shopAction({...input,event:'no'},repo);
 const opened=await shopAction({...input,event:'open'},repo);assert.equal(opened.answer,'yes');assert.equal(opened.customer,undefined);
 await shopAction({...input,file:'secret',productId:'foreign'},repo);assert.equal(docs.get(path).events.at(-1).file,undefined);
 await assert.rejects(shopAction({...input,visitorId:'../secret'},repo));
 docs.get(`contentCreatorPages/${pageId}`).published=false;await assert.rejects(shopAction(input,repo));
});
test('Checkout drafts feed follow-up; an idempotent order repairs conversion and blocks stale cart reopening',async()=>{
 const {repo,docs}=fixture();await shopAction({op:'cart',pageId,cartId,ids:['pack'],visitorId},repo);
 await shopAction({op:'checkout',pageId,cartId,customer:{name:'Test',phone:'+38344123456',address:'Street 1'}},repo);
 let cart=docs.get(`contentCreatorCarts/${cartId}`);assert.equal(cart.customer.name,'Test');assert.ok(cart.checkoutAt);
 const input={op:'order',pageId,cartId,orderId,visitorId,ids:['pack'],expectedTotalCents:2900,customer:{name:'Test User',phone:'+38344123456',address:'Street 1',country:'Kosovo'}};
 const order=await shopAction(input,repo);assert.equal(order.id,orderId);
 docs.get(`contentCreatorCarts/${cartId}`).status='active';await shopAction(input,repo);assert.equal(docs.get(`contentCreatorCarts/${cartId}`).status,'ordered');
 await shopAction({op:'cart',pageId,cartId,ids:['pack']},repo);assert.equal(docs.get(`contentCreatorCarts/${cartId}`).status,'ordered');
 assert.equal(creatorFollowups({carts:[{...cart,id:cartId}],orders:[{cartId}]}).length,0);
});
test('HTTP receipt is returned while push delivery remains pending',async()=>{
 const {repo,docs}=fixture();let release,started=false;
 repo.notify=()=>{started=true;return new Promise(resolve=>{release=resolve;});};
 const res={setHeader(){},end(body){this.body=JSON.parse(body);}};
 await serveCreatorShop({method:'POST',url:'/api/content-creator-shop',body:{op:'order',pageId,cartId,orderId,ids:['pack'],expectedTotalCents:2900,customer:{name:'Test User',phone:'+38344123456',address:'Street 1',country:'Kosovo'}}},res,async()=>repo);
 assert.equal(res.statusCode,200);assert.equal(res.body.id,orderId);assert.equal(started,true);assert.equal(docs.get(`contentCreatorOrders/${orderId}`).notificationPending,true);release(true);
});
test('Creator detail has ordered cards, one package editor and no duplicate caption grid',()=>{
 const {page}=fixture();const html=renderContentCreator({pages:[page],selectedId:pageId,visits:[]});
 assert.ok(html.indexOf('cc-business-name')<html.indexOf('cc-package-stage'));assert.ok(html.indexOf('cc-package-stage')<html.indexOf('Bestellungen'));assert.ok(html.indexOf('Bestellungen')<html.indexOf('Titelbilder'));
 const {document}=parseHTML(html);assert.equal(document.querySelectorAll('[data-cc-package]').length,1);assert.equal(document.querySelectorAll('[data-edit-caption]').length,0);assert.ok(document.querySelector('[data-cc-action="new-package"]'));assert.match(html,/Klickpfad/);
});
test('Live rerender retains package values, open editors and horizontal photo position',()=>{
 const {document}=parseHTML('<div id="app"></div>'),root=document.querySelector('#app'),state=createHeartInitialState(),{page}=fixture();
 state.auth={status:'authenticated',access:{allowed:true},user:{uid:'test'}};state.shell.activeView='contentCreator';
 state.contentCreator={...state.contentCreator,pages:[page],selectedId:pageId,orders:[],visits:[]};
 renderHeartApp(root,state,{});const input=root.querySelector('#cc-title-pack');input.value='Unsaved';
 root.querySelector('[data-cc-fold="package-pack"]').open=true;root.querySelector('[data-cc-track="cover-pack"]').scrollLeft=180;
 state.contentCreator.notice='Aktualisiert';renderHeartApp(root,state,{});
 assert.equal(root.querySelector('#cc-title-pack').value,'Unsaved');assert.equal(root.querySelector('[data-cc-fold="package-pack"]').open,true);assert.equal(root.querySelector('[data-cc-track="cover-pack"]').scrollLeft,180);
});

test('Approved chips reuse LifeSkin four-column pages and actual settings icon',()=>{
 const {page}=fixture();const {document}=parseHTML(renderContentCreator({pages:[page],visits:[]}));
 const heading=document.querySelector('.cc-businesses .cc-card-head');
 assert.equal(heading.querySelector('h3').textContent,'Bizneset');assert.equal(heading.querySelector('.cc-count').textContent,'1');
 assert.equal(document.querySelector('.cc-business-chips .heart-shopchip-page').children.length,4);
 assert.ok(heading.querySelector('[data-cc-action="settings"] svg.heart-faelle-zahnrad__icon'));
 assert.equal(document.querySelectorAll('.cc-metric').length,4);
});
test('Package drafts remain intact through minimisation, live refresh and expansion',()=>{
 const {document}=parseHTML('<div id="app"></div>'),root=document.querySelector('#app'),state=createHeartInitialState(),{page}=fixture();
 state.auth={status:'authenticated',access:{allowed:true},user:{uid:'test'}};state.shell.activeView='contentCreator';
 state.contentCreator={...state.contentCreator,pages:[page],selectedId:pageId,orders:[],visits:[]};
 renderHeartApp(root,state,{});root.querySelector('#cc-title-pack').value='Draft survives';
 state.contentCreator.collapsedCards={'package-pack':true};renderHeartApp(root,state,{});
 state.contentCreator.notice='Heartbeat';renderHeartApp(root,state,{});
 state.contentCreator.collapsedCards={'package-pack':false};renderHeartApp(root,state,{});
 assert.equal(root.querySelector('#cc-title-pack').value,'Draft survives');
});

test('Businesses stay Working until Ready, including missing workflows and real visits',()=>{
 const visits=[{pageId,opened:true,scrolled:true,updatedAt:'2026-10-31T12:00:00Z'}];
 for(const workflow of [undefined,'working','draft','unknown','ready','sent']){
  const page={id:pageId,name:'Draft',published:true,workflow,photoIds:['one']};
  assert.equal(creatorBusinessStatus(page,visits),'working');
 }
 assert.equal(creatorBusinessStatus({id:pageId,workflow:'ready',workflowAt:'2026-10-31T13:00:00Z'},visits),'ready');
 assert.equal(creatorBusinessStatus({id:pageId,workflow:'sent',workflowAt:'2026-10-31T11:00:00Z'},visits),'seen');
});
test('Package cards share one two-column grid while the business heading stays outside it',()=>{
 const {page}=fixture();page.photoIds=['one','two'];page.products.push({id:'second',title:'Second',imageIds:['two'],priceCents:350});
 const {document}=parseHTML(renderContentCreator({pages:[page],selectedId:pageId,visits:[]}));
 const grid=document.querySelector('.cc-package-grid');
 assert.equal(grid.children.length,2);assert.ok([...grid.children].every(node=>node.matches('.cc-package-card')));
 assert.equal(grid.querySelector('.cc-business-name'),null);
 assert.equal(grid.querySelector('.cc-package-price>span').textContent,'1 Bild');
 assert.deepEqual([...document.querySelector('.cc-business-name').querySelectorAll('h2')].map(node=>node.textContent),['Cafe']);
});


test('Every Creator live stage uses the same three-minute boundaries as LifeSkin',()=>{
 const now=Date.parse('2026-10-31T12:00:00Z');assert.equal(CREATOR_LIVE_WINDOW_MS,LIVE_FENSTER_MS);
 for(const stage of ['page','cart','checkout','ordered'])for(const age of [-60001,-60000,0,90000,179999,180000,180001]){
  const updatedAt=new Date(now-age).toISOString(),expected=istGeradeAktiv({updatedAt},now);
  for(const online of [true,false]){
   const result=creatorOverview({visits:[{stage,updatedAt,online}]},now);
   assert.equal(result.live,Number(expected),`${stage}, age ${age}, online ${online}`);
   assert.equal(result.stages.reduce((sum,n)=>sum+n,0),result.live);
  }
 }
});

test('Cash counts completed orders and expires from purchase time despite fresh heartbeats',()=>{
 const now=Date.parse('2026-10-31T12:00:00Z');
 const visit=(stage,age)=>({pageId,visitorId,stage,updatedAt:now,events:[{event:'order',at:now-age}]});
 assert.deepEqual(creatorOverview({visits:[visit('page',0),visit('cart',0),visit('checkout',0),visit('ordered',180000)]},now).stages,[1,2,1]);
 assert.equal(creatorOverview({visits:[visit('ordered',180001)]},now).live,0);
});

test('Legacy auto-Ready and Sended businesses remain Working until manual Ready timestamp exists',()=>{
 const pages=[{id:'draft',workflow:'working'},{id:'old-ready',workflow:'ready'},{id:'old-sent',workflow:'sent',sentAt:'2026-10-30T10:00:00Z'},{id:'manual',workflow:'ready',workflowAt:'2026-10-31T10:00:00Z'}];
 const visits=pages.map(page=>({pageId:page.id,opened:true,updatedAt:'2026-10-30T12:00:00Z'}));
 const state={pages,visits,orders:[],filter:'working'};
 assert.deepEqual(pages.filter(page=>creatorBusinessMatches(page,state)).map(page=>page.id),['draft','old-ready','old-sent']);
 assert.equal(creatorBusinessStatus({...pages[1],workflowAt:'invalid'},visits),'working');
 const {document}=parseHTML(renderContentCreator(state));
 const chip=document.querySelector('[data-cc-action="filter"][data-key="working"]');assert.match(chip.textContent,/Working3/);
});
