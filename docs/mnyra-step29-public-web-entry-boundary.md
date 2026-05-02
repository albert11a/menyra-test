Status: CURRENT
Last updated: 2026-05-02

# Schritt 29: Public Web Entry Boundary

## Ziel

Der oeffentliche Website-Start soll eine eigene Entry-Grenze bekommen, ohne die
sichtbare Oberflaeche, Public-Routen, QR, Warenkorb oder App-Flows umzubauen.

Dieser Schritt wurde auf Nutzerwunsch bewusst auf Branch `fixmai` umgesetzt.

## Umsetzung

- `index.html` erkennt Public-Website-Starts jetzt synchron im Head.
- Die fruehe Public-Startup-Erkennung haengt nicht mehr an einem
  `type="module"`-Import, der fuer spaetere klassische Inline-Scripts zu spaet
  kommen kann.
- Public-Website-Starts laden als Boot-Modul jetzt
  `social-public-entry.js`.
- Nicht-oeffentliche App-Starts laden weiter direkt `social-app.js`.
- Die aggressiven `modulepreload`-Hints fuer `social-app.js` und Firebase-
  Vendor-Module laufen nur noch fuer Nicht-Public-App-Starts.
- Public-Starts preladen nur den kleinen Public-Entry. Dieser laedt die
  bestehende App anschliessend nach, sodass die sichtbare Produktoberflaeche
  stabil bleibt.
- PWA-Nachladen nutzt den aktuellen App-Build-Token statt eines hart
  verdrahteten alten Token.

## Bewusst Nicht Geaendert

- Kein sichtbares Layout, keine Farben, keine Typografie, kein Spacing.
- Kein neuer Public-Renderer und keine veraenderte Profil-/Menu-Darstellung.
- Keine Aenderung an QR-URLs, Tischkontext, Warenkorb oder Checkout.
- Keine Aenderung an Firestore-Rules, Functions oder Datenmodell.
- `social-public-entry.js` importiert fuer diesen Schritt bewusst noch die
  bestehende `social-app.js`; der echte Public-Renderer bleibt ein separater
  Folgeschritt.
- Keine Playwright-, Smoke- oder Browser-Laeufe durch Codex.

## Validierung

- `node --check apps/menyra-social/social-public-entry.js`.
- `node --check apps/menyra-social/social-app.js`.
- Inline-Script-Syntaxcheck fuer `apps/menyra-social/index.html`.
- Startup-Route-Hint-Mockcheck fuer Public-/App-Beispielpfade.
- `node --test tests/public-business-route-resolver.test.mjs`.
- `node --test tests/initial-route-state-public-route-cache.test.mjs`.
- `node --test tests/public-menu-surface-state-utils.test.mjs`.
- `node --test tests/public-profile-runtime-controller.test.mjs`.
- `git diff --check`.

## Manuelle Testliste

- `/:slug` kalt als Gast oeffnen: Profil muss wie vorher erscheinen.
- `/:slug/menu` kalt als Gast oeffnen: Menu muss wie vorher laden.
- Entdecker-Karte -> anderes Business-Profil -> Menu pruefen: Daten muessen
  weiter zum geoeffneten Profil passen.
- Echten QR-Link mit `src=qr` und `table` pruefen: Menu, Tisch und Warenkorb
  muessen unveraendert funktionieren.
- Nicht-Public-App-Pfade pruefen: `/feed`, `/login`, `/profile`, `/orders`
  sollen weiter direkt die App laden.
- Nach Login kurz Chat/Upload/Orders pruefen, weil diese Flows weiterhin in
  der bestehenden App laufen.

## Bekannte Rest-Risiken

- Der Public-Entry ist jetzt technisch getrennt, aber noch kein eigener
  leichter Renderer. Er importiert nach wie vor `social-app.js`.
- Der grosse statische App-Baum bleibt deshalb weiterhin der groesste
  Performance-Blocker.
- Die Public-Route-Erkennung im HTML ist bewusst klein und konservativ. Die
  kanonische Routing-Wahrheit bleibt weiterhin im Router-Code der App.

## Bewertung

`bestanden mit Rest-Risiko`: Die Entry-Grenze ist gesetzt und die fruehen
Preload-Prioritaeten unterscheiden jetzt Public-Website-Starts von App-Starts.
Das ist ein notwendiger Zwischenschritt fuer einen echten leichten Public-
Renderer, macht Mnyra aber allein noch nicht launch-ready.
