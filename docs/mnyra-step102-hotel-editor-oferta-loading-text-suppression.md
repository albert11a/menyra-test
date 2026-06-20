Status: CURRENT
Last updated: 2026-06-20

# Schritt 102 - Hotel Editor Oferta Immediate State Restore

## Ziel

Beim Einstieg in den Hotel-/Motel-Editor sollen vorhandene `Ofertat` wieder
sofort sichtbar sein. Die Sektion darf nicht erst auf `public/offers`
nachladen und dabei `Ofertat werden geladen...` zeigen.

## Geaendert

- Vor dem Rendern des Hotel-/Motel-Editors werden vorhandene `publicOffers`,
  `travelOffers` oder `offerItems` aus dem Hotel-/Restaurantdatensatz in den
  `focus`-State gesetzt.
- Dadurch kann die `Ofertat`-Sektion sofort aus der bekannten Restaurant-
  Wahrheit rendern.
- Die frische `public/offers`-Ladung laeuft danach weiter und aktualisiert die
  Liste, ohne die vorhandenen Eintraege durch Loading zu verdraengen.
- Der Hotel-/Motel-Editor ruft die `Ofertat`-Sektion jetzt mit
  `suppressLoading: true` auf.
- `renderFocusAdminSection()` unterstuetzt diesen gezielten Modus.
- Wenn im Hotel-Editor gerade Offer-Daten laden und noch keine Items im State
  sind, bleibt der Body der `Ofertat`-Sektion leer statt
  `Ofertat werden geladen...` anzuzeigen.
- Normale `Sot ne Fokus`-/Restaurant-Loading-Anzeigen bleiben unveraendert.
- Der gebuendelte Mnyra-Social-Output wurde nachgezogen.

## Bewusst Nicht Geaendert

- Keine Aenderung am Laden, Speichern, Bearbeiten, Aktivieren oder Loeschen von
  Ofertas.
- Keine Aenderung an Travel-Tab `Ofertat`.
- Keine Aenderung an QR, Cart, Order, Checkout oder Routing.
- Keine Aenderung an Firebase Rules, Functions oder Collections.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps\menyra-social\core\profile\profile-menu-focus-render-controller.js`
- `npm run build:menyra-social:bundle`
- `node --check apps\menyra-social\bundled\chunks\profile-menu-focus-render-controller-DPo-W14k.js`
- `node --check apps\menyra-social\bundled\entry\social-app.js`

## Manuelle Testliste

- Als Hotel-/Motel-Owner Profil -> Editor oeffnen.
- Direkt beim Einstieg darf `Ofertat werden geladen...` nicht sichtbar sein.
- Wenn Ofertas existieren, sollen sie sofort aus der bekannten Restaurant-
  Wahrheit erscheinen.
- Wenn keine Ofertas existieren, soll der Empty-State erst nach dem Laden normal
  erscheinen.
- `Hotel Details` oeffnen/schliessen und pruefen, dass `Ofertat` stabil bleibt.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die echte sichtbare Bedienung muss manuell im lokalen Dev-Setup
gegengeprueft werden.
