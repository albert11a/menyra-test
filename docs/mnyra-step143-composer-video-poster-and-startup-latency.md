# Mnyra Step 143 - Composer-Standbild und Composer-Startzeit

Status: CURRENT
Datum: 2026-08-06
Branch: `stabilityegger1`

## Ziel

Gemeldet vom Nutzer (iPhone, Safari, Business-Account):

- die Miniatur neben "Ndrysho videon" bleibt bei Video leer - in `Postim`,
  `Story` und `Profil` gleichermassen
- die Profil-Vorschau bleibt weiss, nur das Play-Symbol steht darin
- nach dem Waehlen eines Videos "ist alles langsam"
- `+ Posto` oeffnet das Modal mit Verzoegerung

## Runtime-Befund

### 1. Standbild wurde auf iOS praktisch nie eingefangen

`captureVideoPosterFileCore()` baute ein `<video>`, haengte es **nicht** ins
Dokument, spielte es **nicht** ab und wartete auf `loadeddata`. Genau das
liefert Safari auf iOS in der Regel nicht: ohne Element im Dokument und ohne
laufende Wiedergabe wird nicht dekodiert. Folge:

- der Timeout von 5s lief ab -> `null` -> Miniatur blieb leer
- ohne Standbild rendert die Profil-Vorschau (wie der echte Profil-Renderer)
  ein statisches `<video>` mit `#t=0.001`. Das Zeit-Fragment greift bei einer
  `blob:`-URL nicht - die Kachel blieb weiss.

Beide Symptome aus den Screenshots hatten damit dieselbe Ursache.

### 2. Die Vorschau wartete auf das Standbild

`handleFileSelection()` hat das Einfangen **abgewartet**, bevor
`buildPreview()` lief. Zusammen mit (1) hiess das: nach dem Waehlen eines
Videos passierte 5 Sekunden lang nichts. Das war das "alles langsam".

### 3. Das Standbild wurde in voller Videogroesse gezeichnet

Canvas in 4K zeichnen und als JPEG packen kostet auf einem schwachen Telefon
Sekunden - obwohl `uploadCompressedImage` das Bild vor dem Upload ohnehin auf
1080 herunterrechnet. Die Arbeit war also doppelt und umsonst.

### 4. Der Composer-Chunk lud erst beim Tap

`business-composer-controller` ist ein eigener Chunk (~13 kB gzip). Er wurde
erst beim Klick auf `+ Posto` geladen - auf schwacher Verbindung eine volle
Netzrunde mitten in der Geste.

## Geaendert

`core/media/video-poster-utils.js`

- Das Einfang-Video haengt 1x1 Pixel und unsichtbar **im Dokument** und wird
  **abgespielt** (stumm + inline, dafuer braucht es keine Nutzergeste). Nur so
  dekodiert iOS zuverlaessig.
- Gewartet wird auf `requestVideoFrameCallback` (ein wirklich gezeichnetes
  Bild); wo es das nicht gibt, auf `loadeddata` plus einen Frame.
- Timeout von 5s auf 3.5s - und bei Zeitablauf wird ein bereits vorliegendes
  Bild trotzdem genommen, statt es wegzuwerfen.
- Gezeichnet wird auf die lange Kante 1080 (genau das, was der Upload ohnehin
  erzeugt) statt in voller Videogroesse. Sichtbar aendert das nichts.
- Neu: `captureVideoPosterFromElementCore()` zeichnet das Standbild aus einem
  Video, das ohnehin schon laeuft - ohne zweites Dekodieren.

`core/composer/business-composer-controller.js`

- Die Vorschau steht **sofort**; das Standbild laeuft daneben und wird
  nachgetragen. Bei Feed- und Story-Vorschau nur ueber das `poster`-Attribut,
  damit das laufende Video nicht neu startet; die Profil-Kachel wechselt mit
  Standbild von `<video>` auf `<img>` und baut deshalb einmal neu.
- Zweiter Weg zum Standbild: liefert das eigene Einfangen nichts, wird das
  Bild aus der laufenden Vorschau gezeichnet (gut eine Sekunde lang in
  Schritten von 140ms nachgesehen, danach bleibt es beim Symbol).

`core/dashboard/dashboard-view-controller.js`

- Der Composer-Chunk und die Upload-Runtime werden vorgeladen, sobald das
  Dashboard steht und der Browser Leerlauf hat (`requestIdleCallback`,
  Timeout 2.5s, Fallback `setTimeout` 1.2s). Der erste Tap auf `+ Posto`
  braucht danach keine Netzrunde mehr.
- Bei ausdruecklich sparsamer Verbindung (`saveData`, `effectiveType` 2g)
  bleibt es beim Nachladen auf Klick.

## Nicht geaendert (bewusst)

- Die Regel, welche Vorschau ein Standbild als `<img>` zeigt und welche das
  Video abspielt, ist unveraendert - sie folgt weiter 1:1 den echten
  Renderern (`composer-preview-fidelity`-Test).
- Poster-Aufloesung und -Qualitaet ergeben nach der Upload-Kompression
  dasselbe Bild wie vorher.

## Messung Kaltstart (Beleg, keine Aenderung daran)

Gemessen lokal gegen `dist/` (Chromium, iPhone-Viewport, 1.6 Mbit/s,
300ms RTT, CPU 4x gedrosselt, **ohne** gzip - Vercel liefert gzip/brotli,
real also grob ein Drittel):

- First Paint 1.26s, First Contentful Paint 11.07s
- 25 JS-Chunks, alle ab 1.19s parallel angefordert, ~1.4 MB roh
  (~420 kB gzip)
- der Inhalt erscheint erst, wenn der komplette eagere Modulgraph geladen und
  ausgefuehrt ist

Das ist der verbleibende grosse Hebel und **nicht** Teil dieses Schritts: er
verlangt, eager importierte Domains (analytics, dashboard, crm,
business-accounts, leads) aus dem Startgraph zu loesen. Fuer einen
Business-Account waere genau das aber kontraproduktiv - `dashboard` und
`analytics` liegen bei ihm auf dem kritischen Pfad. Ein solcher Umbau gehoert
in einen eigenen Schritt mit eigener Absicherung.

## Tests

- `tests/video-poster-capture.test.mjs` (neu): Einhaengen ins Dokument,
  Abspielen, `requestVideoFrameCallback`-Pfad, Fallback ohne rVFC,
  Herunterrechnen 4K -> 1080, Zeitablauf mit vorhandenem Bild, Aufraeumen,
  Einfangen aus einem laufenden Element.
- `tests/dashboard-view.test.mjs`: Vorabruf haengt am Leerlauf, passiert genau
  einmal, und unterbleibt bei Datensparmodus/2g.
- `tests/composer-preview-fidelity.test.mjs`: neuer Vertrag - die Vorschau
  wartet nicht auf das Standbild, das Nachtragen laeuft ueber `poster`.
- `npm run test:unit` (551 gruen), `npm run lint`, `npm run arch:check`,
  `npm run build`.

## Nicht geprueft

- Kein Test auf einem echten iPhone durch mich (kein Geraet, kein
  Business-Login in dieser Umgebung). Der iOS-Pfad ist aus dem bekannten
  Safari-Verhalten abgeleitet und im Unit-Test nachgestellt.
- Die Zeit zwischen Business-Login und Panel haengt am Lesen von
  `users/{uid}`; ohne Zugangsdaten war sie hier nicht messbar.
