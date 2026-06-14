Status: CURRENT
Last updated: 2026-06-15

# Schritt 64 - Local Heart Pretty Routes

## Ziel

Lokal sollen die Heart-Owned-URLs wieder wie gewohnt direkt funktionieren:

- `/leads`
- `/customers`
- `/admin/staff`

Dabei sollen Production/Vercel-Rewrites, der direkte Social-Drawer-Handoff aus
Schritt 62 und bare `/staff` unveraendert bleiben.

## Geaendert

- `vite.config.mjs`
  - Eine lokale Vite-Dev-/Preview-Middleware rewritet Heart-Pretty-Routes
    intern auf `/apps/mnyra-heart/index.html`.
  - Die Browser-URL bleibt dabei `/leads`, `/customers` oder `/admin/staff`.
  - Heart kann dadurch wie in Production die aktuelle `location.pathname`
    auswerten und `crmLeads`, `crmCustomers` oder `crmStaff` oeffnen.

## Lokaler Route-Vertrag

- `/leads` -> Heart `crmLeads`
- `/leads/` -> Heart `crmLeads`
- `/customers` -> Heart `crmCustomers`
- `/customers/` -> Heart `crmCustomers`
- `/admin/staff` -> Heart `crmStaff`
- `/admin/staff/` -> Heart `crmStaff`
- `/admin/staff/:path*` -> Heart `crmStaff`

## Bewusst Nicht Geaendert

- `/staff` bleibt lokal Social und wird nicht nach Heart umgebogen.
- Keine Aenderung an `vercel.json`.
- Keine Aenderung an `sw.js`.
- Kein Rueckbau des direkten Social-Drawer-Handoffs aus Schritt 62.
- Keine Aenderung an Heart-Functions, Firebase Rules, QR, Cart oder Order.
- Kein Browser-/Smoke-Test durch Codex gemaess Repo-Regel.

## Verifikation

- `node --check vite.config.mjs`
- Node-Routencheck:
  - `/leads -> true`
  - `/leads/ -> true`
  - `/customers -> true`
  - `/customers/ -> true`
  - `/admin/staff -> true`
  - `/admin/staff/ -> true`
  - `/admin/staff/edit -> true`
  - `/staff -> false`
  - `/feed -> false`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Fix ist auf lokale Vite-Dev-/Preview-Auslieferung begrenzt. Rest-Risiko
bleibt die manuelle Browser-Gegenpruefung auf der echten lokalen LAN-IP.

## Nachbefund

Schritt 65 hat ergaenzt, dass `npm run dev` in diesem Repo nicht den Vite-
Dev-Server direkt nutzt, sondern `scripts/local-dev-server.mjs`. Fuer diesen
aktiven Standard-Dev-Server wurde der Heart-Pretty-Route-Fix deshalb in
Schritt 65 zusaetzlich dort umgesetzt.

## Manuelle Testliste

- Dev-Server neu starten.
- `http://172.20.10.3:5173/leads` oeffnen und Heart Leads pruefen.
- `http://172.20.10.3:5173/customers` oeffnen und Heart Customers pruefen.
- `http://172.20.10.3:5173/admin/staff` oeffnen und Heart Staff pruefen.
- `http://172.20.10.3:5173/staff` oeffnen und pruefen, dass bare `/staff`
  weiter Social bleibt.
- Aus dem Social-Drawer `Leads`, `Staff`, `Kunden/Klients` pruefen.
