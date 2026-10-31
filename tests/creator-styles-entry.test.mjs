import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseHTML} from 'linkedom';
import {ensureCreatorStyles,CREATOR_STYLE_HREF} from '../apps/mnyra-heart/heart-creator-styles.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Both shipped Heart entry documents include the matching Creator stylesheet',()=>{
 const sources=['apps/mnyra-heart/index.html','heart/index.html'];
 const lists=sources.map(path=>{
  const {document}=parseHTML(read(path));
  const links=[...document.querySelectorAll('link[rel="stylesheet"]')].map(node=>node.getAttribute('href'));
  assert.ok(links.includes(CREATOR_STYLE_HREF),`${path} would show Creator without its layout`);
  assert.ok(links.indexOf(CREATOR_STYLE_HREF)>links.indexOf('/apps/mnyra-heart/heart.css'));
  return links;
 });
 assert.deepEqual(lists[0],lists[1]);
});
test('Older cached Heart HTML gets the missing stylesheet before the app initialises',()=>{
 const {document}=parseHTML('<html><head><link rel="stylesheet" href="/apps/mnyra-heart/heart.css"></head><body></body></html>');
 const link=ensureCreatorStyles(document);assert.equal(link.getAttribute('href'),CREATOR_STYLE_HREF);
 assert.equal(link.parentNode,document.head);assert.equal(ensureCreatorStyles(document),link);
 assert.equal(document.querySelectorAll('#heart-content-creator-style').length,1);
 const bootstrap=read('apps/mnyra-heart/heart.js');assert.ok(bootstrap.indexOf('ensureCreatorStyles();')<bootstrap.indexOf('createContentCreator({'));
});
test('Existing unversioned style links are repaired without duplicated downloads or DOM links',()=>{
 const {document}=parseHTML('<html><head><link rel="stylesheet" href="/apps/mnyra-heart/heart-content-creator.css"></head></html>');
 const before=document.querySelector('link');assert.equal(ensureCreatorStyles(document),before);
 assert.equal(before.getAttribute('href'),CREATOR_STYLE_HREF);assert.equal(document.querySelectorAll('link').length,1);
});
test('CSS content changes require a new revision and precache entry',()=>{
 const css=read('apps/mnyra-heart/heart-content-creator.css');
 const hash=createHash('sha256').update(css).digest('hex').slice(0,12);
 assert.equal(CREATOR_STYLE_HREF.split('?v=')[1],hash);
 assert.ok(read('apps/mnyra-heart/sw.js').includes('"'+CREATOR_STYLE_HREF+'"'));
 assert.match(css,/\.cc-metrics-grid\{display:grid;grid-template-columns:repeat\(2/);
 assert.match(css,/\.cc-package-gallery\{display:flex;overflow-x:auto/);
});
test('The style repair is safe without a browser document',()=>{assert.equal(ensureCreatorStyles(),null);});
