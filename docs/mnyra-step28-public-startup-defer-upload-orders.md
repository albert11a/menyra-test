Status: CURRENT
Last updated: 2026-05-02

# Schritt 28: Public Startup Upload/Orders Defer

## Ziel

Der oeffentliche Website-Start fuer `/:slug`, `/:slug/menu` und Profilwechsel
ueber die Entdecker-Karte soll weniger App-Nebenlast direkt beim Start
ausfuehren. Upload-/Bildkompression und Orders sollen erst geladen werden,
wenn sie wirklich gebraucht werden.

Dieser Schritt wurde auf Nutzerwunsch bewusst auf Branch `fixmai` umgesetzt.

## Umsetzung

- `social-app.js` importiert den Media-Upload-Cluster nicht mehr statisch.
- `social-app.js` importiert den Orders-Controller nicht mehr statisch.
- `social-app.js` importiert die Bildkompression nicht mehr statisch.
- Fuer Uploads gibt es jetzt einen Deferred-Controller:
  Erst `uploadCompressedImage` oder `handleUploadPost` laedt den echten
  Media-Upload-Cluster dynamisch nach.
- Fuer Orders gibt es jetzt einen Deferred-Controller:
  Erst Orders-Tab, Orders-Listener oder Checkout laden den echten
  Orders-Controller dynamisch nach.
- Die Bildkompression wird erst beim tatsaechlichen Bild-Upload dynamisch
  nachgeladen.

## Bewusst Nicht Geaendert

- Keine Layout-, Farb-, Typografie-, Spacing- oder Design-Aenderungen.
- Keine Aenderung an Public-Routing, QR-URLs, Warenkorb, Tischkontext oder
  Order-Datenmodell.
- Kein echter separater Public-Web-Entry in diesem Schritt.
- Keine Menu-Bootstrap-Verkleinerung und kein Render-Chunking.
- Keine Firestore-Rules-, Functions- oder Datenmodell-Aenderung.
- Keine Playwright-, Smoke- oder Browser-Laeufe durch Codex.

## Validierung

- `node --check apps/menyra-social/social-app.js`.
- `node --test tests/public-menu-surface-state-utils.test.mjs`.
- `node --test tests/public-profile-runtime-controller.test.mjs`.
- `git diff --check`.

## Manuelle Testliste

- `/:slug` kalt als Gast oeffnen: Profilinhalt soll wie vorher sichtbar werden.
- `/:slug/menu` kalt als Gast oeffnen: Menu soll wie vorher laden.
- Ueber die Entdecker-Karte mehrere Business-Profile oeffnen, z.B.
  `moka-coffee`: Menu muss zum jeweils geoeffneten Profil passen.
- Echten QR-Link mit `src=qr` und `table` pruefen: Menu, Tisch und Warenkorb
  muessen unveraendert funktionieren.
- Eine Gastbestellung absenden: Checkout darf den Orders-Controller
  nachladen und Bestellung wie vorher schreiben.
- Nach Login einen Upload/Post mit Bild pruefen: Bildkompression und Upload
  muessen nach dem Nachladen funktionieren.
- Nach Login den Orders-Tab oeffnen: Orders-Liste muss nach dem Nachladen
  funktionieren.

## Bekannte Rest-Risiken

- Der grosse statische `social-app.js`-Baum bleibt weiterhin der groesste
  Performance-Blocker. Dieser Schritt entfernt nur drei schwere Nebenpfade aus
  dem unmittelbaren Gast-Start.
- Der erste Upload, erste Checkout oder erste Orders-Tab-Oeffnung hat nun einen
  kleinen Nachlade-Moment, weil die Module erst dann importiert werden.
- Ein echter leichter Public-Web-Entry bleibt weiterhin der naechste groessere
  Performance-Hebel, hat aber mehr Blast Radius.

## Bewertung

`bestanden mit Rest-Risiko`: Der Public-Gaststart muss Upload, Bildkompression
und Orders nicht mehr sofort initialisieren. Das reduziert Startup-Arbeit, ohne
sichtbare Oberflaeche, QR, Warenkorb oder Produktlogik absichtlich zu aendern.
Launch-ready ist Mnyra dadurch noch nicht, weil der Haupt-Entry weiterhin viele
App-Module statisch laedt.
