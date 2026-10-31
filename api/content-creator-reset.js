import { creatorResetRepository, isCreatorResetAdmin, resetCreatorBatch } from '../server/creator-reset.js';

export async function serveCreatorReset(req, res, { authorize = isCreatorResetAdmin, repository = creatorResetRepository, now = Date.now } = {}) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST'); res.statusCode = 405; res.end('{}'); return;
  }
  try {
    if (!await authorize(req)) { res.statusCode = 403; res.end(JSON.stringify({ ok: false, error: 'Nur dein CEO-Konto darf Testdaten zurücksetzen.' })); return; }
    const input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!input || typeof input !== 'object') throw Error('Reset-Anfrage fehlt.');
    const result = await resetCreatorBatch(input, await repository(), now());
    res.statusCode = 200; res.end(JSON.stringify(result));
  } catch (error) {
    res.statusCode = 400; res.end(JSON.stringify({ ok: false, error: String(error.message || 'Reset fehlgeschlagen.') }));
  }
}
export default function handler(req, res) { return serveCreatorReset(req, res); }
