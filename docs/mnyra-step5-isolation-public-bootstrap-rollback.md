Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 5 Isolationsschritt: Public-Bootstrap-Rollback (temporaer)

## Schrittziel

Gezielte Ursachen-Isolation fuer den Request-/Listener-Sturm im Menu.

Es wurde bewusst kein neuer Produktfix gebaut. Stattdessen wurden nur die zwei Schritt-5-Unterdrueckungen fuer Public-Core-Web-Direct temporaer zurueckgenommen.

## Was temporaer zurueckgenommen wurde

1. In `index.html` wurde die Unterdrueckung des fruehen Bootstrap-Fetch fuer normale Public-Core-Web-Direct-Routen entfernt.
2. Im Auth-Startup wurde die Unterdrueckung des Startup-Public-Bootstrap-Fetch fuer `webDirectGuestProfileSurface` entfernt.

## Geaenderte Dateien

- `apps/menyra-social/index.html`
- `apps/menyra-social/core/auth/auth-session-startup-coordinator.js`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Kein Routing-Umbau.
- Keine Firebase-/Functions-/Rules-Aenderung.
- Kein `/login`-Eingriff.
- Kein Dauerfix im Focus-Ensure-/Focus-Load-Pfad.
- Keine Scope-Erweiterung.

## Manuelle Testliste

1. Hard Reload auf `/:slug/menu` (mehrfach) und Netzwerk beobachten: Request-Sturm ja/nein.
2. Hard Reload auf `/:slug` und `/:slug/posts` (mehrfach): Verhalten vergleichen, ob Lastspitzen deutlich ruhiger sind.
3. Bei vorhandenem Problemfall dieselbe Menue-Interaktion wie zuvor wiederholen und Request-Menge direkt vergleichen.
4. Echten QR-Link testen: Menu-Open und Grundverhalten muessen unveraendert bleiben.

## Bewertung

`noch unklar` bis zur manuellen Verifikation.
