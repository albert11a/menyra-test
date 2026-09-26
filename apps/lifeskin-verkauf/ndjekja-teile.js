// BAUTEILE DER BEGLEITUNG - fuer die Beispielkarte auf der Therapieseite
// und den echten Kundenbereich (/ndjekja). Dieselben Knoepfe, dieselben
// Worte: Was der Besucher vor dem Kauf als Beispiel sieht, ist das, was er
// danach bekommt.
//
// Nur DOM, kein Netz: Speichern ist Sache der Seite, die ein Bauteil
// benutzt. Die Beispielkarte speichert nie etwas.

import { NDJEKJA_TEXTE, NDJESITE } from "../../shared/lifeskin-ndjekja.js";

export function el(name, klasse, text) {
  const knoten = document.createElement(name);
  if (klasse) knoten.className = klasse;
  if (text !== undefined && text !== null) knoten.textContent = text;
  return knoten;
}

// Symbole: Lucide (pencil-line, calendar-check, message-circle, package,
// circle-check). Nur Striche, Farbe vom Text.
const IKONEN = Object.freeze({
  shenim: '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
  kalendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  mesazh: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  pako: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 2.004 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>',
  gati: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'
});

export function ikone(name, klasse = "ndj-ikona") {
  const huelle = el("span", klasse);
  huelle.setAttribute("aria-hidden", "true");
  huelle.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IKONEN[name] || ""}</svg>`;
  return huelle;
}

// "Java 2 nga 4" als vier Striche - der aktuelle ausgefuellt. Kein
// Prozentwert, kein Countdown.
export function wochenSpur(woche, wochen = 4) {
  const spur = el("span", "ndj-spur");
  spur.setAttribute("aria-hidden", "true");
  for (let i = 1; i <= wochen; i += 1) spur.append(el("i", i <= woche ? "an" : ""));
  return spur;
}

// Knoepfe, von denen einer (einzeln) oder mehrere gewaehlt sind -
// aria-pressed, gross genug fuer den Daumen. Nochmal antippen waehlt ab.
//
//   optionen   [[id, text], ...]
//   einzeln    nur einer auf einmal
//   allein     die id, die alle anderen abwaehlt ("Pa shqetësime")
export function auswahl(optionen, { einzeln = false, allein = "", klasse = "ndj-zgjedhje", knopfKlasse = "ndj-opsion", titel = "", beiAenderung = null } = {}) {
  const gruppe = el("div", klasse);
  gruppe.setAttribute("role", "group");
  if (titel) gruppe.setAttribute("aria-label", titel);
  const knoepfe = optionen.map(([id, text]) => {
    const k = el("button", knopfKlasse, text);
    k.type = "button";
    k.dataset.wert = id;
    k.setAttribute("aria-pressed", "false");
    return k;
  });
  gruppe.append(...knoepfe);
  const wert = () => knoepfe.filter((k) => k.getAttribute("aria-pressed") === "true").map((k) => k.dataset.wert);
  const setzen = (ids = []) => {
    const an = new Set(ids);
    for (const k of knoepfe) k.setAttribute("aria-pressed", an.has(k.dataset.wert) ? "true" : "false");
  };
  gruppe.addEventListener("click", (ereignis) => {
    const k = ereignis.target instanceof Element ? ereignis.target.closest("button[data-wert]") : null;
    if (!k || !gruppe.contains(k) || k.disabled) return;
    const war = k.getAttribute("aria-pressed") === "true";
    if (einzeln) setzen(war ? [] : [k.dataset.wert]);
    else if (war) k.setAttribute("aria-pressed", "false");
    else if (allein && k.dataset.wert === allein) setzen([allein]);
    else setzen([...wert().filter((id) => id !== allein), k.dataset.wert]);
    beiAenderung?.(wert());
  });
  return { el: gruppe, wert, setzen, knoepfe };
}

export function ndjesiaAuswahl(optionen = {}) {
  return auswahl(NDJESITE.map((n) => [n.id, n.sq]), {
    allein: "mire", klasse: "ndj-cipa", knopfKlasse: "ndj-cip", titel: NDJEKJA_TEXTE.ndjesiaPyetja, ...optionen
  });
}

export function frage(titel, inhalt, hinweis = "") {
  const block = el("div", "ndj-pyetje");
  const kopf = el("p", "ndj-pyetje__titulli", titel);
  if (hinweis) kopf.append(" ", el("small", null, hinweis));
  block.append(kopf, inhalt);
  return block;
}

// DIE BEISPIELKARTE auf der Therapieseite (Auftrag, Punkt 3).
//
// Klar als Beispiel erkennbar: gestrichelter Rand, "Shembull", und der Satz
// "Vetëm shembull – asgjë nuk ruhet." Antippen bleibt auf dem Geraet -
// kein Netz, kein Klickpfad (data-pfad-still), keine Diagnose aus einer
// Auswahl. Keine erfundene Arztnachricht, kein "Kontrolle erledigt",
// kein Live-Stand, keine Heilungsquote.
export function beispielKarte({ wochen = 4 } = {}) {
  const T = NDJEKJA_TEXTE;
  const karte = el("div", "ndj-karta ndj-karta--shembull");
  karte.setAttribute("data-pfad-still", "");
  karte.setAttribute("role", "group");
  karte.setAttribute("aria-label", `${T.shembull}. ${T.shembullShenim}`);

  const kopf = el("div", "ndj-karta__kok");
  kopf.append(el("span", "ndj-karta__titulli", T.shembull), el("span", "ndj-shenje", "Shembull"));
  const java = el("div", "ndj-java");
  java.append(el("b", null, `Java 1 nga ${wochen}`), wochenSpur(1, wochen));

  const perdorimi = auswahl([["po", "E përdora"], ["jo", "Nuk e përdora"]], { einzeln: true, titel: T.perdorimiSot });
  const ndjesia = ndjesiaAuswahl();

  const fund = el("div", "ndj-karta__fund");
  const kontroll = el("p", "ndj-kontrolli");
  kontroll.append("Kontrolli i radhës: ", el("b", null, "dita 7"));
  const pyetje = el("button", "ndj-lidhje", T.pyetjeKontakt);
  pyetje.type = "button";
  pyetje.setAttribute("aria-expanded", "false");
  fund.append(kontroll, pyetje);
  const antwort = el("p", "ndj-karta__pergjigje", "Në zonën tuaj personale na shkruani një mesazh të shkurtër – ose na shkruani në WhatsApp.");
  antwort.hidden = true;
  pyetje.addEventListener("click", () => {
    antwort.hidden = !antwort.hidden;
    pyetje.setAttribute("aria-expanded", String(!antwort.hidden));
  });

  karte.append(kopf, java, frage(T.perdorimiSot, perdorimi.el), frage(T.ndjesiaPyetja, ndjesia.el), fund, antwort,
    el("p", "ndj-karta__shenim", T.shembullShenim));
  return karte;
}
