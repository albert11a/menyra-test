import { createHash } from 'node:crypto';

export const STUDIO_PAGE_A = 'a'.repeat(32);
export const STUDIO_PAGE_B = 'b'.repeat(32);
export const STUDIO_TOKEN = 'f'.repeat(64);

export function studioFixture() {
  const docs = new Map(), objects = new Map(), counts = new Map();
  let revision = 0;
  const seed = (path, data) => docs.set(path, { data, path, version: String(++revision) });
  seed('contentCreatorPages/' + STUDIO_PAGE_A, { name: 'Business A', published: true, photoStudioEnabled: true });
  seed('contentCreatorPages/' + STUDIO_PAGE_B, { name: 'Business B', published: true, photoStudioEnabled: false });
  const read = async path => structuredClone(docs.get(path) || null);
  const repo = {
    read,
    async write(path, data, previous, checks, { patch } = {}) {
      const existing = docs.get(path);
      if (existing?.version !== previous?.version || checks.some(row => docs.get(row.path)?.version !== row.version)) return false;
      seed(path, patch ? { ...existing.data, ...data } : data);
      return true;
    }
  };
  const media = {
    upload: async key => '/fixture/upload?key=' + encodeURIComponent(key),
    async readUpload(key) {
      if (!objects.has(key)) throw Object.assign(Error('Missing'), { $metadata: { httpStatusCode: 404 } });
      return objects.get(key);
    },
    put: async (key, bytes) => { objects.set(key, bytes); },
    copy: async (from, to) => { objects.set(to, await media.readUpload(from)); },
    sign: async key => '/fixture/media?key=' + encodeURIComponent(key),
    archive: async (order, variant) => `archives/${order}/${variant}.zip`,
    export: async (order, key, format) => 'exports/' + order + '/' + key + '/' + format
  };
  const limit = async (scope, max) => {
    const next = (counts.get(scope) || 0) + 1;
    counts.set(scope, next);
    return next <= max;
  };
  return { docs, objects, seed, repo, media, limit };
}

export function testStudioOrderId(page = STUDIO_PAGE_A, token = STUDIO_TOKEN) {
  const hash = value => createHash('sha256').update(value).digest('hex');
  return hash(page + ':' + hash(token));
}
