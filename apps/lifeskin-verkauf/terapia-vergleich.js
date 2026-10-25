import { vergleichLesen, vergleichVollstaendig } from "../../shared/lifeskin-vergleich.js";

export function vergleichPosition(clientX, rechteck) {
  if (!Number.isFinite(clientX) || !(rechteck.width > 0)) return null;
  return Math.max(0, Math.min(100, (clientX - rechteck.left) / rechteck.width * 100));
}

// One native range input: touch, mouse, keyboard and screen readers. Moving
// the divider only changes a CSS variable; neither image moves or resizes.
export function zeigeVergleich(wurzel, wert) {
  if (!wurzel) return;
  wurzel._vergleichAbbauen?.();
  wurzel.replaceChildren();
  wurzel.hidden = true;
  if (!vergleichVollstaendig(wert)) return;
  const paar = vergleichLesen(wert);
  const doc = wurzel.ownerDocument;
  const buehne = doc.createElement("div");
  buehne.className = "vergleich__buehne";
  buehne.style.setProperty("--teilung", "50%");
  const bilder = ["nachher", "vorher"].map((seite) => {
    const bild = doc.createElement("img");
    bild.className = `vergleich__${seite}`;
    bild.alt = seite === "vorher" ? "Para" : "Pas";
    bild.decoding = "async";
    bild.draggable = false;
    buehne.append(bild);
    return bild;
  });
  for (const text of ["Para", "Pas"]) {
    const label = doc.createElement("span");
    label.className = `vergleich__label vergleich__label--${text.toLowerCase()}`;
    label.textContent = text;
    buehne.append(label);
  }
  const griff = doc.createElement("span");
  griff.className = "vergleich__griff";
  griff.setAttribute("aria-hidden", "true");
  griff.innerHTML = '<b>‹</b><b>›</b>';
  const regler = doc.createElement("input");
  regler.type = "range";
  regler.min = "0";
  regler.max = "100";
  regler.value = "50";
  regler.className = "vergleich__regler";
  regler.setAttribute("aria-label", "Krahasoni fotot para dhe pas");
  regler.addEventListener("input", () => buehne.style.setProperty("--teilung", `${regler.value}%`));
  // Mobile browsers can restrict native range taps to the invisible track.
  // Map the whole image to the divider; keep the native input for keyboards.
  let zeiger = null;
  const positionSetzen = (ereignis) => {
    const position = vergleichPosition(ereignis.clientX, buehne.getBoundingClientRect());
    if (position === null) return;
    regler.value = String(Math.round(position));
    buehne.style.setProperty("--teilung", `${regler.value}%`);
  };
  regler.addEventListener("pointerdown", (ereignis) => {
    if (ereignis.isPrimary === false || (ereignis.button !== undefined && ereignis.button !== 0)) return;
    ereignis.preventDefault();
    zeiger = ereignis.pointerId;
    regler.focus?.({ preventScroll: true });
    regler.setPointerCapture?.(zeiger);
    positionSetzen(ereignis);
  });
  regler.addEventListener("pointermove", (ereignis) => {
    if (zeiger !== null && ereignis.pointerId === zeiger) positionSetzen(ereignis);
  });
  const ende = () => { zeiger = null; };
  regler.addEventListener("pointerup", ende);
  regler.addEventListener("pointercancel", ende);
  regler.addEventListener("lostpointercapture", ende);
  buehne.append(griff, regler);
  const hinweis = doc.createElement("figcaption");
  hinweis.textContent = "Prekni ose rrëshqitni foton për të krahasuar";
  wurzel.append(buehne, hinweis);
  let aktiv = true;
  let beobachter;
  let geladen = 0;
  const fehler = () => { if (aktiv) wurzel.hidden = true; };
  bilder.forEach((bild) => {
    bild.addEventListener("error", fehler, { once: true });
    bild.addEventListener("load", () => {
      if (++geladen === 2 && aktiv) buehne.dataset.bereit = "ja";
    }, { once: true });
  });
  const laden = () => {
    beobachter?.disconnect();
    bilder[0].src = paar.nachher;
    bilder[1].src = paar.vorher;
  };
  wurzel._vergleichAbbauen = () => { aktiv = false; beobachter?.disconnect(); };
  wurzel.hidden = false;
  if (typeof IntersectionObserver === "function") {
    beobachter = new IntersectionObserver((eintraege) => {
      if (eintraege.some((e) => e.isIntersecting)) laden();
    }, { rootMargin: "400px" });
    beobachter.observe(wurzel);
  } else laden();
}
