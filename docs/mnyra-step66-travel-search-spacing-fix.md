Status: CURRENT
Last updated: 2026-06-15

# Schritt 66 - Travel Suche und Abstand Feinschliff

## Ziel

Travel soll direkt unter dem Smart-Header mit der blauen Flaeche starten, die
Eingabecard soll im blauen Bereich mehr Luft nach oben und unten haben, und die
Travel-Eingabe soll wie eine echte Hotel-/Reisezielsuche nutzbar sein.

## Geaendert

- Die allgemeine Smart-Header-Luecke wird fuer Travel rein per CSS auf 0
  gesetzt, sobald `#travelView` im Main-Scrollbereich liegt.
- Die blaue Travel-Flaeche hat mehr oberen und unteren Innenabstand.
- Die Benko/Bento-Flaeche ueberlappt weniger stark mit dem blauen Bereich und
  hat oben/unten mehr Innenabstand.
- Das Travel-Eingabefeld rendert beim Tippen fokus- und caret-stabil weiter,
  damit mehrere Zeichen normal eingegeben werden koennen.
- Travel zeigt ab zwei Zeichen albanische Stadtvorschlaege wie `Tirana`,
  `Durres`, `Vlora`, `Shkoder`, `Sarande` und weitere.
- Travel zeigt weiterhin passende Hotelvorschlaege aus den bereits vorhandenen
  Travel-Profilen, wenn der Nutzer direkt einen Hotelnamen tippt.
- Die Travel-Suche prueft vor dem 24er-Anzeigelimit alle vorhandenen
  Travel-Profile und matched jetzt neben Ort/Adresse auch Hotelname,
  Slug/Handle, Typ und weitere Textfelder tokenweise.
- Das gebaute Social-Bundle wurde aktualisiert; die neuen Travel-/Marketplace-
  Lazy-Chunk-Hashes sind im Manifest verdrahtet.

## Geaenderte Dateien

- `apps/menyra-social/index.html`
- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- gebaute Vite-Chunk-Hash-Aktualisierungen unter
  `apps/menyra-social/bundled/chunks/`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step66-travel-search-spacing-fix.md`

## Bewusst Nicht Geaendert

- Keine Routing-, QR-, Cart-, Order-, Firebase-Rules- oder Functions-Aenderung.
- Keine neue Hotel-Datenquelle und kein neuer Listener.
- Keine neue Map-Library.
- Keine Aenderung an Restaurants, Shopping, Feed oder Public-Profil-Logik.
- Keine Hotel-Owner-Tools fuer Zimmer, Fotos oder Ausstattung.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `node --check apps/menyra-social/core/marketplace/travel-view-event-bindings.js`
- `node --check apps/menyra-social/core/ui/main-shell-render-utils.js`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

Finaler Bundle-Guard:

- `apps/menyra-social/bundled/entry/social-app.js`: 1,049,973 Bytes raw /
  284,994 Bytes gzip.
- Budget: 1,052,000 Bytes raw / 285,000 Bytes gzip.

## Ergebnis

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko bleibt die manuelle Sichtpruefung auf echten Daten, besonders fuer
Hotelnamen, die nicht in den ersten sichtbaren Travel-Karten lagen.

## Manuelle Testliste

- `Travel` oeffnen und pruefen, dass die blaue Flaeche direkt unter dem Header
  startet.
- Pruefen, dass die Eingabecard im blauen Bereich oben und unten mehr Luft hat.
- Mehrere Buchstaben schnell in das Travel-Eingabefeld tippen und pruefen, dass
  der Text nicht auf einen Buchstaben zurueckspringt.
- Zwei oder mehr Zeichen einer albanischen Stadt eingeben und pruefen, dass
  Stadtvorschlaege erscheinen.
- Zwei oder mehr Zeichen eines Hotelnamens eingeben und pruefen, dass
  Hotelvorschlaege erscheinen.
- Einen Hotelvorschlag antippen und pruefen, dass `Hotels` passende Treffer
  zeigt.
- Einen exakten Hotelnamen eingeben und mit der Suchlupe bestaetigen; das Hotel
  soll gefunden werden, auch wenn es nicht in den ersten sichtbaren Karten lag.
- Ohne Reiseziel `Hotels` oder `Karte` antippen und pruefen, dass weiter der
  bestehende Pflicht-Hinweis erscheint.
- Kurz gegenpruefen, dass Restaurants und Shopping unveraendert oeffnen.
