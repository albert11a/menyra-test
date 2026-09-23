// DIE VORSCHAU UNTER JEDEM FELD - so sieht es der Patient.
//
// Unter jedem Feld im Schritt "Therapieseite pruefen" steht der Text so,
// wie ihn die Therapieseite zeigt: helles Papier, fett, was fett wird,
// Produktname vorn und gruen, Karten wie auf der Seite. Aendert sich ein
// Feld, aendert sich die Vorschau beim Tippen mit (heart-events.js ->
// vorschauAuffrischen), ohne dass Heart neu zeichnet.
//
// DIESELBEN REGELN WIE DIE SEITE: shared/lifeskin-terapia-text.js. Eine
// Vorschau, die anders rechnet als die Seite, waere eine Behauptung.

import { escapeHtml } from "./heart-ui-utils.js";
import {
  fettTeile, fettNachtragen, hyrjaAbgleichen, ohneVerneinung, ohneFotoSaetze, produktVornRest
} from "../../shared/lifeskin-terapia-text.js";

const leer = (text) => `<p class="heart-tv__leer">${escapeHtml(text)}</p>`;
const fett = (text) => fettTeile(text).map((t) => (t.fett ? `<b>${escapeHtml(t.text)}</b>` : escapeHtml(t.text))).join("");

// Jede Art bekommt ihre Werte als Objekt - beim ersten Zeichnen aus dem
// Befund, beim Tippen aus den Feldern.
const BAUER = {
  hyrja(w) {
    if (!w.text) return leer("Leer – die Seite baut den Einstiegssatz aus dem Befund.");
    const satz = fettNachtragen(hyrjaAbgleichen(w.text, w.anzahl || 0, w.imText || []), w.problemet || []);
    return `<p class="heart-tv__hyrja">${fett(satz)}</p>`;
  },
  shqetesimi(w) {
    const text = w.ohneFoto ? ohneFotoSaetze(w.text) : w.text;
    return text ? `<p class="heart-tv__kasten">${escapeHtml(text)}</p>` : leer("Leer – der grüne Kasten erscheint nicht.");
  },
  karte(w) {
    if (w.nichtImSet) return leer("Produkt nicht gewählt – diese Karte erscheint nicht.");
    if (!w.gjetja) return leer("Leer – diese Karte erscheint nicht.");
    const satz = String(w.zgjidhja || "").trim();
    const rest = w.name ? produktVornRest(w.name, ohneVerneinung(satz) || satz) : satz;
    return `
      <div class="heart-tv__karte">
        <div><h6>${escapeHtml(w.gjetja)}</h6>${w.ku ? `<p>${escapeHtml(w.ku)}</p>` : ""}</div>
        ${w.name ? `<span class="heart-tv__pfeil" aria-hidden="true">→</span>` : ""}
        ${w.name || satz ? `<p class="heart-tv__zgjidhja">${w.name ? `<b>${escapeHtml(w.name)}</b>${rest ? ` ${escapeHtml(rest)}` : ""}` : escapeHtml(satz)}</p>` : ""}
      </div>`;
  },
  punkte(w) {
    const punkte = (w.punkte || []).filter(Boolean);
    return `
      <div class="heart-tv__produkt">
        <h6>${escapeHtml(w.name || "")}</h6>
        ${punkte.length
          ? `<ul>${punkte.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>`
          : leer("Leer – die Seite nimmt die drei Zeilen aus dem Katalog.")}
      </div>`;
  },
  dita_28(w) {
    const text = (w.ohneFoto ? ohneFotoSaetze(w.text) : w.text) || "Krahasojmë lëkurën tuaj me foton e sotme.";
    return `
      <div class="heart-tv__zeit"><span>28</span><div><h6>Dita 28 — vlerësimi final</h6><p>${escapeHtml(text)}</p></div></div>
      ${w.text ? "" : leer("Leer – so steht der Standardsatz da.")}`;
  },
  pse_tani(w) {
    const text = w.ohneFoto ? ohneFotoSaetze(w.text) : w.text;
    return `${text ? `<p class="heart-tv__leise">${escapeHtml(text)}</p>` : leer("Leer – über dem Knopf steht dann nichts.")}
      <span class="heart-tv__knopf">Fillo terapinë</span>`;
  },
  // ── Analyse-Details (unten auf der Therapieseite, "Analiza e plotë") ──
  absatz(w) {
    const text = String(w.text || "").trim();
    if (!text) return leer("Leer – dieser Satz erscheint nicht.");
    return `<p class="heart-tv__absatz">${fett(text)}</p>`;
  },
  zahl(w) {
    const text = String(w.text || "").trim();
    return text ? `<p class="heart-tv__zahl"><b>${escapeHtml(text)}</b> ${escapeHtml(w.einheit || "")}</p>`
      : leer("Leer – die Seite rechnet selbst.");
  },
  // Wie auf der Therapieseite: die Stufe als Plakette mit ihrem Namen.
  stufe(w) {
    const n = w.text === "" || w.text === undefined ? NaN : Number(w.text);
    if (!Number.isFinite(n)) return leer("Keine Stufe – die Plakette erscheint nicht.");
    const name = String(w.name || "").replace(/^\d+\s*[—-]\s*/, "");
    return `<span class="heart-tv__plakette">${escapeHtml(name || String(n))}</span>`;
  },
  zona(w) {
    if (!w.zona && !w.teksti) return leer("Leer – diese Zone erscheint nicht.");
    return `<div class="heart-tv__zone"><h6>${escapeHtml(w.zona || "")}</h6><p>${escapeHtml(w.teksti || "")}</p></div>`;
  },
  // Wie auf der Therapieseite (Liste "Të gjithë parametrat"): Name, dazu
  // der Grad als Plakette.
  param(w) {
    if (!w.emri && !w.thjeshte) return leer("Leer – dieser Messwert erscheint nicht.");
    return `<div class="heart-tv__paramzeile"><span>${escapeHtml(w.emri || w.thjeshte)}</span>${w.grada ? `<span class="heart-tv__plakette">${escapeHtml(w.grada)}</span>` : ""}</div>`;
  },
  whatsapp(w) {
    if (!w.text) return leer("Leer – der Knopf „WhatsApp-Nachricht kopieren“ erscheint nicht.");
    return `<p class="heart-tv__wa">${escapeHtml(w.patient ? `Përshëndetje ${w.patient}! ` : "Përshëndetje! ")}${escapeHtml(w.text)}</p>`;
  }
};

export function vorschauInhalt(art, werte = {}) {
  const bauer = BAUER[art];
  return bauer ? bauer(werte) : "";
}

// Der Kasten unter einem Feld. schluessel sagt vorschauAuffrischen, woher
// die Werte kommen ("hyrja", "karte:0", "punkte:lf-acne" ...).
export function vorschauKasten(schluessel, art, werte, extra = "") {
  return `
          <div class="heart-tv" data-tv="${escapeHtml(schluessel)}"${extra}>
            <span class="heart-tv__marke">So sieht es der Patient</span>
            <div class="heart-tv__inhalt">${vorschauInhalt(art, werte)}</div>
          </div>`;
}

// ── Live: alle Vorschauen aus den Feldern neu setzen ──────────────────
function wert(wurzel, wahl) {
  return String(wurzel.querySelector(wahl)?.value || "").trim();
}

function kartenAusFeldern(wurzel) {
  const karten = [];
  for (const feld of wurzel.querySelectorAll('[data-shitja-problem][data-teil="gjetja"]')) {
    const i = feld.getAttribute("data-shitja-problem");
    const teil = (name) => wert(wurzel, `[data-shitja-problem="${i}"][data-teil="${name}"]`);
    const wahl = wurzel.querySelector(`[data-shitja-problem="${i}"][data-teil="produkt_id"]`);
    const name = wahl && wahl.value ? String(wahl.selectedOptions?.[0]?.textContent || wahl.value).trim() : "";
    karten.push({ i, gjetja: teil("gjetja"), ku: teil("ku"), produkt_id: wahl?.value || "", name, zgjidhja: teil("zgjidhja") });
  }
  return karten;
}

export function vorschauAuffrischen(wurzel = globalThis.document) {
  if (!wurzel?.querySelectorAll) return;
  const kaesten = wurzel.querySelectorAll("[data-tv]");
  if (!kaesten.length) return;
  const ohneFoto = wert(wurzel, "[data-bogen-art]") === "pa-foto";
  const angehakt = [...wurzel.querySelectorAll("[data-produkt-wahl]:checked")].map((k) => String(k.value));
  const karten = kartenAusFeldern(wurzel);
  const mitPunkten = angehakt.filter((id) => [...wurzel.querySelectorAll(`[data-shitja-punkt="${CSS.escape(id)}"]`)]
    .some((f) => String(f.value || "").trim()));

  for (const kasten of kaesten) {
    const [art, teil] = String(kasten.getAttribute("data-tv") || "").split(":");
    let werte;
    if (art === "karte") {
      const k = karten.find((x) => x.i === teil) || {};
      // Die Seite zeigt nur Karten, deren Produkt im Set ist (oder ohne Produkt).
      const imSet = !k.produkt_id || !angehakt.length || angehakt.includes(k.produkt_id);
      werte = imSet ? k : { nichtImSet: true };
    } else if (art === "punkte") {
      werte = {
        name: kasten.getAttribute("data-tv-name") || teil,
        punkte: [...wurzel.querySelectorAll(`[data-shitja-punkt="${CSS.escape(teil)}"]`)].map((f) => String(f.value || "").trim())
      };
    } else if (art === "raport") {
      const feld = wurzel.querySelector(`[data-raport="${CSS.escape(teil)}"]`);
      const text = String(feld?.value ?? "").trim();
      const unterart = kasten.getAttribute("data-tv-art") || "absatz";
      const name = unterart === "stufe" ? String(feld?.selectedOptions?.[0]?.textContent || "").trim() : "";
      const neu = vorschauInhalt(unterart, { text, name, einheit: kasten.getAttribute("data-tv-einheit") || "" });
      const inhalt = kasten.querySelector(".heart-tv__inhalt");
      if (inhalt && inhalt.innerHTML !== neu) inhalt.innerHTML = neu;
      continue;
    } else if (art === "zona") {
      werte = { zona: wert(wurzel, `[data-zona-ort="${teil}"]`), teksti: wert(wurzel, `[data-zona-text="${teil}"]`) };
    } else if (art === "param") {
      const p = (n) => wert(wurzel, `[data-par-${n}="${teil}"]`);
      werte = { emri: p("emri"), vlera: p("vlera"), grada: p("grada"), shkalla: p("shkalla"), thjeshte: p("thjeshte") };
    } else if (art === "hyrja") {
      werte = { text: wert(wurzel, '[data-shitja="hyrja"]'), anzahl: angehakt.length, imText: mitPunkten,
        problemet: karten.map((k) => ({ gjetja: k.gjetja })) };
    } else {
      werte = { text: wert(wurzel, `[data-shitja="${art}"]`), ohneFoto, patient: kasten.getAttribute("data-tv-patient") || "" };
    }
    const inhalt = kasten.querySelector(".heart-tv__inhalt");
    const neu = vorschauInhalt(art, werte);
    if (inhalt && inhalt.innerHTML !== neu) inhalt.innerHTML = neu;
  }
}
