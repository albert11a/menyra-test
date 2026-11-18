import { wert } from "../../api/lifeskin-meldung.js";
import { problem } from "../../server/v2-store.js";
const prefix = "projects/menyra-c0e68/databases/(default)/documents/";
export function memoryStore() {
  let docs = new Map(),
    revision = 0;
  return {
    read: async (path) => docs.get(path) || null,
    query: async (
      col,
      { parent = "", where, order, limit = 100, start } = {},
    ) => {
      const base = (parent ? parent + "/" : "") + col + "/";
      return [...docs]
        .filter(
          ([k]) => k.startsWith(base) && !k.slice(base.length).includes("/"),
        )
        .map(([, r]) => r)
        .filter(
          (r) =>
            (!where || r.data[where[0]] === where[1]) &&
            (!start || r.id > start),
        )
        .sort((a, b) => order === "__name__" ? (a.id < b.id ? -1 : Number(a.id > b.id)) :
          String(b.data[order] || b.id).localeCompare(
            String(a.data[order] || a.id),
          ),
        )
        .slice(0, limit);
    },
    commit: async (writes) => {
      const next = new Map(docs);
      for (const w of writes) {
        const path = (w.delete || w.update.name).slice(prefix.length),
          r = docs.get(path),
          guard = w.currentDocument;
        if (
          (guard?.exists === false && r) ||
          (guard?.updateTime && r?.version !== guard.updateTime)
        )
          throw problem(409, "Conflict");
        if (w.delete) {
          next.delete(path);
          continue;
        }
        const data = Object.fromEntries(
          Object.entries(w.update.fields).map(([k, v]) => [k, wert(v)]),
        );
        next.set(path, {
          id: path.split("/").at(-1),
          version: String(++revision),
          data: { ...(w.updateMask ? r?.data : {}), ...data },
        });
      }
      docs = next;
    },
  };
}
