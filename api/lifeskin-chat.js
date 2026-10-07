// DIE MELDUNG ZUM CHAT (docs/lifeskin-chat.md, 07.10.).
//
// Nach jeder Nachricht eines Kunden ruft /lifeskinshop diese Adresse
// (sendBeacon, ohne zu warten). Hier wird NICHTS geglaubt, was der Browser
// sagt: Die Nachricht muss in Firestore stehen, vom Kunden sein und frisch
// (2 Minuten, Serverzeit). Dann geht ein Push an die Heart-Geraete - ueber
// denselben Weg wie die Meldung einer neuen Analyse (lifeskin-meldung.js).
//
// HOECHSTENS EINE MELDUNG JE CHAT UND 20 SEKUNDEN: Die Kennung der Meldung
// enthaelt den 20-Sekunden-Abschnitt; wer in dieser Zeit fuenf Nachrichten
// schickt, loest einen Push aus (meldungAnlegen legt jede Kennung nur
// einmal an).
import {
  schluessel, zugangHolen, lies, wert, empfaenger, meldungAnlegen, schicken, zustellungAendern
} from "./lifeskin-meldung.js";

const TENANT = "lifeskin";
const ZUGANG = /^[0-9a-f]{32}$/;
const NACHRICHT = /^[a-z0-9]{8,40}$/;
const FRISCH_MS = 2 * 60 * 1000;
const ABSCHNITT_MS = 20 * 1000;

const felderVon = (dok) => Object.fromEntries(Object.entries(dok?.fields || {}).map(([k, v]) => [k, wert(v)]));

export function meldungsText(chat, nachricht) {
  const art = nachricht?.art;
  const inhalt = art === "bild" ? "📷 Foto" : art === "antwort" ? "📝 Formular plotësuar" : String(nachricht?.text || "").replace(/\s+/g, " ").trim();
  const wer = String(chat?.code || "").trim() || "Klient i ri";
  const kurz = inhalt.length > 120 ? `${inhalt.slice(0, 119)}…` : inhalt;
  return `💬 ${wer}: ${kurz}`;
}

export function meldungsKennungChat(zugang, atMs) {
  return `lifeskin_chat_${zugang.slice(0, 16)}_${Math.floor(atMs / ABSCHNITT_MS)}`;
}

export default async function lifeskinChat(req, res) {
  res.setHeader("cache-control", "no-store");
  res.setHeader("content-type", "application/json");
  if (req.method !== "POST") { res.statusCode = 405; res.end(JSON.stringify({ ok: false })); return; }
  let koerper = req.body;
  if (typeof koerper === "string") { try { koerper = JSON.parse(koerper); } catch { koerper = {}; } }
  const zugang = String(koerper?.zugang || "");
  const id = String(koerper?.id || "");
  if (!ZUGANG.test(zugang) || !NACHRICHT.test(id)) { res.statusCode = 400; res.end(JSON.stringify({ ok: false, grund: "kennung" })); return; }
  const k = schluessel();
  if (!k) { res.statusCode = 503; res.end(JSON.stringify({ ok: false, grund: "kein-schluessel" })); return; }
  try {
    const token = await zugangHolen(k);
    const pfad = `lifeskin/${TENANT}/chats/${zugang}`;
    const [chatDok, nachrichtDok] = await Promise.all([lies(pfad, token), lies(`${pfad}/nachrichten/${id}`, token)]);
    const chat = felderVon(chatDok);
    const nachricht = felderVon(nachrichtDok);
    const atMs = Date.parse(String(nachricht.at || ""));
    if (!chatDok || !nachrichtDok || nachricht.von !== "kunde" || !Number.isFinite(atMs) || Date.now() - atMs > FRISCH_MS) {
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, gemeldet: 0, grund: "nicht-faellig" }));
      return;
    }
    const kennung = meldungsKennungChat(zugang, atMs);
    const nutzlast = { type: "lifeskin_chat", text: meldungsText(chat, nachricht), link: `/heart#chat/${zugang}`, source: "chat" };
    let gemeldet = 0;
    let fehlgeschlagen = false;
    for (const uid of await empfaenger(token)) {
      let zustellung;
      try {
        zustellung = await meldungAnlegen(uid, kennung, nutzlast, token);
        if (!zustellung) continue;
        await schicken(uid, kennung, nutzlast, token, zustellung);
        gemeldet += 1;
      } catch {
        if (zustellung) await zustellungAendern(zustellung.pfad, { leaseUntil: 0 }, token).catch(() => {});
        fehlgeschlagen = true;
      }
    }
    res.statusCode = fehlgeschlagen ? 503 : 200;
    res.end(JSON.stringify({ ok: !fehlgeschlagen, gemeldet }));
  } catch (fehler) {
    console.error("[lifeskin-chat]", fehler?.message || fehler);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false }));
  }
}
