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

// WIE WEIT "UNTEN" DANEBEN LIEGT, in Bildpunkten.
//
// iOS (Safari, Instagram, Facebook) behaelt nach der Tastatur oder beim
// Wischen manchmal eine zu kleine Fensterhoehe (innerHeight). Alles mit
// "position: fixed; bottom: 0" steht dann mitten im Bildschirm - die
// Kaufleiste und jede andere feste Leiste um genau dasselbe Stueck.
// Der sichtbare Bereich (visualViewport) kennt die echte Unterkante; die
// Differenz ist das, was die Leiste nach unten muss. Bei Zoom, offenem
// Feld oder kleinen Abweichungen: 0 - dann nichts anfassen.
export function untenVersatz({ vvHoehe, vvOben = 0, fensterHoehe, zoom = 1, feldOffen = false } = {}) {
  if (feldOffen || !(vvHoehe > 0) || !(fensterHoehe > 0)) return 0;
  if (Math.abs(zoom - 1) > 0.01) return 0;
  const versatz = Math.round(vvOben + vvHoehe - fensterHoehe);
  return Math.abs(versatz) > 2 ? versatz : 0;
}

// Haelt eine feste Leiste an der echten Unterkante: setzt die
// CSS-Variable --unten (in px), die die Leiste in ihr transform rechnet.
// Laeuft bei jeder Aenderung des sichtbaren Bereichs und beim Wischen
// (hoechstens einmal je Bild).
export function festUntenHalten(leiste) {
  const vv = globalThis.visualViewport;
  if (!leiste || !vv || typeof window === "undefined") return () => {};
  let wartet = false;
  const setzen = () => {
    wartet = false;
    const versatz = untenVersatz({
      vvHoehe: vv.height,
      vvOben: vv.offsetTop,
      fensterHoehe: window.innerHeight,
      zoom: vv.scale,
      feldOffen: Boolean(document.activeElement?.matches?.("input, textarea, select"))
    });
    const wert = `${versatz}px`;
    if (leiste.style.getPropertyValue("--unten") !== wert) leiste.style.setProperty("--unten", wert);
  };
  const bald = () => {
    if (wartet) return;
    wartet = true;
    requestAnimationFrame(setzen);
  };
  vv.addEventListener("resize", bald, { passive: true });
  vv.addEventListener("scroll", bald, { passive: true });
  window.addEventListener("scroll", bald, { passive: true });
  window.addEventListener("resize", bald, { passive: true });
  document.addEventListener("focusout", () => setTimeout(bald, 150));
  setzen();
  return bald;
}
