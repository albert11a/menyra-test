Status: CURRENT
Last updated: 2026-05-25

# Schritt 38: Profile Runtime Boundary

## Ziel

Die Public/Profile-Route-Runtime soll eine klare technische Grenze bekommen,
ohne sichtbare UI, Routing, Firebase, QR, Warenkorb, Public Menu oder App-Flows
zu veraendern.

Dieser Schritt ist bewusst kein grosser Bundle-Cut. Er bereitet den spaeteren
richtigen Schnitt vor: ein eigener leichter Public/Profile-Renderer kann
kuenftig ueber die Route-Runtime-Registry eingehangen werden, statt den grossen
`social-app.js`-Entry weiter mit Einzeldatei-Splits zu behandeln.

## Befund

- `profile-open-flow-utils.js` allein war als Lazy-Chunk source-level sicher,
  sparte im realen Build aber nur `6,965` Bytes gzip und wurde deshalb
  verworfen.
- Die groesseren Profile-Kandidaten sind nicht isoliert genug:
  `profile-menu-focus-render-controller.js` ist synchroner Renderer fuer
  Public Profile/Menu/Profile, und `public-profile-runtime-controller.js`
  besitzt direkte Public-Route-/Profile-Datenverantwortung.
- Die bestehende `route-runtime-registry.js` hatte bereits Runtime-Slots fuer
  Feed/Search/Map, aber Public Business und Public Menu nutzten noch harte
  Renderer-Eintraege statt austauschbarer Runtime-Eintraege.

## Geaendert

- `publicBusiness` und `publicMenu` sind in der Social-Route-Runtime-Registry
  jetzt echte Runtime-Slots.
- Beide Slots verwenden weiterhin den bestehenden `renderPublicProfileView` als
  Fallback.
- Bestehendes sichtbares Verhalten bleibt dadurch gleich.
- Ein neuer Unit-Test prueft:
  - `profile` mit Public-Profile-View wird `publicBusiness`.
  - `profile` mit Menu-Surface wird `publicMenu`.
  - beide Runtime-Slots koennen den Fallback-Renderer unabhaengig ersetzen.
  - ohne Runtime-Override bleibt der bestehende Renderer aktiv.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/route-runtime-registry.js`
- `tests/route-runtime-registry.test.mjs`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step38-profile-runtime-boundary.md`
- `apps/menyra-social/bundled/entry/social-app.js`

## Bewusst Nicht Geaendert

- Keine sichtbare UI-/Design-Aenderung.
- Keine Routen-Aenderung.
- Keine Firebase-, Functions-, Rules- oder Datenpfad-Aenderung.
- Keine QR-Aenderung.
- Keine Public Menu-, Produktmodal-, Warenkorb- oder Order-Logik.
- Keine Heart-/CRM-Aenderung.
- Keine `/staff`-, businessAccounts-, Waiter- oder Kitchen-Aenderung.
- Keine Feed-First-Paint-Renderer-Aenderung.
- Kein Dev-Server.
- Kein Playwright.

## Warum das Mnyra stabiler macht

Die Runtime-Grenze trennt jetzt fachlich zwischen:

- Public Business Profile (`publicBusiness`)
- Public Menu/QR/Menu-Surface (`publicMenu`)
- Feed/Search/Map und sonstiger App-Shell

Damit muss ein spaeterer leichter Public/Profile-Renderer nicht mehr an der
zentralen Render-Fallthrough-Logik vorbei eingebaut werden. Der spaetere
Schnitt kann einen eigenen Runtime-Eintrag liefern und den bestehenden Renderer
weiter als Fallback behalten.

## Warum das noch nicht die kleine Datei ist

Dieser Schritt reduziert die Entry-Groesse nicht wesentlich. Er ist die
notwendige Vertragsarbeit, damit der naechste groessere Schnitt nicht wieder ein
zu kleiner Einzeldatei-Cut wird.

Der richtige spaetere Bundle-Schritt ist:

1. Public/Profile Runtime ueber `publicBusiness`/`publicMenu` anbinden.
2. Bestehende Surface-States als Lade-/Fallback-Vertrag verwenden.
3. Erst danach `profile-menu-focus-render-controller.js` oder einen daraus
   extrahierten Public/Profile-Renderer aus dem Main-Entry nehmen.

## Validierung

- `node --check apps/menyra-social/core/app-shell/route-runtime-registry.js`
- `node --test tests/route-runtime-registry.test.mjs`
- `npm run build`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `node --check apps/menyra-social/bundled/entry/social-public-entry.js`
- `git diff --check`

## Manuell testen

- `/feed` oeffnet wie vorher.
- Ein Business/Profile aus Feed oeffnen.
- Ein Business/Profile aus Search oeffnen.
- Ein Business/Profile aus Map oeffnen.
- `/:slug` oeffnet Public Profile wie vorher.
- `/:slug/menu` oeffnet Public Menu wie vorher.
- Echten QR-Link mit Tischkontext pruefen.
- Produktdetail oeffnet/schliesst wie vorher.
- Warenkorb und Order Send funktionieren wie vorher.
- `/leads`, `/customers`, `/admin/staff` oeffnen Heart wie vorher.
- `/staff`, businessAccounts, Waiter/Kitchen unveraendert.

## Bewertung

Bestanden mit kleinem Rest-Risiko.

Rest-Risiko: Dieser Schritt ist eine Runtime-Vertragsvorbereitung, noch kein
finaler Public/Profile-Bundle-Schnitt. Der eigentliche Groessengewinn kommt erst
mit einem Folgeschritt, der einen leichten Public/Profile-Renderer ueber diese
Runtime-Slots einhaengt.

## Branch-Hinweis

Auf ausdruecklichen Nutzerwunsch im laufenden Refactor-/Bundle-Kontext wurde
dieser Schritt auf `refactorapp` umgesetzt.
