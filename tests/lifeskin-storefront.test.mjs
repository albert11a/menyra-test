import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { storefrontProducts, catalogCart, safeProductImage } from '../shared/lifeskin-storefront.js';
import { productCard, productDetail } from '../apps/lifeskin-shop/storefront.js';
import { renderShopVerwaltung, renderLifeskin } from '../apps/mnyra-heart/heart-lifeskin-render.js';

globalThis.__LIFESKIN_TEST__ = true;
const { Dyqan, bestellZeilen, summe, korbLesen, korbSchreiben } = await import('../apps/lifeskin-shop/shop.js');
const record = (extra = {}) => ({ id: 'lf-moistur', name: 'LF MOISTUR', einzelpreis: 17.95, availability: 'visible', photoRef: 'data:image/jpeg;base64,AAAA', ...extra });

test('catalog uses authoritative Heart prices, new products, visibility and editable text', () => {
  const products = storefrontProducts([record(), record({ id: 'new-serum', name: 'Serum i ri', beschreibung: { sq: 'Teksti i ri' }, einzelpreis: 22.5 }), record({ id:'hidden', availability:'hidden' }), record({ id:'invalid', einzelpreis:'NaN' }), record({ id:'zero', einzelpreis:0 })]);
  assert.equal(products.length, 2);
  assert.equal(products.find(p => p.id === 'lf-moistur').price, 17.95);
  assert.equal(products.find(p => p.id === 'new-serum').description, 'Teksti i ri');
  assert.equal(storefrontProducts([record(), record()]).length, 1);
});

test('catalog cart restores current prices and rejects unavailable products; order lines match total', () => {
  const products = storefrontProducts([record(), record({ id:'custom', einzelpreis:12.2 })]);
  const cart = catalogCart(['lf-moistur','custom','custom'], products);
  assert.equal(cart.cmimi, 30.15);
  assert.equal(summe(cart), 30.15);
  assert.deepEqual(bestellZeilen(cart, []), cart.lines);
  assert.equal(Math.round(bestellZeilen(cart, []).reduce((n, p) => n + p.cmimi * p.sasia, 0) * 100) / 100, summe(cart));
  let saved;
  korbSchreiben({ setItem(_, value) { saved = value; } }, { ...cart, cmimi:1 });
  assert.equal(saved.includes('cmimi'), false);
  const restored = korbLesen({ getItem: () => saved });
  assert.equal(catalogCart(restored.ids, products).cmimi, 30.15);
  assert.equal(catalogCart(restored.ids, products.slice(0,1)), null);
});

test('the existing shop engine buys a catalog product through its normal checkout with exact price', () => {
  const events = [], saved = [];
  const doc = { querySelector: () => null };
  const shop = new Dyqan({ dokument:doc, speicher:null, dauerSpeicher:null, trichter: () => ({ pixel: { meldeKorb:value => events.push(value) }, sitzung:{ ergaenze:patch => saved.push(patch) } }) });
  shop.catalogProducts = storefrontProducts([record()]);
  shop.kasseOeffnen = () => { shop.opened = true; };
  assert.equal(shop.catalogLegen(['lf-moistur']), false);
  shop.catalogReady = true;
  assert.equal(shop.catalogLegen(['lf-moistur']), true);
  assert.equal(shop.opened, true);
  assert.equal(shop.korb.cmimi, 17.95);
  assert.deepEqual(events, [17.95]);
  assert.deepEqual(bestellZeilen(shop.korb, []), [{ id:'lf-moistur', name:'LF MOISTUR', cmimi:17.95, sasia:1 }]);
  assert.equal(shop.catalogLegen(['missing']), false);
  assert.ok(saved.some(p => p.korbWert === 17.95));
});

test('restored catalog carts cannot open checkout or submit before live catalog data is ready', async () => {
  const queries = [];
  const doc = { querySelector:selector => { queries.push(selector); return null; } };
  const shop = new Dyqan({ dokument:doc, speicher:{ getItem: () => JSON.stringify({ ids:['lf-moistur'], set:'catalog', cmimi:1 }), setItem() {} }, dauerSpeicher:null, trichter: () => null });
  shop.angebotBereit = true;
  shop.kasseOeffnen();
  assert.ok(!queries.includes('#kasa'));
  await shop.bestellen();
  assert.ok(!queries.includes('#kasa-dergo'));
});

test('catalog cards escape content, reject unsafe image URLs and show only verified ingredients', () => {
  const p = storefrontProducts([record({ name:'<img onerror="bad()">', perberesit:[{ emri:'unverified' }] })])[0];
  assert.equal(safeProductImage('javascript:alert(1)'), '');
  assert.equal(safeProductImage('/apps/../../photo.jpg'), '');
  assert.equal(safeProductImage('https://example.com/photo.jpg'), 'https://example.com/photo.jpg');
  assert.doesNotMatch(productCard(p), /<img onerror/);
  assert.doesNotMatch(productDetail(p), /unverified/);
  assert.match(productCard(p), /17,95 €/);
  const verified = storefrontProducts([record({ perberesitGeprueft:true, perberesit:[{ emri:'Glycerin' }] })])[0];
  assert.match(productDetail(verified), /Glycerin/);
});

test('Heart shop management exposes products and image controls directly and preserves product editors', () => {
  const state = { shopVerwaltung:true, produkte:[record()], kennzahlen:{}, trichter:[], sitzungen:[] };
  const html = renderLifeskin(state);
  assert.match(html, /Dein Shop\. Deine Produkte/);
  assert.match(html, /lifeskin-produkt-neu/);
  assert.match(html, /Shop ansehen/);
  assert.match(html, /lifeskin-produkt" data-id="lf-moistur"/);
  assert.doesNotMatch(html, /<summary>Mehr anzeigen/);
  const editor = renderLifeskin({ ...state, produktOffen:'lf-moistur' });
  assert.match(editor, /data-produktfeld="einzelpreis"/);
  assert.match(editor, /heartLifeskinFotoInput/);
  assert.match(editor, /lifeskin-produkt-zu/);
  assert.match(renderShopVerwaltung(), /Noch kein Produkt/);
});

test('only LIFESKIN domain roots are routed to the shop; mnyra root routing stays intact', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
  const rules = config.rewrites.filter(r => r.source === '/' && r.has?.some(h => h.type === 'host' && h.value.includes('lifeskin-ks')));
  assert.deepEqual(rules.map(r => r.has[0].value), ['lifeskin-ks.com','www.lifeskin-ks.com']);
  assert.ok(rules.every(r => r.destination === '/api/lifeskin-shop'));
  assert.ok(!config.rewrites.some(r => r.source === '/' && !r.has && r.destination === '/api/lifeskin-shop'));
  // Redirects run before rewrites: custom roots must never be sent to /feed.
  const rootRedirects = config.redirects.filter(r => r.source === '/');
  const matches = (rule, host) => (rule.has || []).every(h => h.type !== 'host' || h.value === host)
    && (rule.missing || []).every(h => h.type !== 'host' || h.value !== host);
  for (const host of ['lifeskin-ks.com', 'www.lifeskin-ks.com']) {
    assert.equal(rootRedirects.find(r => matches(r, host)), undefined);
  }
  for (const host of ['mnyra.com', 'www.mnyra.com', 'menyra-test.vercel.app']) {
    assert.equal(rootRedirects.find(r => matches(r, host))?.destination, '/feed');
  }
  assert.equal(rootRedirects.find(r => matches(r, 'ceo.mnyra.com'))?.destination, '/ceo');
  assert.equal(config.rewrites.find(r => r.source === '/lifeskin')?.destination, '/apps/lifeskin-landing/index.html');
});

test('multi-product cart preserves quantities, recomputes cents, removes lines and restores quantities without cached prices', async () => {
  const { changeCatalogQuantity } = await import('../shared/lifeskin-storefront.js');
  const products = storefrontProducts([record(), record({ id:'extra', einzelpreis:5.35 })]);
  let cart = changeCatalogQuantity({ ids:[], set:'catalog' }, 'lf-moistur', 2, products);
  cart = changeCatalogQuantity(cart, 'extra', 3, products);
  assert.equal(cart.cmimi, 51.95);
  assert.deepEqual(bestellZeilen(cart, []).map(p=>p.sasia), [2,3]);
  let value; korbSchreiben({setItem(_,v){value=v;}},cart);
  assert.ok(!JSON.parse(value).cmimi);
  const restored=korbLesen({getItem:()=>value});
  assert.equal(catalogCart(restored.ids,products,restored.mengen).cmimi,51.95);
  const changed=storefrontProducts([record({einzelpreis:20}),record({id:'extra',einzelpreis:5.35})]);
  assert.equal(catalogCart(restored.ids,changed,restored.mengen).cmimi,56.05);
  cart=changeCatalogQuantity(cart,'lf-moistur',0,products);
  assert.deepEqual(cart.ids,['extra']);assert.equal(cart.cmimi,16.05);
  cart=changeCatalogQuantity(cart,'extra',0,products);assert.equal(cart.cmimi,0);assert.deepEqual(cart.ids,[]);
});

test('large catalog supports category metadata, search, sorting and unavailable products', async () => {
  const {filterCatalog,changeCatalogQuantity}=await import('../shared/lifeskin-storefront.js');
  const records=Array.from({length:150},(_,i)=>record({id:`p-${i}`,name:`Product ${i}`,einzelpreis:i+1,shopKategorie:i%2?'spf':'trup'}));
  const products=storefrontProducts(records);
  assert.equal(products.length,150);
  assert.equal(filterCatalog(products,{category:'spf'}).length,75);
  assert.equal(filterCatalog(products,{search:'Product 149'}).length,1);
  assert.equal(filterCatalog(products,{sort:'price-down'})[0].price,150);
  const unavailable=storefrontProducts([record({availability:'soldout'})]);
  assert.equal(unavailable.length,1);assert.equal(catalogCart(['lf-moistur'],unavailable),null);
  assert.match(productCard(unavailable[0]),/Nuk ka ne stok/);
  assert.equal(changeCatalogQuantity(null,'missing',1,products),null);
});

test('real product pages preserve still mode and generate shareable product URLs', async () => {
  const {Storefront}=await import('../apps/lifeskin-shop/storefront.js');
  const urls=[];
  const make=hostname=>new Storefront({dok:{defaultView:{location:{hostname,pathname:'/lifeskinshop',search:'?still=1&x=test'},history:{pushState(_,__,url){urls.push(url);}}}}});
  make('mnyra.com').route('/p/lf-acne');assert.equal(urls.pop(),'/lifeskinshop/p/lf-acne?still=1&x=test');
  make('lifeskin-ks.com').route('/p/lf-acne');assert.equal(urls.pop(),'/p/lf-acne?still=1&x=test');
  make('lifeskin-ks.com').route('#sf-products');assert.equal(urls.pop(),'/?still=1&x=test#sf-products');
  const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url)));
  assert.ok(config.rewrites.some(x=>x.source==='/lifeskinshop/p/:id'));
});

test('new commerce UI includes two purchase actions, quantity controls and dedicated product page', () => {
  const p=storefrontProducts([record()])[0];
  assert.match(productCard(p),/Shto ne shport/);assert.match(productCard(p),/Porosit/);
  assert.match(productDetail(p),/data-sf-pdp-qty="-1"/);assert.match(productDetail(p),/data-sf-pdp-qty="1"/);
  const html=readFileSync(new URL('../apps/lifeskin-shop/index.html',import.meta.url),'utf8');
  assert.match(html,/<section id="sf-product"/);assert.doesNotMatch(html,/<dialog id="sf-product"/);
  assert.match(html,/id="sf-search"/);assert.match(html,/id="sf-cart"/);
  const editor=renderLifeskin({shopVerwaltung:true,produkte:[record()],produktOffen:'lf-moistur',kennzahlen:{},trichter:[],sitzungen:[]});
  assert.match(editor,/data-produktfeld="shopKategorie"/);assert.match(editor,/value="soldout"/);
});

test('adding several products merges the cart and changing quantities preserves the other lines', () => {
  const shop=new Dyqan({dokument:{querySelector:()=>null},speicher:null,dauerSpeicher:null,trichter:()=>null});
  shop.catalogProducts=storefrontProducts([record(),record({id:'second',name:'Second',einzelpreis:10})]);shop.catalogReady=true;
  assert.equal(shop.catalogHinzufuegen('lf-moistur',2),true);
  assert.equal(shop.catalogHinzufuegen('second',1),true);
  assert.equal(shop.catalogHinzufuegen('lf-moistur',1),true);
  assert.equal(shop.korb.mengen['lf-moistur'],3);assert.equal(shop.korb.mengen.second,1);
  assert.equal(shop.korb.cmimi,63.85);
  assert.equal(shop.catalogMenge('second',2),true);assert.equal(shop.korb.cmimi,73.85);
  assert.match(shop.katalogBestelltext(),/3× LF MOISTUR \+ 2× Second/);
  shop.catalogMenge('lf-moistur',0);assert.equal(shop.korb.cmimi,20);
});

test('catalog metadata excludes embedded image fields and uses deferred image URLs', async () => {
  const {CATALOG_FIELDS}=await import('../shared/lifeskin-storefront.js');
  assert.ok(!CATALOG_FIELDS.includes('photoRef'));
  const products=storefrontProducts([record()],new Map(),{deferredImages:true});
  assert.deepEqual(products[0].images,['/api/lifeskin-product-photo?id=lf-moistur&w=480']);
});

test('product image reader uses only public product fields, respects hidden state and handles invalid IDs', async () => {
  const {loadProductPhoto}=await import('../api/lifeskin-product-photo.js');
  const urls=[];
  const result=await loadProductPhoto('lf-moistur',async url=>{urls.push(url);return {ok:true,json:async()=>({fields:{photoRef:{stringValue:'data:image/jpeg;base64,AAAA'},availability:{stringValue:'visible'}}})};});
  assert.equal(result.buffer.length,3);
  assert.match(urls[0],/\/products\/lf-moistur\?mask.fieldPaths=photoRef&mask.fieldPaths=availability$/);
  assert.equal(await loadProductPhoto('../sessions',()=>{throw new Error('must not fetch');}),null);
  const hidden=await loadProductPhoto('x',async()=>({ok:true,json:async()=>({fields:{availability:{stringValue:'hidden'}}})}));assert.equal(hidden.hidden,true);
});

test('canonical URLs identify dedicated product pages on the correct domain', async () => {
  const {shopPageCanonical}=await import('../api/lifeskin-shop.js');
  assert.equal(shopPageCanonical({headers:{host:'lifeskin-ks.com'},query:{produkt:'lf-acne'}}),'https://lifeskin-ks.com/p/lf-acne');
  assert.equal(shopPageCanonical({headers:{host:'mnyra.com'},url:'/lifeskinshop/p/lf-acne?still=1'}),'https://www.mnyra.com/lifeskinshop/p/lf-acne');
  assert.equal(shopPageCanonical({headers:{host:'untrusted.example'}}),'https://www.mnyra.com/lifeskinshop');
});

test('adding catalog products never silently replaces an existing discounted set', () => {
  const shop=new Dyqan({dokument:{querySelector:()=>null},speicher:null,dauerSpeicher:null,trichter:()=>null});
  shop.catalogProducts=storefrontProducts([record()]);shop.catalogReady=true;
  shop.korb={ids:['lf-acne','lf-moistur'],set:'acne',cmimi:25};
  assert.equal(shop.catalogHinzufuegen('lf-moistur'),false);assert.equal(shop.korb.cmimi,25);
  shop.catalogZbraze();assert.equal(shop.catalogHinzufuegen('lf-moistur'),true);assert.equal(shop.korb.cmimi,17.95);
});
