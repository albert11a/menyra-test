# Launch Closure Batch A - Freeze and Scope

Stand: 2026-03-31  
Referenz:
- `MENYRA_SYSTEM_KERNANALYSE_2026-03-30.md`
- `MENYRA_LAUNCH_CLOSURE_PLAN_2026-03-31.md`

## Batch-A In Scope (Phase 0)

- Freeze fuer `apps/menyra-social`, `apps/waiter`, `functions`, `firestore.rules`: nur Launch-Closure-Arbeit, keine Feature-Arbeit.
- Verbindliche Datenvertraege pro Problemblock festhalten:
  - kanonische Quelle
  - erlaubte Read-Modelle
  - Write-Pfad
  - Reconcile-Regeln
  - Definition of Done
- Migrations-/Cutover-Blaetter je Wahrheitsumbau vorbereiten:
  - Backfill-Quelle
  - Zielschema
  - Cutover-Kriterium
  - Rollback-Regel
  - Verifikationsquery
- Testbaseline fuer Heart-Runner fixieren:
  - relevante Packs
  - Persona-Setup
  - lokale und Staging-Ausfuehrung
  - Guarded-vs-Live-Mutation-Regeln

## Explizit Nicht In Scope

- Kein Phase-1-Codeumbau fuer Notifications.
- Kein Umbau an `firestore.rules` fuer Notification-Security in diesem Batch.
- Kein Umbau an `functions/index.js` fuer Notification-Writer/Push-Flow in diesem Batch.
- Kein Umbau von Client-Notification-Writes in:
  - `apps/menyra-social/core/notifications/notification-support-runtime-controller.js`
  - `apps/menyra-social/core/chat/chat-runtime-controller.js`
  - `apps/menyra-social/core/profile/social-engagement-runtime-controller.js`
- Kein Vorziehen spaeterer Wahrheitsumbauten (Restaurant/Geo, Menu/QR, Orders, Feed/Profile/Story/Chat, Guest-Scoping).
- Kein UI-Polish, keine neuen Features, kein Performance-Tuning ausser Dokumentation und Baseline.

## Reihenfolge- und Scope-Regeln

1. Erst Vertrag, dann Umbau.
2. Kein Vorziehen spaeterer Batch-Arbeit.
3. Jede technische Aenderung muss einem Contract-Block zugeordnet sein.
4. Jede Wahrheitsumstellung braucht vor Merge einen Backfill-, Cutover- und Rollback-Plan.
5. Vor jedem Folge-Batch muessen die benoetigten Persona-Packs mindestens reproduzierbar konfigurierbar sein.

## Naechste Batches (fixe Reihenfolge)

- Batch B: Phase 1 Notification Security Hotfix
- Batch C: Phase 2 Restaurant Identity + Geo Truth
- Batch D: Phase 3 Menu + QR Contract
- Batch E: Phase 4 Orders Mirror + Waiter Runtime
- Batch F: Phase 5 Post/Feed/Profile/Story/Chat Recovery
- Batch G: Phase 6 Guest Scoping
- Batch H: Phase 7 Render Budget + Vendor Hardening + Degraded Modes
- Batch I: Phase 8 Release Gates + Observability
- Batch J: Full regression pass, bugfix-only, launch signoff
