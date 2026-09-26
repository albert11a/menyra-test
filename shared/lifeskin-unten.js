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
// SOFORT, NICHT SANFT. Steht auf der Seite html { scroll-behavior: smooth },
// ist jedes window.scrollTo() ein sanftes Scrollen: Im Moment des Aufrufs
// passiert nichts, iOS rechnet nichts neu - der Trick wirkte deshalb auf
// der Therapieseite nie. Fuer den einen Punkt wird das Verhalten kurz auf
// "auto" (= sofort) gestellt.
//
// beimZurueckkommen: auch nach der Rueckkehr aus einer anderen App / einem
// anderen Tab (visibilitychange) und aus dem Verlaufsspeicher (pageshow).
//
// Gibt die Funktion zurueck, damit eine Seite sie auch selbst aufrufen
// kann (beim Schliessen eines eigenen Vollbilds).
export function untenNachziehenStarten({ nachher, beimZurueckkommen = false } = {}) {
  if (typeof document === "undefined" || typeof window === "undefined") return () => {};
  const nachziehen = () => {
    if (document.activeElement?.matches?.("input, textarea, select")) return;
    requestAnimationFrame(() => {
      einPunktHinUndZurueck();
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
  if (beimZurueckkommen) {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") setTimeout(nachziehen, 80);
    });
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) setTimeout(nachziehen, 80);
    });
  }
  return nachziehen;
}

// Ein Punkt hin und zurueck, sofort - auch wenn die Seite sanftes Scrollen
// eingestellt hat. Ganz unten geht es einen Punkt nach oben statt nach unten
// (dort gibt es kein "weiter"); ganz oben einen nach unten.
export function einPunktHinUndZurueck(fenster = window, dokument = document) {
  const wurzel = dokument.documentElement;
  const vorher = wurzel.style.scrollBehavior;
  wurzel.style.scrollBehavior = "auto";
  const x = fenster.scrollX;
  const y = fenster.scrollY;
  fenster.scrollTo(x, y > 0 ? y - 1 : y + 1);
  fenster.scrollTo(x, y);
  wurzel.style.scrollBehavior = vorher;
}
