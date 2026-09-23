// DER KLICKPFAD - was ein Besucher angetippt und wirklich angesehen hat.
//
// Die Marken in der Sitzung (sahPreis, kasseGeoeffnet ...) sagen, OB etwas
// passiert ist. Dieser Pfad sagt, WAS und IN WELCHER REIHENFOLGE: welcher
// Knopf, welche Frage aufgeklappt, welcher Abschnitt wie lange im Bild war,
// wie weit gescrollt, wann die Seite verlassen wurde. Daraus liest man in
// Heart, wofuer sich jemand interessiert hat.
//
// WAS NIE HINEINKOMMT: getippter Text. Ein Feld wird mit seinem Namen
// gemeldet ("Numri i telefonit angetippt"), nie mit seinem Inhalt.
//
// WO ES LIEGT: in der Sitzung unter timings.pfad.<kennung> - je Ereignis
// ein Eintrag { t, s, e, d }. timings ist in den Firestore-Regeln eine
// freie Map; ein neues Feld auf oberster Ebene wuerde von hasOnly()
// abgewiesen. Geschrieben wird mit Feldmaske je Eintrag, also nie ueber
// Eintraege eines anderen Tabs hinweg.
//
// SPARSAM: gesammelt und alle paar Sekunden in EINEM Schreibvorgang
// verschickt, beim Verlassen der Seite sofort. Hoechstens MAX_JE_AUFRUF
// Eintraege je Seitenaufruf - ein Dokument hat eine Groessengrenze, und
// ein Besucher, der zehn Minuten wischt, soll sie nicht erreichen.

const MAX_JE_AUFRUF = 220;
const SAMMELN_MS = 4000;
const MIN_SICHTBAR_MS = 1200;
const TEXT_MAX = 110;

function kurz(text, max = TEXT_MAX) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

let zaehler = 0;
export function pfadKennung(jetzt = Date.now()) {
  zaehler = (zaehler + 1) % 1296;
  return `e${jetzt.toString(36)}${zaehler.toString(36).padStart(2, "0")}`;
}

// Die Feldmasken und das Objekt fuer einen Schreibvorgang. Eigene
// Funktion, damit beide Schreibwege (Trichter und Befundseiten) dieselbe
// Form schreiben - und damit sie sich pruefen laesst.
export function pfadPatch(eintraege, jetzt = new Date().toISOString()) {
  const pfad = {};
  for (const eintrag of eintraege || []) pfad[eintrag.id] = { t: eintrag.t, s: eintrag.s, e: eintrag.e, d: eintrag.d };
  return {
    daten: { updatedAt: jetzt, timings: { pfad } },
    masken: ["updatedAt", ...Object.keys(pfad).map((id) => `timings.pfad.${id}`)]
  };
}

// Heart: der Pfad einer Sitzung, zeitlich sortiert.
export function pfadLesen(sitzung) {
  const roh = sitzung?.timings?.pfad;
  if (!roh || typeof roh !== "object") return [];
  return Object.entries(roh)
    .map(([id, e]) => ({ id, t: String(e?.t || ""), s: String(e?.s || ""), e: String(e?.e || ""), d: String(e?.d || "") }))
    .filter((e) => e.t && e.e)
    .sort((a, b) => a.t.localeCompare(b.t) || a.id.localeCompare(b.id));
}

// Der Name eines Elements, so wie der Besucher es gelesen hat.
function nameVon(el) {
  if (!el) return "";
  const eigen = el.getAttribute?.("data-pfad-name") || el.getAttribute?.("aria-label");
  if (eigen) return kurz(eigen, 70);
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
    const label = el.closest("label") || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`));
    const text = label ? Array.from(label.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ") : "";
    return kurz(text || el.getAttribute("placeholder") || el.name || el.id, 60);
  }
  // Eine Karte mit Ueberschrift und Beschreibung heisst wie ihre
  // Ueberschrift - die Beschreibung ist kein Name.
  const kopf = el.querySelector?.("h2, h3, h4, strong, b");
  if (kopf && String(el.textContent || "").trim().length > 40 && kopf.textContent.trim()) {
    return kurz(kopf.textContent, 70);
  }
  // Zeichen wie das "+" eines Aufklappers gehoeren nicht zum Namen.
  return kurz(String(el.textContent || "").replace(/[+−×→↓]\s*$/, ""), 70);
}

// Der Abschnitt, in dem etwas liegt - fuer "Knopf X in Abschnitt Y".
function abschnittVon(el, namen) {
  const sektion = el?.closest?.("[data-pfad], section[id]");
  if (!sektion) return "";
  return sektion.getAttribute("data-pfad") || namen[sektion.id] || sektion.id;
}

export function starteKlickpfad({
  seite,
  schreiben,
  namen = {},
  beobachte = "[data-pfad], section[id]",
  wurzel = globalThis.document
} = {}) {
  if (!wurzel || typeof schreiben !== "function") return { melde() {}, schicke() {} };
  const puffer = [];
  let gezaehlt = 0;
  let timer = null;

  const schicke = () => {
    clearTimeout(timer);
    timer = null;
    if (!puffer.length) return;
    const stapel = puffer.splice(0);
    try {
      Promise.resolve(schreiben(stapel)).catch(() => {});
    } catch { /* ein verlorener Stapel haelt die Seite nicht an */ }
  };

  const melde = (ereignis, detail = "") => {
    if (gezaehlt >= MAX_JE_AUFRUF) return;
    gezaehlt += 1;
    puffer.push({ id: pfadKennung(), t: new Date().toISOString(), s: seite, e: ereignis, d: kurz(detail) });
    if (!timer) timer = setTimeout(schicke, SAMMELN_MS);
  };

  melde("geoeffnet", globalThis.location?.pathname || "");

  // KLICKS - jeder Knopf, Link, Aufklapper, jede Auswahl.
  wurzel.addEventListener("click", (ereignis) => {
    // Nur echte Finger. Die Seite loest selbst Klicks aus (die Karten auf
    // der Landingpage druecken den Startknopf) - die hat niemand getippt.
    if (ereignis.isTrusted === false) return;
    const ziel = ereignis.target instanceof Element ? ereignis.target : null;
    const el = ziel?.closest("button, a, summary, label, [role=button], [data-pfad-klick], input[type=checkbox], input[type=radio]");
    if (!el) return;
    const wo = abschnittVon(el, namen);
    if (el.tagName === "SUMMARY") {
      const offen = !el.parentElement?.open;
      melde(offen ? "aufgeklappt" : "zugeklappt", [nameVon(el), wo].filter(Boolean).join(" · "));
      return;
    }
    if (el.tagName === "LABEL" && el.querySelector("input:not([type=checkbox]):not([type=radio]), textarea, select")) return;
    const href = el.tagName === "A" ? String(el.getAttribute("href") || "") : "";
    const extra = href.includes("wa.me") || href.includes("whatsapp") ? " (WhatsApp)" : href.startsWith("tel:") ? " (Anruf)" : "";
    melde("klick", [nameVon(el) + extra, wo].filter(Boolean).join(" · "));
  }, true);

  // FELDER - angetippt, einmal je Feld. Nie der Inhalt.
  const felder = new Set();
  wurzel.addEventListener("focusin", (ereignis) => {
    const el = ereignis.target;
    if (!(el instanceof Element) || !el.matches("input, textarea, select")) return;
    if (el.matches("[type=checkbox], [type=radio], [type=hidden]")) return;
    const name = nameVon(el);
    if (felder.has(name)) return;
    felder.add(name);
    melde("feld", [name, abschnittVon(el, namen)].filter(Boolean).join(" · "));
  }, true);

  // ABSCHNITTE - wie lange jeder wirklich im Bild war.
  const seit = new Map();
  const schliessen = (el, jetzt = Date.now()) => {
    const ab = seit.get(el);
    if (!ab) return;
    seit.delete(el);
    const dauer = jetzt - ab;
    if (dauer < MIN_SICHTBAR_MS) return;
    melde("gesehen", `${el.getAttribute("data-pfad") || namen[el.id] || el.id} · ${Math.round(dauer / 1000)} s`);
  };
  let beobachter = null;
  if (typeof IntersectionObserver === "function") {
    beobachter = new IntersectionObserver((eintraege) => {
      const jetzt = Date.now();
      for (const e of eintraege) {
        if (e.isIntersecting && e.intersectionRatio >= 0.3) {
          if (!seit.has(e.target)) seit.set(e.target, jetzt);
        } else {
          schliessen(e.target, jetzt);
        }
      }
    }, { threshold: [0, 0.3, 0.6] });
    for (const el of wurzel.querySelectorAll(beobachte)) beobachter.observe(el);
  }
  const alleSchliessen = () => { for (const el of Array.from(seit.keys())) schliessen(el); };

  // SCROLLTIEFE - bei 25, 50, 75 und 100 Prozent, je Scrollflaeche.
  const tiefen = new Map();
  wurzel.addEventListener("scroll", (ereignis) => {
    const el = ereignis.target === wurzel ? wurzel.scrollingElement : ereignis.target;
    if (!(el instanceof Element)) return;
    const hoehe = el.scrollHeight - el.clientHeight;
    if (hoehe < 200) return;
    const prozent = Math.min(100, Math.round((el.scrollTop / hoehe) * 100));
    const schon = tiefen.get(el) || 0;
    const stufe = [100, 75, 50, 25].find((s) => prozent >= s) || 0;
    if (stufe > schon) {
      tiefen.set(el, stufe);
      melde("scroll", `${stufe} %${el === wurzel.scrollingElement ? "" : ` (${el.id || el.className || "Bereich"})`}`);
    }
  }, { capture: true, passive: true });

  // WEG UND ZURUECK - WhatsApp, anderer Tab, Telefon gesperrt.
  let wegSeit = 0;
  wurzel.addEventListener("visibilitychange", () => {
    if (wurzel.visibilityState === "hidden") {
      wegSeit = Date.now();
      alleSchliessen();
      melde("verlassen", "");
      schicke();
    } else if (wegSeit) {
      melde("zurueck", `nach ${Math.round((Date.now() - wegSeit) / 1000)} s`);
      wegSeit = 0;
      // Was jetzt im Bild ist, zaehlt ab jetzt.
      if (beobachter) for (const el of wurzel.querySelectorAll(beobachte)) { beobachter.unobserve(el); beobachter.observe(el); }
    }
  });
  globalThis.addEventListener?.("pagehide", () => { alleSchliessen(); schicke(); });

  return {
    melde,
    schicke,
    // Neue Abschnitte (nach einem Neuzeichnen) mitbeobachten.
    beobachten() { if (beobachter) for (const el of wurzel.querySelectorAll(beobachte)) beobachter.observe(el); }
  };
}
