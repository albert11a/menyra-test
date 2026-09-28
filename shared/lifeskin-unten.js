// iOS RECHNET "UNTEN" NICHT IMMER NEU.
//
// Safari, Instagram und Facebook (alle WKWebView): Schliesst sich die
// Tastatur (Kasse, Kommentar, Name) oder ein Vollbild, oder kommt man aus
// einer anderen App bzw. einem anderen Tab zurueck, bleiben Leisten mit
// "position: fixed; bottom: 0" mitten im Bildschirm stehen - bis man
// weiterwischt. Ein Scroll um einen Punkt hin und zurueck zwingt iOS, neu
// zu rechnen; man sieht ihn nicht. Nie, solange ein Feld den Fokus hat -
// sonst springt die Tastatur.
//
// SOFORT, NICHT SANFT. Die Landingpage setzt html { scroll-behavior:
// smooth }; damit ist jedes window.scrollTo() ein sanftes Scrollen - im
// Moment des Aufrufs passiert nichts, und iOS rechnet nichts neu. Der
// Trick wirkte dort deshalb nie. behavior "instant" gilt unabhaengig vom
// Stilblatt; aeltere Browser kennen den Wert nicht und werfen: dann ohne.
//
// Am unteren Ende der Seite geht "+1" ins Leere; dann einen Punkt nach
// oben und zurueck.
//
// Gibt die Funktion zurueck, damit eine Seite sie auch selbst aufrufen
// kann (beim Schliessen eines eigenen Vollbilds).
export function einPunktHinUndZurueck(fenster = globalThis.window) {
  if (!fenster?.scrollTo) return;
  const x = fenster.scrollX || 0;
  const y = fenster.scrollY || 0;
  const springen = (top) => {
    try {
      fenster.scrollTo({ top, left: x, behavior: "instant" });
    } catch {
      fenster.scrollTo(x, top);
    }
  };
  springen(y > 0 ? y - 1 : y + 1);
  springen(y);
}

export function untenNachziehenStarten({ nachher } = {}) {
  if (typeof document === "undefined" || typeof window === "undefined") return () => {};
  const nachziehen = () => {
    if (document.activeElement?.matches?.("input, textarea, select")) return;
    requestAnimationFrame(() => {
      einPunktHinUndZurueck(window);
      nachher?.();
    });
  };
  document.addEventListener("focusout", (e) => {
    if (e.target instanceof Element && e.target.matches("input, textarea, select")) setTimeout(nachziehen, 150);
  });
  // Waechst der sichtbare Bereich deutlich (Tastatur zu), ebenfalls - aber
  // nicht bei den kleinen Spruengen der Browserleiste beim Wischen.
  const vv = globalThis.visualViewport;
  let hoehe = vv?.height || 0;
  vv?.addEventListener("resize", () => {
    if (vv.height - hoehe > 120) setTimeout(nachziehen, 80);
    hoehe = vv.height;
  }, { passive: true });
  // Rueckkehr aus einer anderen App / einem anderen Tab und aus dem
  // Verlaufsspeicher (Zurueck-Geste): iOS legt feste Leisten dabei oft
  // falsch hin.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") setTimeout(nachziehen, 80);
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) setTimeout(nachziehen, 80);
  });
  // Ein Bildschirm des Trichters kommt ins Bild (data-aktiv="ja") - vor
  // allem die Landingpage nach dem Zurueck aus Name oder Nummer: Die
  // Tastatur ging dort zu, als das Dokument nicht scrollte, und der Punkt
  // von oben ging ins Leere. Jetzt scrollt es wieder, also jetzt.
  if (typeof MutationObserver === "function" && document.body) {
    new MutationObserver((aenderungen) => {
      if (aenderungen.some((a) => a.target?.getAttribute?.("data-aktiv") === "ja")) setTimeout(nachziehen, 80);
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-aktiv"] });
  }
  return nachziehen;
}
