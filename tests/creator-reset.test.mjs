import test from 'node:test';
import { generateKeyPairSync } from 'node:crypto';
import { shopRepository } from '../server/content-creator-shop.js';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { resetCreatorBatch, CREATOR_RESET_CONFIRMATION, isCreatorResetAdmin } from '../server/creator-reset.js';
import { serveCreatorReset } from '../api/content-creator-reset.js';
import { createCreatorReset } from '../apps/mnyra-heart/heart-creator-reset.js';
import { renderSettingsView } from '../apps/mnyra-heart/heart-settings-render.js';
import { creatorOverview, creatorFollowups } from '../shared/creator-analytics.js';

const before = '2026-10-31T10:00:00.000Z';
const old = '2026-10-30T10:00:00.000Z';
const base = 'projects/menyra-c0e68/databases/(default)/documents';
const confirm = CREATOR_RESET_CONFIRMATION;
function fixture(count = 1) {
  const docs = new Map();
  for (const collection of ['contentCreatorVisits', 'contentCreatorCarts', 'contentCreatorOrders']) {
    for (let i = 0; i < count; i++) {
      const name = `${base}/${collection}/${String(i).padStart(4, '0')}`;
      docs.set(name, { name, updateTime: old, fields: { createdAt: { stringValue: old } } });
    }
  }
  const page = { name: `${base}/contentCreatorPages/page`, updateTime: old, fields: {
    followups: { mapValue: { fields: { cart: { booleanValue: true } } } },
    photoIds: { arrayValue: { values: [{ stringValue: 'photo' }] } }, products: { arrayValue: {} }, workflow: { stringValue: 'ready' }
  } };
  docs.set(page.name, page);
  docs.set(`${page.name}/originals/photo`, { name: `${page.name}/originals/photo`, updateTime: old });
  docs.set(`${base}/lifeskin/lifeskin/sessions/test`, { untouched: true });
  const batches = [];
  const repo = {
    async list(collection, token) {
      const rows = [...docs.values()].filter(d => d.name?.startsWith(`${base}/${collection}/`) && !d.name.slice(`${base}/${collection}/`.length).includes('/') && (!token || d.name > token)).sort((a,b) => a.name.localeCompare(b.name));
      const documents = rows.slice(0, 200);
      return { documents, ...(rows.length > 200 ? { nextPageToken: documents.at(-1).name } : {}) };
    },
    async commit(writes) {
      assert.ok(writes.length <= 200);
      for (const write of writes) assert.equal(docs.get(write.delete || write.update.name).updateTime, write.currentDocument.updateTime);
      batches.push(writes);
      for (const write of writes) {
        if (write.delete) docs.delete(write.delete);
        else delete docs.get(write.update.name).fields.followups;
      }
    }
  };
  return { docs, repo, page, batches };
}

test('all pages and all three telemetry collections reset, assets and other modules survive', async () => {
  const { repo, docs, page, batches } = fixture(451);
  const fields = structuredClone(page.fields); delete fields.followups;
  let input = { confirm, begin: true }, deleted = 0, cleared = 0;
  const start = await resetCreatorBatch(input, repo, Date.parse(before));
  assert.equal(batches.length, 0, 'starting a reset must not delete before its boundary is acknowledged');
  input = { confirm, before: start.before, cursor: start.next };
  do {
    const result = await resetCreatorBatch(input, repo, Date.parse(before));
    deleted += result.deleted; cleared += result.cleared;
    input = { confirm, before: result.before, cursor: result.next };
  } while (input.cursor);
  assert.equal(deleted, 1353); assert.equal(cleared, 1);
  assert.equal(docs.size, 3); assert.deepEqual(page.fields, fields);
  const stats = creatorOverview({ visits: [], orders: [], period: 'all' });
  assert.deepEqual(stats, { live: 0, visitors: 0, orders: 0, value: 0, stages: [0,0,0] });
  assert.deepEqual(creatorFollowups({ carts: [], orders: [] }), []);
});

test('new activity after the cutoff survives, concurrency failures remain retryable', async () => {
  const { repo, docs } = fixture(2);
  docs.get(`${base}/contentCreatorVisits/0001`).updateTime = '2026-10-31T10:00:01.000Z';
  const input = { confirm, before, cursor: { collection: 0, pageToken: '' } };
  const commit = repo.commit;
  repo.commit = async () => { throw Error('Concurrent update'); };
  await assert.rejects(resetCreatorBatch(input, repo, Date.parse(before)), /Concurrent/);
  assert.ok(docs.has(`${base}/contentCreatorVisits/0000`));
  repo.commit = commit;
  const result = await resetCreatorBatch(input, repo, Date.parse(before));
  assert.equal(result.deleted, 1);
  assert.ok(docs.has(`${base}/contentCreatorVisits/0001`));
});

test('malformed scope, missing confirmation/boundary and foreign document paths never commit', async () => {
  const { repo, batches } = fixture();
  for (const input of [{}, {confirm}, {confirm,before,cursor:{collection:4,pageToken:''}}, {confirm,before,cursor:{collection:0,pageToken:9}}, {confirm,before:'2099-01-01'}]) {
    await assert.rejects(resetCreatorBatch(input, repo, Date.parse(before)));
  }
  repo.list = async () => ({ documents: [{ name: `${base}/restaurants/foreign`, updateTime: old }] });
  await assert.rejects(resetCreatorBatch({confirm,before}, repo, Date.parse(before)), /Dokumentpfad/);
  assert.equal(batches.length, 0);
});

function response() { return { headers: {}, setHeader(k,v) { this.headers[k] = v; }, end(body) { this.body = JSON.parse(body); } }; }
test('endpoint denies GET and non-CEO access before opening a repository', async () => {
  let opened = 0;
  const repository = async () => { opened++; throw Error('should not open'); };
  let res = response();
  await serveCreatorReset({method:'GET'}, res, { repository, authorize: async () => true });
  assert.equal(res.statusCode, 405);
  res = response();
  await serveCreatorReset({method:'POST',body:{confirm}}, res, { repository, authorize: async () => false });
  assert.equal(res.statusCode, 403); assert.equal(opened, 0);
  assert.equal(res.headers['Cache-Control'], 'no-store');
});

test('admin verification accepts only a server-verified CEO ID token', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw Error('lookup should not run'); };
    assert.equal(await isCreatorResetAdmin({headers:{}}), false);
    for (const [uid, expected] of [['attacker',false],['aklBkkIuZ7Nrpx266TJn63rrxX62',true]]) {
      globalThis.fetch = async (url, options) => {
        assert.ok(url.startsWith('https://identitytoolkit.googleapis.com/v1/accounts:lookup'));
        assert.equal(JSON.parse(options.body).idToken, 'token');
        return {ok:true,json:async()=>({users:[{localId:uid}]})};
      };
      assert.equal(await isCreatorResetAdmin({headers:{authorization:'Bearer token'}}), expected);
    }
    globalThis.fetch = async () => ({ok:false});
    assert.equal(await isCreatorResetAdmin({headers:{authorization:'Bearer expired'}}), false);
  } finally { globalThis.fetch = original; }
});

test('settings require two clicks, cancel is harmless; errors resume at the last batch and double taps cannot start duplicate resets', async () => {
  let state = {}, calls = 0, refreshed = 0, fail = true;
  const inputs = [];
  const controller = createCreatorReset({ getState: () => state, patch: data => Object.assign(state,data), refresh: () => refreshed++,
    request: async input => {
      calls++; inputs.push(input);
      if (input.begin) return {ok:true,before,next:{collection:0,pageToken:''}};
      if (input.cursor.collection === 0) return {ok:true,before,next:{collection:1,pageToken:''},deleted:200};
      if (fail) throw Error('Network');
      return {ok:true,before,next:null,deleted:1};
    }
  });
  await controller.reset(); assert.equal(calls, 0); assert.equal(state.resetAsked,true);
  controller.cancel(); assert.equal(state.resetAsked,false); assert.equal(calls,0);
  await controller.reset();
  const run = controller.reset(); await controller.reset(); await run;
  assert.match(state.resetError,/Network/); assert.equal(state.resetNotice,'');
  assert.equal(state.resetContinuation.cursor.collection,1);
  assert.equal(state.resetRunning,false); assert.equal(refreshed,0);
  fail = false; await controller.reset();
  assert.match(state.resetNotice,/201/); assert.equal(refreshed,1);
  assert.equal(inputs.at(-1).cursor.collection,1);
  assert.equal(inputs.filter(input=>input.begin).length,1);
  assert.equal(state.resetContinuation,null);
});

test('settings render confirmed, busy, error and success states without touching the separate LifeSkin reset', () => {
  for (const state of [{},{resetAsked:true},{resetRunning:true,resetDeleted:200},{resetError:'<error>'},{resetNotice:'Fertig'}]) {
    const {document} = parseHTML(renderSettingsView({contentCreator:state}));
    const card = document.querySelector('[data-creator-reset]');
    assert.ok(card); assert.ok(card.querySelector('[data-cc-action="reset-data"]'));
    assert.equal(!!card.querySelector('[data-cc-action="cancel-reset"]'),!!state.resetAsked);
    assert.equal(card.querySelector('[data-cc-action="reset-data"]').hasAttribute('disabled'),!!state.resetRunning);
    assert.equal(card.querySelector('error'),null);
    assert.ok(document.querySelector('[data-lifeskin-einstellungen]'));
  }
});


test('delayed push completion cannot recreate a cart or order deleted by reset', async () => {
  const originalFetch = globalThis.fetch, originalKey = process.env.MNYRA_FIREBASE_ADMIN_KEY;
  const {privateKey} = generateKeyPairSync('rsa',{modulusLength:2048});
  process.env.MNYRA_FIREBASE_ADMIN_KEY = JSON.stringify({client_email:'test@example.invalid',private_key:privateKey.export({type:'pkcs8',format:'pem'})});
  const calls = [];
  try {
    globalThis.fetch = async (url, options = {}) => {
      calls.push({url,options});
      if (url === 'https://oauth2.googleapis.com/token') return {ok:true,json:async()=>({access_token:'test-only',expires_in:3600})};
      return {ok:false,status:404,json:async()=>({})};
    };
    const repo = await shopRepository();
    for (const kind of ['cart','order']) {
      await repo.notify(kind,'deleted',{lines:[{id:'pack'}],totalCents:100,pageName:'Test',customer:{name:'Test'}});
      const write = calls.findLast(call=>call.url.includes(`/contentCreator${kind==='cart'?'Carts':'Orders'}/deleted?`));
      assert.ok(write);
      assert.equal(new URL(write.url).searchParams.get('currentDocument.exists'),'true');
      assert.equal(write.options.method,'PATCH');
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.MNYRA_FIREBASE_ADMIN_KEY;
    else process.env.MNYRA_FIREBASE_ADMIN_KEY = originalKey;
  }
});
