// ZUSCHNEIDEN IN HEART - ein Bild in einem festen Rahmen verschieben und
// zoomen, dann genau diesen Ausschnitt als JPEG ausgeben.
//
// Genutzt fuer das Titelbild des Ladens (/lifeskinshop, Karte
// "Shop-Titelbild"). Der Rahmen hat das Seitenverhaeltnis, in dem das Bild
// im Shop steht; was hier im Rahmen zu sehen ist, steht dort.
//
// REINES DOM, KEIN ZUSTAND IN HEART: Waehrend des Ziehens zeichnet Heart
// nicht neu (das wuerde den Ausschnitt zuruecksetzen). Gehorcht wird am
// Dokument, damit es fuer einen Rahmen gilt, der erst spaeter gezeichnet
// wird:
//   [data-schnitt-rahmen]  der Rahmen (overflow hidden, festes Verhaeltnis)
//   [data-schnitt-bild]    das Bild darin
//   [data-schnitt-zoom]    ein Schieberegler 1 ... 4

const lage = { w: 0, h: 0, rw: 0, rh: 0, zoom: 1, dx: 0, dy: 0, bereit: false };

function rahmen() { return document.querySelector("[data-schnitt-rahmen]"); }
function bild() { return document.querySelector("[data-schnitt-bild]"); }

// Rahmen und Bild wiegen: Das Bild deckt den Rahmen immer ganz (wie
// object-fit: cover), der Zoom vergroessert darueber hinaus.
function mass() {
  const s0 = Math.max(lage.rw / lage.w, lage.rh / lage.h);
  return s0 * lage.zoom;
}

function begrenzen() {
  const s = mass();
  lage.dx = Math.min(0, Math.max(lage.rw - lage.w * s, lage.dx));
  lage.dy = Math.min(0, Math.max(lage.rh - lage.h * s, lage.dy));
}

function zeigen() {
  const el = bild();
  if (!el || !lage.bereit) return;
  const s = mass();
  el.style.width = `${lage.w * s}px`;
  el.style.height = `${lage.h * s}px`;
  el.style.transform = `translate(${lage.dx}px, ${lage.dy}px)`;
}

function einrichten() {
  const r = rahmen();
  const el = bild();
  if (!r || !el || !el.naturalWidth) return;
  const box = r.getBoundingClientRect();
  // Zeichnet Heart waehrend der Arbeit neu (neue Daten), laedt das Bild
  // neu - der gewaehlte Ausschnitt bleibt dann stehen.
  if (lage.bereit && lage.w === el.naturalWidth && lage.h === el.naturalHeight
      && Math.abs(lage.rw - box.width) < 1 && Math.abs(lage.rh - box.height) < 1) {
    const regler = document.querySelector("[data-schnitt-zoom]");
    if (regler) regler.value = String(lage.zoom);
    zeigen();
    return;
  }
  lage.w = el.naturalWidth;
  lage.h = el.naturalHeight;
  lage.rw = box.width;
  lage.rh = box.height;
  lage.zoom = 1;
  const s = mass();
  // Mittig beginnen.
  lage.dx = (lage.rw - lage.w * s) / 2;
  lage.dy = (lage.rh - lage.h * s) / 2;
  lage.bereit = true;
  const regler = document.querySelector("[data-schnitt-zoom]");
  if (regler) regler.value = "1";
  zeigen();
}

let gestartet = false;
export function schnittHoeren() {
  if (gestartet || typeof document === "undefined") return;
  gestartet = true;
  // "load" steigt nicht auf - deshalb in der Einfangphase.
  document.addEventListener("load", (e) => {
    if (e.target?.matches?.("[data-schnitt-bild]")) einrichten();
  }, true);
  let zug = null;
  document.addEventListener("pointerdown", (e) => {
    const r = e.target?.closest?.("[data-schnitt-rahmen]");
    if (!r || !lage.bereit) return;
    zug = { x: e.clientX, y: e.clientY, dx: lage.dx, dy: lage.dy };
    r.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });
  document.addEventListener("pointermove", (e) => {
    if (!zug) return;
    lage.dx = zug.dx + (e.clientX - zug.x);
    lage.dy = zug.dy + (e.clientY - zug.y);
    begrenzen();
    zeigen();
  });
  const ende = () => { zug = null; };
  document.addEventListener("pointerup", ende);
  document.addEventListener("pointercancel", ende);
  document.addEventListener("input", (e) => {
    if (!e.target?.matches?.("[data-schnitt-zoom]") || !lage.bereit) return;
    // Um die Mitte des Rahmens zoomen.
    const alt = mass();
    const mx = (lage.rw / 2 - lage.dx) / alt;
    const my = (lage.rh / 2 - lage.dy) / alt;
    lage.zoom = Math.min(4, Math.max(1, Number(e.target.value) || 1));
    const neu = mass();
    lage.dx = lage.rw / 2 - mx * neu;
    lage.dy = lage.rh / 2 - my * neu;
    begrenzen();
    zeigen();
  });
}

// Der Ausschnitt in Bildpunkten des Originals - rein, fuer Tests.
export function ausschnitt({ w, h, rw, rh, zoom, dx, dy }) {
  const s = Math.max(rw / w, rh / h) * zoom;
  return { sx: -dx / s, sy: -dy / s, sw: rw / s, sh: rh / s };
}

// Den sichtbaren Ausschnitt als JPEG, breit `breite` Punkte, hoechstens
// `grenze` Zeichen (Guete sinkt, bis es passt).
export function schnittErgebnis(breite = 1400, grenze = 450000) {
  const el = bild();
  if (!el || !lage.bereit) throw new Error("Das Bild ist noch nicht geladen.");
  const { sx, sy, sw, sh } = ausschnitt(lage);
  const leinwand = document.createElement("canvas");
  leinwand.width = breite;
  leinwand.height = Math.round(breite * lage.rh / lage.rw);
  const ctx = leinwand.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(el, sx, sy, sw, sh, 0, 0, leinwand.width, leinwand.height);
  for (const guete of [0.86, 0.8, 0.72, 0.64, 0.56, 0.48]) {
    const url = leinwand.toDataURL("image/jpeg", guete);
    if (url.length <= grenze) return url;
  }
  throw new Error("Das Bild ist zu gross. Bitte ein kleineres wählen.");
}

export function schnittZurueck() {
  lage.bereit = false;
}
