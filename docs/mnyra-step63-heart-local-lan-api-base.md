Status: CURRENT
Last updated: 2026-06-15

# Schritt 63 - Heart Local LAN API Base

## Ziel

Klaeren und beheben, warum `Leads`, `Staff` und `Kunden/Klients` lokal zuerst
nach Feed gefallen sind und warum Heart danach auf `172.20.10.3:5173` die
Heart-API unter `/api/heart/...` mit 404 aufruft.

## Befund

- Am 24.05.2026 wurde mit Commit `20be023f` Social-Ownership fuer `leads` und
  `customers` entfernt. Der Social-Drawer zeigte danach auf die Heart-owned
  Pretty Routes `/leads` und `/customers`.
- Am 25.05.2026 wurde mit Commit `9ed50286` auch CEO-`Staff` auf die Heart-
  Route `/admin/staff` gelegt.
- Diese Pretty Routes sind fuer Vercel/Rewrites und Root-Service-Worker
  korrekt, aber lokal im Vite-Server nicht garantiert. Ohne aktive Rewrite-
  Schicht konnte Social die Route als reserviert/unbekannt behandeln und am
  Ende wieder Feed anzeigen.
- Schritt 62 hat den Social-Drawer deshalb direkt auf die Heart-Shell mit
  expliziter View umgestellt:
  `apps/mnyra-heart/index.html?view=crmLeads`,
  `?view=crmStaff`, `?view=crmCustomers`.
- Danach wurde Heart lokal wirklich geoeffnet. Auf `172.20.10.3` erkannte
  Heart den Host aber nicht als lokale Entwicklung, weil bisher nur
  `localhost` und `127.0.0.1` als lokal galten.
- Deshalb nutzte Heart lokal auf der privaten LAN-IP faelschlich die relative
  Produktions-API `/api/heart/`. Auf dem Vite-Server `:5173` existiert diese
  Route nicht, daher die 404 fuer `heartGetDashboard` und `heartGetIncidents`.

## Geaendert

- `apps/mnyra-heart/index.html`
  - Heart erkennt lokale Entwicklungs-Hosts jetzt auch fuer private LAN-IP-
    Bereiche:
    - `10.x.x.x`
    - `172.16.x.x` bis `172.31.x.x`
    - `192.168.x.x`
    - plus `0.0.0.0` und `::1`
  - Diese Hosts nutzen wie `localhost` direkt
    `https://us-central1-menyra-c0e68.cloudfunctions.net/` als Heart-API-Base.

## Bewusst Nicht Geaendert

- Kein Rueckbau des Schritt-62-Handoffs.
- Keine Aenderung an Vercel-Rewrites.
- Keine Aenderung an Heart-Functions.
- Keine Aenderung an Social-Routing, QR, Cart, Order, Firebase Rules oder
  Functions.
- Kein Browser-/Smoke-Test durch Codex gemaess Repo-Regel.

## Verifikation

- Node-Host-Erkennungscheck:
  - `172.20.10.3 -> true`
  - `172.15.10.3 -> false`
  - `172.31.1.1 -> true`
  - `192.168.1.5 -> true`
  - `10.0.0.8 -> true`
  - `mnyra.com -> false`
  - `preview.vercel.app -> false`
- `git diff --check`

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Fix ist auf die lokale Heart-API-Base-Erkennung begrenzt. Rest-Risiko bleibt
die manuelle Gegenpruefung im Browser unter der echten lokalen LAN-IP.

## Manuelle Testliste

- Lokal unter `http://172.20.10.3:5173/apps/mnyra-heart/index.html?view=crmLeads`
  oeffnen.
- Pruefen, dass `heartGetDashboard` und `heartGetIncidents` nicht mehr gegen
  `http://172.20.10.3:5173/api/heart/...` laufen.
- Aus Social im CEO-Drawer `Leads`, `Staff`, `Kunden/Klients` oeffnen.
- Pruefen, dass Heart angezeigt wird und nicht Feed.
