Status: CURRENT
Last updated: 2026-07-01

# Schritt 140 - Focus/Menu Loading Skeletons und kanonischer Empty-State

## Schritt

Auf Nutzerwunsch wurde der sichtbare Ladezustand im Business-Profil-Menu
platzstabiler gemacht.

Dieser Schritt ist eine gezielte, freigegebene UI-Loading-Aenderung fuer den
Profil-Menu-Pfad. Er entkoppelt das sichtbare Menu von noch ladenden
Focus-/Angebotsdaten und ersetzt die bisherigen Text-Ladeflaechen durch
Card-nahe Skeletons.

## Geaendert

- `resolveVisiblePublicMenuSurfaceState()` laesst ein fertiges Public-Menu
  nicht mehr kuenstlich auf Focus warten. `waitingForFocus` bleibt als
  kompatibles Rueckgabefeld erhalten, blockiert aber `canRenderItems` nicht
  mehr.
- Der Focus-Bereich bekommt bei ausstehender Focus-Wahrheit eine reservierte
  Skeleton-Flaeche oberhalb des Menus.
- Testfirst-/Restaurant-Menu-Loading rendert moderne Skeletons im Format der
  bestehenden Drink-Grid- und Food-Card-Struktur.
- Standard-Restaurant-Menu-Loading rendert Skeletons in denselben
  Section-/Card-Containern wie das echte Menu.
- Shop-/E-Commerce-Menu-Loading rendert ein zweispaltiges Product-Card-
  Skeleton mit derselben Bildproportion wie echte Shop-Produkte.
- Das Testfirst-Loading-Markup behaelt den bestehenden `menu-section`-Anker,
  damit die sichtbare Menu-Flaeche beim Wechsel von Skeleton zu echten Cards
  nicht leer oder sprunghaft wirkt.
- Im Hotfix nach Review-Gate wurde `focusSettled` wieder explizit definiert,
  damit `resolveVisiblePublicMenuSurfaceState()` keinen Runtime-Fehler wirft.
- Im Hotfix nach Review-Gate wird `seeded + []` fuer Menu und Focus als
  `loading` behandelt, nicht als authoritative `empty`. Nur `knownEmpty`
  fuer die kanonische Restaurant-ID bleibt ein bestaetigter Empty-Zustand.
- Der finale Contract-Patch fuehrt `menu.confirmedEmpty` ein. Dieses Feld wird
  nur dann `true`, wenn die kanonische Restaurant-ID bekannt ist, der geladene
  Menu-State genau zu dieser ID gehoert und dessen Truth `knownEmpty` ist.
- Ein leerer Read gegen `restaurants/{slug}/public/menu` bleibt `unknown` und
  `loading`, solange der Slug nicht zur kanonischen Restaurant-ID aufgeloest
  wurde. Er wird nicht als Empty gecacht und blockiert den spaeteren
  kanonischen Read nicht.
- Synthetische Route-Snapshots duerfen ihren `restaurantId` nicht mehr allein
  als kanonische ID deklarieren. Nur ein expliziter Canonical-Handoff darf
  terminale Public-Menu-Wahrheit erzeugen.
- Der Profil-Renderer leitet `Keine Produkte` ausschliesslich aus
  `confirmedEmpty === true` ab. `items.length === 0` und eine nach
  Sichtbarkeitsfilter leere Liste reichen nicht mehr aus; diese Faelle bleiben
  Skeleton/Pending.
- Bereits geladene Focus-Eintraege mit ungueltigem Menu-Ziel gelten weiter als
  settled/unverfuegbar; ein wirklich leerer `seeded`-Preview bleibt dagegen
  pending.
- Mit `?debug-menu-state=1` kann einmalig pro sichtbarem Menu-Ziel der erste
  Render-State als `[mnyra][public-menu.first-render]` ausgegeben werden. Ohne
  diesen Parameter bleibt das Logging vollstaendig stumm.
- `apps/menyra-social/index.html` setzt den App-Build-Token auf
  `2026-07-01-focus-menu-skeletons-04`.
- Das Menyra-Social-Bundle wurde neu gebaut; dadurch wurden der
  Profil-Menu-Focus-Chunk, `bundled/entry/social-app.js` und
  `bundled/manifest.json` aktualisiert.

## Bewusst Nicht Geaendert

- Keine QR-Route, kein QR-Deep-Link-Vertrag und keine QR-Parameter.
- Keine Warenkorb-, Checkout-, Order- oder Table-Logik.
- Keine Firebase Rules, Functions, Firestore-Pfade oder Datenmigration.
- Keine URL-, History-, QR- oder Public-/App-Routing-Aenderung. Geaendert wurde
  nur, wann eine bereits vorhandene Route-ID als kanonische Menu-Wahrheit gilt.
- Kein Posts-Skeleton und kein Public-Renderer-Splitting.
- Keine Produktlogik-Aenderung.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex; der Nutzer testet
  manuell.

## Technische Pruefung

### Casarita-Vergleich

- Der Live-Read zeigte fuer Casarita den kanonischen Public-Menu-Pfad
  `restaurants/Lzm6RpNu3ErSDtGCHxpi/public/menu` mit 39 Items.
- Casarita wird bereits beim Initial-Route-Resolve synchron von `casarita` auf
  diese kanonische ID abgebildet. Deshalb kann der erste Menu-Read direkt
  Produkte liefern.
- Vergleichsweise haben weitere Live-Public-Menu-Dokumente ebenfalls Produkte,
  zum Beispiel `70-s-pastry-and-bakery` mit 2 Items, `aktashbar` mit 2 Items
  und `artres-restaurant` mit 2 Items. Diese Dokumente besitzen teils nur
  `items` und `publishedAt`, waehrend Casarita zusaetzlich
  `menuTruthState`/`menuTruthSource` besitzt.
- Keines der verglichenen Public-Menu-Dokumente benoetigt ein separates
  Top-Level-`categories`-Array; Kategorien liegen an den Items. Die
  unterschiedliche Metadatenform ist deshalb nicht der Empty-Ausloeser.
- Der fehlerhafte Unterschied lag vor dem Public-Menu-Dokument: Nicht statisch
  aufgeloeste Slugs konnten zuerst als Restaurant-ID gelesen werden. Ein dort
  fehlendes Dokument wurde zu frueh `knownEmpty`, bevor `publicRoutes/{slug}`
  die kanonische ID lieferte.

- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`:
  bestanden.
- `node --check apps/menyra-social/core/profile/public-menu-surface-state-utils.js`:
  bestanden.
- `node --check` fuer Open-Flow, Session-Loader, Public-Profile-Runtime,
  Bootstrap-Runtime und Menu-Cluster: bestanden.
- `npm run build:menyra-social:bundle`: bestanden.
- Die kombinierte fokussierte Suite aus Menu-Surface, Session-Loader,
  Menu-Cluster, Profile-Open-Flow, Public-Profile-Runtime, Initial-Route und
  Direct-Entry und Render-Boundary besteht mit `44/44` Tests.
- Abgedeckt sind Casarita-artiger sofort kanonischer Ready-State, unaufgeloester
  Slug, fehlendes Slug-Menu, spaeter kanonischer Empty-/Items-Read und eine
  nach Filterung leere Liste mit vorhandenen Raw-Items.
- `npm run check:social-bundle`: nicht bestanden, weil der bestehende
  `entry/social-app.js` weiter ueber dem gesetzten Budget liegt
  (`1.123.498` raw / `304.784` gzip Bytes gegen `1.052.000` raw /
  `285.000` gzip Bytes).

## Manuell Testen

1. App hart neu laden, bei Bedarf mit `?sw-reset=1`.
2. Mit `?debug-build=1` pruefen, dass
   `2026-07-01-focus-menu-skeletons-04` aktiv ist.
3. Ein Restaurant-/Cafe-Business-Profil direkt auf `/:slug/menu` oeffnen oder
   dorthin refreshen.
4. Pruefen, dass oberhalb des Menus ein Focus-Platz reserviert bleibt, solange
   Focus/Angebote noch laden.
5. Pruefen, dass darunter Card-nahe Menu-Skeletons erscheinen und keine leere
   Text-Ladeflaeche wie `Menu wird geladen...` den Hauptbereich dominiert.
6. Wenn Menu-Produkte vor Focus bereit sind, muessen die Menu-Cards sichtbar
   werden, ohne auf Focus zu warten.
7. Sobald Focus-Daten eintreffen, darf der Focus-Bereich die darunterliegenden
   Menu-Cards nicht sichtbar nach unten springen lassen.
8. Ein Profil ohne Focus/Angebote pruefen: Das Menu darf nicht dauerhaft
   blockiert bleiben.
9. Ein Shop-/E-Commerce-Profil mit Shop-Tab pruefen: Product-Skeletons sollen
   in derselben zweispaltigen Card-Struktur erscheinen und danach durch echte
   Produkte ersetzt werden.
10. QR-URL kurz gegenpruefen: Profil oeffnet weiter mit offenem Menu und
    unveraenderter Warenkorb-/Order-Logik.
11. Casarita und mindestens ein anderes Restaurant mit Public-Route direkt auf
    `/:slug/menu` hart refreshen. Casarita darf sofort Produkte zeigen; beim
    anderen Restaurant muss bis zum kanonischen Menu-Read Skeleton statt
    `Keine Produkte` sichtbar sein.
12. Optional `?debug-menu-state=1` anhaengen und beim ersten Menu-Render
    `businessId`, `slug`, Item-/Kategorie-Anzahl, Status, Truth, Loading,
    `confirmedEmpty`, `canRenderItems`, NoProducts-Entscheidung und Quelle in
    der Browser-Konsole vergleichen.

## Bewertung

Bestanden mit Rest-Risiko. Der Schritt beseitigt zusaetzlich den falschen
terminalen Empty-State aus unaufgeloesten Slug-Reads. Rest-Risiko bleibt bei
der manuellen Laufzeitpruefung mehrerer echter Public-Routen und bei feinen
Hoehenabweichungen zwischen Skeleton und echten Inhalten.
