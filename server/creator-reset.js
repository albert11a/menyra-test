import { schluessel, zugangHolen } from '../api/lifeskin-meldung.js';
import { CC_PAGES, CC_VISITS } from '../shared/content-creator.js';
import { CC_CARTS, CC_ORDERS } from '../shared/content-creator-shop.js';

export const CREATOR_RESET_CONFIRMATION = 'RESET_CONTENT_CREATOR';
const COLLECTIONS = [CC_VISITS, CC_CARTS, CC_ORDERS, CC_PAGES];
const BASE = 'https://firestore.googleapis.com/v1/projects/menyra-c0e68/databases/(default)/documents';
const NAME = BASE.replace('https://firestore.googleapis.com/v1/', '');
const CEO = 'aklBkkIuZ7Nrpx266TJn63rrxX62';
const API_KEY = 'AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU';
const google = (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15000) });

export async function isCreatorResetAdmin(req) {
  const token = /^Bearer\s+(.+)$/i.exec(String(req.headers?.authorization || ''))?.[1];
  if (!token) return false;
  const response = await google(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token })
  });
  return response.ok && (await response.json()).users?.[0]?.localId === CEO;
}

export async function creatorResetRepository() {
  const key = schluessel();
  if (!key) throw Error('Server-Zugang fehlt.');
  const token = await zugangHolen(key);
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  return {
    async list(collection, pageToken) {
      const params = new URLSearchParams({ pageSize: '200', 'mask.fieldPaths': collection === CC_PAGES ? 'followups' : 'createdAt' });
      if (pageToken) params.set('pageToken', pageToken);
      const response = await google(`${BASE}/${collection}?${params}`, { headers });
      if (!response.ok) throw Error('Testdaten konnten nicht gelesen werden.');
      return response.json();
    },
    async commit(writes) {
      const response = await google(`${BASE}:commit`, { method: 'POST', headers, body: JSON.stringify({ writes }) });
      if (!response.ok) throw Error('Reset unterbrochen. Bitte erneut versuchen; parallele Änderungen bleiben geschützt.');
    }
  };
}

// One bounded batch per request; all collection/path ownership stays server-side.
export async function resetCreatorBatch(input, repo, now = Date.now()) {
  if (input.confirm !== CREATOR_RESET_CONFIRMATION) throw Error('Reset bitte bestätigen.');
  const cursor = input.cursor || { collection: 0, pageToken: '' };
  if (!Number.isInteger(cursor.collection) || cursor.collection < 0 || cursor.collection >= COLLECTIONS.length ||
      typeof cursor.pageToken !== 'string' || cursor.pageToken.length > 10000) throw Error('Ungültige Fortsetzung.');
  const before = input.before || new Date(now).toISOString();
  const cutoff = Date.parse(before);
  if (!Number.isFinite(cutoff) || cutoff > now) throw Error('Ungültiger Reset-Zeitpunkt.');
  if (input.begin === true) return { ok: true, before, next: { collection: 0, pageToken: '' }, deleted: 0 };
  if (!input.before) throw Error('Reset zuerst starten.');
  const collection = COLLECTIONS[cursor.collection];
  const result = await repo.list(collection, cursor.pageToken);
  const writes = [];
  for (const document of result.documents || []) {
    const suffix = document.name?.slice(`${NAME}/${collection}/`.length);
    if (!document.name?.startsWith(`${NAME}/${collection}/`) || !suffix || suffix.includes('/')) throw Error('Ungültiger Dokumentpfad.');
    // Server updateTime covers legacy data too, irrespective of its stored date format.
    if (!document.updateTime || !Number.isFinite(Date.parse(document.updateTime))) throw Error('Dokumentzeit fehlt.');
    if (Date.parse(document.updateTime) > cutoff) continue;
    const currentDocument = { updateTime: document.updateTime };
    if (collection === CC_PAGES) {
      if (!document.fields?.followups) continue;
      writes.push({ update: { name: document.name, fields: {} }, updateMask: { fieldPaths: ['followups'] }, currentDocument });
    } else writes.push({ delete: document.name, currentDocument });
  }
  if (writes.length) await repo.commit(writes);
  const next = result.nextPageToken
    ? { collection: cursor.collection, pageToken: result.nextPageToken }
    : cursor.collection + 1 < COLLECTIONS.length ? { collection: cursor.collection + 1, pageToken: '' } : null;
  return { ok: true, before, next, deleted: collection === CC_PAGES ? 0 : writes.length, cleared: collection === CC_PAGES ? writes.length : 0 };
}
