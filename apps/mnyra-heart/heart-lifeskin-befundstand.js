// DER STAND DES BEFUNDS - aus dem DOM gelesen.
//
// Zwei Helfer fuer die Akte eines Falls (heart-lifeskin-render.js):
//   befundStandAuffrischen  setzt die Zeichen rechts in den Koepfen der
//                           vier Abschnitte: ✓ vollstaendig, ! fehlt
//   befundFelderAnpassen    macht jedes Textfeld so hoch wie seinen Text
//
// Aus dem DOM, nicht aus dem Zustand: Der Bogen lebt im DOM, bis
// freigegeben wird (data-bewahren).

// DIE ZEICHEN RECHTS IM KOPF: vollstaendig (✓) oder fehlt noch etwas (!).
//
// Aus dem DOM gelesen, nicht aus dem Zustand - der Bogen lebt im DOM, bis
// freigegeben wird. Laeuft nach jedem Zeichnen, jedem Tastendruck im Bogen,
// nach dem Einfuegen der Antwort und beim Anhaken eines Produkts.
export function befundStandAuffrischen(wurzel = document) {
  const bogen = wurzel?.querySelector?.(".heart-befund");
  if (!bogen) return;
  const wert = (wahl) => String(bogen.querySelector(wahl)?.value || "").trim();
  const angehakt = [...bogen.querySelectorAll("[data-produkt-wahl]:checked")].map((k) => String(k.value));
  const ohneFoto = wert("[data-bogen-art]") === "pa-foto";
  const vorbereitung = angehakt.length > 0 && Number(wert("#lifeskin-preis")) > 0;
  const punkteVoll = angehakt.length > 0 && angehakt.every((id) =>
    [...bogen.querySelectorAll(`[data-shitja-punkt="${CSS.escape(id)}"]`)].filter((f) => String(f.value || "").trim()).length >= 3);
  const seite = Boolean(wert('[data-shitja="hyrja"]')) && punkteVoll && Boolean(wert('[data-shitja-problem="0"][data-teil="gjetja"]'));
  const rasteFelder = bogen.querySelectorAll("[data-befund-rasti]");
  const raste = rasteFelder.length ? bogen.querySelectorAll("[data-befund-rasti]:checked").length > 0 : null;
  const details = Boolean(wert('[data-raport="gjetjet"]'))
    && (ohneFoto || [...bogen.querySelectorAll("[data-par-emri]")].some((f) => String(f.value || "").trim()));
  const stand = { vorbereitung, seite, raste, details };
  const setze = (name, ja) => {
    for (const el of bogen.querySelectorAll(`[data-stand-fuer="${name}"]`)) {
      el.setAttribute("data-stand", ja === null ? "" : ja ? "voll" : "fehlt");
      el.setAttribute("title", ja === null ? "" : ja ? "vollständig" : "fehlt noch etwas");
    }
  };
  for (const [name, ja] of Object.entries(stand)) setze(name, ja);
  setze("gesamt", Object.values(stand).every((ja) => ja !== false));
  // Kundenfotos sind freiwillig: gewaehlt -> Haken, sonst kein Zeichen.
  setze("klientet", bogen.querySelectorAll("[data-befund-klienti]:checked").length ? true : null);
}

// Textfelder so hoch wie ihr Text: kein Scrollen IM Feld, Teile lassen
// sich auf dem Telefon markieren und kopieren. Zugeklappte Felder haben
// keine Hoehe - sie folgen beim Aufklappen (heart-events.js, toggle).
//
// NUR, WAS SICH GEAENDERT HAT, UND IN ZWEI SCHRITTEN.
//
// Das lief nach JEDEM Zeichnen ueber jedes Feld des Bogens, und zwar im
// Wechsel lesen-schreiben-lesen: Jedes Feld zwang den Browser, die ganze
// Seite neu zu vermessen. Gemessen am 25.09. (lauf-heart.mjs): gut eine
// halbe Sekunde beim Oeffnen einer Akte. Und weil jedes Feld dafuer kurz
// auf "auto" schrumpfte, konnte die Seite kurz kuerzer werden als die
// Stelle, an der man stand - der Browser schob sie nach oben: der Sprung.
//
// Jetzt: nur Felder, deren Text oder Breite sich seit dem letzten Mal
// geaendert hat; alle auf einmal schrumpfen, alle auf einmal messen, alle
// auf einmal setzen - und die Scrollstelle bleibt, wo sie war.
const vermessen = new WeakMap();

export function befundFelderAnpassen(wurzel = document) {
  const felder = [...(wurzel?.querySelectorAll?.(".heart-befund textarea:not([hidden]):not([data-fest])") || [])]
    .filter((feld) => feld.offsetParent);
  const noetig = [];
  const staende = [];
  for (const feld of felder) {
    const stand = `${feld.clientWidth}|${feld.value}`;
    if (vermessen.get(feld) === stand) continue;
    noetig.push(feld);
    staende.push(stand);
  }
  if (!noetig.length) return;
  const x = globalThis.scrollX || 0;
  const y = globalThis.scrollY || 0;
  for (const feld of noetig) feld.style.height = "auto";
  const hoehen = noetig.map((feld) => feld.scrollHeight);
  noetig.forEach((feld, i) => {
    feld.style.height = `${hoehen[i] + 2}px`;
    vermessen.set(feld, staende[i]);
  });
  if (typeof globalThis.scrollTo === "function" && ((globalThis.scrollY || 0) !== y)) globalThis.scrollTo(x, y);
}

