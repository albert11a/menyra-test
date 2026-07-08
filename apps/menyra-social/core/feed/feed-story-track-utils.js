// Pure Helfer fuer die Feed-Story-Reihe (ohne DOM/Firebase), damit die
// Entscheidung "welche echte Story bleibt und in welcher Reihenfolge" testbar
// ist. Verwendet in feed-view-orchestration-controller.js.
//
// Grundregel (vom Nutzer bestaetigt): echte, aktive Storys werden NIE nur wegen
// fehlender Stadt-/Standortdaten aus der Reihe geworfen – sie werden nur bei
// EINDEUTIG fremder Stadt verworfen. Fehlt die Info, bleibt die Story erhalten
// und wird lediglich spaeter einsortiert (nah -> unbekannt -> fern).

export const STORY_SCOPE_NEAR = "near";
export const STORY_SCOPE_UNKNOWN = "unknown";
export const STORY_SCOPE_FOREIGN = "foreign";

// Klassifiziert die geografische Naehe einer Story anhand bereits berechneter
// Signale (Stadt-Treffer / erkannte fremde Stadt). So bleibt diese Funktion frei
// von den DOM-/State-abhaengigen City-Helfern des Controllers.
export function classifyStoryGeoScope({
  hasViewerCity = false,
  cityMatchesViewer = false,
  businessHasKnownForeignCity = false
} = {}) {
  if (!hasViewerCity) return STORY_SCOPE_NEAR;
  if (cityMatchesViewer) return STORY_SCOPE_NEAR;
  if (businessHasKnownForeignCity) return STORY_SCOPE_FOREIGN;
  return STORY_SCOPE_UNKNOWN;
}

// Eine echte Story wird nur bei eindeutig fremder Stadt verworfen.
export function shouldKeepStoryInScope(scope = STORY_SCOPE_UNKNOWN) {
  return scope !== STORY_SCOPE_FOREIGN;
}

// Sortiergewicht: nah zuerst, dann unbekannt, dann fern.
export function storyScopeOrderRank(scope = STORY_SCOPE_UNKNOWN) {
  if (scope === STORY_SCOPE_NEAR) return 0;
  if (scope === STORY_SCOPE_UNKNOWN) return 1;
  return 2;
}

// Vergleicht zwei Story-Meta-Eintraege fuer die Reihenfolge in der Reihe:
// 1) Scope-Rang (nah -> unbekannt -> fern)
// 2) endliche Distanz vor unendlicher, sonst nach Distanz
// 3) Live-Storys vor nicht-live
// 4) neuere Storys zuerst (createdAtMs desc)
// 5) stabiler Fallback-Index
export function compareStoryTrackMeta(a = {}, b = {}) {
  const rankDiff = storyScopeOrderRank(a.scope) - storyScopeOrderRank(b.scope);
  if (rankDiff !== 0) return rankDiff;
  const aDist = Number(a.distanceKm);
  const bDist = Number(b.distanceKm);
  const aFinite = Number.isFinite(aDist);
  const bFinite = Number.isFinite(bDist);
  if (aFinite && bFinite && Math.abs(aDist - bDist) > 0.001) return aDist - bDist;
  if (aFinite !== bFinite) return aFinite ? -1 : 1;
  const aLive = a.isLive ? 1 : 0;
  const bLive = b.isLive ? 1 : 0;
  if (aLive !== bLive) return bLive - aLive;
  const aCreated = Number(a.createdAtMs) || 0;
  const bCreated = Number(b.createdAtMs) || 0;
  if (aCreated !== bCreated) return bCreated - aCreated;
  return (Number(a.fallbackIndex) || 0) - (Number(b.fallbackIndex) || 0);
}

// Baut die gemischte Reihe: ALLE echten Storys zuerst, danach die
// Discovery-/Best-Spot-Kacheln. Storys tarnen sich nie als Spots und
// umgekehrt.
export function buildStoryFirstTrackItems({ stories = [], spots = [] } = {}) {
  const safeStories = Array.isArray(stories) ? stories : [];
  const safeSpots = Array.isArray(spots) ? spots : [];
  return [
    ...safeStories.map((story) => ({ type: "story", story })),
    ...safeSpots.map((spot) => ({ type: "spot", spot }))
  ];
}
