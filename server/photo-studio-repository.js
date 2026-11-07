import { createHash } from 'node:crypto';
import { schluessel, zugangHolen, wert } from '../api/lifeskin-meldung.js';
import { encodeValue } from './content-creator-shop.js';

const NAME = 'projects/menyra-c0e68/databases/(default)/documents';
const BASE = `https://firestore.googleapis.com/v1/${NAME}`;
let credentials;

export async function photoStudioRepository() {
  const key = schluessel();
  if (!key) throw Error('Photo Studio credentials missing');
  const token = await (credentials ||= zugangHolen(key).finally(() => { credentials = undefined; }));
  return createPhotoStudioRepository(BASE, token);
}

export function createPhotoStudioRepository(base, token) {
  const name = new URL(base).pathname.slice('/v1/'.length);
  const request = (path, options) => fetch(base + path, {
    ...options, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    signal: AbortSignal.timeout(12000)
  });
  return {
    async read(path) {
      const response = await request('/' + path);
      if (response.status === 404) return null;
      if (!response.ok) throw Error('Studio Firestore read failed');
      const raw = await response.json();
      return { path, version: raw.updateTime, data: Object.fromEntries(Object.entries(raw.fields || {}).map(([k, v]) => [k, wert(v)])) };
    },
    async listOrders() {
      const response = await request(':runQuery', {
        method: 'POST',
        body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'photoStudioOrders' }] } })
      });
      if (!response.ok) throw Error('Studio orders query failed');
      return (await response.json()).flatMap(({ document }) => document ? [{
        ...Object.fromEntries(Object.entries(document.fields || {}).map(([k, v]) => [k, wert(v)])),
        id: document.name.split('/').at(-1)
      }] : []);
    },
    async write(path, data, previous = null, checks = [], { patch = false, ttl = false } = {}) {
      const fields = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encodeValue(v)]));
      if (ttl) fields.expireAt = { timestampValue: data.expireAt };
      const write = {
        update: { name: `${name}/${path}`, fields },
        ...(patch ? { updateMask: { fieldPaths: Object.keys(fields) } } : {}),
        currentDocument: previous ? { updateTime: previous.version } : { exists: false }
      };
      const post = (method, data) => request(':' + method, { method: 'POST', body: JSON.stringify(data) });
      let transaction, committed = false;
      try {
        if (checks.length) {
          const start = await post('beginTransaction', {});
          if (!start.ok) throw Error('Studio Firestore transaction failed');
          ({ transaction } = await start.json());
          if (!transaction) throw Error('Studio Firestore transaction missing');
          const documents = checks.map(row => `${name}/${row.path}`);
          const result = await post('batchGet', { documents, transaction });
          if (!result.ok) throw Error('Studio Firestore preflight failed');
          const versions = new Map((await result.json()).filter(row => row.found).map(row => [row.found.name, row.found.updateTime]));
          if (checks.some((row, index) => versions.get(documents[index]) !== row.version)) return false;
        }
        const response = await post('commit', { writes: [write], ...(transaction ? { transaction } : {}) });
        if (response.ok) { committed = true; return true; }
        const detail = await response.json().catch(() => null);
        if (['ABORTED', 'ALREADY_EXISTS', 'FAILED_PRECONDITION', 'NOT_FOUND'].includes(detail?.error?.status)) return false;
        throw Error('Studio Firestore commit failed');
      } finally {
        if (transaction && !committed) await post('rollback', { transaction }).catch(() => {});
      }
    }
  };
}

export async function studioRateLimit(repo, ip, scope, limit, now) {
  const window = 3600000;
  const hash = createHash('sha256').update(`${scope}:${Math.floor(now / window)}:${ip}`).digest('hex');
  const path = `photoStudioLimits/${hash}`;
  for (let attempt = 0; attempt < 6; attempt++) {
    const row = await repo.read(path);
    if ((row?.data.count || 0) >= limit) return false;
    const data = { count: (row?.data.count || 0) + 1, expireAt: new Date(now + 2 * window).toISOString() };
    if (await repo.write(path, data, row, [], { ttl: true })) return true;
  }
  return false;
}
