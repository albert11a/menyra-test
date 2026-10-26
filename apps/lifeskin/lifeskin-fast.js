import { LIFESKIN_FIRESTORE_BASE } from './lifeskin-config.js';

// A tab's mode is decided once, before capture. It never changes mid-question.
export class FastLauf {
  constructor(session, { storage = null, fetchFn = globalThis.fetch?.bind(globalThis) } = {}) {
    this.session = session;
    this.storage = storage;
    this.fetchFn = fetchFn;
    this.key = `lifeskin:fast:${session.id}`;
    this.ticket = '';
    this.ready = null;
    try { this.saved = JSON.parse(storage?.getItem(this.key) || 'null'); } catch { this.saved = null; }
    if (this.saved?.ticket) this.ticket = this.saved.ticket;
    this.typ = this.saved?.typ || '';
    this.answers = this.saved?.answers || null;
    this.pending = this.saved?.pending === true;
  }
  get active() { return Boolean(this.ticket) && ['scan', 'foto'].includes(this.typ); }
  select(typ) {
    this.typ = typ;
    if (this.saved) this.persist();
  }
  persist() {
    this.saved = { ticket: this.ticket, typ: this.typ, answers: this.answers, pending: this.pending };
    try { this.storage?.setItem(this.key, JSON.stringify(this.saved)); } catch { /* in-memory mode still works */ }
  }
  remember(answers) {
    this.answers = { ...answers };
    this.persist();
  }
  markPending() { this.pending = true; this.persist(); }
  finish() { this.pending = false; this.persist(); }
  async request(action) {
    const r = await this.fetchFn('/api/lifeskin-fast', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id: this.session.id, ...(this.ticket ? { ticket: this.ticket } : {}),
        ...(action === 'generate' && this.answers ? { answers: this.answers } : {}) }), signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw new Error('fast-save');
    const data = await r.json();
    if (!data.ok) throw new Error('fast-save');
    return data;
  }
  decide() {
    if (this.ready) return this.ready;
    this.ready = (async () => {
      if (this.saved) return Boolean(this.ticket);
      let choice = { enabled: false };
      try {
        const r = await this.fetchFn(`${LIFESKIN_FIRESTORE_BASE}/lifeskin/lifeskin/config/fast`, { signal: AbortSignal.timeout(3000) });
        if (r.ok && (await r.json())?.fields?.enabled?.booleanValue === true) {
          await this.session.kette;
          choice = await this.request('start');
        }
      } catch { /* An unavailable switch leaves the existing funnel active. */ }
      this.ticket = choice.ticket || '';
      this.persist();
      return Boolean(this.ticket);
    })();
    return this.ready;
  }
  async generate() {
    if (!this.ticket) throw new Error('fast-ticket');
    // A failed background answer PATCH is retried before every publication.
    if (this.answers) await this.session.ergaenze({ anamnese: this.answers,
      ...(this.answers.emri ? { name: String(this.answers.emri).slice(0, 80) } : {}),
      ...(this.answers.mosha ? { ageBand: this.answers.mosha } : {}) });
    await this.session.kette;
    return this.request('generate');
  }
}
