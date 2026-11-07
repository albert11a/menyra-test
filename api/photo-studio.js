import { once } from 'node:events';
import { creatorAuthUid } from '../server/creator-reset.js';
import { ALBERT_CEO_UID } from '../shared/ceo-access.js';
import { photoStudioAction } from '../server/photo-studio.js';
import { photoStudioRepository, studioRateLimit } from '../server/photo-studio-repository.js';

async function authorizeStudioAdmin(req, repo) {
  const uid = await creatorAuthUid(req);
  if (!uid || !/^[A-Za-z0-9_-]{1,128}$/.test(uid)) return false;
  if (uid === ALBERT_CEO_UID) return true;
  const profile = (await repo.read(`users/${uid}`))?.data;
  return profile?.role === 'ceo' || (Array.isArray(profile?.roles) && profile.roles.includes('ceo')) ||
    !!await repo.read(`superadmins/${uid}`);
}

export async function servePhotoStudio(req, res, {
  authorize = authorizeStudioAdmin, repository = photoStudioRepository,
  storage = async repo => (await import('../server/photo-studio-storage.js')).studioStorage(repo),
  image = async (...args) => (await import('../server/photo-studio-images.js')).studioImage(...args),
  exportImage = async (...args) => (await import('../server/photo-studio-images.js')).studioSocialExport(...args)
} = {}) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  const reply = (status, data) => { res.statusCode = status; res.end(JSON.stringify(data)); };
  if (!['POST', 'GET'].includes(req.method)) { res.setHeader('Allow', 'POST, GET'); return reply(405, {}); }
  if (req.headers?.['sec-fetch-site'] === 'cross-site') return reply(403, { error: 'Kërkesa nuk lejohet.' });
  try {
    const token = new URL(req.url || '/', 'https://www.mnyra.com').searchParams.get('t');
    if (token && req.method === 'GET') {
      const file = await (await storage(await repository())).openDownload(token);
      if (!file) return reply(403, {});
      res.setHeader('Content-Type', file.mime);
      if (file.filename) res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
      for await (const chunk of file.chunks) {
        if (res.destroyed) return;
        if (!res.write(chunk)) await once(res, 'drain', { signal: AbortSignal.timeout(15000) });
      }
      res.end();
      return;
    }
    if (req.method !== 'POST') return reply(405, {});
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (token) {
      if (process.env.PHOTO_STUDIO_AVAILABLE === 'false' || raw.length > 4200000) return reply(403, {});
      const input = JSON.parse(raw);
      const status = await (await storage(await repository())).acceptPart(token, input.index, input.data);
      return reply(status, { ok: status === 200 });
    }
    if (!raw || raw.length > 12000) return reply(400, { error: 'Kërkesa nuk është e vlefshme.' });
    const input = JSON.parse(raw);
    if (!input || typeof input.op !== 'string') return reply(400, { error: 'Kërkesa nuk është e vlefshme.' });
    const admin = input.op.startsWith('admin-');
    if (process.env.PHOTO_STUDIO_AVAILABLE === 'false' && !['admin-list', 'receipt'].includes(input.op) &&
        !(input.op === 'admin-toggle' && input.enabled === false)) {
      return reply(503, { error: admin ? 'Photo Studio ist derzeit deaktiviert.' : 'Photo Studio nuk është i disponueshëm.' });
    }
    if (admin && !req.headers?.authorization) return reply(403, { error: 'Bitte mit dem CEO-Konto anmelden.' });
    const now = Date.now();
    const repo = await repository();
    if (admin && !await authorize(req, repo)) return reply(403, { error: 'Bitte mit dem CEO-Konto anmelden.' });
    if (input.op === 'admin-list') return reply(200, { orders: await repo.listOrders() });
    if (input.op === 'admin-toggle' && input.enabled === true && !await (await storage(repo)).ready()) {
      return reply(503, { error: 'Die Medienfreigabe des Shops ist derzeit nicht erreichbar.' });
    }
    const ip = req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
    const media = ['studio-info', 'receipt', 'admin-state', 'admin-toggle'].includes(input.op) ? null : await storage(repo);
    return reply(200, await photoStudioAction(input, {
      repo, media, image, exportImage, now, admin, limit: (scope, max) => studioRateLimit(repo, ip, scope, max, now)
    }));
  } catch (error) {
    if (res.headersSent) { res.destroy(); return; }
    if (!error.status) console.error('photo_studio_request_failed', { name: error.name, code: error.code });
    return reply(error.status || 503, { error: error.status ? error.message : 'Ju lutemi, provo përsëri.' });
  }
}

export default servePhotoStudio;
