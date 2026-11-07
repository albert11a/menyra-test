import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { studioImage, studioSocialExport } from '../server/photo-studio-images.js';
import { studioStorage } from '../server/photo-studio-storage.js';
import { photoStudioAction } from '../server/photo-studio.js';
import { STUDIO_PART_BYTES, studioStats } from '../shared/photo-studio.js';
import { STUDIO_PAGE_A as pageId, STUDIO_PAGE_B as other, STUDIO_TOKEN as token, studioFixture, testStudioOrderId } from './helpers/photo-studio-fixture.mjs';

const now = Date.parse('2026-11-07T00:00:00Z');
const original = await sharp({ create: { width: 91, height: 61, channels: 3, background: '#ca8744' } })
  .withMetadata({ orientation: 6 }).withIccProfile('p3').jpeg().toBuffer();
const replacement = await sharp({ create: { width: 61, height: 91, channels: 3, background: '#82482b' } }).png().toBuffer();
function setup() {
  const fixture = studioFixture();
  const orderId = testStudioOrderId();
  const publicOp = (op, fields = {}, options = {}) => photoStudioAction({ op, pageId, token, ...fields }, { ...fixture, now, image: studioImage, ...options });
  const admin = (op, fields = {}) => publicOp('admin-' + op, { orderId, ...fields }, { admin: true });
  const record = () => fixture.docs.get('photoStudioOrders/' + orderId)?.data;
  const place = (photos, fields = {}) => publicOp('place', { photos, ...fields });
  async function upload(bytes, photoId = randomUUID(), version = photoId, baseVersion = '', edited = false) {
    const data = { photoId, version, baseVersion, bytes: bytes.length };
    const call = edited ? admin : publicOp;
    const slot = await call(edited ? 'prepare-result' : 'prepare-original', data);
    if (!slot.accepted) {
      fixture.objects.set(new URL(slot.url, 'http://localhost').searchParams.get('key'), bytes);
      await call(edited ? 'accept-result' : 'accept-original', data);
    }
    return photoId;
  }
  return { ...fixture, publicOp, admin, record, place, upload, orderId };
}

test('one, five and twenty accepted files are ordered at 25 cents each; concurrent retries are idempotent', async () => {
  for (const count of [1, 5, 20]) {
    const ctx = setup();
    const ids = await Promise.all(Array.from({ length: count }, () => ctx.upload(original)));
    const [a, b] = await Promise.all([ctx.place(ids, { totalCents: 1, unitPriceCents: 1 }), ctx.place(ids)]);
    assert.equal(a.id, b.id);
    assert.equal(a.totalCents, 25 * count);
    assert.equal(ctx.record().photoRecords.length, count);
    assert.deepEqual(ctx.record().photoRecords.map(row => row.id), ids);
    assert.deepEqual(ctx.objects.get(ctx.record().photoRecords[0].original.key), original);
    assert.equal(ctx.record().customer, undefined);
    assert.equal(ctx.record().consentAt, undefined);
    assert.notEqual(ctx.record().accessTokenHash, token);
    assert.equal(a.accessTokenHash, undefined);
    assert.equal(a.customer, undefined);
    assert.equal(ctx.docs.size >= count, true);
    assert.equal((await ctx.publicOp('receipt', { revision: a.revision })).unchanged, true);
  }
});

test('drafts reject oversized, invalid, duplicate and unaccepted files and a disabled business', async () => {
  const ctx = setup();
  const id = randomUUID();
  await assert.rejects(ctx.publicOp('prepare-original', { photoId: id, version: id, bytes: 31 * 1024 * 1024 }), { status: 400 });
  await assert.rejects(ctx.upload(Buffer.from('<svg></svg>')), { status: 422 });
  await assert.rejects(ctx.place([id]), { status: 400 });
  await assert.rejects(ctx.place([id, id]), { status: 400 });
  await assert.rejects(ctx.place(Array.from({ length: 21 }, randomUUID)), { status: 400 });
  await assert.rejects(ctx.publicOp('prepare-original', { pageId: other, photoId: id, version: id, bytes: 100 }), { status: 404 });
  await assert.rejects(ctx.publicOp('prepare-original', { photoId: id, version: id, bytes: 100 }, { limit: async () => false }), { status: 429 });
  await assert.rejects(ctx.publicOp('accept-original', { photoId: id, version: id }), { status: 409 });
  await ctx.upload(original, id);
  assert.equal((await ctx.place([id])).photoCount, 1);
});

test('payment, draft revisions, publication and access to the exact published master remain independent', async () => {
  const ctx = setup();
  const first = await ctx.upload(original);
  const second = await ctx.upload(original);
  await ctx.place([first, second]);
  const variant = (variant, fields = {}) => ctx.publicOp('media', { variant, photoId: first, ...fields });
  const state = (action, fields) => ctx.admin('state', { action, ...fields });
  await assert.rejects(ctx.publicOp('receipt', { pageId: other }), { status: 404 });
  await assert.rejects(ctx.publicOp('receipt', { token: '3'.repeat(64) }), { status: 404 });
  await assert.rejects(ctx.publicOp('admin-media', { orderId: ctx.orderId, variant: 'original', photoId: first }), { status: 403 });
  await assert.rejects(ctx.admin('media', { pageId: other, variant: 'original', photoId: first }), { status: 404 });
  await assert.rejects(variant('original'), { status: 403 });
  await assert.rejects(variant('edited'), { status: 403 });
  await assert.rejects(state('confirm-payment', { note: 'Reference' }), { status: 409 });
  await state('confirm-payment', { confirmed: true, note: 'Monthly receipt 1', paymentMethod: 'consolidated' });
  assert.equal(ctx.record().processingStatus, 'pending');
  await assert.rejects(state('release-downloads'), { status: 409 });
  const firstVersion = randomUUID();
  await ctx.upload(replacement, first, firstVersion, '', true);
  await assert.rejects(state('publish'), { status: 409 });
  await ctx.upload(replacement, second, randomUUID(), '', true);
  assert.equal((await variant('preview')).after, '');
  await state('publish');
  assert.match(await variant('preview').then(row => decodeURIComponent(row.after)), /marked-large.webp$/);
  await assert.rejects(variant('edited'), { status: 403 });
  await state('release-downloads');
  const before = await variant('edited');
  const secondVersion = randomUUID();
  await ctx.upload(original, first, secondVersion, firstVersion, true);
  assert.equal((await variant('edited')).url, before.url);
  await state('publish');
  assert.notEqual((await variant('edited')).url, before.url);
  assert.equal(ctx.record().photoRecords[0].original.version, first);
  assert.notEqual(ctx.record().photoRecords[1].published.version, secondVersion);
  assert.match((await variant('edited-archive')).name, /\.zip$/);
  assert.match((await variant('export', { format: 'story' })).name, /story\.jpg$/);
  await state('complete');
  assert.equal(studioStats([ctx.record()]).paid, 50);
  assert.equal(studioStats([ctx.record()]).completed, 1);
  await assert.rejects(state('cancel', { note: 'Refund' }), { status: 409 });
});

test('an unpaid preview is protected and cancellation revokes authorization without creating revenue', async () => {
  const ctx = setup();
  const first = await ctx.upload(original);
  await ctx.place([first]);
  await ctx.upload(replacement, first, randomUUID(), '', true);
  await ctx.admin('state', { action: 'publish' });
  assert.equal((await ctx.publicOp('receipt')).status, 'unpaid');
  assert.equal(studioStats([ctx.record()]).value, 25);
  assert.equal(studioStats([ctx.record()]).paid, 0);
  await ctx.admin('state', { action: 'cancel', note: 'Customer request' });
  assert.deepEqual((await ctx.publicOp('receipt')).photos, []);
  await assert.rejects(ctx.publicOp('media', { variant: 'preview', photoId: first }), { status: 410 });
  assert.equal(studioStats([ctx.record()]).value, 0);
});

test('ICC, orientation, baked watermark and padded export are present in actual derivatives', async () => {
  const originalInfo = await sharp(original).metadata();
  const { previews, width, height } = await studioImage(original, { edited: true });
  assert.deepEqual([width, height], [61, 91]);
  const preview = await sharp(previews.large).metadata();
  assert.deepEqual(preview.icc, originalInfo.icc);
  assert.notDeepEqual(previews['marked-large'], previews.large);
  assert.deepEqual((await sharp(previews['marked-large']).metadata()).icc, originalInfo.icc);
  const exported = await sharp(await studioSocialExport(original, 'story')).metadata();
  assert.deepEqual([exported.width, exported.height], [1080, 1920]);
  assert.deepEqual(exported.icc, originalInfo.icc);
});

test('Studio uses the normal shop upload for encrypted chunks and keeps private download grants scoped', async () => {
  const { repo } = studioFixture();
  const bucket = new Map();
  const base = 'https://menyra-media.alberthoti-vsa.workers.dev';
  let uploads = 0;
  const store = studioStorage(repo, {
    credentials: { private_key: 'studio-fixture-key' },
    issueTicket: async uid => ({ value: uid }),
    fetchFn: async (url, request) => {
      if (request.method === 'POST') {
        assert.equal(url, base + '/image/upload');
        const uid = request.body.get('restaurantId');
        assert.equal(request.headers.Authorization, 'Bearer ' + uid);
        const key = base + '/media/social/' + uid + '/object-' + (++uploads) + '.jpg';
        bucket.set(key, Buffer.from(await request.body.get('file').arrayBuffer()));
        return Response.json({ cdnUrl: key });
      }
      return bucket.has(url) ? new Response(bucket.get(url)) : new Response('', { status: 404 });
    }
  });
  const token = url => new URL(url, 'https://www.mnyra.com').searchParams.get('t');
  const stage = 'staging/order/upload';
  const bytes = Buffer.concat([Buffer.alloc(STUDIO_PART_BYTES, 7), original]);
  const upload = token(store.upload(stage, bytes.length));
  assert.equal(await store.acceptPart(upload, 0, 'bad'), 400);
  assert.equal(await store.acceptPart(upload, 0, bytes.subarray(0, STUDIO_PART_BYTES).toString('base64')), 200);
  assert.equal(await store.acceptPart(upload, 1, original.toString('base64')), 200);
  assert.equal(await store.acceptPart(upload, 1, original.toString('base64')), 200);
  assert.equal(uploads, 2);
  assert.notDeepEqual([...bucket.values()][1], original);
  assert.deepEqual(await store.readUpload(stage), bytes);
  assert.equal(await store.openDownload(upload), null);
  await store.put('prepared/order/image', original, 'image/jpeg');
  await store.copy('prepared/order/image', 'assets/order/image');
  const read = async file => {
    const chunks = [];
    for await (const chunk of file.chunks) chunks.push(chunk);
    return Buffer.concat(chunks);
  };
  const download = await store.openDownload(token(store.sign('assets/order/image', 'MNYRA.jpg')));
  assert.equal(download.filename, 'MNYRA.jpg');
  assert.equal(download.mime, 'image/jpeg');
  assert.deepEqual(await read(download), original);
  const zipKey = await store.archive('order', 'edited-archive', [{ name: 'MNYRA.jpg', key: 'assets/order/image' }]);
  const zip = await store.openDownload(token(store.sign(zipKey, 'MNYRA.zip')));
  assert.equal(zip.mime, 'application/zip');
  assert.equal((await read(zip)).subarray(0, 4).toString('hex'), '504b0304');
});
