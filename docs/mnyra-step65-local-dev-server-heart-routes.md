Status: CURRENT
Last updated: 2026-06-15

# Schritt 65 - Local Dev Server Heart Routes

## Ziel

Die Heart-Pretty-Routes muessen im tatsaechlich verwendeten lokalen Server
funktionieren. `npm run dev` nutzt `scripts/local-dev-server.mjs`, nicht den
Vite-Dev-Server aus `vite.config.mjs`.

## Befund

- Schritt 64 hat die Heart-Pretty-Routes fuer Vite Dev/Preview ergaenzt.
- Der Mnyra-Dev-Start laeuft aber ueber `scripts/local-dev-server.mjs`.
- Dort standen `/leads` und `/customers` explizit in `SOCIAL_ROUTES`.
- `/admin/staff` fiel durch die Regex `^/(ceo|admin|owner|staff|kitchen)/`
  ebenfalls auf Social.
- Deshalb wurde lokal weiterhin Social ausgeliefert und Social konnte auf Feed
  normalisieren.

## Geaendert

- `scripts/local-dev-server.mjs`
  - `/leads` und `/customers` wurden aus `SOCIAL_ROUTES` entfernt.
  - `isHeartPrettyRoutePath()` wurde ergaenzt.
  - Heart-Pretty-Routes werden vor dem Social-Fallback auf
    `/apps/mnyra-heart/index.html` geroutet.

## Lokaler Route-Vertrag

- `/leads` -> Heart
- `/leads/` -> Heart
- `/customers` -> Heart
- `/customers/` -> Heart
- `/admin/staff` -> Heart
- `/admin/staff/` -> Heart
- `/admin/staff/:path*` -> Heart
- `/admin` -> Social
- `/admin/:path*` ausser `/admin/staff/:path*` -> Social
- `/staff` -> Social
- `/staff/:path*` -> Social
- `/feed` -> Social

## Bewusst Nicht Geaendert

- Kein Rueckbau von Schritt 62, 63 oder 64.
- Keine Aenderung an `vercel.json`.
- Keine Aenderung an `sw.js`.
- Keine Aenderung an Heart-Functions.
- Keine Aenderung an QR, Cart, Order, Firebase Rules oder Functions.
- Kein Browser-/Smoke-Test durch Codex gemaess Repo-Regel.

## Verifikation

- `node --check scripts/local-dev-server.mjs`
- Node-Routen-Simulation:
  - `/leads -> /apps/mnyra-heart/index.html`
  - `/leads/ -> /apps/mnyra-heart/index.html`
  - `/customers -> /apps/mnyra-heart/index.html`
  - `/customers/ -> /apps/mnyra-heart/index.html`
  - `/admin/staff -> /apps/mnyra-heart/index.html`
  - `/admin/staff/ -> /apps/mnyra-heart/index.html`
  - `/admin/staff/edit -> /apps/mnyra-heart/index.html`
  - `/admin -> /apps/menyra-social/index.html`
  - `/admin/users -> /apps/menyra-social/index.html`
  - `/staff -> /apps/menyra-social/index.html`
  - `/staff/x -> /apps/menyra-social/index.html`
  - `/feed -> /apps/menyra-social/index.html`
- `git diff --check`

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Fix sitzt jetzt im aktiven lokalen Dev-Server. Rest-Risiko bleibt nur die
manuelle Browser-Gegenpruefung nach Neustart des Dev-Servers.

## Manuelle Testliste

- Dev-Server komplett stoppen und neu starten.
- `http://172.20.10.3:5173/leads` oeffnen und Heart Leads pruefen.
- `http://172.20.10.3:5173/customers` oeffnen und Heart Customers pruefen.
- `http://172.20.10.3:5173/admin/staff` oeffnen und Heart Staff pruefen.
- `http://172.20.10.3:5173/staff` oeffnen und pruefen, dass Social bleibt.
- Im Browser bei Bedarf alten Service Worker fuer die lokale Origin einmal
  unregister/refreshen, falls noch alte Navigation gecached ist.
