import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as utils from '../apps/mnyra-heart/heart-push-utils.js';

function runtime({ ancestor = false, writeFails = false, storage = new Map() } = {}) {
  const writes = [], registrations = [];
  const scope = 'https://mnyra.com/apps/mnyra-heart/';
  const own = { scope, active: {} };
  const context = vm.createContext({
    ...utils, URL, setTimeout, clearTimeout, isSecureContext: true,
    db: {}, doc: (...parts) => parts.slice(1).join('/'), serverTimestamp: () => 'now',
    setDoc: async (path, data) => { if (writeFails) throw Error('offline'); writes.push({ path, data }); },
    Notification: { permission: 'granted' }, PushManager: {},
    navigator: { serviceWorker: {
      getRegistration: async () => ancestor ? { scope: 'https://mnyra.com/', active: {} } : own,
      register: async (url, options) => { registrations.push({ url: String(url), ...options }); return own; },
      get ready() { throw Error('Must not use another app worker'); }
    } },
    localStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) },
    messagingMock: { isSupported: async () => true, getMessaging: () => ({}), getToken: async (_, options) => {
      assert.equal(options.serviceWorkerRegistration, own);
      return 'token';
    } }
  });
  context.kannPush = () => utils.kannPush(context);
  let source = readFileSync(new URL('../apps/mnyra-heart/heart-push.js', import.meta.url), 'utf8');
  source = source.replace(/^import\s+[\s\S]*?from\s+"[^"]+";\n/gm, '')
    .replaceAll('import.meta.url', JSON.stringify(`${scope}heart-push.js`))
    .replace('await import("/shared/vendor/firebase/11.0.0/firebase-messaging.js")', 'messagingMock')
    .replace(/^export /gm, '');
  vm.runInContext(source, context);
  return { context, writes, registrations, storage };
}

test('first registration creates the Heart worker even if an ancestor is active', async () => {
  const r = runtime({ ancestor: true });
  assert.equal(await r.context.meldeGeraetAn('albert'), true);
  assert.equal(r.registrations.length, 1);
  assert.equal(r.registrations[0].scope, 'https://mnyra.com/apps/mnyra-heart/');
  assert.equal(r.writes[0].data.enabled, true);
});

test('logout disables the device; same token is re-enabled on login', async () => {
  const r = runtime();
  await r.context.meldeGeraetAn('albert');
  await r.context.meldeGeraetAb('albert');
  assert.equal(r.context.istPushAngemeldet('albert'), false);
  assert.equal(r.writes[1].data.enabled, false);
  await r.context.meldeGeraetAn('albert');
  assert.equal(r.writes[2].data.enabled, true);
  assert.equal(r.context.istPushAngemeldet('albert'), true);
});

test('permission does not mean registered when Firestore rejects the device', async () => {
  const r = runtime({ writeFails: true });
  assert.equal(await r.context.meldeGeraetAn('albert'), false);
  assert.equal(r.context.istPushAngemeldet('albert'), false);
});

test('account switch does not reuse another account registration', async () => {
  const r = runtime();
  const results = await Promise.all([r.context.meldeGeraetAn('a'), r.context.meldeGeraetAn('b')]);
  assert.deepEqual(results, [true, true]);
  assert.equal(r.writes.length, 2);
  assert.match(r.writes[1].path, /^users\/b\/devices\//);
});

test('reload checks the server registration even with a fresh local marker', async () => {
  const first = runtime();
  await first.context.meldeGeraetAn('a');
  const second = runtime({ storage: first.storage });
  await second.context.meldeGeraetAn('a');
  assert.equal(second.writes.length, 1);
});

test('future timestamps and another account cannot count as fresh', () => {
  assert.equal(utils.istFrisch({ token: 't', uid: 'a', ts: 100 }, 't', 99, undefined, 'a'), false);
  assert.equal(utils.istFrisch({ token: 't', uid: 'a', ts: 100 }, 't', 101, undefined, 'b'), false);
});
