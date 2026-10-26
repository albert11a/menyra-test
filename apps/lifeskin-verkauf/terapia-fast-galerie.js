import { medienAusDokument, medienListe } from '../../shared/lifeskin-medien.js';

// Only public gallery documents. Private session photos are never requested.
export async function fastMedienLaden({ basis, tenant = 'lifeskin', fetchFn = globalThis.fetch } = {}) {
  if (!basis || typeof fetchFn !== 'function') return [];
  const media = [];
  const seen = new Set();
  let page = '';
  try {
    do {
      const query = new URLSearchParams({ pageSize: '100' });
      if (page) query.set('pageToken', page);
      const response = await fetchFn(`${basis}/lifeskin/${encodeURIComponent(tenant)}/medien?${query}`, { signal: AbortSignal.timeout(8000) });
      if (!response?.ok) return [];
      const data = await response.json();
      media.push(...(data.documents || []).map(medienAusDokument));
      page = String(data.nextPageToken || '');
      if (page && seen.has(page)) throw new Error('Repeated gallery page');
      if (page) seen.add(page);
    } while (page);
    // Same ordering, enabled state and initial defaults as Heart's gallery.
    return medienListe(media).filter(m => m.aktiv && m.bild);
  } catch { return []; }
}

export function fastRasteAuswahl(list) {
  // Respect cases that Heart has disabled everywhere; include every published
  // case, irrespective of which products this customer's set contains.
  return (list || []).filter(r => r.analiza || r.landing || r.shop);
}
