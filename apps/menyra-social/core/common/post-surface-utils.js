// Wo ein Business-Beitrag zuhause ist.
//
// Der Composer kennt drei Seiten: "Postim", "Story" und "Profil". Postim und
// Profil schrieben frueher denselben Beitrag - einmal nach socialFeed und
// einmal nach restaurants/{rid}/socialPosts - und standen darum immer auf
// beiden Flaechen. Dieses Feld trennt die beiden Wege:
//
//   surface "feed"    -> laeuft im Feed, nicht im Profil-Grid
//   surface "profile" -> steht im Profil-Grid, nie im Feed
//
// Der Beitrag wird in beiden Faellen unter restaurants/{rid}/socialPosts
// abgelegt. Das bleibt die eine Wahrheit pro Beitrag: daran haengen Loeschen,
// Zaehler und das Aufraeumen im CRM. Nur der Eintrag in socialFeed entsteht
// allein fuer "feed".
//
// Beitraege von frueher tragen das Feld nicht. Sie gelten weiter als
// Profil-Beitraege und bleiben damit sichtbar, wo sie immer standen - eine
// Migration ist nicht noetig.

export const POST_SURFACE_FEED = "feed";
export const POST_SURFACE_PROFILE = "profile";

export function normalizePostSurfaceCore(value = "") {
  const key = String(value || "").trim().toLowerCase();
  if (key === POST_SURFACE_FEED) return POST_SURFACE_FEED;
  if (key === POST_SURFACE_PROFILE) return POST_SURFACE_PROFILE;
  return "";
}

// Welche Flaeche ein Composer-Modus schreibt. "profile" ist die einzige
// Seite, die im Profil landet; alles andere (auch ein unbekannter Modus)
// geht in den Feed und entspricht damit dem Verhalten von vorher.
export function resolvePostSurfaceForComposerModeCore(mode = "") {
  return String(mode || "").trim().toLowerCase() === POST_SURFACE_PROFILE
    ? POST_SURFACE_PROFILE
    : POST_SURFACE_FEED;
}

// Ohne Feld = Beitrag von frueher = gehoert ins Profil.
export function isProfileSurfacePostCore(post = {}) {
  return normalizePostSurfaceCore(post?.surface) !== POST_SURFACE_FEED;
}

export function filterProfileSurfacePostsCore(posts = []) {
  return (Array.isArray(posts) ? posts : []).filter(isProfileSurfacePostCore);
}
