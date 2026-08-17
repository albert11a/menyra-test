// Heart: die GO-Zahlen holen.
//
// Nur holen. Gerechnet wird auf dem Server - die Buchungen liegen ueber alle
// Lokale verteilt, und die Regeln geben sie einem Browser gar nicht frei.
// Eine Geldsumme, die im Browser entsteht, kann im Browser auch geaendert
// werden.

export function createHeartGoAdapter({ apiClient } = {}) {
  async function loadOverview({ days = 30 } = {}) {
    const window = Math.max(1, Math.trunc(Number(days) || 30));
    const payload = await apiClient.request(`heartGetGoOverview?days=${window}`);
    return payload?.data || null;
  }

  return { loadOverview };
}
