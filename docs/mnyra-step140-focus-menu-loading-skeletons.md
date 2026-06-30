Status: CURRENT
Last updated: 2026-07-01

# Schritt 140 - Focus/Menu Loading Skeletons

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
  bleibt ein bestaetigter Empty-Zustand.
- `apps/menyra-social/index.html` setzt den App-Build-Token auf
  `2026-07-01-focus-menu-skeletons-02`.
- Das Menyra-Social-Bundle wurde neu gebaut; dadurch wurden der
  Profil-Menu-Focus-Chunk, `bundled/entry/social-app.js` und
  `bundled/manifest.json` aktualisiert.

## Bewusst Nicht Geaendert

- Keine QR-Route, kein QR-Deep-Link-Vertrag und keine QR-Parameter.
- Keine Warenkorb-, Checkout-, Order- oder Table-Logik.
- Keine Firebase Rules, Functions, Firestore-Pfade oder Datenmigration.
- Keine Public-/App-Routing-Aenderung.
- Kein Posts-Skeleton und kein Public-Renderer-Splitting.
- Keine Produktlogik-Aenderung.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex; der Nutzer testet
  manuell.

## Technische Pruefung

- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`:
  bestanden.
- `node --check apps/menyra-social/core/profile/public-menu-surface-state-utils.js`:
  bestanden.
- `npm run build:menyra-social:bundle`: bestanden.
- Direkter Modul-Test fuer `public-menu-surface-state-utils.js`:
  `seeded + []` -> `menu.status === "loading"`,
  `knownEmpty + []` -> `menu.status === "empty"`,
  `menu ready + focus seeded empty` -> `menu.canRenderItems === true` und
  `focus.status === "loading"`, sowie kein `focusSettled`-ReferenceError:
  bestanden.
- `npm run check:social-bundle`: nicht bestanden, weil der bestehende
  `entry/social-app.js` weiter ueber dem gesetzten Budget liegt
  (`1.121.779` raw / `304.403` gzip Bytes gegen `1.052.000` raw /
  `285.000` gzip Bytes).

## Manuell Testen

1. App hart neu laden, bei Bedarf mit `?sw-reset=1`.
2. Mit `?debug-build=1` pruefen, dass
   `2026-07-01-focus-menu-skeletons-02` aktiv ist.
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

## Bewertung

Bestanden mit Rest-Risiko. Der Schritt beseitigt die sichtbare Kopplung
zwischen fertigem Menu und spaeter Focus-Wahrheit und macht den Ladezustand
platzstabiler. Rest-Risiko bleibt bei feinen Hoehenabweichungen zwischen
Skeleton und echten Inhalten, weil diese final nur per manueller Sichtpruefung
auf echten Profilen bewertet werden koennen.
