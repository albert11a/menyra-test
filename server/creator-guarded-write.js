// A read/write transaction prevents a late public request from recreating data
// after deletion has locked or removed its parent Business page.
export async function guardedCreatorWrite({ base, headers, pagePath, write, create = false, requireExisting = false, fetchFn = fetch }) {
  const request = (url, options = {}) => fetchFn(url, { ...options, headers, signal: AbortSignal.timeout(10000) });
  const start = await request(`${base}:beginTransaction`, { method: 'POST', body: '{}' });
  if (!start.ok) throw Error('Seite konnte nicht geprüft werden. Bitte erneut versuchen.');
  const { transaction } = await start.json();
  if (!transaction) throw Error('Seitenprüfung ist unvollständig.');
  let committed = false;
  try {
    const snapshot = await request(`${base}/${pagePath}?transaction=${encodeURIComponent(transaction)}`);
    if (!snapshot.ok) throw Error('Diese Business-Seite ist nicht mehr verfügbar.');
    const page = await snapshot.json();
    if (page.fields?.published?.booleanValue !== true || page.fields?.deleting?.booleanValue === true) throw Error('Diese Business-Seite ist nicht mehr verfügbar.');
    const response = await request(`${base}:commit`, { method: 'POST', body: JSON.stringify({ transaction, writes: [write] }) });
    if (create && [409,412].includes(response.status)) return false;
    if (requireExisting && [404,409,412].includes(response.status)) return false;
    if (!response.ok) throw Error('Seite wurde geändert. Bitte erneut versuchen.');
    committed = true; return true;
  } finally {
    if (!committed) await request(`${base}:rollback`, { method: 'POST', body: JSON.stringify({ transaction }) }).catch(() => {});
  }
}
