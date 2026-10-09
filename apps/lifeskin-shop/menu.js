// MENU OBEN LINKS UND TABS IM KOPF (09.10., Inhaber).
//
// - Drei Striche oben links oeffnen das Menu (<dialog id="menu">):
//   Trajtimet (die Sets aus Heart, shop.js zeichnet sie), Rreth nesh,
//   Përdorimi. X, Esc, ein Tipp daneben, ein Link oder "Porosit" schliessen es.
// - Aufklapper mit data-gruppe: Geht einer auf, schliessen die anderen der
//   Gruppe - die Karte wird nie lang. <details name> kann das in neuen
//   Browsern selbst, hier fuer alle.
// Nur Darstellung - keine Zaehlung, kein Pixel.

export function nurEinerOffen(dok = globalThis.document) {
  dok?.addEventListener?.("toggle", (ereignis) => {
    const auf = ereignis.target;
    const gruppe = auf?.dataset?.gruppe;
    if (!gruppe || !auf.open) return;
    for (const anderer of dok.querySelectorAll(`details[data-gruppe="${gruppe}"]`)) {
      if (anderer !== auf && anderer.open) anderer.open = false;
    }
  }, true);
}

export function menuStarten(dok = globalThis.document) {
  const menu = dok?.getElementById?.("menu");
  const hap = dok?.getElementById?.("menu-hap");
  if (!menu || !hap) return null;
  const zu = () => {
    if (menu.open) menu.close?.();
  };
  menu.addEventListener("close", () => {
    hap.setAttribute("aria-expanded", "false");
    dok.documentElement?.removeAttribute?.("data-menu");
  });
  hap.addEventListener("click", () => {
    // Das Duo zeigt im Menu dasselbe Set-Bild wie oben (Titelbild aus Heart).
    const oben = dok.querySelector?.(".hero-set > img");
    const quelle = oben?.currentSrc || oben?.getAttribute?.("src");
    if (quelle) for (const bild of menu.querySelectorAll("img[data-hero-bild]")) if (bild.getAttribute("src") !== quelle) bild.src = quelle;
    if (typeof menu.showModal === "function") menu.showModal(); else menu.setAttribute("open", "");
    hap.setAttribute("aria-expanded", "true");
    dok.documentElement?.setAttribute?.("data-menu", "");
  });
  dok.getElementById("menu-mbyll")?.addEventListener("click", zu);
  menu.addEventListener("click", (ereignis) => {
    // Tipp auf den dunklen Rand (das Dialog-Element selbst) schliesst.
    if (ereignis.target === menu) { zu(); return; }
    if (ereignis.target.closest?.("a[href^='#'], [data-set]")) zu();
  });
  return { zu };
}

if (globalThis.document?.getElementById?.("menu")) {
  nurEinerOffen();
  menuStarten();
}
