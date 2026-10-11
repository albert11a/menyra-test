import { personalRoutine } from './lifeskin-personal-routine.js';
export const RUTINA_EVENTS = Object.freeze(['start', 'finish', 'details', 'order']);
export function rutinaEvent(kind, ids = [], at = new Date().toISOString(), id = `r${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`) {
  const set = personalRoutine(ids);
  if (!RUTINA_EVENTS.includes(kind) || (kind !== 'start' && !set) || !/^r[a-z0-9]{6,40}$/.test(id) || !Number.isFinite(Date.parse(at))) return null;
  return { id, kind, at, ids: set?.produkte || [], price: set?.cmimi || 0 };
}
export function rutinaEvents(session) {
  return Object.entries(session?.timings?.rutina || {}).flatMap(([id, raw]) => {
    const event = rutinaEvent(raw?.kind, raw?.ids, raw?.at, id);
    // Finished price is the immutable displayed snapshot, not today's catalog price.
    return event && Number(raw.price) === event.price ? [event] : [];
  });
}
