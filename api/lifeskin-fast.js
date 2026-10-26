import { createHmac, timingSafeEqual } from 'node:crypto';
import { schluessel, zugangHolen, wert } from './lifeskin-meldung.js';
import { felder } from '../apps/lifeskin/lifeskin-session.js';
import { LIFESKIN_FIRESTORE_BASE } from '../apps/lifeskin/lifeskin-config.js';
import { fastKonfig, fastEmpfehlung } from '../shared/lifeskin-fast.js';

const ROOT = 'lifeskin/lifeskin';
const ID = /^[0-9a-f]{32}$/;
const unpack = d => Object.fromEntries(Object.entries(d?.fields || {}).map(([k, v]) => [k, wert(v)]));
const name = path => `${LIFESKIN_FIRESTORE_BASE.replace('https://firestore.googleapis.com/v1/', '')}/${path}`;
export function fastTicket(key, id, createdAt) {
  return createHmac('sha256', key.private_key).update(`lifeskin-fast-v1:${id}:${createdAt}`).digest('hex');
}
function ticketOk(ticket, expected) {
  return /^[0-9a-f]{64}$/.test(String(ticket || '')) && timingSafeEqual(Buffer.from(ticket, 'hex'), Buffer.from(expected, 'hex'));
}
export function createFastHandler({ key = schluessel, token = zugangHolen, fetchFn = globalThis.fetch,
  now = () => new Date().toISOString() } = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const reply = (status, data) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
    if (req.method !== 'POST') return reply(405, { ok: false });
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!['check', 'start', 'generate'].includes(body?.action) || (body.action !== 'check' && !ID.test(body?.id))) return reply(400, { ok: false });
      const origin = req.headers?.origin;
      if (origin && new URL(origin).host !== req.headers?.host) return reply(403, { ok: false });
    } catch { return reply(400, { ok: false }); }
    const secret = key();
    if (!secret) return reply(503, { ok: false });
    try {
      const access = await token(secret);
      const headers = { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' };
      const google = (path, options = {}) => fetchFn(`${LIFESKIN_FIRESTORE_BASE}${path.startsWith(':') ? '' : '/'}${path}`, { ...options, headers, signal: AbortSignal.timeout(12000) });
      const read = async path => {
        const r = await google(path);
        if (r.status === 404) return null;
        if (!r.ok) throw new Error('read');
        const doc = await r.json();
        return { data: unpack(doc), updateTime: doc.updateTime };
      };
      if (body.action === 'check') {
        await read(`${ROOT}/config/fast`);
        return reply(200, { ok: true });
      }
      const sessionPath = `${ROOT}/sessions/${body.id}`;
      const session = (await read(sessionPath))?.data;
      if (!session || session.source?.weg || session.source?.scanWorkflow === 'skinreact') return reply(409, { ok: false });
      const signature = fastTicket(secret, body.id, session.createdAt);
      const config = fastKonfig((await read(`${ROOT}/config/fast`))?.data);
      if (body.action === 'start') {
        // Only a new, pre-capture primary LifeSkin session can opt in.
        const fresh = Date.parse(now()) - Date.parse(session.createdAt);
        const eligible = ['opened', 'wahl', 'named', 'camera', 'fotopara', 'fotokamera', 'captured', 'fotogati'].includes(session.step)
          && fresh >= 0 && fresh < 86400000;
        return reply(200, config.enabled && eligible ? { ok: true, enabled: true, ticket: signature } : { ok: true, enabled: false });
      }
      if (!ticketOk(body.ticket, signature)) return reply(403, { ok: false });
      const reportPath = `${ROOT}/reports/${body.id}`;
      const report = await read(reportPath);
      if (!report || !['scan', 'foto'].includes(session.typ) || report.data.createdAt !== session.createdAt) return reply(409, { ok: false });
      if (report.data.status !== 'wartet') return reply(200, { ok: true });
      if (body.answers && ['anliegen', 'lekura', 'kujdesi', 'perdorimi'].some(k => JSON.stringify(body.answers[k]) !== JSON.stringify(session.anamnese?.[k]))) return reply(409, { ok: false });
      // Require at least one actual stored photo, not a client-supplied count.
      const photo = await google(`${sessionPath}/photos?pageSize=1&mask.fieldPaths=blick`);
      if (!photo.ok || !(await photo.json()).documents?.length) return reply(409, { ok: false });
      const catalog = await Promise.all(['lf-acne', 'lf-pore', 'lf-pigment', 'lf-moistur', 'lf-clean'].map(async id => {
        const product = await read(`${ROOT}/products/${id}?mask.fieldPaths=name&mask.fieldPaths=availability`);
        return product ? { ...product.data, id } : { id, availability: 'hidden' };
      }));
      const recommendation = fastEmpfehlung(session.anamnese, config, catalog);
      const patch = { ...recommendation, status: 'fertig', freigabeAt: now(), weg: '',
        name: String(session.name || '').slice(0, 80), photos: report.data.photos || 1 };
      // Optimistic precondition protects clinician edits and orders racing generation.
      const commit = await google(':commit', { method: 'POST', body: JSON.stringify({ writes: [
        { update: { name: name(reportPath), fields: felder(patch) }, updateMask: { fieldPaths: Object.keys(patch) }, currentDocument: { updateTime: report.updateTime } },
        { update: { name: name(sessionPath), fields: felder({ source: { fast: true } }) }, updateMask: { fieldPaths: ['source.fast'] }, currentDocument: { exists: true } }
      ] }) });
      if (!commit.ok) {
        // A competing successful generation is an idempotent success.
        const latest = await read(reportPath);
        if (latest && latest.data.status !== 'wartet') return reply(200, { ok: true });
        throw new Error('commit');
      }
      return reply(200, { ok: true });
    } catch { return reply(503, { ok: false }); }
  };
}
export default createFastHandler();
