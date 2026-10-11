import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { jpegPruefen, createReviewHandler } from '../api/lifeskin-review.js';
import { reviewBilderNormalisieren, reviewFotoUrl, SHOP_REVIEW_MEDIUM } from '../shared/lifeskin-shop-bewertungen.js';
import { kommentareLaden } from '../shared/lifeskin-medien.js';
import { reviewMarkup } from '../apps/lifeskin-shop/bewertungen.js';
import { renderMedienReaktionen } from '../apps/mnyra-heart/heart-lifeskin-medien.js';

const id = 'a'.repeat(32);
const jpeg = `data:image/jpeg;base64,${(await readFile(new URL('../apps/lifeskin-shop/assets/mesazh-ftyra.jpg', import.meta.url))).toString('base64')}`;
const image = jpegPruefen(jpeg);
const body = { id, name: 'Arta', text: 'Mire', rating: 5, fotos: [jpeg, jpeg] };
const metadata = { id, index: 0, breite: image.breite, hoehe: image.hoehe };
function wire(value) {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return { integerValue: String(value) };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(wire) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k,v]) => [k,wire(v)])) } };
}
const document = value => ({ fields: wire(value).mapValue.fields });
const response = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });
async function request(req, fetchFn) {
  const res = { headers: {}, setHeader(k,v) { this.headers[k] = v; }, end(data) { this.data = data; } };
  await createReviewHandler({ key: () => ({}), token: async () => 'mock-token', fetchFn, now: () => '2026-10-11T00:00:00Z' })({ headers: {}, url: '/', ...req }, res);
  return res;
}

test('only bounded JPEG uploads and fixed internal photo references are accepted', async () => {
  assert.ok(image.breite > 0 && image.hoehe > 0);
  assert.throws(() => jpegPruefen('data:image/svg+xml;base64,PHN2Zz4='));
  assert.throws(() => jpegPruefen('data:image/jpeg;base64,' + Buffer.alloc(300001).toString('base64')));
  assert.deepEqual(reviewBilderNormalisieren([{ ...metadata, id: '../private' }, { ...metadata, hoehe: 0 }, { ...metadata, index: 4 }]), []);
  assert.equal(reviewFotoUrl({ ...metadata, url: 'https://unsafe.test' }), `/api/lifeskin-review?review=${id}&foto=0`);
  const res = await request({ method: 'POST', body: { ...body, fotos: Array(5).fill(jpeg) } }, () => { assert.fail('Invalid upload reached database'); });
  assert.equal(res.statusCode, 400);
});

test('review and multiple photos are written atomically, using actual image dimensions', async () => {
  let writes;
  const res = await request({ method: 'POST', body }, async (url, options) => {
    assert.ok(url.endsWith(':commit'));
    writes = JSON.parse(options.body).writes;
    return response({});
  });
  assert.equal(res.statusCode, 201);
  assert.equal(writes.length, 3);
  assert.ok(writes.every(w => w.currentDocument.exists === false));
  assert.ok(writes[1].update.name.endsWith(`/kommentare/${id}/fotos/0`));
  const review = JSON.parse(res.data).review;
  assert.deepEqual(review.bilder[0], metadata);
  assert.equal(review.text, '[5/5]\nMire');
  const failed = await request({ method: 'POST', body }, async () => response({}, 503));
  assert.equal(failed.statusCode, 502);
});

test('an interrupted submission can be retried without duplicating its review', async () => {
  const existing = { name: body.name, text: '[5/5]\nMire', createdAt: '2026-10-11', verborgen: false, bilder: [metadata, { ...metadata, index: 1 }] };
  const res = await request({ method: 'POST', body }, async url => url.endsWith(':commit') ? response({}, 409) : response(document(existing)));
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.data).review.id, id);
});

test('public reads decode photo metadata and the card and Heart expose the same gallery', async () => {
  const k = { name: 'Arta', text: '[5/5]\nMire', createdAt: '', verborgen: false, bilder: [metadata, { ...metadata, index: 1 }] };
  const comments = await kommentareLaden(SHOP_REVIEW_MEDIUM, { basis: 'https://example.test', fetchFn: async () => response([{ document: { name: `comments/${id}`, ...document(k) } }]) });
  assert.deepEqual(comments[0].bilder, k.bilder);
  const markup = reviewMarkup(comments[0]);
  assert.match(markup, /data-review-gallery=/);
  assert.match(markup, /review-photo-count">\+1/);
  assert.match(markup, new RegExp(`width="${image.breite}" height="${image.hoehe}"`));
  const admin = renderMedienReaktionen({ weg: 'lifeskinshop', medienKommentare: { [SHOP_REVIEW_MEDIUM]: [{ ...comments[0], medium: SHOP_REVIEW_MEDIUM, verborgen: true }] } });
  assert.match(admin, /2 Fotos öffnen/);
  assert.match(admin, /Wieder zeigen/);
});

test('hidden or deleted reviews do not expose their photos; owner may inspect hidden photos', async () => {
  const lookup = url => url.includes('identitytoolkit') ? response({ users: [{ localId: 'aklBkkIuZ7Nrpx266TJn63rrxX62' }] }) : response(document(url.endsWith('/fotos/0') ? { jpeg } : { verborgen: true }));
  const req = { method: 'GET', url: `/?review=${id}&foto=0` };
  const hidden = await request(req, lookup);
  assert.equal(hidden.statusCode, 404);
  const admin = await request({ ...req, headers: { authorization: 'Bearer owner-test-token' } }, lookup);
  assert.equal(admin.statusCode, 200);
  assert.equal(admin.headers['content-type'], 'image/jpeg');
  assert.deepEqual(admin.data, image.bytes);
  const deleted = await request(req, async () => response({}, 404));
  assert.equal(deleted.statusCode, 404);
});

test('only authenticated owner can atomically delete a review and all its photo documents', async () => {
  const req = { method: 'DELETE', url: `/?review=${id}` };
  const denied = await request(req, () => { assert.fail('Unauthenticated deletion reached database'); });
  assert.equal(denied.statusCode, 403);
  let writes;
  const deleted = await request({ ...req, headers: { authorization: 'Bearer owner-test-token' } }, async (url, options) => {
    if (url.includes('identitytoolkit')) return response({ users: [{ localId: 'aklBkkIuZ7Nrpx266TJn63rrxX62' }] });
    writes = JSON.parse(options.body).writes;
    return response({});
  });
  assert.equal(deleted.statusCode, 200);
  assert.equal(writes.length, 5);
  assert.ok(writes.every(w => w.delete.includes(`/kommentare/${id}`)));
  const outsider = await request({ ...req, headers: { authorization: 'Bearer other-test-token' } }, async url => {
    assert.ok(url.includes('identitytoolkit')); return response({ users: [{ localId: 'someone-else' }] });
  });
  assert.equal(outsider.statusCode, 403);
});
