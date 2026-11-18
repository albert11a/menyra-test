import { schluessel, zugangHolen, wert } from "../api/lifeskin-meldung.js";

const name = "projects/menyra-c0e68/databases/(default)/documents";
const base = "https://firestore.googleapis.com/v1/" + name;
export const stamp = () => new Date();
function value(v) {
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(value) } };
  if (v === null) return { nullValue: null };
  if (typeof v === "object") return { mapValue: { fields: fields(v) } };
  if (typeof v === "number")
    return Number.isInteger(v)
      ? { integerValue: String(v) }
      : { doubleValue: v };
  return typeof v === "boolean"
    ? { booleanValue: v }
    : { stringValue: String(v) };
}
function fields(data) {
  return Object.fromEntries(
    Object.entries(data).map(([key, v]) => [key, value(v)]),
  );
}
function decode(doc) {
  return {
    id: doc.name.split("/").at(-1),
    version: doc.updateTime,
    data: Object.fromEntries(
      Object.entries(doc.fields || {}).map(([k, v]) => [k, wert(v)]),
    ),
  };
}
export function change(path, data, version, patch = false) {
  return {
    update: { name: name + "/" + path, fields: fields(data) },
    ...(patch ? { updateMask: { fieldPaths: Object.keys(data) } } : {}),
    ...(version === false
      ? { currentDocument: { exists: false } }
      : version
        ? { currentDocument: { updateTime: version } }
        : {}),
  };
}
export function remove(path, version) {
  return {
    delete: name + "/" + path,
    currentDocument: { updateTime: version },
  };
}
export function problem(status, message) {
  return Object.assign(new Error(message), { status });
}
export async function v2Store() {
  const token = await zugangHolen(schluessel());
  async function request(path, body) {
    const res = await fetch(base + path, {
      method: body ? "POST" : "GET",
      headers: {
        authorization: "Bearer " + token,
        "content-type": "application/json",
      },
      body: body && JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 404 && !body) return null;
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      if (
        ["ABORTED", "FAILED_PRECONDITION", "ALREADY_EXISTS"].includes(
          detail.error?.status,
        )
      )
        throw problem(409, "Të dhënat ndryshuan. Provo përsëri.");
      throw problem(503, "Shërbimi nuk është në dispozicion. Provo përsëri.");
    }
    return res.json();
  }
  return {
    async read(path) {
      const doc = await request("/" + path);
      return doc && decode(doc);
    },
    async query(
      collection,
      { parent = "", where, order, limit = 100, start } = {},
    ) {
      const q = { from: [{ collectionId: collection }], limit };
      if (where)
        q.where = {
          fieldFilter: {
            field: { fieldPath: where[0] },
            op: "EQUAL",
            value: value(where[1]),
          },
        };
      if (order)
        q.orderBy = [{ field: { fieldPath: order }, direction: "DESCENDING" }];
      if (start)
        q.startAt = {
          values: [{ referenceValue: name + "/" + collection + "/" + start }],
          before: false,
        };
      return (
        await request((parent ? "/" + parent : "") + ":runQuery", {
          structuredQuery: q,
        })
      ).flatMap((r) => (r.document ? [decode(r.document)] : []));
    },
    commit(writes) {
      return request(":commit", { writes });
    },
  };
}
