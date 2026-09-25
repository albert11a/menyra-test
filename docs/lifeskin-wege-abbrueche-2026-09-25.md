Status: CURRENT
Last updated: 2026-09-25

# LifeSkin — Wege von /lifeskin bis zur fertigen Analyse: Abbruchstellen und Korrekturen

Auftrag: die Wege von der Landingpage `/lifeskin` bis zur fertigen Analyse
pruefen (inklusive Vite und Buendel), weil zu viele Besucher abbrechen.
Nur Smartphones. Landing bis Warteseite laufen meist im eingebauten
Browser von Instagram/Facebook, die fertige Analyse im normalen Browser
(Safari/Chrome). Dazu: Beim Foto-Weg war die Aufnahme seitenverkehrt.

Ausgangsstand: `9266399` (Branch `claude/lifeskin-user-journey-h4f5bb`).

## 1. Die Wege

| Seite | Datei | Wo sie meist laeuft |
|---|---|---|
| `/lifeskin` | `apps/lifeskin-landing/index.html` + `apps/lifeskin/lifeskin-app.js` | Instagram/Facebook-App |
| `/analiza/<id>` (Warteseite) | `apps/lifeskin-astra/` | Instagram/Facebook-App |
| `/terapia/<id>` (fertige Analyse) | `apps/lifeskin-verkauf/terapia.html` | Safari/Chrome (Link aus WhatsApp) |

```
Landing ─ Fillo ─► Mënyra ─┬─ Me skanim ─► Anleitung ─► Kamera (Ring) ─► Name ─► Nummer ─► Übergabe ─► /analiza/<id>
                           ├─ Me foto ───► Anleitung ─► Kamera (Foto) ─► Name ─► Nummer ─► Übergabe ─► /analiza/<id>
                           └─ Trup/Pytje ─► Name ─► Anliegen (+Foto optional) ─► Nummer ─► Übergabe ─► /analiza/<id>
/analiza/<id> fragt alle 12 s nach; ist der Befund frei, geht es nach /terapia/<id>.
```

## 2. Vite und Buendel

- Vite baut nur die Social-App (`apps/menyra-social/bundled`). LifeSkin laeuft
  nicht durch Vite.
- LifeSkin wird von `scripts/build-vercel-static-output.mjs` nach `dist/`
  kopiert; fuenf Einstiege werden mit esbuild zu je EINER Datei gebuendelt
  (`lifeskin-app.js`, `shop.js`, `raste.js`, `astra.js`, `terapia.js`),
  Kommentare und Leerraum entfernt, ueberfluessige `modulepreload` bereinigt.
- `npm run build` laeuft sauber. Die einzige Warnung (Social-Chunk > 500 kB)
  ist alt und betrifft LifeSkin nicht.
- Groesse `dist/apps/lifeskin/lifeskin-app.js`: vorher 198 134 B (56 274 B gzip),
  jetzt 208 780 B (59 224 B gzip) — die neuen Wege kosten rund 3 KB uebertragen.
- Das Buendel ist nicht der Engpass. Der Engpass war das Gesichtsnetz (unten, A4).

## 3. Befunde und Korrekturen

Sortiert nach Wirkung auf die Abbrueche.

### A1 — Android in Facebook/Instagram: keine Live-Kamera (groesste Abbruchstelle)

Die Android-Apps von Facebook und Instagram geben ihrer eingebauten
Webansicht keinen Kamerazugriff: `getUserMedia()` antwortet sofort mit
`NotAllowedError`, ohne Systemfrage. Auf dem iPhone geben dieselben Apps die
Kamera frei. Belegt durch das Meta-Entwicklerforum
([Thread](https://developers.facebook.com/community/threads/432379558191221))
und die 8th-Wall-Dokumentation
([iOS-Apps](https://www.8thwall.com/blog/post/41168830873/8th-wall-now-works-across-all-major-ios-apps-including-instagram-snapchat-and-more)).

Vorher: Fehlerkasten mit "Lejoni kamerën …" und "Provo sërish" — der Knopf
hilft dort nie. Scan UND Foto waren fuer Android-Besucher aus Anzeigen eine
Sackgasse.

Jetzt (`#kameraAusweg`, `#systemFotoWaehlen`, `#systemFotoErhalten`,
`#chromeAdresse` in `lifeskin-app.js`):

- Jeder Kamerafehler (Scan und Foto) bietet zusaetzlich
  **"Bëj foto me kamerën e telefonit"** an: ein Dateifeld
  (`accept="image/*"`, `capture="user"`), das die Kamera-App des Telefons
  oeffnet — dafuer braucht die Seite keine Freigabe.
- Das Foto landet im Foto-Weg zur Pruefung ("Përdor foton" / "Bëje
  përsëri"), der Fall wird zu Typ `foto`, danach Name → Nummer → Warteseite
  wie gewohnt. "Bëje përsëri" oeffnet wieder die Handykamera.
- Android in einer App (Facebook, Instagram, Messenger, TikTok, jede
  Android-Webansicht `; wv)`): Bei verweigerter Kamera steht der Satz
  `fehlerKameraInApp`, **kein** "Provo sërish", dafuer Handykamera und
  **"Hape në Chrome"** (`intent://…;package=com.android.chrome`, mit
  `browser_fallback_url`). In Chrome fuehrt `?ls_weg=skanim|foto` direkt zur
  Anleitung des gewaehlten Wegs; die Angabe verschwindet sofort aus der Adresse.
- Bilder aus der Kamera-App (12 MP+) werden ueber eine Objekt-Adresse
  dekodiert statt als Text von mehreren MB gelesen; Dateien ohne Typangabe
  (manche Android-Webansichten) werden nicht mehr verworfen.

Offen und nur am Geraet zu klaeren: ob das Dateifeld in der jeweiligen App
wirklich die Kamera/Galerie oeffnet und ob der `intent://`-Link aus der App
heraus Chrome oeffnet (siehe 5.).

### A2 — Übergabe: falscher Fehler nach 20 Sekunden

Vorher: Die Übergabe zeigte nach **20 s ab dem Tipp** "Dërgimi nuk është
konfirmuar ende …", auch wenn die Fotos (Scan: bis 7 Bilder, ~1,5 MB) auf
einer schmalen Leitung noch sauber hochgingen. Kam der Versand danach an,
passierte nichts, bis jemand "Provo sërish" tippte.

Jetzt:
- Die Frist zaehlt ab der **letzten Antwort des Servers**
  (`sitzung.letzteAntwort`), nicht ab dem Tipp. Solange Fotos ankommen, kein
  Hinweis.
- Die letzte Zeile der Aufbereitung zeigt "Po dërgohen fotot te Dr. Gashi…
  x nga y", solange Fotos unterwegs sind.
- Kommt der Versand nach dem Hinweis doch an, geht es **von selbst** zur
  Warteseite. Scheitert er endgueltig, sendet der naechste Tipp neu.
- `keepalive` nur noch fuer Schreibvorgaenge unter 60 KB: Groessere
  (gesammelt hinter langen Foto-Uploads) wuerde der Browser sonst verwerfen —
  samt Name und Klickpfad.

### A3 — Ring steht: alles weg nach 45 Sekunden

Vorher: 45 s ohne neuen Strich → Kamera aus, Fehler, alle Bilder verworfen,
Neustart. Wer 6 von 8 Strichen hatte, verlor alles.

Jetzt (`#stillstandPruefen`): Liegen Bilder vor, oeffnet sich nach **25 s**
ohne Fortschritt das Hilfe-Blatt mit "Vazhdo kështu" (weiter mit dem, was da
ist). Kamera und Bilder bleiben. Der Abbruch nach 45 s bleibt nur, wenn es
gar kein Bild gibt. Dazu: Wirft die Gesichtserkennung Bild um Bild Fehler
(z. B. verlorener WebGL-Kontext unter Speicherdruck), uebernimmt nach 30
Fehlern in Folge die einfache Erkennung, statt dass der Ring still steht.

### A4 — 6,9 MB Gesichtsnetz fuer jeden Landing-Besucher

Vorher: `netzVorladen()` lief in `starte()`, also beim Oeffnen der
Landingpage — fuer jeden Besucher aus der Anzeige: ~6,9 MB Download
(WASM 3,1 MB + Modell 3,8 MB), WebAssembly uebersetzen und die GPU
einrichten. Auf iOS griff die Netzbremse nie (kein `navigator.connection`).
Das konkurrierte mit dem Laden der Landingpage selbst, kostete Datenvolumen
und Speicher in den knappen App-Browsern — auch in den Android-App-Browsern,
wo es gar keine Live-Kamera gibt.

Jetzt:
- Geladen wird erst bei Absicht: 1,5 s nach dem Tipp auf den Startknopf
  (ein Tipp auf "Me foto"/"Trup" bestellt es wieder ab), sofort bei
  "Me skanim". Wo keine Live-Kamera moeglich ist (Android-App-Browser, keine
  Kamera-Schnittstelle), gar nicht.
- GPU-Start scheitert → zweiter Versuch auf der CPU statt ganz ohne Netz.
  Welcher Weg lief, steht im Klickpfad ("Gesichtserkennung bereit … · GPU/CPU").

### A5 — Foto-Weg: Aufnahme seitenverkehrt

Die Vorschau der Frontkamera ist gespiegelt (wie ein Spiegel), die Aufnahme
war es nicht: Beim Ausloesen sprang das Bild seitenverkehrt um, und so stand
es auch auf dem Nummernschirm und der Warteseite.

Jetzt wird die Frontkamera-Aufnahme (Foto und Miniatur) genauso gespiegelt
wie die Vorschau (`alsJpeg(…, { spiegeln })`, `Flaechenkamera#aufnehmen`).
Das entspricht dem Scan, der seine Bilder schon immer gespiegelt ablegt
(`#spiegelnAuf`); der Befund nennt ohnehin nie "links/rechts"
(`docs/lifeskin-prompt-v9.txt`). Rueckkamera: ungespiegelt wie ihre Vorschau.
Bilder aus der Kamera-App (Dateifeld) bleiben, wie das Telefon sie liefert.

## 4. Neue Zeilen im Klickpfad (Heart → Fall → Klickpfad → "Technik")

Damit sich am echten Verkehr zeigt, welche Wege genommen werden:

- `Live-Kamera in der App gesperrt (…) – Handykamera und Chrome angeboten`
- `Handykamera geöffnet (skanim|foto)` / `Handykamera: Foto erhalten · B×H · KB` / `Handykamera: Foto nicht lesbar`
- `Chrome-Link getippt (…)` / `Aus dem Chrome-Link geöffnet: …`
- `Scan ohne Fortschritt seit … s – Hilfe mit »Vazhdo kështu« geöffnet`
- `Gesichtserkennung ausgefallen (… Fehler in Folge) – einfache Erkennung übernimmt`
- `Gesichtserkennung bereit nach … ms (ab Kamera) · GPU|CPU`

Keine neuen Firestore-Felder: alles laeuft ueber vorhandene Felder
(`typ`, `photos`, Klickpfad) — die Regeln (`hasOnly`) bleiben unberuehrt.

## 5. Pruefung

- `node --test tests/lifeskin-*.test.mjs tests/heart-lifeskin-*.test.mjs`: 1162 bestanden.
- `npm test`: 2673 bestanden, 0 fehlgeschlagen.
- Neu: `tests/lifeskin-wege-robust.test.mjs` (15 Tests: App-Erkennung,
  Fehlerkasten-Auswege, Handykamera → Foto-Weg, Chrome-Link, Stillstand-Hilfe,
  Netz-Ausfall, Laden bei Absicht). Erweitert: `lifeskin-uebergabe` (+6),
  `lifeskin-netz` (+2), `lifeskin-foto-lifecycle` (+4), `lifeskin-stellenfoto`
  (Spiegel-Test ersetzt: Aufnahme = Vorschau).
- `npm run build`: erfolgreich; keine getrackten Bundle-Dateien geaendert.
- `npm run arch:check`: keine Verstoesse. ESLint auf den geaenderten Dateien: sauber.
- Lokaler Server: `http://127.0.0.1:5173/lifeskin` lieferte 200 mit neuem Aufbau
  (Cloud-Container; `192.168.1.168` ist von hier nicht erreichbar).

**Nicht geprueft:** keine echten Telefone, keine echte Kamera, kein
Instagram/Facebook-Fenster. Playwright/Smoke wurde gemaess `AGENTS.md` nicht
gestartet. Die mobilen Faelle sind simulierte Browser-/Kamera-/Netz-Ereignisse.

### Nachkontrolle auf echten Geraeten (vor dem Hochfahren der Anzeigen)

| Geraet / Fenster | Pruefen |
|---|---|
| Android + Instagram-App | Me skanim → Fehlerkasten ohne "Provo sërish", Handykamera oeffnet? Foto → Foto-Weg → Name → Nummer → Warteseite. "Hape në Chrome" oeffnet Chrome direkt auf der Anleitung? |
| Android + Facebook-App | dasselbe; Me foto ebenso |
| iPhone + Instagram/Facebook-App | Live-Kamera geht, Ring laeuft; Me foto vorne: Vorschau = Aufnahme (nicht seitenverkehrt); Freigabe ablehnen → Handykamera-Ausweg |
| iPhone Safari, Android Chrome | Scan komplett; Ring an 2 Strichen haengen lassen → nach 25 s Hilfe mit "Vazhdo kështu" |
| Langsames Netz (Mobilfunk schwach) | Übergabe zeigt "x nga y", kein Fehler solange Fotos laufen; Flugmodus → Hinweis; Netz zurueck → geht von selbst weiter |
| Landing im App-Browser | Netzwerk-Tab: kein `face_landmarker.task`/`vision_wasm` vor dem Tipp auf "Fillo" |

## 6. Rueckweg

Ein Commit, einzeln per `git revert` ruecknehmbar. Keine Routen-, Regel- oder
Datenmodell-Aenderungen, keine Deploys.

## 7. Naechste sinnvolle Schritte (nicht umgesetzt)

- Die Trichter-Stufen in Heart ueber zwei Wochen lesen: Anteil
  "Live-Kamera in der App gesperrt" und wie viele danach die Handykamera nutzen.
- Cache-Regel fuer `apps/lifeskin-landing/fotot/*` (heute `max-age=0`) — spart
  Wiederbesuchern (App-Fenster laden nach WhatsApp neu) die Rundreisen.
- Optional volle esbuild-Minifizierung der LifeSkin-Buendel (heute bewusst nur
  Kommentare/Leerraum).
