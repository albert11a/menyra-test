// DIE SEITEN DER BEGLEITUNG - Therapieseite (neue Fassung), Kundenbereich,
// Heart. Ohne Browser: was im Markup steht, was geschrieben wird und was
// nie irgendwo auftauchen darf. Der Durchlauf im echten Telefon-Browser
// gegen den Emulator: tests/lifeskin-trichter-pruefstand/lauf-ndjekja.mjs.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

globalThis.__LIFESKIN_TEST__ = true;
const { ohneWochenversprechen } = await import("../apps/lifeskin-verkauf/terapia.js");
const { NdjekjaDaten } = await import("../apps/lifeskin-verkauf/ndjekja-daten.js");
const { datumSq, zeitSq } = await import("../apps/lifeskin-verkauf/ndjekja.js");
const { renderBetreuung, renderBetreuungFall, renderFallBestellung, renderKaufweg } = await import("../apps/mnyra-heart/heart-lifeskin-ndjekja-render.js");
const { LESEMARKEN } = await import("../apps/mnyra-heart/heart-lifeskin-berechnung.js");

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");
const ZUGANG = "0123456789abcdef0123456789abcdef";

test("Therapieseite: der neue Abschnitt ist versteckt - ohne Schalter bleibt alles, wie es war", () => {
  const html = lies("apps/lifeskin-verkauf/terapia.html");
  assert.match(html, /<section class="pjese ndjekja" id="ndjekja" data-pfad="Betreuung" hidden><\/section>/);
  assert.match(html, /<section class="pjese" id="ditet" data-pfad="28 Tage" hidden>/, "Nuk mbeteni vetëm bleibt fuer die klassische Fassung");
  assert.ok(html.indexOf('id="merrni"') < html.indexOf('id="ndjekja"') && html.indexOf('id="ndjekja"') < html.indexOf('id="rezultate"'),
    "Nach Produkten und Routine, vor den Ergebnissen");
  for (const id of ["t-pako", "t-ndjekjalink", "t-fatura", "t-numrianalize", "t-numriperseri", "t-porosigarancia", "t-porosistatusi", "t-porosiwa", "t-kushtet"]) {
    assert.match(html, new RegExp(`id="${id}"[^>]*hidden`), `${id} ist ohne Schalter versteckt`);
  }
});

test("Therapieseite: 'Dr. Gashi jede Woche' nur, wenn es festgelegt ist", () => {
  assert.equal(ohneWochenversprechen("Për x — dy produkte, një plan i qartë dhe Dr. Gashi pranë jush çdo javë."),
    "Për x — dy produkte, një plan i qartë dhe ndjekje çdo javë.");
  assert.equal(ohneWochenversprechen("Çdo lëkurë reagon ndryshe. Prandaj Dr. Gashi ju ndjek çdo javë."),
    "Çdo lëkurë reagon ndryshe. Prandaj ju ndjekim çdo javë.");
  assert.equal(ohneWochenversprechen("Pakoja juaj është dorëzuar. Dr. Gashi ju ndjek gjatë 4 javëve."),
    "Pakoja juaj është dorëzuar. Ju ndjekim gjatë 4 javëve.");
  assert.equal(ohneWochenversprechen("… synojmë t'i largojmë plotësisht: x. Dr. Gashi e kontrollon çdo javë me skanim."),
    "… synojmë t'i largojmë plotësisht: x. Në kontrollet e planifikuara shqyrtojmë ecurinë.");
  assert.match(ohneWochenversprechen("Gjatë 4 javëve Dr. Gashi ju ndjek çdo javë dhe e përshtat planin nëse duhet."), /ju ndjekim çdo javë dhe e përshtatim planin/);
  // Festgelegt: bleibt.
  assert.equal(ohneWochenversprechen("Dr. Gashi ju ndjek çdo javë.", "Dr. Violeta Gashi"), "Dr. Gashi ju ndjek çdo javë.");
});

test("Therapieseite: die Beispielkarte zeichnet der Klickpfad nicht auf", () => {
  assert.match(lies("apps/lifeskin-verkauf/ndjekja-teile.js"), /karte\.setAttribute\("data-pfad-still", ""\)/);
  assert.match(lies("shared/lifeskin-klickpfad.js"), /if \(ziel\?\.closest\("\[data-pfad-still\]"\)\) return;/);
});

test("Therapieseite: Messmarken nur in der neuen Fassung, nie in der Vorschau oder still", () => {
  const js = lies("apps/lifeskin-verkauf/terapia.js");
  assert.match(js, /if \(!this\.neu \|\| this\.nurVorschau \|\| globalThis\.__mnyraStill === true\) return;/);
  // Kein Pixel-Ereignis fuer die Begleitung oder die Messung.
  assert.doesNotMatch(js, /pixel\.melde\("(betreuung|ndjekja|kauf)/);
});

test("Kasse: die Nummer aus der Analyse steht nie im Bericht und nie in einer Adresse", () => {
  const js = lies("apps/lifeskin-verkauf/terapia.js");
  const neu = js.slice(js.indexOf("async #bestellenNeu()"), js.indexOf("// ---------- Die Begleitung"));
  assert.match(neu, /if \(werte\.telefon\) auftrag\.phone = werte\.telefon\.slice\(0, 40\);/);
  assert.match(neu, /address\.telefonNgaAnaliza = true/);
  assert.doesNotMatch(neu, /zustandSchreiben\(\{[^}]*(phone|telefon)/);
  assert.match(neu, /if \(this\.nurVorschau \|\| this\.bestellt \|\| this\.sendet\) return;/, "Kein zweites Absenden");
  assert.match(neu, /BESTELLT\.includes\(String\(stand\?\.status/, "Nach einem Fehler: erst nachsehen, ob es doch ankam");
});

test("Kundenbereich: kein Pixel, kein Klickpfad, nicht indexiert, kein Referer", () => {
  const html = lies("apps/lifeskin-verkauf/ndjekja.html");
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(html, /<meta name="referrer" content="no-referrer">/);
  assert.doesNotMatch(html, /lifeskin-pixel|fbq|lifeskin-still/);
  const ohneKommentare = (text) => text.replace(/^\s*\/\/.*$/gm, "");
  const js = ohneKommentare(lies("apps/lifeskin-verkauf/ndjekja.js") + lies("apps/lifeskin-verkauf/ndjekja-daten.js"));
  assert.doesNotMatch(js, /lifeskin-pixel|klickpfad|ndjekjaIntern/, "Der Kundenbereich kennt keinen Pfad zum Internen");
  assert.match(lies("vercel.json"), /"source": "\/ndjekja",\s*"destination": "\/apps\/lifeskin-verkauf\/ndjekja\.html"/);
  assert.match(lies("sw.js"), /'\/ndjekja',/);
  assert.match(lies("sw.js"), /'\/terapia',/);
});

test("Kundenbereich: ein Eintrag und seine Zusammenfassung in EINEM Commit", async () => {
  const anfragen = [];
  const daten = new NdjekjaDaten({
    zugang: ZUGANG,
    basis: "http://127.0.0.1:8080/v1/projects/p1/databases/(default)/documents",
    fetchFn: async (url, optionen = {}) => { anfragen.push({ url, optionen }); return { ok: true, status: 200, json: async () => ({}) }; }
  });
  const neu = await daten.eintragSpeichern({ dita: 2, data: "2026-09-21", perdorimi: "po", ndjesia: ["skuqje"], mesazh: "Pyetje?" },
    { altFundit: {}, jetzt: "2026-09-21T10:00:00Z" });
  assert.equal(neu.ok, true);
  const { url, optionen } = anfragen[0];
  assert.equal(url, "http://127.0.0.1:8080/v1/projects/p1/databases/(default)/documents:commit");
  const koerper = JSON.parse(optionen.body);
  assert.equal(koerper.writes.length, 2);
  const [eintrag, fall] = koerper.writes;
  assert.equal(eintrag.update.name, `projects/p1/databases/(default)/documents/lifeskin/lifeskin/ndjekja/${ZUGANG}/shenime/t02`);
  assert.deepEqual(eintrag.currentDocument, { exists: false });
  assert.ok(eintrag.updateMask.fieldPaths.includes("createdAt"));
  assert.equal(eintrag.update.fields.dita.integerValue, "2");
  assert.deepEqual(fall.updateMask.fieldPaths, ["fundit", "updatedAt"]);
  assert.equal(fall.update.fields.fundit.mapValue.fields.blickAt.stringValue, "2026-09-21T10:00:00Z");
  // Korrektur: kein neues createdAt, das Dokument muss es geben.
  await daten.eintragSpeichern({ dita: 2, data: "2026-09-21", perdorimi: "jo" }, { vorhanden: { createdAt: "2026-09-21T10:00:00Z" }, jetzt: "2026-09-21T12:00:00Z" });
  const korrektur = JSON.parse(anfragen[1].optionen.body).writes[0];
  assert.deepEqual(korrektur.currentDocument, { exists: true });
  assert.equal(korrektur.updateMask.fieldPaths.includes("createdAt"), false);
  // Ungueltig: gar nicht erst senden.
  assert.deepEqual(await daten.eintragSpeichern({ dita: 2, perdorimi: "vielleicht" }), { ok: false, grund: "form" });
  assert.equal(anfragen.length, 2);
  // Ohne gueltigen Zugang: nichts.
  const ohne = new NdjekjaDaten({ zugang: "../x", fetchFn: async () => { throw new Error("darf nicht"); } });
  assert.deepEqual(await ohne.fall(), { status: "fehlt" });
});

test("Kundenbereich: Datum auf Albanisch, von Hand", () => {
  assert.equal(datumSq("2026-10-05"), "e hënë, 5 tetor");
  assert.equal(datumSq("2026-10-05", { mitTag: false }), "5 tetor");
  assert.equal(zeitSq("2026-09-26T11:02:00Z"), "26 shtator, 13:02");
  assert.equal(datumSq("gestern"), "");
});

// --- Heart ---

function zustand(extra = {}) {
  return {
    ndjekja: {
      an: true, status: "ok",
      faelle: [
        { zugang: ZUGANG, kennung: "k1", code: "LS-1", emri: "Arta", statusi: "aktiv", porosia: { statusi: "konfirmuar" }, startAt: "2026-09-24", startVon: "klienti", kontrollet: {}, kontrolliRadhes: "", fundit: { dita: 2, at: "2026-09-25T09:00:00Z", blickAt: "2026-09-25T09:00:00Z" }, createdAt: "2026-09-23T10:00:00Z", updatedAt: "2026-09-25T09:00:00Z" },
        { zugang: "f".repeat(32), kennung: "k2", code: "LS-2", emri: "Blerina", statusi: "aktiv", porosia: { statusi: "derguar" }, startAt: "", kontrollet: {}, fundit: {}, createdAt: "2026-09-25T10:00:00Z" }
      ],
      intern: { k1: { kennung: "k1", zugang: ZUGANG, pergjegjes: "GEHEIM-VERANTWORTLICH", detyra: "GEHEIM-AUFGABE", shenimet: [{ tekst: "GEHEIM-NOTIZ", nga: "Team", at: "2026-09-25T10:00:00Z" }], lexuarDeri: "" } },
      offen: ZUGANG,
      detail: { zugang: ZUGANG, status: "ok", eintraege: [{ dita: 2, data: "2026-09-25", perdorimi: "pjeserisht", ndjesia: ["thatesi"], mesazh: "A mund?", updatedAt: "2026-09-25T09:00:00Z" }], pergjigjet: [{ tekst: "Po, mundeni.", nga: "Ekipi", lloji: "pergjigje", createdAt: "2026-09-25T12:00:00Z" }] },
      ...extra
    }
  };
}

test("Heart: ohne Schalter gibt es die Betreuung nicht", () => {
  assert.equal(renderBetreuung({ ndjekja: { faelle: [] } }), "");
  assert.equal(renderFallBestellung({ id: "k1", order: { orderId: "x" } }, {}, {}), "");
});

test("Heart: Arbeitslisten mit Zahlen, die Frage zuerst", () => {
  const html = renderBetreuung(zustand(), "2026-09-26");
  assert.match(html, /Neue Rückmeldung \/ Frage <span>1<\/span>/);
  assert.match(html, /Wartet auf Start <span>1<\/span>/);
  assert.match(html, /data-was="liste" data-wert="rueckmeldung" aria-pressed="true"/, "Die dringendste Liste ist vorgewaehlt");
  assert.match(html, /Arta · LS-1/);
  assert.doesNotMatch(html, /Blerina/, "Nicht in der gewaehlten Liste");
});

test("Heart: Kunde und intern getrennt - mit Absender, ohne automatische Antwort", () => {
  const html = renderBetreuungFall(zustand(), { sitzungen: [{ id: "k1", phone: "+383 44 111 222" }], berichte: { k1: { produkte: [{ id: "lf-acne" }] } }, heute: "2026-09-26" });
  const kunde = html.slice(html.indexOf("heart-ndj-kasten--kunde"), html.indexOf("heart-ndj-kasten--intern"));
  const intern = html.slice(html.indexOf("heart-ndj-kasten--intern"));
  assert.match(kunde, /sichtbar für den Kunden, mit Datum und Absender/);
  assert.match(kunde, /name="nga"/);
  assert.match(kunde, /Po, mundeni\./);
  assert.doesNotMatch(kunde, /GEHEIM/);
  assert.match(intern, /Intern – nie für den Kunden/);
  assert.match(intern, /GEHEIM-NOTIZ/);
  assert.match(html, /wa\.me\/38344111222\?text=/);
  assert.match(html, new RegExp(`/ndjekja\\?shiko=1#${ZUGANG}`));
  // Die Termine: geplant, mit Knopf "Erledigt" - nie von selbst erledigt.
  assert.equal((html.match(/data-was="kontrolle"/g) || []).length, 4);
  assert.doesNotMatch(html, /erledigt \S+ \d/, "Kein Termin steht als erledigt da");
  assert.match(html, /· nicht dokumentiert \(nicht „nicht angewendet“\)/);
});

test("Heart: in der Akte - bestaetigen, WhatsApp eintragen, storniert", () => {
  const z = zustand();
  const offen = renderFallBestellung({ id: "k9", order: { orderId: "LS-9", status: "neu" } }, { status: "bestellt" }, z);
  assert.match(offen, /data-was="bestaetigen"/);
  assert.match(offen, /noch nicht bestätigt/);
  const wa = renderFallBestellung({ id: "k8", name: "Dua" }, { status: "fertig" }, z);
  assert.match(wa, /data-was="wa-bestellung"/);
  assert.match(wa, /value="Dua"/);
  assert.equal(renderFallBestellung({ id: "k7" }, { status: "wartet" }, z), "", "Ohne Befund keine Bestellung per WhatsApp");
  const mit = renderFallBestellung({ id: "k1", order: { orderId: "LS-1", status: "neu" } }, { status: "bestellt" }, z);
  assert.match(mit, /Betreuung öffnen/, "Gibt es die Betreuung, ist die Bestellung bestaetigt");
  const storno = renderFallBestellung({ id: "k1", order: { orderId: "LS-1", status: "storniert" } }, { status: "bestellt" }, z);
  assert.doesNotMatch(storno, /data-was="(bestaetigen|stornieren)"/);
});

test("Heart: Kaufweg je Fassung und 'gesehen' statt 'gelesen'", () => {
  const html = renderKaufweg([{ id: "a", createdAt: "2026-09-25T10:00:00Z", berichtGeoeffnet: true, hatBestellt: true, order: { orderId: "A", status: "bestaetigt" } }], { a: { status: "zugestellt" } });
  assert.match(html, /Kaufweg je Fassung/);
  assert.match(html, /Klassisch<small>1 Empfänger/);
  assert.match(html, /heart-ndj-kw__ziel"><th>Zugestellt<\/th><td><b>1<\/b>/);
  assert.match(html, /nicht Klicks oder Verweildauer/);
  assert.deepEqual(LESEMARKEN.filter((m) => /gelesen/.test(m.label)), []);
});
