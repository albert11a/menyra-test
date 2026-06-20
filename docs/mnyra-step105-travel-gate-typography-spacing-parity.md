Status: CURRENT
Last updated: 2026-06-21

# Schritt 105 - Travel Gate Typography Spacing Parity

## Ziel

Der Travel-Suchkopf soll bei Schrift, Groesse und Abstaenden naeher an Feed-
Gate und Restaurants-Gate liegen. Der Schritt ist nur ein CSS-Feinschliff am
oberen Travel-Gate.

## Geaendert

- `#travelSearchTop .loc-top` nutzt jetzt denselben vertikalen Grundabstand
  wie Restaurants-Gate und Feed-Gate: `8rem` oben und `10.75rem` unten.
- `#travelSearchTop .loc-top` bekommt den Teal-Hintergrund direkt auf dem
  Gate-Top-Layer wie die Vergleichs-Gates.
- `#travelSearchTop .loc-title` nutzt dieselbe responsive Headline-Groesse wie
  Restaurants-Gate und Feed-Gate.
- `#travelSearchTop .loc-title` nutzt dieselbe Headline-Zeilenanmutung und
  Buchstabenabstands-Korrektur wie die Vergleichs-Gates.

## Geaenderte Dateien

- `apps/menyra-social/index.html`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step105-travel-gate-typography-spacing-parity.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an Travel-Markup, Travel-Suche, Vorschlaegen, Tabs, Cards
  oder Map.
- Keine Aenderung am Travel-Benko-Radius-Fix aus Schritt 104.
- Keine Aenderung an Restaurants, Feed-Gate, Shopping oder Profilansichten.
- Keine Aenderung an Routing, QR, Cart, Order, Firebase Rules, Functions oder
  Collections.
- Kein Bundle-Build, weil nur `index.html`-CSS und Dokumentation geaendert
  wurden.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `git diff --check`

## Manuelle Testliste

- Travel oeffnen und Schriftgroesse, Headline-Abstand und Input-Abstand oben
  gegen Restaurants-Gate oder Feed-Gate vergleichen.
- Pruefen, dass der Raum zwischen Eingabefeld und Benko jetzt wie beim Gate-
  Muster wirkt.
- Pruefen, dass der Benko weiter runde obere Ecken zeigt.
- Reiseziel eingeben und kurz pruefen, dass Suche/Vorschlaege unveraendert
  funktionieren.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die exakte visuelle Paritaet muss manuell auf dem Zielgeraet
gegengesehen werden.
