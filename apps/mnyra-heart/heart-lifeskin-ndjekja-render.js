// DIE BEGLEITUNG IN HEART - Zeichnen (Auftrag vom 26.09., Punkt 8).
//
//   renderBetreuung(zustand)        die Karte in der Lifeskin-Ansicht:
//                                   Arbeitslisten und Faelle
//   renderBetreuungFall(zustand)    ein Fall, ganzer Bildschirm
//   renderFallBestellung(...)       in der Akte einer Analyse: Bestellung
//                                   bestaetigen, stornieren, per WhatsApp
//                                   eintragen, Link an den Kunden
//
// KUNDE UND INTERN SIND ZWEI KAESTEN MIT ZWEI FARBEN. Was im gruenen Kasten
// geschrieben wird, sieht der Kunde (mit Datum und Absender); der rote ist
// "Intern - nie fuer den Kunden" und steht in einer eigenen Sammlung.

import { escapeHtml } from "./heart-ui-utils.js";
import {
  NDJEKJA, ARBEITSLISTEN, PERDORIMI, heuteIso, anwendungsTag, wocheVon, kontrollPlan, naechsteKontrolle, phaseVon,
  nachDenWochen, arbeitslistenVon, tagesStand, ndjesiaTekst, eintragBrauchtBlick, ndjekjaLink, istDatum, linkNachricht
} from "../../shared/lifeskin-ndjekja.js";
import { kaufwegKohorten } from "../../shared/lifeskin-kaufweg.js";

const WOCHEN = Math.max(1, Math.round((NDJEKJA.tage || 28) / 7));
const TAGE_KURZ = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function tag(iso) {
  if (!istDatum(iso)) return "—";
  const d = new Date(`${iso}T12:00:00Z`);
  return `${TAGE_KURZ[d.getUTCDay()]} ${d.getUTCDate()}.${d.getUTCMonth() + 1}.`;
}

function zeit(iso) {
  const ms = Date.parse(String(iso || ""));
  if (!Number.isFinite(ms)) return "";
  const d = new Date(ms);
  const t = heuteIso(d);
  const uhr = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Belgrade", hour: "2-digit", minute: "2-digit" }).format(d);
  return `${tag(t)} ${uhr}`;
}

function waNummer(nummer) {
  const ziffern = String(nummer || "").replace(/[^\d+]/g, "");
  if (ziffern.startsWith("+")) return ziffern.slice(1);
  if (ziffern.startsWith("00")) return ziffern.slice(2);
  return ziffern;
}

const knopf = (was, text, { zugang = "", id = "", extra = "", klasse = "heart-befund__knopf", laeuft = false } = {}) => `
  <button type="button" class="${klasse}" data-action="ndjekja" data-was="${escapeHtml(was)}"${zugang ? ` data-zugang="${escapeHtml(zugang)}"` : ""}${id ? ` data-id="${escapeHtml(id)}"` : ""}${extra}${laeuft ? ' disabled aria-busy="true"' : ""}>${laeuft ? "Speichert …" : text}</button>`;

// Was ein Fall gerade ist - eine Zeile.
function phaseText(fall, heute) {
  const phase = phaseVon(fall, heute);
  if (phase === "anuluar") return "Storniert";
  if (phase === "perfunduar") return "Abgeschlossen";
  if (phase === "pritet") return `Wartet auf Start · Paket ${({ konfirmuar: "bestätigt", derguar: "unterwegs", dorezuar: "zugestellt" })[fall.porosia?.statusi] || "bestätigt"}`;
  const t = anwendungsTag(fall.startAt, heute);
  return nachDenWochen(fall, heute) ? `Tag ${t} · ${WOCHEN} Wochen um` : `Woche ${wocheVon(t)} von ${WOCHEN} · Tag ${t}`;
}

export function betreuungListen(zustand, heute = heuteIso()) {
  const n = zustand?.ndjekja || {};
  const intern = n.intern || {};
  return (n.faelle || []).map((fall) => ({
    fall,
    listen: arbeitslistenVon({ ndjekja: fall, lexuarDeri: intern[fall.kennung]?.lexuarDeri || "", heute })
  }));
}

// ---------------------------------------------------------------------------
// Die Karte in der Lifeskin-Ansicht
// ---------------------------------------------------------------------------

export function renderBetreuung(zustand, heute = heuteIso()) {
  const n = zustand?.ndjekja || {};
  if (n.an !== true) return "";
  if (n.status === "laedt" && !(n.faelle || []).length) {
    return `<section class="heart-lifeskin-block heart-ndj"><h3 class="heart-lifeskin-block__titel">Betreuung</h3><p class="heart-lifeskin-leer">Wird geladen …</p></section>`;
  }
  if (n.status === "fehler") {
    return `<section class="heart-lifeskin-block heart-ndj"><h3 class="heart-lifeskin-block__titel">Betreuung</h3>
      <p class="heart-lifeskin-leer">Nicht geladen: ${escapeHtml(n.fehler || "")}. Sind die neuen Firestore-Regeln („ndjekja“) schon veröffentlicht?</p></section>`;
  }
  const alle = betreuungListen(zustand, heute);
  const zahlen = Object.fromEntries(ARBEITSLISTEN.map((l) => [l.id, alle.filter((x) => x.listen.has(l.id)).length]));
  const vorschlag = ARBEITSLISTEN.find((l) => zahlen[l.id] > 0)?.id || "alle";
  const gewaehlt = n.liste || vorschlag;
  const chips = [...ARBEITSLISTEN, { id: "alle", label: "Alle" }].map((l) => {
    const anzahl = l.id === "alle" ? alle.length : zahlen[l.id];
    return `<button type="button" class="heart-lifeskin-chip${l.id === gewaehlt ? " heart-lifeskin-chip--an" : ""}${anzahl && ["rueckmeldung", "ueberfaellig"].includes(l.id) ? " heart-ndj-chip--dringend" : ""}"
      data-action="ndjekja" data-was="liste" data-wert="${escapeHtml(l.id)}" aria-pressed="${l.id === gewaehlt ? "true" : "false"}">${escapeHtml(l.label)} <span>${anzahl}</span></button>`;
  }).join("");
  const zeilen = alle
    .filter((x) => gewaehlt === "alle" || x.listen.has(gewaehlt))
    .sort((a, b) => String(b.fall.fundit?.blickAt || b.fall.updatedAt).localeCompare(String(a.fall.fundit?.blickAt || a.fall.updatedAt)))
    .map(({ fall, listen }) => {
      const naechste = phaseVon(fall, heute) === "aktiv" ? naechsteKontrolle(fall) : null;
      const marken = [...listen].filter((id) => id !== gewaehlt && id !== "neu")
        .map((id) => `<span class="heart-lifeskin-marke ${["rueckmeldung", "ueberfaellig"].includes(id) ? "heart-lifeskin-marke--offen" : "heart-lifeskin-marke--neu"}">${escapeHtml(ARBEITSLISTEN.find((l) => l.id === id)?.label || id)}</span>`).join("");
      return `
      <button type="button" class="heart-lifeskin-zeile heart-ndj-zeile" data-action="ndjekja" data-was="oeffnen" data-zugang="${escapeHtml(fall.zugang)}" data-morph-key="ndj:${escapeHtml(fall.zugang)}">
        <span class="heart-lifeskin-zeile__leib">
          <b>${escapeHtml(fall.emri || "—")} · ${escapeHtml(fall.code || "")}</b>
          <small>${escapeHtml(phaseText(fall, heute))}${naechste ? ` · nächste Kontrolle Tag ${naechste.dita} (${escapeHtml(tag(naechste.datum))})` : ""}</small>
        </span>
        <span class="heart-ndj-zeile__marken">${marken}</span>
      </button>`;
    }).join("");
  return `
    <section class="heart-lifeskin-block heart-ndj">
      <h3 class="heart-lifeskin-block__titel">Betreuung${NDJEKJA.imVerkauf ? "" : ' <small class="heart-ndj__vorschau">Vorschau</small>'}</h3>
      <div class="heart-lifeskin-chips heart-ndj__chips" role="group">${chips}</div>
      ${zeilen ? `<div class="heart-lifeskin-zeilen">${zeilen}</div>` : `<p class="heart-lifeskin-leer">${alle.length ? "In dieser Liste gerade kein Fall." : "Noch keine Betreuung. Sie beginnt, wenn eine Bestellung in der Akte bestätigt wird."}</p>`}
      ${n.liveFehler ? `<p class="heart-lifeskin-leer">Live-Verbindung unterbrochen – Aktualisieren tippen.</p>` : ""}
    </section>`;
}

// ---------------------------------------------------------------------------
// Ein Fall
// ---------------------------------------------------------------------------

function tagesStreifen(fall, eintraege, heute) {
  const bis = Math.min(Math.max(anwendungsTag(fall.startAt, heute), 0), 35);
  if (!bis) return "";
  const nachTag = new Map(eintraege.map((e) => [e.dita, e]));
  const zelle = (t) => {
    const e = nachTag.get(t);
    const stand = tagesStand(e);
    const zeichen = { po: "✓", pjeserisht: "½", jo: "✗", pa: "·" }[stand.id] || "·";
    const blick = eintragBrauchtBlick(e);
    return `<span class="heart-ndj-tag heart-ndj-tag--${stand.id}${blick ? " heart-ndj-tag--blick" : ""}" title="Tag ${t}: ${escapeHtml(stand.sq)}${e?.ndjesia?.length ? ` · ${escapeHtml(ndjesiaTekst(e.ndjesia))}` : ""}">${t}<i>${zeichen}</i></span>`;
  };
  return `<div class="heart-ndj-streifen" aria-label="Tage">${Array.from({ length: bis }, (_, i) => zelle(i + 1)).join("")}</div>
    <p class="heart-ndj-legende">✓ angewendet · ½ teilweise · ✗ ausgelassen · · nicht dokumentiert (nicht „nicht angewendet“)</p>`;
}

export function renderBetreuungFall(zustand, { sitzungen = [], berichte = {}, heute = heuteIso() } = {}) {
  const n = zustand?.ndjekja || {};
  const fall = (n.faelle || []).find((f) => f.zugang === n.offen);
  if (!fall) {
    return `<div class="heart-ndj-fall">${knopf("zu", "← Zurück", { klasse: "heart-fall-knopf" })}<p class="heart-lifeskin-leer">Diesen Fall gibt es nicht mehr.</p></div>`;
  }
  const intern = (n.intern || {})[fall.kennung] || {};
  const detail = n.detail?.zugang === fall.zugang ? n.detail : { status: "laedt", eintraege: [], pergjigjet: [] };
  const eintraege = detail.eintraege || [];
  const sitzung = sitzungen.find((s) => s.id === fall.kennung) || {};
  const bericht = berichte[fall.kennung] || {};
  const phase = phaseVon(fall, heute);
  const listen = arbeitslistenVon({ ndjekja: fall, eintraege: detail.status === "ok" ? eintraege : null, lexuarDeri: intern.lexuarDeri, heute });
  const laeuft = (s) => n.laeuft === s;
  const nga = n.absender || "";
  const form = Number(n.formZaehler) || 0;
  const link = ndjekjaLink(fall.zugang);
  const wa = waNummer(sitzung.phone || sitzung.address?.telefon);
  const plan = kontrollPlan(fall);
  const naechste = phase === "aktiv" ? naechsteKontrolle(fall) : null;
  const neu = eintraege.filter((e) => eintragBrauchtBlick(e) && String(e.updatedAt) > String(intern.lexuarDeri || ""));
  const produkte = (bericht.produkte || []).map((p) => (typeof p === "string" ? p : p?.id)).filter(Boolean);

  const termine = plan.map((k) => {
    const offen = k.statusi !== "kryer";
    const istNaechste = naechste && naechste.dita === k.dita;
    const datum = istNaechste ? naechste.datum : k.datum;
    const faellig = offen && istDatum(datum) && datum <= heute;
    return `
      <li class="heart-ndj-termin${offen ? "" : " heart-ndj-termin--kryer"}${faellig ? " heart-ndj-termin--faellig" : ""}">
        <span><b>Tag ${k.dita}</b> · ${escapeHtml(tag(datum))}${istNaechste && naechste.eigen ? " (eigenes Datum)" : ""}</span>
        <span>${offen
          ? (phase === "aktiv" ? knopf("kontrolle", "Erledigt", { zugang: fall.zugang, extra: ` data-dita="${k.dita}"`, klasse: "heart-fall-knopf heart-ndj-mini", laeuft: laeuft(`kontrolle:${fall.zugang}:${k.dita}`) }) : "geplant")
          : `erledigt ${escapeHtml(zeit(k.kryerAt))} · ${escapeHtml(k.nga)}`}</span>
      </li>`;
  }).join("");

  const verlauf = [...eintraege].sort((a, b) => b.dita - a.dita).map((e) => `
    <li class="heart-ndj-eintrag${neu.includes(e) ? " heart-ndj-eintrag--neu" : ""}">
      <span class="heart-ndj-eintrag__kopf"><b>Tag ${e.dita}</b> · ${escapeHtml(tag(e.data))} · ${escapeHtml(PERDORIMI.find((p) => p.id === e.perdorimi)?.sq || "—")}${neu.includes(e) ? ' <span class="heart-lifeskin-marke heart-lifeskin-marke--offen">neu</span>' : ""}</span>
      ${e.ndjesia?.length ? `<span class="heart-ndj-eintrag__gefuehl">Haut: ${escapeHtml(ndjesiaTekst(e.ndjesia))}</span>` : ""}
      ${e.mesazh ? `<span class="heart-ndj-eintrag__text">„${escapeHtml(e.mesazh)}“</span>` : ""}
      <small>geändert ${escapeHtml(zeit(e.updatedAt))}</small>
    </li>`).join("");

  const gesendet = (detail.pergjigjet || []).map((p) => `
    <li class="heart-ndj-antwort">
      ${p.lloji === "kontroll" && p.dita ? `<span class="heart-lifeskin-marke heart-lifeskin-marke--neu">Kontrolle Tag ${p.dita}</span>` : ""}
      <span class="heart-ndj-antwort__text">${escapeHtml(p.tekst)}</span>
      <small>${escapeHtml(p.nga)} · ${escapeHtml(zeit(p.createdAt))}</small>
    </li>`).join("");

  const offeneKontrolle = naechste && istDatum(naechste.datum) && naechste.datum <= heute ? naechste.dita : 0;

  return `
    <div class="heart-ndj-fall">
      <div class="heart-ndj-fall__kopf">
        ${knopf("zu", "← Betreuung", { klasse: "heart-fall-knopf heart-ndj-zurueck" })}
        <h3>${escapeHtml(fall.emri || "—")} · ${escapeHtml(fall.code || "")}</h3>
        <p>${escapeHtml(phaseText(fall, heute))}${fall.startAt ? ` · Start ${escapeHtml(tag(fall.startAt))} (${fall.startVon === "ekipi" ? "vom Team gesetzt" : "vom Kunden bestätigt"})` : ""}</p>
        <div class="heart-ndj-fall__marken">${[...listen].map((id) => `<span class="heart-lifeskin-marke ${["rueckmeldung", "ueberfaellig"].includes(id) ? "heart-lifeskin-marke--offen" : "heart-lifeskin-marke--neu"}">${escapeHtml(ARBEITSLISTEN.find((l) => l.id === id)?.label || id)}</span>`).join("")}</div>
      </div>

      <div class="heart-fall-knoepfe">
        ${wa ? `<a class="heart-fall-knopf heart-fall-knopf--haupt" href="https://wa.me/${escapeHtml(wa)}?text=${escapeHtml(encodeURIComponent(linkNachricht(fall.emri, fall.zugang)))}" target="_blank" rel="noopener">Link senden<small>WhatsApp an ${escapeHtml(sitzung.phone || "")}</small></a>` : ""}
        <button type="button" class="heart-fall-knopf" data-action="lifeskin-text-kopieren" data-wert="${escapeHtml(link)}" data-was="Link der Betreuung">Link kopieren<small>nur an diesen Kunden</small></button>
        <a class="heart-fall-knopf" href="/ndjekja?shiko=1#${escapeHtml(fall.zugang)}" target="_blank" rel="noopener">Kundenansicht<small>nur lesen</small></a>
      </div>

      <section class="heart-ndj-kasten">
        <h4>Termine <small>geplant, bis jemand sie erledigt</small></h4>
        ${phase === "pritet" ? `<p class="heart-lifeskin-leer">Die Termine zählen ab dem Anwendungsstart. Noch nicht gestartet.</p>` : `<ul class="heart-ndj-termine">${termine}</ul>`}
        <div class="heart-ndj-reihe" data-ndjekja-form data-bewahren="ndj-termin:${escapeHtml(fall.zugang)}:${escapeHtml(fall.kontrolliRadhes || "")}">
          <label class="heart-lifeskin-feld"><span>Nächster Termin (anderes Datum)</span>
            <input class="heart-lifeskin-eingabe" type="date" name="termin" value="${escapeHtml(fall.kontrolliRadhes || "")}" /></label>
          ${knopf("termin", "Setzen", { zugang: fall.zugang, klasse: "heart-fall-knopf heart-ndj-mini", laeuft: laeuft(`termin:${fall.zugang}`) })}
        </div>
        <div class="heart-ndj-reihe" data-ndjekja-form data-bewahren="ndj-start:${escapeHtml(fall.zugang)}:${escapeHtml(fall.startAt || "")}">
          <label class="heart-lifeskin-feld"><span>Anwendungsstart ${fall.startAt ? "korrigieren" : "setzen"}</span>
            <input class="heart-lifeskin-eingabe" type="date" name="start" value="${escapeHtml(fall.startAt || "")}" max="${escapeHtml(heute)}" /></label>
          ${knopf("start", "Start setzen", { zugang: fall.zugang, klasse: "heart-fall-knopf heart-ndj-mini", laeuft: laeuft(`start:${fall.zugang}`) })}
        </div>
      </section>

      <section class="heart-ndj-kasten">
        <h4>Einträge des Kunden <small>${eintraege.length} · freiwillig</small></h4>
        ${detail.status === "laedt" ? `<p class="heart-lifeskin-leer">Wird geladen …</p>` : ""}
        ${tagesStreifen(fall, eintraege, heute)}
        ${verlauf ? `<ul class="heart-ndj-eintraege">${verlauf}</ul>` : (detail.status === "ok" ? `<p class="heart-lifeskin-leer">Noch kein Eintrag.</p>` : "")}
        ${neu.length || String(fall.fundit?.blickAt || "") > String(intern.lexuarDeri || "") ? knopf("gelesen", "Als gelesen markieren", { id: fall.kennung, klasse: "heart-fall-knopf", laeuft: laeuft(`gelesen:${fall.kennung}`) }) : ""}
      </section>

      <section class="heart-ndj-kasten heart-ndj-kasten--kunde">
        <h4>An den Kunden schreiben <small>sichtbar für den Kunden, mit Datum und Absender</small></h4>
        <!-- Nur die Felder ueberleben das Neuzeichnen (data-bewahren) - die
             Liste darunter muss sich mit jeder Antwort aendern. -->
        <div class="heart-ndj-form" data-ndjekja-form data-bewahren="ndj-antwort:${escapeHtml(fall.zugang)}:${form}">
        <textarea class="heart-lifeskin-eingabe" name="tekst" rows="4" maxlength="2000" placeholder="Rückmeldung auf Albanisch – was gut läuft, was als Nächstes kommt"></textarea>
        <div class="heart-ndj-reihe heart-ndj-reihe--stapel">
          <label class="heart-lifeskin-feld"><span>Absender (so sieht es der Kunde)</span>
            <input class="heart-lifeskin-eingabe" name="nga" value="${escapeHtml(nga)}" maxlength="80" placeholder="z. B. Dr. Violeta Gashi" /></label>
          <label class="heart-lifeskin-feld"><span>Gehört zur Kontrolle</span>
            <select class="heart-lifeskin-eingabe" name="kontroll">
              <option value="">– keine –</option>
              ${plan.filter((k) => k.statusi !== "kryer").map((k) => `<option value="${k.dita}"${k.dita === offeneKontrolle ? " selected" : ""}>Tag ${k.dita} (dann erledigt)</option>`).join("")}
            </select></label>
        </div>
        ${knopf("antwort", "An den Kunden senden", { zugang: fall.zugang, id: fall.kennung, klasse: "heart-befund__knopf heart-befund__knopf--haupt", laeuft: laeuft(`antwort:${fall.zugang}`) })}
        </div>
        ${gesendet ? `<ul class="heart-ndj-antworten">${gesendet}</ul>` : `<p class="heart-lifeskin-leer">Noch nichts gesendet.</p>`}
      </section>

      <section class="heart-ndj-kasten heart-ndj-kasten--intern">
        <h4>Intern – nie für den Kunden</h4>
        <div data-ndjekja-form data-bewahren="ndj-intern:${escapeHtml(fall.kennung)}:${escapeHtml(intern.pergjegjes || "")}:${escapeHtml(String(intern.detyra || "").length)}">
          <label class="heart-lifeskin-feld"><span>Verantwortlich</span>
            <input class="heart-lifeskin-eingabe" name="pergjegjes" value="${escapeHtml(intern.pergjegjes || "")}" maxlength="80" /></label>
          <label class="heart-lifeskin-feld"><span>Offene Aufgaben</span>
            <textarea class="heart-lifeskin-eingabe" name="detyra" rows="2" maxlength="1000">${escapeHtml(intern.detyra || "")}</textarea></label>
          ${knopf("intern", "Intern speichern", { id: fall.kennung, klasse: "heart-fall-knopf", laeuft: laeuft(`intern:${fall.kennung}`) })}
        </div>
        ${(intern.shenimet || []).length ? `<ul class="heart-ndj-notizen">${[...intern.shenimet].reverse().map((s) => `<li><span>${escapeHtml(s.tekst)}</span><small>${escapeHtml(s.nga || "")} · ${escapeHtml(zeit(s.at))}</small></li>`).join("")}</ul>` : ""}
        <div data-ndjekja-form data-bewahren="ndj-notiz:${escapeHtml(fall.kennung)}:${form}">
          <textarea class="heart-lifeskin-eingabe" name="notiz" rows="2" maxlength="1000" placeholder="Interne Notiz"></textarea>
          ${knopf("notiz", "Notiz speichern", { id: fall.kennung, klasse: "heart-fall-knopf", laeuft: laeuft(`notiz:${fall.kennung}`) })}
        </div>
      </section>

      <section class="heart-ndj-kasten">
        <h4>Plan</h4>
        <p>${escapeHtml(produkte.join(" + ") || "—")} · <a href="/terapia/${escapeHtml(fall.kennung)}?still=1" target="_blank" rel="noopener">Therapieseite (ohne Statistik)</a></p>
        <p class="heart-ndj-klein">Bestellung: ${escapeHtml(({ konfirmuar: "bestätigt", derguar: "versendet", dorezuar: "zugestellt", anuluar: "storniert" })[fall.porosia?.statusi] || "bestätigt")} · angelegt ${escapeHtml(zeit(fall.createdAt))}</p>
        ${phase === "perfunduar"
          ? knopf("wieder", "Betreuung wieder öffnen", { zugang: fall.zugang, klasse: "heart-fall-knopf", laeuft: laeuft(`abschluss:${fall.zugang}`) })
          : phase === "anuluar" ? "" : knopf("abschliessen", "Betreuung abschließen", { zugang: fall.zugang, klasse: "heart-fall-knopf", laeuft: laeuft(`abschluss:${fall.zugang}`) })}
      </section>
    </div>`;
}

// ---------------------------------------------------------------------------
// In der Akte einer Analyse: Bestellung und Betreuung
// ---------------------------------------------------------------------------

export function renderFallBestellung(sitzung, bericht, zustand, heute = heuteIso()) {
  const n = zustand?.ndjekja || {};
  if (n.an !== true || !sitzung) return "";
  const order = sitzung.order || null;
  const status = String(bericht?.status || "");
  const intern = (n.intern || {})[sitzung.id] || null;
  const fall = intern?.zugang ? (n.faelle || []).find((f) => f.zugang === intern.zugang) : null;
  const laeuft = (s) => n.laeuft === s;

  if (!order?.orderId) {
    if (status !== "fertig") return "";
    return `
      <section class="heart-ndj-kasten" data-ndjekja-form data-bewahren="ndj-wa:${escapeHtml(sitzung.id)}">
        <h4>Bestellung per WhatsApp? <small>an diesem Fall eintragen – zählt einmal</small></h4>
        <div class="heart-ndj-reihe heart-ndj-reihe--drei">
          <label class="heart-lifeskin-feld"><span>Name</span><input class="heart-lifeskin-eingabe" name="wa-name" value="${escapeHtml(sitzung.name || "")}" maxlength="100" /></label>
          <label class="heart-lifeskin-feld"><span>Straße</span><input class="heart-lifeskin-eingabe" name="wa-strasse" maxlength="150" /></label>
          <label class="heart-lifeskin-feld"><span>Ort</span><input class="heart-lifeskin-eingabe" name="wa-ort" maxlength="100" /></label>
        </div>
        ${knopf("wa-bestellung", "WhatsApp-Bestellung eintragen", { id: sitzung.id, klasse: "heart-fall-knopf", laeuft: laeuft(`wa:${sitzung.id}`) })}
      </section>`;
  }

  // Die Betreuung wird im SELBEN Schreibvorgang angelegt, in dem die
  // Bestellung bestaetigt wird - gibt es sie, ist bestaetigt, auch wenn die
  // Sitzung in Heart noch den alten Stand zeigt.
  const storniert = order.status === "storniert" || fall?.porosia?.statusi === "anuluar";
  const bestaetigt = !storniert && (order.status === "bestaetigt" || Boolean(fall));
  const zeile = [
    order.quelle === "whatsapp" ? "per WhatsApp" : (order.fassung === "ndjekja-1" ? "Therapieseite (neue Fassung)" : "Therapieseite"),
    storniert ? `storniert ${zeit(order.storniertAt)}` : bestaetigt ? `bestätigt ${zeit(order.bestaetigtAt)}` : order.status === "neu" ? "noch nicht bestätigt" : order.status,
    order.still ? "still · Test?" : ""
  ].filter(Boolean).join(" · ");
  return `
    <section class="heart-ndj-kasten heart-ndj-kasten--bestellung">
      <h4>Bestellung &amp; Betreuung</h4>
      <p class="heart-ndj-klein">${escapeHtml(zeile)}</p>
      ${storniert ? "" : !bestaetigt || !fall
        ? knopf("bestaetigen", bestaetigt ? "Betreuung anlegen" : "Bestellung bestätigen &amp; Betreuung anlegen", { id: sitzung.id, klasse: "heart-befund__knopf heart-befund__knopf--haupt", laeuft: laeuft(`bestaetigen:${sitzung.id}`) })
        : `<p class="heart-ndj-klein"><b>Betreuung:</b> ${escapeHtml(phaseText(fall, heute))}</p>
           <div class="heart-fall-knoepfe">
             ${knopf("oeffnen", "Betreuung öffnen", { zugang: fall.zugang, klasse: "heart-fall-knopf heart-fall-knopf--haupt" })}
             ${waNummer(sitzung.phone || sitzung.address?.telefon) ? `<a class="heart-fall-knopf" href="https://wa.me/${escapeHtml(waNummer(sitzung.phone || sitzung.address?.telefon))}?text=${escapeHtml(encodeURIComponent(linkNachricht(fall.emri, fall.zugang)))}" target="_blank" rel="noopener">Link senden<small>WhatsApp</small></a>` : ""}
           </div>`}
      ${storniert ? "" : knopf("stornieren", "Als storniert markieren", { id: sitzung.id, klasse: "heart-fall-knopf heart-ndj-leise", laeuft: laeuft(`stornieren:${sitzung.id}`) })}
    </section>`;
}

// ---------------------------------------------------------------------------
// Der Kaufweg je Fassung (Auftrag, Punkt 13) - fuer den Zeitraum oben
// ---------------------------------------------------------------------------

const FASSUNG_NAMEN = Object.freeze({ klassisch: "Klassisch", "ndjekja-1": "Mit Begleitung" });

export function renderKaufweg(sitzungen, berichte, { zeitraum = "", seit = NDJEKJA.imVerkaufSeit } = {}) {
  const gruppen = kaufwegKohorten(sitzungen, berichte, { seit });
  const titel = `<h3 class="heart-lifeskin-block__titel">Kaufweg je Fassung</h3>`;
  if (!gruppen.length) {
    return `<section class="heart-lifeskin-block">${titel}<p class="heart-lifeskin-leer">Im Zeitraum${zeitraum ? ` (${escapeHtml(zeitraum)})` : ""} keine freigegebene Analyse.</p></section>`;
  }
  const stufen = [...new Map(gruppen.flatMap((g) => g.stufen.map((x) => [x.id, x.label]))).entries()];
  const zelle = (g, id) => {
    const x = g.stufen.find((y) => y.id === id);
    if (!x) return `<td class="heart-ndj-kw__leer">–</td>`;
    return `<td><b>${x.anzahl}</b> <small>${Math.round(x.anteil * 100)} %</small></td>`;
  };
  return `
    <section class="heart-lifeskin-block">
      ${titel}
      <div class="heart-ndj-kw">
        <table>
          <thead><tr><th></th>${gruppen.map((g) => `<th>${escapeHtml(FASSUNG_NAMEN[g.version] || g.version)}<small>${g.faelle} Empfänger · ${escapeHtml(tag(g.von))}–${escapeHtml(tag(g.bis))}</small></th>`).join("")}</tr></thead>
          <tbody>${stufen.map(([id, label]) => `<tr class="${["bestaetigt", "zugestellt"].includes(id) ? "heart-ndj-kw__ziel" : ""}"><th>${escapeHtml(label)}</th>${gruppen.map((g) => zelle(g, id)).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
      <p class="heart-ndj-klein">Erfolg = bestätigte und zugestellte Bestellungen je Empfänger – nicht Klicks oder Verweildauer. „Gesehen“ heißt: im Bild, nicht gelesen. Eigene Testbestellungen (still) und gelöschte Fälle zählen nicht. Wer die Seite nie geöffnet hat, zählt zur Fassung, die am Tag seiner Analyse galt${seit ? ` (neu ab ${escapeHtml(tag(seit))})` : " (bisher: klassisch)"}.</p>
    </section>`;
}
