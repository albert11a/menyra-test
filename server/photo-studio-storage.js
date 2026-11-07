import { createCipheriv, createDecipheriv, createHash, createHmac, createSign, randomBytes, timingSafeEqual } from 'node:crypto';
import { Readable } from 'node:stream';
import ZipStream from 'zip-stream';
import { schluessel } from '../api/lifeskin-meldung.js';
import { BUNNY_EDGE_BASE, MEDIA_TICKET_ENDPOINT } from '../shared/bunny-edge.js';
import { creatorMediaUrl } from '../shared/creator-media.js';
import { STUDIO_MAX_BYTES, STUDIO_PART_BYTES } from '../shared/photo-studio.js';

const API_KEY = 'AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU';
const AUTH_AUDIENCE = 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit';
const ASSET_UID = 'mnyra-studio-assets', TEMP_UID = 'mnyra-studio-temp';
const hash = value => createHash('sha256').update(value).digest('hex');
const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const mediaPath = key => 'photoStudioMedia/' + hash(key);
const expiry = days => new Date(Date.now() + days * 86400000).toISOString();
const missing = () => Object.assign(Error('Studio asset missing'), { $metadata: { httpStatusCode: 404 } });
const tickets = new Map();

async function shopTicket(uid, credentials, fetchFn) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({
    iss: credentials.client_email, sub: credentials.client_email, aud: AUTH_AUDIENCE, iat: now, exp: now + 300, uid
  });
  const token = unsigned + '.' + createSign('RSA-SHA256').update(unsigned).sign(credentials.private_key, 'base64url');
  const headers = { 'content-type': 'application/json' };
  const response = await fetchFn('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=' + API_KEY, {
    method: 'POST', headers, body: JSON.stringify({ token, returnSecureToken: true }), signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw Error('Studio Firebase media identity unavailable');
  const { idToken } = await response.json();
  if (!idToken) throw Error('Studio Firebase media identity missing');
  const ticket = await fetchFn(MEDIA_TICKET_ENDPOINT, {
    method: 'POST', headers: { ...headers, Authorization: 'Bearer ' + idToken },
    body: JSON.stringify({ action: 'image_upload', restaurantId: uid }), signal: AbortSignal.timeout(12000)
  });
  if (!ticket.ok) throw Error('Studio shop media ticket unavailable');
  const { ticket: value, expiresAt } = await ticket.json();
  if (!value || !Number.isFinite(expiresAt)) throw Error('Studio shop media ticket missing');
  return { value, expiresAt };
}

export function studioStorage(repo, { credentials = schluessel(), fetchFn = fetch, issueTicket = shopTicket } = {}) {
  if (!credentials?.private_key || !repo) throw Error('Photo Studio credentials missing');
  const key = createHash('sha256').update('mnyra-photo-studio-assets-v1:').update(process.env.PHOTO_STUDIO_ENCRYPTION_KEY || credentials.private_key).digest();
  const sign = payload => createHmac('sha256', key).update('mnyra-studio-grant-v1:').update(payload).digest();
  function grant(action, data, lifetime) {
    const payload = b64({ ...data, action, exp: Date.now() + lifetime });
    return '/api/photo-studio?t=' + payload + '.' + sign(payload).toString('base64url');
  }
  function verify(token, action) {
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{1,1800}\.[A-Za-z0-9_-]{43}$/.test(token)) return null;
    const [payload, mac] = token.split('.');
    if (!timingSafeEqual(sign(payload), Buffer.from(mac, 'base64url'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.action === action && data.exp > Date.now() ? data : null;
  }
  async function ticket(uid) {
    if (issueTicket !== shopTicket) return (await issueTicket(uid)).value;
    const cached = tickets.get(uid);
    if (cached && cached.until > Date.now()) return (await cached.promise).value;
    const entry = { until: Date.now() + 20000 };
    entry.promise = shopTicket(uid, credentials, fetchFn).then(value => {
      entry.until = Math.max(Date.now(), value.expiresAt - 20000);
      return value;
    }).catch(error => { if (tickets.get(uid) === entry) tickets.delete(uid); throw error; });
    tickets.set(uid, entry);
    return (await entry.promise).value;
  }
  async function putPart(logicalKey, index, bytes, uid) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(Buffer.from(logicalKey + ':' + index));
    const payload = Buffer.concat([iv, cipher.update(bytes), cipher.final(), cipher.getAuthTag()]);
    const form = new FormData();
    form.set('restaurantId', uid);
    // The shop endpoint stores the bytes as supplied. CDN URLs carry only encrypted payloads.
    form.set('file', new Blob([payload], { type: 'image/jpeg' }), 'studio.jpg');
    const response = await fetchFn(BUNNY_EDGE_BASE + '/image/upload', {
      method: 'POST', headers: { Authorization: 'Bearer ' + await ticket(uid) }, body: form,
      signal: AbortSignal.timeout(45000), redirect: 'error'
    });
    if (!response.ok) throw Error('Studio shop media upload failed');
    const body = await response.json();
    const url = creatorMediaUrl(body.cdnUrl || body.url);
    if (!url || !new URL(url).pathname.startsWith('/media/social/' + uid + '/')) throw Error('Invalid Studio media reference');
    return url;
  }
  async function readPart(logicalKey, index, url) {
    if (!creatorMediaUrl(url) || !/^\/media\/social\/mnyra-studio-(assets|temp)\//.test(new URL(url).pathname)) throw Error('Invalid Studio media reference');
    const response = await fetchFn(url, { signal: AbortSignal.timeout(45000), redirect: 'error' });
    if (!response.ok) throw missing();
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 29 || bytes.length > STUDIO_PART_BYTES + 28) throw Error('Invalid encrypted Studio asset size');
    const decipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(0, 12));
    decipher.setAAD(Buffer.from(logicalKey + ':' + index));
    decipher.setAuthTag(bytes.subarray(-16));
    return Buffer.concat([decipher.update(bytes.subarray(12, -16)), decipher.final()]);
  }
  async function* fileChunks(meta) {
    for (let start = 0; start < meta.urls.length; start += 3) {
      const batch = await Promise.all(meta.urls.slice(start, start + 3).map((url, i) => readPart(meta.cipherKey, start + i, url)));
      yield* batch;
    }
  }
  async function metadata(key) {
    const row = await repo.read(mediaPath(key));
    if (!row || (row.data.expireAt && Date.parse(row.data.expireAt) <= Date.now())) throw missing();
    return row.data;
  }
  async function writeMeta(path, data, days = 180) {
    const previous = await repo.read(path);
    const success = await repo.write(path, { ...data, expireAt: expiry(days) }, previous, [], { ttl: true });
    if (!success && !await repo.read(path)) throw Error('Studio media metadata save failed');
  }
  return {
    async ready() {
      try { await Promise.all([ticket(ASSET_UID), ticket(TEMP_UID)]); return true; } catch { return false; }
    },
    upload(key, bytes) { return grant('upload', { key, bytes }, 600000); },
    async acceptPart(token, index, data) {
      const upload = verify(token, 'upload');
      if (!upload) return 403;
      const size = Math.min(STUDIO_PART_BYTES, upload.bytes - index * STUDIO_PART_BYTES);
      if (!Number.isSafeInteger(index) || index < 0 || size <= 0 || typeof data !== 'string' || data.length !== Math.ceil(size / 3) * 4) return 400;
      const bytes = Buffer.from(data, 'base64');
      if (bytes.length !== size) return 400;
      const path = mediaPath(upload.key + ':' + index);
      const previous = await repo.read(path);
      const digest = hash(bytes);
      if (previous) return previous.data.digest === digest ? 200 : 409;
      const url = await putPart(upload.key, index, bytes, TEMP_UID);
      if (await repo.write(path, { url, digest, total: upload.bytes, expireAt: expiry(2) }, null, [], { ttl: true })) return 200;
      return (await repo.read(path))?.data.digest === digest ? 200 : 409;
    },
    async readUpload(key) {
      if (key.startsWith('staging/')) {
        const first = await metadata(key + ':0');
        if (!Number.isSafeInteger(first.total) || first.total < 1 || first.total > STUDIO_MAX_BYTES) throw missing();
        const parts = Math.ceil(first.total / STUDIO_PART_BYTES);
        const rows = await Promise.all(Array.from({ length: parts }, (_, i) => i === 0 ? first : metadata(key + ':' + i)));
        if (rows.some(row => row.total !== first.total)) throw missing();
        const bytes = [];
        for await (const part of fileChunks({ cipherKey: key, urls: rows.map(row => row.url) })) bytes.push(part);
        const data = Buffer.concat(bytes);
        if (data.length !== first.total) throw missing();
        return data;
      }
      const bytes = [];
      for await (const part of fileChunks(await metadata(key))) bytes.push(part);
      return Buffer.concat(bytes);
    },
    async put(key, data, mime, filename = '') {
      if (await repo.read(mediaPath(key))) return;
      const temporary = key.startsWith('exports/');
      const urls = [];
      for (let offset = 0; offset < data.length; offset += STUDIO_PART_BYTES) {
        urls.push(await putPart(key, urls.length, data.subarray(offset, offset + STUDIO_PART_BYTES), temporary ? TEMP_UID : ASSET_UID));
      }
      await writeMeta(mediaPath(key), { urls, cipherKey: key, mime, filename, size: data.length }, temporary ? 2 : 180);
    },
    async copy(source, key) {
      if (await repo.read(mediaPath(key))) return;
      const { expireAt, ...meta } = await metadata(source);
      await writeMeta(mediaPath(key), meta);
    },
    sign(key, filename = '', short = false) { return grant('download', { key, filename }, filename || short ? 90000 : 900000); },
    async export(orderId, source, format, render) {
      const key = `exports/${orderId}/${hash(source)}/${format}.jpg`;
      if (!await repo.read(mediaPath(key))) await this.put(key, await render(await this.readUpload(source), format), 'image/jpeg', 'MNYRA-Edit.jpg');
      return key;
    },
    async archive(orderId, variant, files) {
      const key = `archives/${orderId}/${variant}-${hash(JSON.stringify(files))}.zip`;
      await writeMeta(mediaPath(key), { files, mime: 'application/zip' }, 2);
      return key;
    },
    async openDownload(token) {
      const data = verify(token, 'download');
      if (!data) return null;
      const meta = await metadata(data.key);
      if (!meta.files) return { ...meta, filename: data.filename, chunks: fileChunks(meta) };
      const zip = new ZipStream({ store: true });
      const pack = async () => {
        for (const file of meta.files) {
          const body = Readable.from(fileChunks(await metadata(file.key)));
          await new Promise((resolve, reject) => {
            body.once('error', reject);
            zip.entry(body, { name: file.name }, error => error ? reject(error) : resolve());
          });
        }
        zip.finish();
      };
      void pack().catch(error => zip.destroy(error));
      return { mime: meta.mime, filename: data.filename, chunks: zip };
    }
  };
}
