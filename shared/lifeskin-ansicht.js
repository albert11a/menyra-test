// EIN VOLLBILD IST EINE EIGENE ANSICHT DER SEITE - KEIN FESTES FENSTER
// UEBER IHR.
//
// Kasse und Kundenvideos haben Eingabefelder (Name, Nummer, Anschrift,
// Kommentar). Lagen sie als "position: fixed" ueber der Seite, schob iOS
// beim Tippen die ganze Seite unter der Tastatur weg - und liess sie nach
// dem Schliessen verschoben stehen: Alles mit "fixed; bottom: 0" (die
// Kaufleiste, auch die Still-Pille) stand danach um die Hoehe der Tastatur
// zu weit oben, mitten im Bildschirm. Dazu kam die Scroll-Sperre
// (body overflow: hidden), die auf iOS dasselbe Durcheinander ausloest.
//
// DESHALB: Beim Oeffnen tritt die Ansicht an die Stelle der Seite. Kopf,
// Seite und Kaufleiste werden ausgeblendet (html[data-ansicht], siehe
// verkauf.css), die Ansicht steht als ganz normaler Inhalt im Dokument.
// Die Tastatur trifft ein gewoehnliches Formular - das kann jedes Telefon,
// ohne dass man iOS etwas nachrechnen lassen muss. Es gibt nichts dahinter,
// also auch nichts zu sperren. Beim Schliessen kommt die Seite zurueck, an
// genau derselben Stelle.
//
// GENUTZT von der Therapieseite (Kasse, Kundenvideos; dort ueber
// apps/lifeskin-verkauf/ansicht.js) und der Landingpage /lifeskin (Kasse
// und Mittel-Blatt, apps/lifeskin-landing/shop.js - dort stand die feste
// Leiste unten nach der Kasse aus genau diesem Grund mitten im Bild).

let offen = null; // { ansicht, y }

export function ansichtOeffnen(ansicht, name, { fenster = globalThis.window, dokument = globalThis.document } = {}) {
  if (!ansicht || !dokument) return;
  const neu = !offen || offen.ansicht !== ansicht;
  if (offen && offen.ansicht !== ansicht) offen.ansicht.hidden = true;
  if (!offen) offen = { y: fenster?.scrollY || 0 };
  offen.ansicht = ansicht;
  dokument.documentElement.dataset.ansicht = name;
  ansicht.hidden = false;
  if (neu) springen(fenster, 0);
}

export function ansichtSchliessen(ansicht, { fenster = globalThis.window, dokument = globalThis.document } = {}) {
  if (!ansicht) return;
  ansicht.hidden = true;
  if (!offen || offen.ansicht !== ansicht) return;
  const { y } = offen;
  offen = null;
  if (dokument) delete dokument.documentElement.dataset.ansicht;
  springen(fenster, y);
}

export function offeneAnsicht() {
  return offen?.ansicht || null;
}

// Sofort, nicht sanft. Die Seite scrollt ihre Sprungmarken sanft
// (html { scroll-behavior: smooth }); ein Wechsel der Ansicht ist aber kein
// Sprung innerhalb der Seite - dafuer hat scrollTo das Verhalten "instant".
// Aeltere Browser kennen den Wert nicht und werfen: dann ohne.
function springen(fenster, y) {
  if (!fenster?.scrollTo) return;
  try {
    fenster.scrollTo({ top: y, left: 0, behavior: "instant" });
  } catch {
    fenster.scrollTo(0, y);
  }
}
