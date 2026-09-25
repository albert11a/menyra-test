// iOS RECHNET "UNTEN" NACH DER TASTATUR NICHT NEU.
//
// Safari, Instagram und Facebook (alle WKWebView): Schliesst sich die
// Tastatur (Kasse, Kommentar, Name) oder ein Vollbild, bleiben Leisten mit
// "position: fixed; bottom: 0" mitten im Bildschirm stehen - bis man
// weiterwischt. Ein Scroll um einen Punkt hin und zurueck zwingt iOS, neu
// zu rechnen; man sieht ihn nicht. Nie, solange ein Feld den Fokus hat -
// sonst springt die Tastatur.
//
// Gibt die Funktion zurueck, damit eine Seite sie auch selbst aufrufen
// kann (beim Schliessen eines eigenen Vollbilds).
export function untenNachziehenStarten({ nachher } = {}) {
  if (typeof document === "undefined" || typeof window === "undefined") return () => {};
  const nachziehen = () => {
    if (document.activeElement?.matches?.("input, textarea, select")) return;
    requestAnimationFrame(() => {
      const x = window.scrollX;
      const y = window.scrollY;
      window.scrollTo(x, y + 1);
      window.scrollTo(x, y);
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
  return nachziehen;
}
