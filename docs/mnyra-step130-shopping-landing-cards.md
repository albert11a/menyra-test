Status: CURRENT
Last updated: 2026-06-27

# Mnyra Schritt 130: Shopping Landing Cards

## Schritt

Auf Nutzerwunsch wurde Branch `shopping` auf Main-Stand verwendet und der
Shopping-Tab fuer Ecommerce-Shops mit Landing Cards erweitert.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  rendert fuer den Tab `Shopping` eigene zweispaltige Landing Cards mit
  Titelbildbereich, Profilbild-Fallback, horizontalen Produktbildern und
  `Më shumë`-Shop-Oeffnung.
- `apps/menyra-social/core/marketplace/shopping-view-event-bindings.js`
  kapselt Suche und Like-Visuals fuer den Shopping-Tab als eigenen Lazy-Chunk.
- `apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`
  laedt diese Shopping-Bindings nur, wenn der Shopping-View sichtbar ist.
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
  zeigt im Ecommerce-Shop-Editor eine eigene `Landing Card`-Sektion zum
  Hochladen des Card-Bilds und Auswaehlen vorhandener Produkte.
- `apps/menyra-social/core/profile/shopping-landing-card-editor-bindings.js`
  kapselt Upload, Produkt-Auswahl und Speichern der Landing-Card-Daten als
  eigenen Lazy-Chunk.
- `apps/menyra-social/core/app-events/app-events-menu-focus-bind-utils.js`
  laedt den Landing-Card-Editor nur, wenn diese Editor-Sektion sichtbar ist.
- `apps/menyra-social/core/overlays/overlay-orchestration-controller.js`
  kann Produkt-Snapshots aus dem Shopping-Tab direkt in die bestehende
  Produktdetail-Overlay-Logik uebergeben.
- `apps/menyra-social/index.html` setzt den App-Build-Token auf
  `2026-06-27-shopping-landing-cards-01`.
- Das Menyra-Social-Bundle wurde neu gebaut; dadurch wurden die
  Marketplace-/Profil-Chunks mit neuen Hashes und ein neuer Shopping-Bindings-
  Chunk sowie ein eigener Shopping-Landing-Editor-Chunk erzeugt.

## Fallbacks

- Wenn kein Landing-Card-Bild gespeichert ist, nutzt die Shopping Card das
  Profil-/Shop-Bild.
- Wenn keine Produkte ausgewaehlt sind, speichert der Editor die vorhandenen
  sichtbaren Shop-Produkte als Card-Produkte.
- Wenn keine Produkte vorhanden sind, wird der Produktstreifen in der Card
  weggelassen.

## Bewusst Nicht Geaendert

- Keine Aenderung an Firebase Rules, Functions oder Infrastruktur.
- Keine Verschiebung von Public-/App-Grenzen und kein neues Routing-System.
- Keine neue Shopping-Card- oder Editor-Logik in `social-app.js`.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex; der Nutzer testet
  manuell.

## Technische Pruefung

- `node --check` fuer die geaenderten JavaScript-Quellmodule: bestanden.
- `npm run build:menyra-social:bundle`: bestanden.
- `npm run check:social-bundle`: nicht bestanden, weil der bestehende
  `entry/social-app.js` schon auf `main` ueber dem aktuell gesetzten Budget
  liegt. Vergleich: `main` 1.118.236 raw / 303.181 gzip Bytes, dieser Schritt
  1.119.234 raw / 303.449 gzip Bytes. Die neue Editor-Logik liegt in einem
  Lazy-Chunk und wird nicht direkt in `social-app.js` geladen.

## Manuell Testen

1. App hart neu laden, bei Bedarf mit `?sw-reset=1`, und mit `?debug-build=1`
   pruefen, dass `2026-06-27-shopping-landing-cards-01` sichtbar ist.
2. Als Ecommerce-Shop einloggen und Profil -> Shop/Menu-Editor oeffnen.
3. In `Landing Card` ein Bild ueber den Plus-Button auswaehlen, vorhandene
   Produkte markieren und speichern.
4. Den Tab `Shopping` oeffnen. Die Shop-Card soll im zweispaltigen Landing-
   Card-Layout erscheinen; oben das hochgeladene Bild, darunter die
   ausgewaehlten Produktbilder.
5. Ohne Landing-Bild speichern und erneut pruefen: Die Card soll das Profilbild
   als oberen Bild-Fallback verwenden.
6. Keine Produkte markieren und speichern: Vorhandene Shop-Produkte sollen als
   Card-Produkte verwendet werden. Bei Shops ohne Produkte soll der
   Produktstreifen fehlen.
7. Ein Produktbild in der Shopping Card klicken. Erwartung: Das bestehende
   Produktdetail-Overlay oeffnet direkt mit diesem Produkt.
8. `Më shumë` klicken. Erwartung: Der passende Shop oeffnet sich.
9. Suche im Shopping-Tab oeffnen, nach einem Shop-Namen filtern und wieder
   schliessen.
10. Restaurants-Tab, Travel-Tab, QR, Cart und Orders kurz unveraendert
    gegenpruefen.

## Bewertung

Bestanden mit Rest-Risiko. Die sichtbare Aenderung ist vom Nutzer freigegeben
und auf Shopping/Ecommerce-Editor begrenzt. Rest-Risiko bleibt bei realen
Firestore-Datenformen fuer vorhandene Shop-Produkte, deshalb ist die manuelle
Pruefung mit einem echten Ecommerce-Shop wichtig.
