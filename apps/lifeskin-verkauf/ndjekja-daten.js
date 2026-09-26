// DER KUNDENBEREICH DER BEGLEITUNG - Lesen und Schreiben, ohne SDK.
//
// Wie die Therapieseite ueber REST (keine Firebase-Bibliothek, keine
// Anmeldung): Der Kunde oeffnet einen Link und ist da. Was er lesen und
// schreiben darf, entscheiden die Regeln (firestore.rules, "ndjekja"):
//
//   ndjekja/<zugang>               sein Fall - lesen; selbst aendern nur
//                                  "fundit" und einmal den Start
//   ndjekja/<zugang>/shenime/tNN   seine Eintraege, einer je Tag
//   ndjekja/<zugang>/pergjigjet/*  was das Team ihm schreibt - nur lesen
//
// Interne Notizen liegen in einer anderen Sammlung (ndjekjaIntern), an die
// diese Datei nicht einmal einen Pfad kennt.

import { LIFESKIN_FIRESTORE_BASE, LIFESKIN_TENANT } from "../lifeskin/lifeskin-config.js";
import { dokument } from "../lifeskin-astra/astra-daten.js";
import { felder } from "../lifeskin/lifeskin-session.js";
import { istZugang, eintragsId, eintragBereinigen, funditNach, ndjekjaLesen } from "../../shared/lifeskin-ndjekja.js";

const GRENZE_MS = 15000;

// Ein Aufruf mit Frist: Im Funkloch haengt fetch sonst minutenlang, und
// der Knopf stuende so lange auf "Po ruhet…".
async function mitFrist(fetchFn, url, optionen = {}) {
  const abbruch = typeof AbortController === "function" ? new AbortController() : null;
  const uhr = abbruch ? setTimeout(() => abbruch.abort(), GRENZE_MS) : null;
  try {
    return await fetchFn(url, abbruch ? { ...optionen, signal: abbruch.signal } : optionen);
  } finally {
    if (uhr) clearTimeout(uhr);
  }
}

export class NdjekjaDaten {
  constructor({ zugang, fetchFn, basis = LIFESKIN_FIRESTORE_BASE, tenant = LIFESKIN_TENANT } = {}) {
    this.zugang = istZugang(zugang) ? zugang : "";
    this.fetchFn = fetchFn || ((...a) => globalThis.fetch(...a));
    this.basis = basis;
    this.tenant = tenant;
  }

  get #pfad() { return `lifeskin/${this.tenant}/ndjekja/${this.zugang}`; }

  #url(teil = "", suche = "") { return `${this.basis}/${this.#pfad}${teil}${suche}`; }

  // Der Name eines Dokuments, wie ihn ":commit" verlangt:
  // projects/<p>/databases/(default)/documents/...
  #name(teil = "") {
    return `${this.basis.replace(/^https?:\/\/[^/]+\/v1\//, "")}/${this.#pfad}${teil}`;
  }

  // Der Fall. { status: "ok", fall } | { status: "fehlt" } | { status: "netz" }
  async fall() {
    if (!this.zugang) return { status: "fehlt" };
    try {
      const antwort = await mitFrist(this.fetchFn, this.#url());
      if (antwort.status === 404 || antwort.status === 403) return { status: "fehlt" };
      if (!antwort.ok) return { status: "netz" };
      return { status: "ok", fall: ndjekjaLesen(dokument(await antwort.json())) };
    } catch {
      return { status: "netz" };
    }
  }

  async #liste(teil) {
    const antwort = await mitFrist(this.fetchFn, this.#url(`/${teil}`, "?pageSize=100"));
    if (!antwort.ok) throw new Error(`Firestore ${antwort.status}`);
    const roh = await antwort.json();
    return (roh?.documents || []).map((d) => ({ id: String(d.name || "").split("/").pop(), ...dokument(d) }));
  }

  // Seine Eintraege, nach Tag.
  async eintraege() {
    const liste = await this.#liste("shenime");
    return liste
      .filter((e) => /^t\d{2}$/.test(e.id))
      .map((e) => ({
        id: e.id,
        dita: Number(e.dita) || 0,
        data: String(e.data || ""),
        perdorimi: String(e.perdorimi || ""),
        ndjesia: Array.isArray(e.ndjesia) ? e.ndjesia.map(String) : [],
        mesazh: String(e.mesazh || ""),
        createdAt: String(e.createdAt || ""),
        updatedAt: String(e.updatedAt || "")
      }))
      .sort((a, b) => a.dita - b.dita);
  }

  // Was das Team geschrieben hat, das Neueste oben. Nur, was wirklich
  // geschrieben wurde - mit Datum und Absender.
  async pergjigjet() {
    const liste = await this.#liste("pergjigjet");
    return liste
      .map((p) => ({
        id: p.id,
        tekst: String(p.tekst || ""),
        nga: String(p.nga || ""),
        lloji: String(p.lloji || ""),
        dita: Number(p.dita) || 0,
        createdAt: String(p.createdAt || "")
      }))
      .filter((p) => p.tekst.trim())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  // DEN EINTRAG SPEICHERN - zusammen mit "fundit" am Fall, in EINEM
  // Commit: Beides kommt an, oder keines. Nur so steht eine Frage des
  // Kunden auch sicher in Heart.
  //
  // vorhanden: das bisherige Dokument dieses Tages (fuer createdAt) -
  // ein neuer Eintrag verlangt, dass es noch keinen gibt, ein korrigierter,
  // dass es ihn gibt. Stimmt das nicht (ein zweites Geraet), scheitert der
  // Commit sauber, statt still zu ueberschreiben.
  async eintragSpeichern(eingabe, { vorhanden = null, altFundit = {}, jetzt = new Date().toISOString() } = {}) {
    if (!this.zugang) return { ok: false, grund: "zugang" };
    const sauber = eintragBereinigen(eingabe, jetzt);
    if (!sauber) return { ok: false, grund: "form" };
    const id = eintragsId(sauber.dita);
    const eintrag = { ...sauber, createdAt: vorhanden?.createdAt || jetzt };
    const fundit = funditNach(sauber, altFundit, jetzt);
    const felderEintrag = Object.keys(eintrag).filter((k) => !(vorhanden && k === "createdAt"));
    const writes = [
      {
        update: { name: this.#name(`/shenime/${id}`), fields: felder(eintrag) },
        updateMask: { fieldPaths: felderEintrag },
        currentDocument: { exists: Boolean(vorhanden) }
      },
      {
        update: { name: this.#name(), fields: felder({ fundit, updatedAt: jetzt }) },
        updateMask: { fieldPaths: ["fundit", "updatedAt"] },
        currentDocument: { exists: true }
      }
    ];
    try {
      const antwort = await mitFrist(this.fetchFn, `${this.basis}:commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writes })
      });
      if (antwort.ok) return { ok: true, eintrag: { id, ...eintrag }, fundit };
      // 400 FAILED_PRECONDITION: ein anderes Geraet war schneller.
      return { ok: false, grund: antwort.status === 400 || antwort.status === 409 ? "stand" : "server" };
    } catch {
      return { ok: false, grund: "netz" };
    }
  }

  // Der Anwendungsstart - einmal, vom Kunden. Danach aendert ihn nur Heart.
  async starten(datum, jetzt = new Date().toISOString()) {
    if (!this.zugang) return { ok: false };
    const maske = ["startAt", "startVon", "updatedAt"].map((f) => `updateMask.fieldPaths=${f}`).join("&");
    try {
      const antwort = await mitFrist(this.fetchFn, this.#url("", `?${maske}&currentDocument.exists=true`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: felder({ startAt: datum, startVon: "klienti", updatedAt: jetzt }) })
      });
      return { ok: antwort.ok };
    } catch {
      return { ok: false };
    }
  }
}
