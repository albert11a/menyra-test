// A read/write transaction prevents a late public request from recreating data
// after deletion has locked or removed its parent Business page.
export async function guardedCreatorWrite({ base, headers, pagePath, write, writes, create = false, requireExisting = false, conflictRetry = false, fetchFn = fetch }) {
  const request = (url, options = {}) => fetchFn(url, { ...options, headers, signal: AbortSignal.timeout(10000) });
  const start = await request(`${base}:beginTransaction`, { method: 'POST', body: '{}' });
  if (!start.ok) throw Error('Seite konnte nicht geprüft werden. Bitte erneut versuchen.');
  const { transaction } = await start.json();
  if (!transaction) throw Error('Seitenprüfung ist unvollständig.');
  let committed = false;
  try {
    const snapshot = writes
      ? await request(`${base}:batchGet`, { method: 'POST', body: JSON.stringify({transaction,documents:[`${new URL(base).pathname.slice('/v1/'.length)}/${pagePath}`]}) })
      : await request(`${base}/${pagePath}?transaction=${encodeURIComponent(transaction)}`);
    if (!snapshot.ok) throw Error('Diese Business-Seite ist nicht mehr verfügbar.');
    const data = await snapshot.json();
    const page = writes ? data[0]?.found : data;
    if (page?.fields?.published?.booleanValue !== true || page.fields?.deleting?.booleanValue === true) throw Error('Diese Business-Seite ist nicht mehr verfügbar.');
    const response = await request(`${base}:commit`, { method: 'POST', body: JSON.stringify({ transaction, writes: writes || [write] }) });
    if(conflictRetry && !response.ok){
      const conflict=[409,412].includes(response.status)||(response.status===400&&(await response.json().catch(()=>null))?.error?.status==='FAILED_PRECONDITION');
      if(conflict)throw Object.assign(Error('Besuch wurde gleichzeitig aktualisiert.'),{code:'CREATOR_VISIT_CONFLICT'});
    }
    if (create && [409,412].includes(response.status)) return false;
    if (requireExisting && [404,409,412].includes(response.status)) return false;
    if (!response.ok) throw Error('Seite wurde geändert. Bitte erneut versuchen.');
    committed = true; return true;
  } finally {
    if (!committed) await request(`${base}:rollback`, { method: 'POST', body: JSON.stringify({ transaction }) }).catch(() => {});
  }
}
