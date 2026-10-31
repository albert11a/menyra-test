import { schluessel, zugangHolen } from '../api/lifeskin-meldung.js';
import { validShopId, CC_CARTS, CC_ORDERS } from '../shared/content-creator-shop.js';
import { CC_PAGES, CC_VISITS } from '../shared/content-creator.js';

export const DELETE_CREATOR_BUSINESS = 'DELETE_CREATOR_BUSINESS';
const BASE = 'https://firestore.googleapis.com/v1/projects/menyra-c0e68/databases/(default)/documents';
const NAME = BASE.replace('https://firestore.googleapis.com/v1/', '');
const RELATED = [CC_VISITS, CC_CARTS, CC_ORDERS];
const google = (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15000) });

export async function creatorDeletionRepository() {
  const key = schluessel();
  if (!key) throw Error('Server-Zugang fehlt.');
  const token = await zugangHolen(key);
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  async function json(path, options = {}) {
    const response = await google(`${BASE}${path}`, { ...options, headers });
    if (response.status === 404 && !options.method) return null;
    if (!response.ok) throw Error('Löschen unterbrochen. Bitte erneut versuchen.');
    return response.json();
  }
  return {
    read: path => json(`/${path}`),
    async list(path, { missing = false, size = 200 } = {}) {
      const params = new URLSearchParams({ pageSize: String(size), 'mask.fieldPaths': 'name', ...(missing ? { showMissing: 'true' } : {}) });
      return (await json(`/${path}?${params}`))?.documents || [];
    },
    async related(collection, pageId) {
      const rows = await json(':runQuery', { method: 'POST', body: JSON.stringify({ structuredQuery: {
        from: [{ collectionId: collection }], select: { fields: [{ fieldPath: '__name__' }] },
        where: { fieldFilter: { field: { fieldPath: 'pageId' }, op: 'EQUAL', value: { stringValue: pageId } } }, limit: 200
      } }) });
      return (rows || []).flatMap(row => row.document ? [row.document] : []);
    },
    commit: writes => json(':commit', { method: 'POST', body: JSON.stringify({ writes }) })
  };
}

function deleteWrites(documents, prefix) {
  return documents.map(document => {
    const suffix = document.name?.slice(`${NAME}/${prefix}/`.length);
    if (!document.name?.startsWith(`${NAME}/${prefix}/`) || !suffix || suffix.includes('/')) throw Error('Ungültiger Löschpfad.');
    return { delete: document.name };
  });
}

// The server owns the phase; a caller cannot skip child cleanup or supply paths.
export async function deleteCreatorBusinessStep(input, repo) {
  const { pageId, confirm } = input;
  if (!validShopId(pageId) || confirm !== DELETE_CREATOR_BUSINESS) throw Error('Business-Löschung bitte bestätigen.');
  const path = `${CC_PAGES}/${pageId}`, name = `${NAME}/${path}`;
  const page = await repo.read(path);
  if (!page) return { ok: true, done: true, deleted: 0 };
  const phase = page.fields?.deletionPhase?.integerValue;
  const deleting = page.fields?.deleting?.booleanValue === true;
  async function advance(next) {
    await repo.commit([{ update: { name, fields: { deletionPhase: { integerValue: String(next) } } },
      updateMask: { fieldPaths: ['deletionPhase'] }, currentDocument: { updateTime: page.updateTime } }]);
    return { ok: true, done: false, deleted: 0 };
  }
  if (!deleting) {
    await repo.commit([{ update: { name, fields: { published: { booleanValue: false }, deleting: { booleanValue: true }, deletionPhase: { integerValue: '0' } } },
      updateMask: { fieldPaths: ['published', 'deleting', 'deletionPhase'] }, currentDocument: { updateTime: page.updateTime } }]);
    return { ok: true, done: false, deleted: 0 };
  }
  const step = Number(phase);
  if (!Number.isInteger(step) || step < 0 || step > 6) throw Error('Löschfortschritt ist ungültig.');
  let documents = [], prefix = '';
  if (step < 3) {
    prefix = RELATED[step]; documents = await repo.related(prefix, pageId);
  } else if (step === 3) {
    const originals = await repo.list(`${path}/originals`, { missing: true, size: 1 });
    if (!originals.length) return advance(4);
    deleteWrites(originals, `${path}/originals`);
    const original = originals[0].name.slice(`${NAME}/`.length);
    for (const collection of ['chunks', 'displays']) {
      const children = await repo.list(`${original}/${collection}`);
      if (children.length) {
        await repo.commit(deleteWrites(children, `${original}/${collection}`));
        return { ok: true, done: false, deleted: children.length };
      }
    }
    await repo.commit([{ delete: originals[0].name }]);
    return { ok: true, done: false, deleted: 1 };
  } else if (step < 6) {
    prefix = `${path}/${step === 4 ? 'images' : 'previews'}`;
    documents = await repo.list(prefix);
  } else {
    await repo.commit([{ delete: name, currentDocument: { updateTime: page.updateTime } }]);
    return { ok: true, done: true, deleted: 1 };
  }
  if (!documents.length) return advance(step + 1);
  await repo.commit(deleteWrites(documents, prefix));
  return { ok: true, done: false, deleted: documents.length };
}
