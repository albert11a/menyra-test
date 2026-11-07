import { createHash } from 'node:crypto';
import { STUDIO_ORDERS, STUDIO_PRICE, STUDIO_MAX_BYTES, STUDIO_MAX_FILES, STUDIO_EXPORTS, STUDIO_STYLES, studioState } from '../shared/photo-studio.js';

const DAY = 86400000;
const ID = /^[a-f0-9]{32}$/;
const TOKEN = /^[a-f0-9]{64}$/;
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
const hash = value => createHash('sha256').update(value).digest('hex');
const text = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const time = now => new Date(now).toISOString();
const reject = (message, status = 400) => { throw Object.assign(Error(message), { status }); };
const retry = () => reject('Porosia ka ndryshuar. Provo përsëri.', 409);
const unavailable = () => reject('Porosia nuk u gjet.', 404);
const storageExpired = order => Date.parse(order.mediaExpiresAt);
const valid = (value, pattern) => typeof value === 'string' && pattern.test(value);
const hasDraft = photo => photo.result && photo.published?.version !== photo.result.version;

function customerOrder(order, now) {
  const expired = now >= storageExpired(order);
  return {
    id: order.id, pageId: order.pageId, businessName: order.businessName, photoCount: order.photoCount,
    totalCents: order.totalCents, unitPriceCents: order.unitPriceCents, currency: order.currency,
    createdAt: order.createdAt, revision: order.revision, status: expired ? 'expired' : studioState(order),
    paymentStatus: order.paymentStatus, mediaExpiresAt: order.mediaExpiresAt,
    downloadsAvailable: !expired && order.downloadsReleased && order.paymentStatus === 'paid' && order.processingStatus !== 'cancelled',
    photos: expired || order.processingStatus === 'cancelled' ? [] : order.photoRecords.map(photo => ({
      id: photo.id, original: photo.original.version, edited: photo.published?.version || '',
      originalWidth: photo.original.width, originalHeight: photo.original.height,
      editedWidth: photo.published?.width || 0, editedHeight: photo.published?.height || 0
    }))
  };
}

export async function photoStudioAction(input, { repo, media, image, exportImage, limit, now = Date.now(), admin = false }) {
  const { op, pageId, photoId, version } = input;
  if (!valid(pageId, ID)) unavailable();
  const pagePath = `contentCreatorPages/${pageId}`;
  const readPage = () => repo.read(pagePath);
  const activePage = async () => {
    const page = await readPage();
    if (!page?.data.published || page.data.deleting || page.data.photoStudioEnabled !== true) {
      reject('Photo Studio nuk është i disponueshëm.', 404);
    }
    return page;
  };
  if (op === 'studio-info') {
    const page = await activePage();
    return { businessName: page.data.name };
  }
  if (op === 'admin-toggle') {
    if (!admin || typeof input.enabled !== 'boolean') reject('Aktion nicht erlaubt.', 403);
    const page = await readPage();
    if (!page || page.data.deleting || (input.enabled && !page.data.published)) unavailable();
    if (!await repo.write(pagePath, { photoStudioEnabled: input.enabled }, page, [], { patch: true })) retry();
    return { enabled: input.enabled };
  }

  const isAdmin = typeof op === 'string' && op.startsWith('admin-');
  if (isAdmin && !admin) reject('Aktion nicht erlaubt.', 403);
  if (!isAdmin && !valid(input.token, TOKEN)) unavailable();
  const accessTokenHash = isAdmin ? '' : hash(input.token);
  const orderId = isAdmin ? input.orderId : hash(`${pageId}:${accessTokenHash}`);
  if (!valid(orderId, TOKEN)) unavailable();
  const orderPath = `${STUDIO_ORDERS}/${orderId}`;
  const current = await repo.read(orderPath);
  const order = current?.data;
  if (order && (order.pageId !== pageId || (!isAdmin && order.accessTokenHash !== accessTokenHash))) unavailable();

  if (op === 'receipt' || op === 'place') {
    if (order) return op === 'receipt' && order.revision === input.revision && now < storageExpired(order)
      ? { unchanged: true } : customerOrder(order, now);
    if (op === 'receipt') unavailable();
  }

  const original = op === 'prepare-original' || op === 'accept-original';
  const edited = op === 'admin-prepare-result' || op === 'admin-accept-result';
  if (original || edited) {
    if (!valid(photoId, uuid) || !valid(version, uuid) || (original && photoId !== version)) reject('Fotoja nuk është e vlefshme.');
    const existingPhoto = order?.photoRecords.find(photo => photo.id === photoId);
    if (edited && !existingPhoto) unavailable();
    if (edited && (order.processingStatus === 'cancelled' || now >= storageExpired(order))) reject('Der Auftrag ist für Uploads geschlossen.', 409);
    if (original && order) reject('Porosia është dërguar tashmë.', 409);
    const page = original ? await activePage() : null;
    const draftPath = `photoStudioUploads/${orderId}_${photoId}`;
    const staging = `staging/${pageId}/${orderId}/${photoId}/${version}`;
    const accepted = original ? (await repo.read(draftPath))?.data : existingPhoto.result;
    if (accepted?.version === version && (!original || Date.parse(accepted.expireAt) > now)) return { accepted: true };
    if (op.startsWith('prepare-') || op === 'admin-prepare-result') {
      if (!Number.isSafeInteger(input.bytes) || input.bytes < 1 || input.bytes > STUDIO_MAX_BYTES) reject('Maksimumi 30 MB për foto.');
      if (original && !await limit('upload', 100)) reject('Shumë ngarkime. Provo përsëri më vonë.', 429);
      return { url: await media.upload(staging, input.bytes) };
    }
    if (original && !await limit('validate', 160)) reject('Shumë ngarkime. Provo përsëri më vonë.', 429);
    let bytes, metadata;
    try {
      bytes = await media.readUpload(staging);
      metadata = await image(bytes, { edited });
    } catch (error) {
      if (error.invalidImage) reject('Formati ose madhësia e fotos nuk mbështetet.', 422);
      if (error.$metadata?.httpStatusCode === 404) reject('Ngarkoje foton përsëri.', 409);
      throw error;
    }
    const { previews, ...meta } = metadata;
    const key = `${original ? 'prepared' : 'assets'}/${pageId}/${orderId}/${photoId}/${edited ? 'result' : 'original'}-${version}-${hash(bytes)}`;
    const asset = { ...meta, key, version, uploadedAt: time(now) };
    await Promise.all([
      media.put(key, bytes, asset.mime, `MNYRA-${edited ? 'Edit' : 'Original'}-${photoId.slice(0, 8)}.${asset.extension}`),
      ...Object.entries(previews).map(([size, preview]) => media.put(`${key}/${size}.webp`, preview, 'image/webp'))
    ]);
    if (original) {
      const data = { ...asset, expireAt: time(now + DAY) };
      const before = await repo.read(draftPath);
      if (before?.data.key === key && Date.parse(before.data.expireAt) > now) return { accepted: true };
      if (!await repo.write(draftPath, data, before, [page], { ttl: true })) retry();
    } else {
      if (text(input.baseVersion, 36) !== (existingPhoto.result?.version || '')) retry();
      const photoRecords = order.photoRecords.map(photo => photo.id === photoId ? { ...photo, result: asset } : photo);
      const processingStatus = !order.previewReleased
        ? photoRecords.every(photo => photo.result) ? 'ready' : 'processing'
        : order.processingStatus;
      await mutate(repo, current, { photoRecords, processingStatus }, 'result-uploaded', now, { photoId, version, key });
    }
    return { accepted: true };
  }

  if (op === 'place') {
    const page = await activePage();
    const ids = input.photos;
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > STUDIO_MAX_FILES ||
        new Set(ids).size !== ids.length || !ids.every(id => valid(id, uuid))) reject('Zgjidh nga 1 deri në 20 foto.');
    if (!await limit('place', 50)) reject('Shumë porosi. Provo përsëri më vonë.', 429);
    const uploads = await Promise.all(ids.map(id => repo.read(`photoStudioUploads/${orderId}_${id}`)));
    if (uploads.some(row => !row || Date.parse(row.data.expireAt) <= now)) reject('Ngarkimi i fotove nuk ka përfunduar.');
    const photoRecords = [];
    for (let start = 0; start < uploads.length; start += 4) {
      const batch = await Promise.all(uploads.slice(start, start + 4).map(async ({ data: { expireAt, ...asset } }, index) => {
        const key = asset.key.replace(/^prepared\//, 'assets/');
        await Promise.all(['', '/large.webp', '/thumb.webp'].map(suffix => media.copy(asset.key + suffix, key + suffix)));
        return { id: ids[start + index], sequence: start + index, original: { ...asset, key } };
      }));
      photoRecords.push(...batch);
    }
    const createdAt = time(now);
    const record = {
      id: orderId, pageId, businessName: text(page.data.name, 160), createdAt, updatedAt: createdAt,
      orderType: 'photo_edit', photoCount: ids.length, unitPriceCents: STUDIO_PRICE,
      totalCents: ids.length * STUDIO_PRICE, currency: 'EUR', processingStatus: 'pending',
      paymentStatus: 'unpaid', paymentMethod: 'manual', previewReleased: false, downloadsReleased: false,
      requestedStyle: STUDIO_STYLES.includes(input.style) ? input.style : '', customerNotes: text(input.notes, 1000),
      accessTokenHash, mediaExpiresAt: time(now + 175 * DAY), revision: 1,
      photoRecords,
      history: [{ event: 'ordered', at: createdAt }]
    };
    if (await repo.write(orderPath, record, null, [page, ...uploads])) return customerOrder(record, now);
    const existing = await repo.read(orderPath);
    if (existing?.data.accessTokenHash === accessTokenHash) return customerOrder(existing.data, now);
    retry();
  }

  if (!order) unavailable();
  if (op === 'admin-state') {
    if (order.processingStatus === 'cancelled') reject('Der Auftrag wurde storniert.', 409);
    const note = text(input.note, 1000);
    const action = input.action;
    const expired = now >= storageExpired(order);
    if (expired && !['confirm-payment', 'note', 'complete', 'cancel'].includes(action)) reject('Die Aufbewahrungsfrist für Fotos ist abgelaufen.', 409);
    let change;
    if (action === 'start' && order.processingStatus === 'pending') change = { processingStatus: 'processing' };
    if (action === 'publish' && order.photoRecords.every(photo => photo.result) &&
        (!order.previewReleased || order.photoRecords.some(hasDraft))) {
      change = { processingStatus: order.processingStatus === 'completed' ? 'completed' : 'ready', previewReleased: true,
        photoRecords: order.photoRecords.map(photo => ({ ...photo, published: { ...photo.result, releasedAt: time(now) } })) };
    }
    if (action === 'confirm-payment' && order.paymentStatus === 'unpaid' && note && input.confirmed === true) {
      change = { paymentStatus: 'paid', paymentConfirmedAt: time(now), paymentReference: note, paymentMethod: input.paymentMethod === 'consolidated' ? 'consolidated' : 'manual' };
    }
    if (action === 'release-downloads' && order.paymentStatus === 'paid' && order.previewReleased && !order.downloadsReleased) {
      change = { downloadsReleased: true, downloadsReleasedAt: time(now) };
    }
    if (action === 'complete' && order.downloadsReleased && order.processingStatus !== 'completed') change = { processingStatus: 'completed' };
    if (action === 'cancel' && order.paymentStatus === 'unpaid' && note) change = { processingStatus: 'cancelled', previewReleased: false, downloadsReleased: false };
    if (action === 'note' && note) change = {};
    if (!change) reject('Diese Aktion ist im aktuellen Status nicht möglich.', 409);
    await mutate(repo, current, change, action, now, note ? { note } : {});
    return { ok: true };
  }

  if (now >= storageExpired(order) || order.processingStatus === 'cancelled') reject('Fotot nuk janë më të disponueshme.', 410);
  if (!['media', 'admin-media'].includes(op)) reject('Kërkesa nuk lejohet.');
  const variant = input.variant;
  const originals = variant === 'original' || variant === 'original-archive';
  const preview = variant === 'preview';
  const archive = variant === 'original-archive' || variant === 'edited-archive';
  if (!isAdmin && originals) reject('Nuk lejohet.', 403);
  if (!isAdmin && !preview && !(order.downloadsReleased && order.paymentStatus === 'paid')) reject('Shkarkimi nuk është liruar.', 403);
  if (preview) {
    const photo = order.photoRecords.find(row => row.id === photoId);
    if (!photo) unavailable();
    const result = isAdmin ? photo.result : photo.published;
    const marked = !isAdmin && !(order.downloadsReleased && order.paymentStatus === 'paid');
    const size = input.size === 'thumb' ? 'thumb' : 'large';
    const [before, after] = await Promise.all([
      media.sign(`${photo.original.key}/${size}.webp`),
      result ? media.sign(`${result.key}/${marked ? 'marked-' : ''}${size}.webp`) : ''
    ]);
    return { before, after, width: photo.original.width, height: photo.original.height,
      editedWidth: result?.width || 0, editedHeight: result?.height || 0 };
  }
  if (variant === 'export') {
    const format = input.format;
    if (typeof format !== 'string' || !Object.hasOwn(STUDIO_EXPORTS, format)) reject('Formati nuk është i vlefshëm.');
    const photo = order.photoRecords.find(row => row.id === photoId);
    if (!photo?.published) unavailable();
    if (!isAdmin && !await limit('export', 60)) reject('Shumë shkarkime. Provo përsëri më vonë.', 429);
    const key = await media.export(orderId, photo.published.key, format, exportImage);
    if ((await repo.read(orderPath))?.version !== current.version) retry();
    const name = `MNYRA-Edit-${photo.sequence + 1}-${format}.jpg`;
    return { url: await media.sign(key, name), name };
  }
  if (!['original', 'original-archive', 'edited', 'edited-archive'].includes(variant)) reject('Kërkesa nuk lejohet.');
  const files = (archive ? order.photoRecords : order.photoRecords.filter(row => row.id === photoId)).map(photo => {
    const asset = originals ? photo.original : isAdmin ? photo.result : photo.published;
    if (!asset) reject('Fotoja nuk është gati.', 409);
    return { key: asset.key, name: `MNYRA-${originals ? 'Original' : 'Edit'}-${String(photo.sequence + 1).padStart(2, '0')}.${asset.extension}`, mime: asset.mime, bytes: asset.bytes };
  });
  if (!files.length) unavailable();
  if (archive) {
    if (!isAdmin && !await limit('archive', 30)) reject('Shumë shkarkime. Provo përsëri më vonë.', 429);
    const key = await media.archive(orderId, variant, files);
    // A long archive build must not issue a ticket for stale order rights.
    const latest = await repo.read(orderPath);
    if (latest?.version !== current.version) retry();
    const name = `MNYRA-${orderId.slice(0, 12)}-${originals ? 'Original' : 'Edit'}.zip`;
    return { url: await media.sign(key, name), name };
  }
  const { key, name, mime, bytes } = files[0];
  return { url: await media.sign(key, input.share === true ? '' : name, true), name, mime, bytes };
}

async function mutate(repo, current, change, event, now, details) {
  const order = current.data;
  const updatedAt = time(now);
  const history = [...order.history, { event, at: updatedAt, ...details }];
  if (history.length > 300) reject('Das Änderungsprotokoll dieses Auftrags ist voll.', 409);
  if (!await repo.write(current.path, { ...change, updatedAt, history, revision: order.revision + 1 }, current, [], { patch: true })) retry();
}
