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
  storage = async () => (await import('../server/photo-studio-storage.js')).studioStorage(),
  image = async (...args) => (await import('../server/photo-studio-images.js')).studioImage(...args),
  exportImage = async (...args) => (await import('../server/photo-studio-images.js')).studioSocialExport(...args)
} = {}) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  const reply = (status, data) => { res.statusCode = status; res.end(JSON.stringify(data)); };
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return reply(405, {}); }
  if (req.headers?.['sec-fetch-site'] === 'cross-site') return reply(403, { error: 'Kërkesa nuk lejohet.' });
  // Global off switch keeps private storage and retention configuration a rollout prerequisite.
  if (process.env.PHOTO_STUDIO_AVAILABLE !== 'true') return reply(503, { error: 'Photo Studio nuk është i disponueshëm.' });
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (!raw || raw.length > 12000) return reply(400, { error: 'Kërkesa nuk është e vlefshme.' });
    const input = JSON.parse(raw);
    if (!input || typeof input.op !== 'string') return reply(400, { error: 'Kërkesa nuk është e vlefshme.' });
    const admin = input.op.startsWith('admin-');
    if (admin && !req.headers?.authorization) return reply(403, { error: 'Bitte mit dem CEO-Konto anmelden.' });
    const now = Date.now();
    const repo = await repository();
    if (admin && !await authorize(req, repo)) return reply(403, { error: 'Bitte mit dem CEO-Konto anmelden.' });
    const ip = req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
    const media = ['studio-info', 'receipt', 'admin-state', 'admin-toggle'].includes(input.op) ? null : await storage();
    return reply(200, await photoStudioAction(input, {
      repo, media, image, exportImage, now, admin, limit: (scope, max) => studioRateLimit(repo, ip, scope, max, now)
    }));
  } catch (error) {
    if (!error.status) console.error('photo_studio_request_failed', { name: error.name, code: error.code });
    return reply(error.status || 503, { error: error.status ? error.message : 'Ju lutemi, provo përsëri.' });
  }
}

export default servePhotoStudio;
