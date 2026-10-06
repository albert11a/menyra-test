// DERGESAT IN HEART - Knoepfe, Live-Zuhoerer und Abgleich (Auftrag 05.10.).
//
// Heart ist hier die Stelle, die alles zusammenhaelt:
//   - Posta Beki eintragen (Akte, Karte "Bestellung") legt die Bestellung
//     auf /dergesat an.
//   - Was auf /dergesat getippt wird, kommt live an (Chip unter der
//     Bestellung, Chips der Karte "Bestellungen").
//   - Heart zieht Therapieseite, Begleitung und Storno nach
//     (abgleichSchritte) - /dergesat selbst darf das nicht.
//   - Umgekehrt: "Als versendet/zugestellt melden" und "Als storniert
//     markieren" in Heart setzen auch /dergesat weiter.

import * as daten from "./heart-lifeskin-dergesat-adapter.js";
import { ladeIntern, porosiaStatusSetzen, bestellungStornieren } from "./heart-lifeskin-ndjekja-adapter.js";
import { abgleichSchritte, produkteTePorosise } from "./heart-lifeskin-dergesat-render.js";

export function createDergesatOperationen({ store, actions, setToast, berichteNachlesen = async () => {}, sitzungAuffrischen = async () => {} }) {
  let abmelden = null;
  // Was gerade nachgezogen wird (Kennung:Art:Ziel) - damit ein zweites
  // Signal waehrenddessen nicht ein zweites Mal schreibt. Danach steht der
  // neue Stand in Heart, und abgleichSchritte findet nichts mehr.
  const unterwegs = new Set();
  let abgleichLaeuft = false;
  let nochmal = false;

  const lifeskin = () => store.getState().lifeskin || {};
  const schluessel = (s) => `${s.kennung}:${s.art}:${s.felder?.status || ""}`;

  function starten() {
    if (abmelden) return;
    try {
      abmelden = daten.horcheDergesat((alle) => {
        if (!alle) { actions.patchLifeskin({ dergesatStatus: "fehler" }); return; }
        actions.patchLifeskin({ dergesat: alle, dergesatStatus: "ok" });
        abgleich();
      });
    } catch {
      abmelden = null;
    }
  }

  function stoppen() {
    if (abmelden) { try { abmelden(); } catch { /* egal */ } abmelden = null; }
  }

  // Nur mit Daten vom Server: Aus dem Geraetespeicher koennte ein alter
  // Befundstand kommen, und dann wuerde Heart "zurueckziehen".
  async function abgleich() {
    const z = lifeskin();
    if (z.status !== "ready" || z.loadedFrom !== "network" || z.dergesatStatus !== "ok") return;
    if (abgleichLaeuft) { nochmal = true; return; }
    abgleichLaeuft = true;
    let schritte = [];
    try {
      schritte = abgleichSchritte({
        dergesat: z.dergesat,
        sitzungen: [...(z.sitzungen || []), ...(z.tests || [])],
        berichte: z.berichte || {}
      }).filter((s) => !unterwegs.has(schluessel(s)));
      const berichte = [];
      for (const s of schritte) unterwegs.add(schluessel(s));
      for (const s of schritte) {
        try {
          if (s.art === "storno") {
            const intern = await ladeIntern(s.kennung).catch(() => null);
            await bestellungStornieren({ kennung: s.kennung, zugang: intern?.zugang || "" });
            await sitzungAuffrischen(s.kennung);
          } else {
            await daten.berichtVersand(s.kennung, s.felder);
            berichte.push(s.kennung);
            const intern = await ladeIntern(s.kennung).catch(() => null);
            if (intern?.zugang && s.ndjekja) await porosiaStatusSetzen(intern.zugang, s.ndjekja).catch(() => {});
          }
        } catch (fehler) {
          // Beim naechsten Signal noch einmal.
          globalThis.console?.warn?.("[heart] Dergesat-Abgleich:", s.kennung, fehler?.message);
        }
      }
      if (berichte.length) await berichteNachlesen(berichte);
    } finally {
      for (const s of schritte) unterwegs.delete(schluessel(s));
      abgleichLaeuft = false;
      if (nochmal) { nochmal = false; abgleich(); }
    }
  }

  async function postaBeki(knopf) {
    const kennung = String(knopf?.getAttribute?.("data-id") || "").trim();
    if (!kennung || lifeskin().dergesatLaeuft) return;
    const feld = knopf.closest?.("[data-dergesa-form]")?.querySelector?.("[name=posta-beki]");
    const wert = String(feld?.value || "").trim();
    const z = lifeskin();
    const sitzung = [...(z.sitzungen || []), ...(z.tests || [])].find((s) => s.id === kennung);
    if (!sitzung?.order?.orderId) { setToast("Posta Beki", "Zu diesem Fall gibt es keine Bestellung.", "danger"); return; }
    if (sitzung.order.status === "storniert") { setToast("Posta Beki", "Die Bestellung ist storniert.", "danger"); return; }
    if (!wert && !(z.dergesat || {})[kennung]) { setToast("Posta Beki", "Bitte zuerst die Nummer der Posta Beki eintragen.", "danger"); return; }
    actions.patchLifeskin({ dergesatLaeuft: `posta-beki:${kennung}` });
    try {
      const ergebnis = await daten.postaBekiRuaj({
        kennung,
        postaBeki: wert,
        kodi: sitzung.code || sitzung.order.orderId || "",
        produkte: produkteTePorosise(sitzung, (z.berichte || {})[kennung], z.produkte || []),
        cmimi: Number(sitzung.order.total) || 0
      });
      setToast("Posta Beki", ergebnis.was === "neu" ? "Gespeichert – steht jetzt auf /dergesat unter „Porosiat“."
        : ergebnis.was === "entfernt" ? "Entfernt – steht nicht mehr auf /dergesat."
          : "Gespeichert.", "success");
    } catch (fehler) {
      setToast("Posta Beki", fehler?.message || "Nicht gespeichert.", "danger");
    } finally {
      actions.patchLifeskin({ dergesatLaeuft: "" });
    }
  }

  async function aktion(was, knopf) {
    if (was === "posta-beki") return postaBeki(knopf);
  }

  // "Als versendet/zugestellt melden" in der Akte: /dergesat geht mit.
  async function nachVersand(kennung, stand) {
    const ne = stand === "versandt" ? "derguar" : stand === "zugestellt" ? "pranuar" : "";
    const d = (lifeskin().dergesat || {})[kennung];
    if (!ne || !d || d.statusi === ne || d.statusi === "anuluar") return;
    if (ne === "derguar" && !["porosi", "gati"].includes(d.statusi)) return;
    try { await daten.statusSetzen(kennung, ne); } catch { /* der Versand selbst ist gespeichert */ }
  }

  // "Als storniert markieren" in Heart: auf /dergesat Anuluar.
  async function nachStorno(kennung) {
    const d = (lifeskin().dergesat || {})[kennung];
    if (!d || d.statusi === "anuluar") return;
    try { await daten.statusSetzen(kennung, "anuluar"); } catch { /* die Stornierung selbst ist gespeichert */ }
  }

  return { starten, stoppen, abgleich, aktion, nachVersand, nachStorno };
}
