// EINE BESTELLUNG SELBST ANLEGEN - nur die Daten (Auftrag Inhaber 07.10.:
// "bei Bestellungen rechts oben ein +, dann Produkte, Preis, Name,
// Adresse, Qyteti, Nummer").
//
// Keine Importe von Firebase: laeuft in Heart und im Test.
//
// GENAU WIE EINE BESTELLUNG AUS DEM LADEN (apps/lifeskin-shop/shop.js,
// bestellen()): eine Sitzung unter lifeskin/lifeskin/sessions mit
// step "ordered" und order.orderId - nur so steht sie in der Karte
// "Bestellungen", bekommt Posta Beki, Status und Umsatz wie jede andere.
//
// NIE AN META: Die Sitzung traegt keine Cookie-Zustimmung
// (device.zustimmung fehlt). Ohne sie meldet die Conversions API nichts
// (functions/lifeskin-capi-payload.js, metaErlaubt) - eine Bestellung,
// die am Telefon entstand, ist kein Kauf aus einer Anzeige. Der Test
// tests/heart-bestellung-neu.test.mjs prueft das gegen die echte Regel.
//
// device.gesehen false: Sie war nie ein Besuch auf der Seite und zaehlt
// darum in keinem Trichter der Landingpage mit.

const CODE_ZEICHEN = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function zufall(bytes) {
  const feld = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(feld);
  return feld;
}

export function neueSitzungsId() {
  return Array.from(zufall(16), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Dieselbe Form wie die Fallnummer aus dem Laden: LS-TTMM-XXXXX.
export function neuerCode(jetzt = Date.now()) {
  const d = new Date(jetzt);
  const zwei = (n) => String(n).padStart(2, "0");
  const rest = Array.from(zufall(5), (b) => CODE_ZEICHEN[b % CODE_ZEICHEN.length]).join("");
  return `LS-${zwei(d.getDate())}${zwei(d.getMonth() + 1)}-${rest}`;
}

const text = (w, max) => String(w ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Der Preis, wie man ihn tippt: "19", "19,50", " 19 € ". Leer oder
// Unsinn -> null (dann gilt der Vorschlag).
export function preisLesen(w) {
  const roh = String(w ?? "").replace(/[€\s]/g, "").replace(",", ".");
  if (!roh) return null;
  const n = Number(roh);
  return Number.isFinite(n) && n >= 0 && n <= 100000 ? Math.round(n * 100) / 100 : null;
}

// wahl: { "lf-acne": 1, "lf-moistur": 2 } - Stueckzahl je Produkt.
export function stueckGesamt(wahl) {
  return Object.values(wahl || {}).reduce((s, n) => s + Math.max(0, Math.floor(Number(n) || 0)), 0);
}

// Der Preisvorschlag: genau die Produkte eines Sets (je einmal) -> der
// Preis des Sets wie im Laden; sonst die Staffel nach Stueckzahl.
export function preisVorschlagFuer(wahl, setet = [], staffel = () => 0) {
  const ids = Object.keys(wahl || {}).filter((id) => Number(wahl[id]) > 0).sort();
  const stueck = stueckGesamt(wahl);
  if (!stueck) return 0;
  const jeEinmal = ids.every((id) => Number(wahl[id]) === 1);
  const set = jeEinmal ? (setet || []).find((s) => [...new Set(s.produkte || [])].sort().join(",") === ids.join(",")) : null;
  return set ? Number(set.preis) || staffel(stueck) : staffel(stueck);
}

// Baut das Dokument. Gibt { fehler } oder { id, code, daten } zurueck.
export function neueBestellung({
  wahl = {}, katalog = [], preis = null, vorschlag = 0,
  kunde = {}, autor = "", jetzt = Date.now(), id = neueSitzungsId(), code = neuerCode(jetzt)
} = {}) {
  const items = katalog
    .filter((p) => Number(wahl[p.id]) > 0)
    .map((p) => ({ id: p.id, name: text(p.name, 80), cmimi: Number(p.preis) || 0, sasia: Math.min(99, Math.floor(Number(wahl[p.id]))) }));
  if (!items.length) return { fehler: "Bitte mindestens ein Produkt wählen." };
  const total = preis ?? vorschlag;
  if (!Number.isFinite(Number(total))) return { fehler: "Bitte einen Preis eintragen." };

  const iso = new Date(jetzt).toISOString();
  const name = text(kunde.name, 80);
  const telefon = text(kunde.telefon, 40);
  const shenim = String(kunde.shenim ?? "").trim().slice(0, 500);
  const daten = {
    createdAt: iso,
    updatedAt: iso,
    step: "ordered",
    sprache: "sq",
    code,
    name,
    phone: telefon,
    address: { name, telefon, strasse: text(kunde.adresse, 160), ort: text(kunde.qyteti, 80) },
    source: { weg: "lifeskinshop", quelle: "heart" },
    device: { gesehen: false, app: "heart" },
    shopKauf: true,
    order: {
      kind: "shop",
      burimi: "heart",
      manuell: true,
      createdAt: iso,
      total: Math.round(Number(total) * 100) / 100,
      payment: "nachnahme",
      status: "neu",
      orderId: code,
      items,
      ...(shenim ? { shenim } : {}),
      ...(autor ? { autor: text(autor, 60) } : {})
    }
  };
  return { id, code, daten };
}
