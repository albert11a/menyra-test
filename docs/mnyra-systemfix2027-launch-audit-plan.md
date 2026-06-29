Status: WORKING
Last updated: 2026-06-29

# Mnyra Systemfix2027 Launch Audit Plan

Dieses Dokument ist ein Arbeitsanhang fuer Branch `systemfix2027`.
Die aktuelle Projekt-Wahrheit bleibt die Dreiergruppe aus `AGENTS.md`,
`docs/mnyra-launch-masterplan.md` und `docs/mnyra-current-phase.md`.

## Sicherheitsgrenze

- Keine Production-Firebase-Schreibtests durch Codex.
- Keine Checkout-, Upload-, Post-, CRM-, Staff- oder Admin-Mutationen gegen
  Production.
- Mutationsflows brauchen Emulator, separate Staging-Ressourcen oder
  ausdruecklich freigegebene isolierte Testdaten.
- Read-only Browserpruefungen sind erlaubt, wenn sie dokumentiert bleiben.

## Audit-Reihenfolge

1. Baseline: Branch, aktuelle Wahrheit, Build, lokale Node-Tests,
   Bundle-Budget, vorhandene Runner und Firebase-Grenzen.
2. Public Guest: `/feed`, Public Business Profile, `/:slug/menu`, QR-Kontext,
   Produktdetail, lokaler Warenkorb ohne Order-Submit.
3. Public Routing: Slug, Alias, reserved routes, Path/Query-Konflikte,
   Back/Forward, Refresh/Cold-Start.
4. Auth und Rollen: User, Business, Staff/Waiter, CEO nur mit Staging oder
   freigegebenen Testkonten.
5. Business Workflows: Posten, Upload, Profil, Menu/Shop/Travel-Editor,
   Ads/Fokus nur mit Testdaten.
6. Orders: QR-Warenkorb, Order Callable, Waiter/Kitchen/Owner-Status nur mit
   Emulator/Staging.
7. Heart/CRM: Leads, Customers, Staff, Ads-Freigabe nur mit Testdaten.
8. Performance/Gates: Bundle-Budget, Public-Entry-Grenze, Runtime-Errors,
   Console-Errors, Bild-/Preload-Warnungen.
9. Launch-Rehearsal: dokumentierter manueller Durchlauf, Rollback-Stand,
   offene Risiken.

## Stand nach erstem Durchlauf

- Branch `systemfix2027` wurde von `origin/main` erstellt.
- Lokale Node-Tests: 93/93 bestanden.
- Build: bestanden.
- Public Guest Browser nach Schritt 140: `/feed` und `/casarita/menu` ohne
  Console-Errors.
- Offener Blocker: `npm run check:social-bundle` failt weiter wegen
  `social-app.js` ueber Budget.

## Naechste sichere Schritte

- Bundle-Budget-Blocker analysieren, ohne Budgetwerte einfach hochzusetzen.
- Danach weitere Public-Guest-Routen read-only pruefen.
- Erst nach sicherer Staging-/Emulator-Grenze Mutationsflows wie Upload,
  Posten, Order-Submit, Staff-Status und CRM-Schreiben testen.
