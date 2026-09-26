// DIE BEGLEITUNG IN HEART - was die Knoepfe tun (Auftrag vom 26.09.,
// Punkt 8). Zeichnen: heart-lifeskin-ndjekja-render.js, Firestore:
// heart-lifeskin-ndjekja-adapter.js.
//
// SICHTBAR NUR MIT SCHALTER, solange die Begleitung nicht im Verkauf ist
// (NDJEKJA.imVerkauf): Heart mit ?ndjekja=1 oeffnen - das merkt sich das
// Geraet (localStorage heart.ndjekja = "an"); ?ndjekja=0 schaltet aus.
// Ohne Schalter bleibt Heart, wie es war.
//
// Alles, was hier an den Kunden geht, tippt ein Mensch: Rueckmeldung,
// Termin erledigt, Start. Nichts wird aus einer gewaehlten Hautreaktion
// abgeleitet.

import * as daten from "./heart-lifeskin-ndjekja-adapter.js";
import { NDJEKJA, heuteIso, istZugang, istDatum } from "../../shared/lifeskin-ndjekja.js";

const SCHALTER = "heart.ndjekja";
const ABSENDER = "heart.ndjekja.nga";

export function ndjekjaInHeart(ort = globalThis.location, speicher = globalThis.localStorage) {
  if (NDJEKJA.imVerkauf === true) return true;
  try {
    const wunsch = new URLSearchParams(ort?.search || "").get("ndjekja");
    if (wunsch === "1") speicher?.setItem(SCHALTER, "an");
    else if (wunsch === "0") speicher?.removeItem(SCHALTER);
    return wunsch === "1" || (wunsch !== "0" && speicher?.getItem(SCHALTER) === "an");
  } catch {
    return false;
  }
}

export function absenderGemerkt() {
  try { return globalThis.localStorage?.getItem(ABSENDER) || ""; } catch { return ""; }
}

function absenderMerken(name) {
  try { globalThis.localStorage?.setItem(ABSENDER, String(name || "").trim()); } catch { /* egal */ }
}

export function createNdjekjaOperationen({ store, actions, setToast, berichteNachlesen = async () => {} }) {
  let abmelden = null;
  const stand = () => store.getState().lifeskin?.ndjekja || {};
  const setzen = (felder) => actions.patchLifeskin({ ndjekja: { ...stand(), ...felder } });
  const an = () => stand().an === true;

  async function laden() {
    setzen({ an: true, status: stand().status === "ok" ? "ok" : "laedt" });
    try {
      const { faelle, intern } = await daten.ladeNdjekja();
      setzen({ status: "ok", faelle, intern, fehler: "" });
    } catch (fehler) {
      setzen({ status: "fehler", fehler: fehler?.message || "Nicht geladen" });
    }
  }

  function starten() {
    if (!ndjekjaInHeart()) return;
    if (!an()) setzen({ an: true, absender: stand().absender || absenderGemerkt() });
    if (abmelden) return;
    laden();
    try {
      abmelden = daten.horcheNdjekja((faelle) => {
        if (!Array.isArray(faelle)) { setzen({ liveFehler: true }); return; }
        setzen({ faelle, liveFehler: false });
        // Ist ein Fall offen und hat sich dort etwas getan: Eintraege nachladen.
        const offen = stand().offen;
        const neu = faelle.find((f) => f.zugang === offen);
        if (offen && neu && neu.fundit?.at && neu.fundit.at !== stand().detail?.funditAt) detailLaden(offen, { still: true });
      });
    } catch {
      abmelden = null;
    }
  }

  function stoppen() {
    if (abmelden) { try { abmelden(); } catch { /* egal */ } abmelden = null; }
  }

  async function detailLaden(zugang, { still = false } = {}) {
    if (!istZugang(zugang)) return;
    if (!still) setzen({ detail: { zugang, status: "laedt", eintraege: [], pergjigjet: [] } });
    try {
      const d = await daten.ladeNdjekjaDetail(zugang);
      const fall = (stand().faelle || []).find((f) => f.zugang === zugang);
      setzen({ detail: { zugang, status: "ok", ...d, funditAt: fall?.fundit?.at || "" } });
    } catch (fehler) {
      setzen({ detail: { zugang, status: "fehler", eintraege: [], pergjigjet: [], fehler: fehler?.message || "" } });
    }
  }

  const fallVon = (zugang) => (stand().faelle || []).find((f) => f.zugang === zugang) || null;
  const zugangVon = (kennung) => (stand().intern || {})[kennung]?.zugang || "";

  // Ein Knopf, der wartet: derselbe Knopf kann nicht zweimal laufen.
  async function laufen(schluessel, arbeit, { erfolg = "", titel = "Betreuung" } = {}) {
    if (stand().laeuft === schluessel) return false;
    setzen({ laeuft: schluessel });
    try {
      await arbeit();
      setzen({ laeuft: "" });
      if (erfolg) setToast(titel, erfolg, "success");
      return true;
    } catch (fehler) {
      setzen({ laeuft: "" });
      setToast(titel, fehler?.message || "Nicht gespeichert.", "danger");
      return false;
    }
  }

  const feld = (knopf, wahl) => knopf?.closest?.("[data-ndjekja-form]")?.querySelector(wahl);
  const wert = (knopf, wahl) => String(feld(knopf, wahl)?.value || "").trim();
  const neuesFormular = () => setzen({ formZaehler: (Number(stand().formZaehler) || 0) + 1 });

  async function aktion(was, knopf) {
    const zugang = knopf?.getAttribute?.("data-zugang") || stand().offen || "";
    const kennung = knopf?.getAttribute?.("data-id") || fallVon(zugang)?.kennung || "";
    switch (was) {
      case "liste":
        setzen({ liste: knopf.getAttribute("data-wert") || "" });
        return;
      case "oeffnen":
        if (!istZugang(zugang)) return;
        setzen({ offen: zugang });
        globalThis.scrollTo?.(0, 0);
        await detailLaden(zugang);
        return;
      case "zu":
        setzen({ offen: "", detail: null });
        return;
      case "bestaetigen": {
        const sitzung = (store.getState().lifeskin?.sitzungen || []).find((s) => s.id === kennung) || {};
        let ergebnis = null;
        const ok = await laufen(`bestaetigen:${kennung}`, async () => {
          ergebnis = await daten.bestaetigenUndAnlegen({ kennung, code: sitzung.code || "", emri: sitzung.address?.name?.split(" ")[0] || sitzung.name || "" });
        }, { titel: "Bestellung" });
        if (!ok) return;
        await laden();
        setToast("Bestellung", ergebnis?.neu ? "Bestätigt – Betreuung angelegt. Jetzt den Link an den Kunden senden." : "Bestätigt – die Betreuung gab es schon.", "success");
        return;
      }
      case "stornieren": {
        if (!globalThis.confirm?.("Bestellung wirklich als storniert markieren?")) return;
        const ok = await laufen(`stornieren:${kennung}`, () => daten.bestellungStornieren({ kennung, zugang: zugangVon(kennung) }),
          { titel: "Bestellung", erfolg: "Als storniert markiert." });
        if (ok) await laden();
        return;
      }
      case "wa-bestellung": {
        const bericht = (store.getState().lifeskin?.berichte || {})[kennung] || {};
        const ok = await laufen(`wa:${kennung}`, () => daten.whatsappBestellung({
          kennung, preis: Number(bericht.preis) || 0,
          name: wert(knopf, "[name=wa-name]"), strasse: wert(knopf, "[name=wa-strasse]"), ort: wert(knopf, "[name=wa-ort]")
        }), { titel: "WhatsApp-Bestellung", erfolg: "Eingetragen – zählt einmal, an diesem Fall." });
        if (ok) await berichteNachlesen([kennung]);
        return;
      }
      case "start": {
        const datum = wert(knopf, "[name=start]");
        if (!istDatum(datum)) { setToast("Start", "Bitte ein Datum wählen.", "danger"); return; }
        const ok = await laufen(`start:${zugang}`, () => daten.startSetzen(zugang, datum), { titel: "Start", erfolg: "Start gesetzt." });
        if (ok) await laden();
        return;
      }
      case "antwort": {
        const tekst = wert(knopf, "[name=tekst]");
        const nga = wert(knopf, "[name=nga]");
        const dita = Number(wert(knopf, "[name=kontroll]")) || 0;
        if (!tekst) { setToast("Rückmeldung", "Der Text ist leer.", "danger"); return; }
        if (!nga) { setToast("Rückmeldung", "Bitte angeben, wer schreibt (so sieht es der Kunde).", "danger"); return; }
        const ok = await laufen(`antwort:${zugang}`, async () => {
          await daten.antwortSchreiben(zugang, { tekst, nga, lloji: dita ? "kontroll" : "pergjigje", dita });
          if (dita) await daten.kontrolleErledigt(zugang, dita, nga);
        }, { titel: "Rückmeldung", erfolg: dita ? `Gesendet – Kontrolle Tag ${dita} erledigt.` : "Gesendet – der Kunde sieht sie jetzt." });
        if (!ok) return;
        absenderMerken(nga);
        setzen({ absender: nga });
        neuesFormular();
        if (kennung) await daten.gelesenBis(kennung).then(() => internNeu(kennung, { lexuarDeri: new Date().toISOString() })).catch(() => {});
        await Promise.all([laden(), detailLaden(zugang, { still: true })]);
        return;
      }
      case "kontrolle": {
        const dita = Number(knopf.getAttribute("data-dita")) || 0;
        const nga = wert(knopf, "[name=nga]") || stand().absender || absenderGemerkt();
        if (!nga) { setToast("Kontrolle", "Bitte zuerst eintragen, wer kontrolliert (Feld „Absender“).", "danger"); return; }
        const ok = await laufen(`kontrolle:${zugang}:${dita}`, () => daten.kontrolleErledigt(zugang, dita, nga),
          { titel: "Kontrolle", erfolg: `Tag ${dita} als erledigt markiert.` });
        if (ok) await laden();
        return;
      }
      case "termin": {
        const datum = wert(knopf, "[name=termin]");
        const ok = await laufen(`termin:${zugang}`, () => daten.naechsterTermin(zugang, datum),
          { titel: "Termin", erfolg: datum ? "Nächster Termin gesetzt." : "Eigener Termin entfernt – es gilt der Plan." });
        if (ok) await laden();
        return;
      }
      case "abschliessen": {
        if (!globalThis.confirm?.("Betreuung abschließen? Der Kunde sieht danach „përfundoi“.")) return;
        const ok = await laufen(`abschluss:${zugang}`, () => daten.betreuungAbschliessen(zugang), { erfolg: "Abgeschlossen." });
        if (ok) await laden();
        return;
      }
      case "wieder": {
        const ok = await laufen(`abschluss:${zugang}`, () => daten.betreuungWiederOeffnen(zugang), { erfolg: "Wieder offen." });
        if (ok) await laden();
        return;
      }
      case "intern": {
        const werte = { pergjegjes: wert(knopf, "[name=pergjegjes]"), detyra: wert(knopf, "[name=detyra]") };
        const ok = await laufen(`intern:${kennung}`, () => daten.internSpeichern(kennung, werte), { titel: "Intern", erfolg: "Gespeichert (nur intern)." });
        if (ok) internNeu(kennung, werte);
        return;
      }
      case "notiz": {
        const tekst = wert(knopf, "[name=notiz]");
        if (!tekst) return;
        const nga = stand().absender || absenderGemerkt() || String(store.getState().auth?.user?.email || "");
        const ok = await laufen(`notiz:${kennung}`, () => daten.internNotiz(kennung, tekst, nga), { titel: "Intern", erfolg: "Notiz gespeichert (nur intern)." });
        if (!ok) return;
        const alt = (stand().intern || {})[kennung] || {};
        internNeu(kennung, { shenimet: [...(alt.shenimet || []), { tekst, nga, at: new Date().toISOString() }] });
        neuesFormular();
        return;
      }
      case "gelesen": {
        const jetzt = new Date().toISOString();
        const ok = await laufen(`gelesen:${kennung}`, () => daten.gelesenBis(kennung, jetzt), { erfolg: "Als gelesen markiert." });
        if (ok) internNeu(kennung, { lexuarDeri: jetzt });
        return;
      }
      default:
    }
  }

  function internNeu(kennung, felder) {
    const intern = { ...(stand().intern || {}) };
    intern[kennung] = { ...(intern[kennung] || { kennung }), ...felder };
    setzen({ intern });
  }

  // Versand in Heart gemeldet: auch im Bereich des Kunden.
  async function versandGemeldet(kennung, stand_) {
    const zugang = zugangVon(kennung);
    if (!zugang) return;
    try {
      await daten.porosiaStatusSetzen(zugang, stand_ === "versandt" ? "derguar" : stand_ === "zugestellt" ? "dorezuar" : "");
      await laden();
    } catch { /* der Versand selbst ist gespeichert */ }
  }

  return { starten, stoppen, aktion, laden, versandGemeldet, heute: () => heuteIso() };
}
