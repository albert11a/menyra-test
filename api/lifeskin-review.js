import { schluessel, zugangHolen, wert } from './lifeskin-meldung.js';
import { LIFESKIN_FIRESTORE_BASE, LIFESKIN_API_KEY } from '../apps/lifeskin/lifeskin-config.js';
import { SHOP_REVIEW_MEDIUM, bewertungText, REVIEW_FOTOS_MAX, REVIEW_FOTO_BYTES_MAX } from '../shared/lifeskin-shop-bewertungen.js';

const ROOT = `lifeskin/lifeskin/medien/${SHOP_REVIEW_MEDIUM}/kommentare`;
const ID = /^[0-9a-f]{32}$/;
const CEO = 'aklBkkIuZ7Nrpx266TJn63rrxX62';
const docName = path => `${LIFESKIN_FIRESTORE_BASE.replace('https://firestore.googleapis.com/v1/', '')}/${path}`;
const fields = data => Object.fromEntries(Object.entries(data?.fields || {}).map(([k, v]) => [k, wert(v)]));

export function jpegPruefen(data) {
  if (typeof data !== 'string' || data.length > REVIEW_FOTO_BYTES_MAX * 1.4 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(data)) throw new Error('foto');
  const bytes = Buffer.from(data.slice(data.indexOf(',') + 1), 'base64');
  if (bytes.length < 20 || bytes.length > REVIEW_FOTO_BYTES_MAX || bytes[0] !== 255 || bytes[1] !== 216 || bytes.at(-2) !== 255 || bytes.at(-1) !== 217) throw new Error('foto');
  for (let pos = 2; pos + 8 < bytes.length;) {
    if (bytes[pos++] !== 255) throw new Error('foto');
    while (bytes[pos] === 255) pos++;
    const marker = bytes[pos++];
    if (marker === 218 || marker === 217) break;
    if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
    if (pos + 2 > bytes.length) break;
    const size = bytes.readUInt16BE(pos);
    if (size < 2 || pos + size > bytes.length) throw new Error('foto');
    if ([192, 193, 194].includes(marker)) {
      const hoehe = bytes.readUInt16BE(pos + 3), breite = bytes.readUInt16BE(pos + 5);
      if (breite < 1 || hoehe < 1 || breite > 4096 || hoehe > 4096) throw new Error('foto');
      return { bytes, breite, hoehe };
    }
    pos += size;
  }
  throw new Error('foto');
}

export function reviewPruefen(body) {
  const name = String(body?.name || '').trim();
  if (!name || name.length > 40 || !ID.test(String(body?.id || '')) || !Array.isArray(body?.fotos) || !body.fotos.length || body.fotos.length > REVIEW_FOTOS_MAX) throw new Error('eingabe');
  return { id: body.id, name, text: bewertungText(body.text, body.rating), fotos: body.fotos.map(jpegPruefen) };
}

export function createReviewHandler({ key = schluessel, token = zugangHolen, fetchFn = globalThis.fetch, now = () => new Date().toISOString() } = {}) {
  const google = (url, options = {}) => fetchFn(url, { ...options, signal: AbortSignal.timeout(15000) });
  const json = (res, status, data) => { res.statusCode = status; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(data)); };
  return async function reviewHandler(req, res) {
    res.setHeader('cache-control', 'no-store');
    const query = new URL(req.url || '/', 'https://mnyra.com').searchParams;
    const id = String(req.query?.review ?? query.get('review') ?? '');
    const foto = Number(req.query?.foto ?? query.get('foto'));
    let eingabe;
    try {
      if (req.method === 'POST') {
        let body = req.body;
        if (typeof body === 'string') body = JSON.parse(body);
        eingabe = reviewPruefen(body);
        const origin = req.headers?.origin;
        if (origin && new URL(origin).host !== req.headers?.host) return json(res, 403, { ok: false });
      } else if (!['GET', 'DELETE'].includes(req.method)) return json(res, 405, { ok: false });
      else if (!ID.test(id) || (req.method === 'GET' && (!Number.isInteger(foto) || foto < 0 || foto >= REVIEW_FOTOS_MAX))) return json(res, 400, { ok: false });
    } catch { return json(res, 400, { ok: false }); }
    const secret = key();
    if (!secret) return json(res, 503, { ok: false });
    try {
      const access = await token(secret);
      const headers = { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' };
      const read = async path => {
        const response = await google(`${LIFESKIN_FIRESTORE_BASE}/${path}`, { headers });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('read');
        return fields(await response.json());
      };
      const isAdmin = async () => {
        const bearer = String(req.headers?.authorization || '').replace(/^Bearer /i, '');
        if (!bearer) return false;
        const response = await google(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${LIFESKIN_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: bearer }) });
        return response.ok && (await response.json()).users?.[0]?.localId === CEO;
      };
      if (req.method === 'GET') {
        const review = await read(`${ROOT}/${id}`);
        if (!review || (review.verborgen && !await isAdmin())) return json(res, 404, { ok: false });
        const image = await read(`${ROOT}/${id}/fotos/${foto}`);
        if (!image?.jpeg) return json(res, 404, { ok: false });
        const data = jpegPruefen(image.jpeg);
        res.statusCode = 200; res.setHeader('content-type', 'image/jpeg'); res.setHeader('X-Content-Type-Options', 'nosniff'); res.end(data.bytes); return;
      }
      if (req.method === 'DELETE') {
        if (!await isAdmin()) return json(res, 403, { ok: false });
        const writes = [{ delete: docName(`${ROOT}/${id}`) }, ...Array.from({ length: REVIEW_FOTOS_MAX }, (_, i) => ({ delete: docName(`${ROOT}/${id}/fotos/${i}`) }))];
        const response = await google(`${LIFESKIN_FIRESTORE_BASE}:commit`, { method: 'POST', headers, body: JSON.stringify({ writes }) });
        return json(res, response.ok ? 200 : 502, { ok: response.ok });
      }
      const { id: reviewId, name, text, fotos } = eingabe;
      const createdAt = now();
      const bilder = fotos.map((f, index) => ({ id: reviewId, index, breite: f.breite, hoehe: f.hoehe }));
      const meta = bilder.map(b => ({ mapValue: { fields: { id: { stringValue: b.id }, index: { integerValue: String(b.index) }, breite: { integerValue: String(b.breite) }, hoehe: { integerValue: String(b.hoehe) } } } }));
      const writes = [{ update: { name: docName(`${ROOT}/${reviewId}`), fields: { name: { stringValue: name }, text: { stringValue: text }, createdAt: { stringValue: createdAt }, verborgen: { booleanValue: false }, bilder: { arrayValue: { values: meta } } } }, currentDocument: { exists: false } }, ...fotos.map((f, index) => ({ update: { name: docName(`${ROOT}/${reviewId}/fotos/${index}`), fields: { jpeg: { stringValue: `data:image/jpeg;base64,${f.bytes.toString('base64')}` } } }, currentDocument: { exists: false } }))];
      const response = await google(`${LIFESKIN_FIRESTORE_BASE}:commit`, { method: 'POST', headers, body: JSON.stringify({ writes }) });
      if (!response.ok) {
        // Retry after an interrupted response returns the same review, never a duplicate.
        if ([409, 400].includes(response.status)) {
          const existing = await read(`${ROOT}/${reviewId}`);
          if (existing?.name === name && existing.text === text && existing.bilder?.length === bilder.length) return json(res, 200, { ok: true, review: { id: reviewId, ...existing } });
        }
        return json(res, 502, { ok: false });
      }
      return json(res, 201, { ok: true, review: { id: reviewId, name, text, createdAt, bilder } });
    } catch { return json(res, 502, { ok: false }); }
  };
}

export default createReviewHandler();
