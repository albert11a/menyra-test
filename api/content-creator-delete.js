import { isCreatorResetAdmin } from '../server/creator-reset.js';
import { creatorDeletionRepository, deleteCreatorBusinessStep } from '../server/creator-business-delete.js';

export async function serveCreatorBusinessDelete(req, res, { authorize = isCreatorResetAdmin, repository = creatorDeletionRepository } = {}) {
  res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); res.statusCode = 405; res.end('{}'); return; }
  try {
    if (!await authorize(req)) { res.statusCode = 403; res.end(JSON.stringify({ ok: false, error: 'Nur dein CEO-Konto darf ein Business löschen.' })); return; }
    const input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!input || typeof input !== 'object') throw Error('Löschanfrage fehlt.');
    const result = await deleteCreatorBusinessStep(input, await repository());
    res.statusCode = 200; res.end(JSON.stringify(result));
  } catch (error) { res.statusCode = 400; res.end(JSON.stringify({ ok: false, error: String(error.message || 'Löschen fehlgeschlagen.') })); }
}
export default function handler(req, res) { return serveCreatorBusinessDelete(req, res); }
