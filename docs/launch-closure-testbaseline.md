# Launch Closure Batch A - Testbaseline

Stand: 2026-03-31  
Referenz:
- `MENYRA_LAUNCH_CLOSURE_PLAN_2026-03-31.md`
- `tests/mnyra-heart-runner/package.json`

## 1) Relevante Runner-Dateien

- Entry:
  - `tests/mnyra-heart-runner/src/run-pack.mjs`
  - `tests/mnyra-heart-runner/src/packs/pack-registry.mjs`
  - `shared/heart-pack-catalog.js`
- Persona/Env:
  - `tests/mnyra-heart-runner/src/personas/persona-registry.mjs`
  - `tests/mnyra-heart-runner/src/helpers/env.mjs`
  - `tests/mnyra-heart-runner/config/heart-pack-config.example.json`
- CI-Anbindung:
  - `.github/workflows/mnyra-heart-smoke.yml`
  - `.github/workflows/mnyra-heart-synthetic.yml`

## 2) Packs (aktuell verfuegbar)

Skript-Packs aus `package.json`:

- `smoke`
- `synthetic` (`full-platform-pack`)
- `ceo-pack`
- `business-pack`
- `staff-pack`
- `user-pack`
- `guest-pack`
- `mutation-pack`
- `journey-pack`
- `full-platform-pack`

Weitere Runner-Packs laut Katalog (`shared/heart-pack-catalog.js`), aber ohne eigenes npm-Skript:

- `guard-pack`
- `release-pack`
- `health-pack`

## 3) Was aktuell nicht sauber konfiguriert wirkt

- Es gibt nur ein Beispiel unter `tests/mnyra-heart-runner/config/heart-pack-config.example.json`; keine produktive, versionierte Pack-Konfig im Repo.
- Beispielkonfig enthaelt keine Zugangsdaten fuer `ceo`, `business`, `staff`, `user`; damit landen Auth-Module lokal sofort auf `not_configured`.
- Discovery-Konfiguration (`actions.discovery.search/map`) fehlt im Beispiel; `runDiscoveryChecks` markiert dann Map/Suche als `not_configured`.
- Viele Mutationschecks sind bewusst `guarded`, solange nicht beides gesetzt ist:
  - `MNYRA_ALLOW_LIVE_MUTATIONS=true`
  - `MNYRA_SYNTHETIC_ISOLATION_KEY` vorhanden
- `mnyra-heart-smoke.yml` ist weiterhin `workflow_dispatch` und setzt keinen Isolation-Key; damit bleiben Schreibpfade in Smoke absichtlich nicht live.
- Pflicht-Gates sind noch nicht als harter automatischer Release-Block vor jedem Deploy definiert.

## 4) Persona-Wege fuer die Umsetzungsphase (Phase 1 bis 8)

- CEO:
  - Smoke auf Social-Shell, Navigation, Discovery, PWA
- Guest:
  - Cold/QR-Link -> Menu sichtbar -> Cart -> Order-Flow
  - Pruefung auf versteckte privilegierte Business-Controls
- User:
  - Feed/Profile/Follow/Comment/Post
  - Cart/Order
  - Chat senden inkl. sichtbarer Ergebnispruefung
- Business:
  - Menu/Fokus Oberflaechen
  - Produkt create/edit/delete
  - Chat + Discovery
- Staff:
  - Waiter-Login
  - Order sichtbar
  - Statusaktion und Verifikation

## 5) Batch-A Baseline (vor Phase-1-Umbau)

- Mindestpacks fuer kommende Batches:
  - `smoke`
  - `guest-pack`
  - `user-pack`
  - `business-pack`
  - `staff-pack`
- Laufziel:
  - lokal reproduzierbar
  - gegen Staging reproduzierbar
  - Pflichtpfade ohne unerklaerte `not_configured`-Treffer
