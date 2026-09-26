// HEART AM 25.09.: DREI EINTRAEGE, TAG UND NACHT, EIN KNOPF, DER SICH DREHT,
// UND ZAHLEN, DIE NUR NOCH DAS NACHLADEN, WAS SICH GEAENDERT HAT.
//
// Gewuenscht: "nur 3 - Lifeskin, und alles andere packst du in Mnyra";
// "Tag- und Nachtfarbe"; "der Refresh-Knopf animiert, sobald man
// draufdrueckt". Gemessen (tests/lifeskin-trichter-pruefstand/lauf-heart.mjs):
// Nach jeder Freigabe lud Heart alles neu, und jede Live-Zahl baute die
// ganze Fallliste neu auf.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { renderHeartApp, NAV_MNYRA } from "../apps/mnyra-heart/heart-render.js";
import { HEART_NAV_ITEMS, createHeartStore, sanitizeStateValue } from "../apps/mnyra-heart/heart-state.js";
import { aktualisiereLifeskinSitzungen } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { mitFingerabdruck } from "../apps/mnyra-heart/heart-morph.js";

function knotenAttrappe() {
  return { innerHTML: "", querySelector: () => null, querySelectorAll: () => [], contains: () => false };
}

function angemeldet(ansicht, shell = {}) {
  return {
    auth: { status: "authenticated", user: { uid: "u1", email: "ceo@mnyra.test" }, profile: {}, access: { allowed: true } },
    shell: { activeView: ansicht, modal: {}, navGruppe: null, aktualisiert: false, theme: "nacht", ...shell },
    crmAdmin: {}, analytics: {}, landing: {}, destinations: {}, mnyraGo: {}, connections: {}, setup: {}, lifeskin: {}
  };
}

function zeichne(ansicht, shell) {
  const knoten = knotenAttrappe();
  renderHeartApp(knoten, angemeldet(ansicht, shell), {});
  return knoten.innerHTML;
}

function schublade(html) {
  const anfang = html.indexOf('<nav class="heart-nav">');
  return html.slice(anfang, html.indexOf("</nav>", anfang));
}

test("die Schublade hat drei Eintraege: Lifeskin, Mnyra, Einrichtung", () => {
  const nav = schublade(zeichne("lifeskin"));
  // Oben ausserhalb der Gruppe: nur Lifeskin und Einrichtung.
  const gruppeAnfang = nav.indexOf('<div class="heart-nav-gruppe');
  const gruppeEnde = nav.indexOf("</div>\n    </div>", gruppeAnfang);
  const aussen = nav.slice(0, gruppeAnfang) + nav.slice(gruppeEnde);
  const oben = [...aussen.matchAll(/data-nav-key="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(oben, ["lifeskin", "connections"]);
  assert.match(nav, /data-action="nav-gruppe"/);
  assert.match(nav, /<span class="heart-nav-link__label">Mnyra<\/span>/);
});

test("alles andere steht unter Mnyra - kein Bereich geht verloren", () => {
  const nav = schublade(zeichne("lifeskin", { navGruppe: true }));
  const alle = HEART_NAV_ITEMS.map((item) => item.key);
  for (const key of alle) assert.match(nav, new RegExp(`data-nav-key="${key}"`), `${key} fehlt in der Schublade`);
  assert.deepEqual([...NAV_MNYRA, "lifeskin", "connections"].sort(), [...alle].sort(),
    "Jeder Bereich steht genau einmal: unter Mnyra, oder als Lifeskin/Einrichtung");
});

test("die Gruppe ist zu - ausser man steht in einem ihrer Bereiche oder klappt sie auf", () => {
  assert.match(schublade(zeichne("lifeskin")), /class="heart-nav-gruppe__inhalt" hidden/);
  assert.match(schublade(zeichne("crmLeads")), /class="heart-nav-gruppe__inhalt">/, "In Leads ist die Gruppe offen");
  assert.match(schublade(zeichne("crmLeads")), /Jetzt: Leads/);
  assert.match(schublade(zeichne("lifeskin", { navGruppe: true })), /class="heart-nav-gruppe__inhalt">/);
  assert.match(schublade(zeichne("crmLeads", { navGruppe: false })), /class="heart-nav-gruppe__inhalt" hidden/);
});

test("Tag und Nacht: zwei Knoepfe, der gewaehlte leuchtet", () => {
  const nacht = zeichne("lifeskin", { theme: "nacht" });
  assert.match(nacht, /data-theme="nacht" aria-pressed="true"/);
  assert.match(nacht, /data-theme="tag" aria-pressed="false"/);
  const tag = zeichne("lifeskin", { theme: "tag" });
  assert.match(tag, /data-theme="tag" aria-pressed="true"/);
});

test("der Farbsatz Tag steht in heart.css und ist vor dem ersten Bild gesetzt", () => {
  const css = readFileSync(new URL("../apps/mnyra-heart/heart.css", import.meta.url), "utf8");
  assert.match(css, /html\[data-heart-theme="tag"\] \{[^}]*--heart-bg:/);
  assert.match(css, /:where\(html\[data-heart-theme="tag"\]\) \.heart-lifeskin-fall/);
  // Der gruene Hauptknopf bleibt gruen: seine Regel steht NACH der allgemeinen.
  const allgemein = css.lastIndexOf(':where(html[data-heart-theme="tag"]) .heart-befund__knopf {');
  const haupt = css.lastIndexOf(':where(html[data-heart-theme="tag"]) .heart-befund__knopf--haupt');
  assert.ok(allgemein > -1 && haupt > allgemein, "Die Reihenfolge der Regeln ist im Tag-Satz verloren");
  const index = readFileSync(new URL("../apps/mnyra-heart/index.html", import.meta.url), "utf8");
  assert.ok(index.indexOf("heartTheme") < index.indexOf("heart.css"), "Das Farbschema wird erst nach dem Stylesheet gesetzt - es blitzt");
});

test("der Knopf Aktualisieren dreht sich, solange geladen wird", () => {
  assert.doesNotMatch(zeichne("lifeskin"), /heart-icon-button--dreht/);
  const dreht = zeichne("lifeskin", { aktualisiert: true });
  assert.match(dreht, /heart-icon-button--refresh heart-icon-button--dreht" data-action="refresh-heart"/);
  assert.match(dreht, /aria-busy="true"/);
});

test("der Zustand kennt Gruppe, Drehen und Farbe - und schreibt nur bei Aenderung", () => {
  const store = createHeartStore();
  let zeichnungen = 0;
  store.subscribe(() => { zeichnungen += 1; });
  store.actions.setAktualisiert(true);
  store.actions.setAktualisiert(true);
  assert.equal(zeichnungen, 1, "Zweimal dasselbe darf nicht zweimal zeichnen");
  store.actions.setTheme("tag");
  assert.equal(store.getState().shell.theme, "tag");
  store.actions.setTheme("irgendwas");
  assert.equal(store.getState().shell.theme, "nacht");
  store.actions.setNavGruppe(true);
  assert.equal(store.getState().shell.navGruppe, true);
});

test("Bereinigen gibt fuer dasselbe Objekt dasselbe Ergebnis - schnell und mit gleicher Identitaet", () => {
  const sitzung = { id: "a", name: "Arta", timings: { pfad: { x: { t: "2026-09-25T10:00:00Z" } } } };
  const erste = sanitizeStateValue(sitzung);
  assert.equal(sanitizeStateValue(sitzung), erste, "Zweimal dieselbe Sitzung, zwei verschiedene Objekte");
  assert.equal(sanitizeStateValue(erste), erste, "Ein bereinigtes Objekt wird noch einmal kopiert");
  assert.deepEqual(erste, sitzung);
  // Was nicht rein ist, wird weiter bereinigt.
  const mitDatum = sanitizeStateValue({ wann: new Date("2026-09-25T10:00:00Z") });
  assert.equal(mitDatum.wann, "2026-09-25T10:00:00.000Z");
});

test("eine Live-Aenderung laesst unveraenderte Sitzungen dieselben Objekte bleiben", () => {
  const a = { id: "a", createdAt: "2026-09-25T09:00:00Z", updatedAt: "2026-09-25T09:00:00Z", bestelltAt: "" };
  const b = { id: "b", createdAt: "2026-09-25T09:30:00Z", updatedAt: "2026-09-25T09:30:00Z", bestelltAt: "" };
  const zustand = { sitzungen: [b, a], tests: [], berichte: {} };
  const bNeu = { ...b, updatedAt: "2026-09-25T09:31:00Z", step: "numri" };
  const { sitzungen } = aktualisiereLifeskinSitzungen(zustand, [bNeu]);
  assert.equal(sitzungen.find((s) => s.id === "a"), a, "Die unveraenderte Sitzung wurde kopiert - ihre Zeile wuerde neu gezeichnet");
  assert.equal(sitzungen.find((s) => s.id === "b"), bNeu);
});

test("der Fingerabdruck einer Zeile haengt am Inhalt", () => {
  const eins = mitFingerabdruck('<button data-id="a">Arta</button>');
  const gleich = mitFingerabdruck('<button data-id="a">Arta</button>');
  const anders = mitFingerabdruck('<button data-id="a">Arta ✓</button>');
  const abdruck = (html) => html.match(/data-morph-hash="([^"]+)"/)?.[1];
  assert.ok(abdruck(eins));
  assert.equal(abdruck(eins), abdruck(gleich));
  assert.notEqual(abdruck(eins), abdruck(anders));
  assert.match(eins, /^<button data-morph-hash="[^"]+" data-id="a">Arta<\/button>$/);
});

test("nach dem Freigeben wird nur der eine Bericht nachgelesen, nicht alles", () => {
  const quelle = readFileSync(new URL("../apps/mnyra-heart/heart.js", import.meta.url), "utf8");
  const freigabe = quelle.slice(quelle.indexOf("async function gibLifeskinBerichtFrei"), quelle.indexOf("// Die Therapietexte beim Anhaken fuellen."));
  assert.match(freigabe, /await lifeskinBerichteNachlesen\(\[id\]\)/);
  assert.doesNotMatch(freigabe, /ladeLifeskinBereich\(\{ force: true/, "Die Freigabe laedt wieder alles neu");
  // Der Knopf zeigt das Speichern aus dem Zustand - nicht nur im DOM.
  assert.match(freigabe, /berichtKnopf: knopfArt/);
});

test("Aktualisieren holt nur nach, was sich seit dem letzten Laden geaendert hat", () => {
  const quelle = readFileSync(new URL("../apps/mnyra-heart/heart.js", import.meta.url), "utf8");
  const laden = quelle.slice(quelle.indexOf("async function ladeLifeskinBereich"), quelle.indexOf("// DIE AKTE OEFFNET OBEN"));
  assert.match(laden, /lifeskinNachholen\(\)/);
  const adapter = readFileSync(new URL("../apps/mnyra-heart/heart-lifeskin-adapter.js", import.meta.url), "utf8");
  assert.match(adapter, /where\("updatedAt", ">=", String\(seit \|\| ""\)\)/);
});
