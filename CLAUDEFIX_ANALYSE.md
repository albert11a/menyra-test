# MNYRA – Komplett-Analyse (Branch `claudefix`)

Stand: 2026-07-03 · Basis: `origin/main` · Erstellt für die Launch-Vorbereitung
(Millionen Besucher / 100.000 Kunden). Diese Datei ist die vollständige
Ist-Aufnahme. Was davon bereits auf `claudefix` umgesetzt wurde, steht in
`CLAUDEFIX_CHANGES.md`.

> Wichtig vorweg: Zwei P0-Punkte aus euren älteren Reports
> (Order-Preis-Manipulation, Counter-Manipulation) sind **inzwischen gefixt**
> (Server-Cloud-Function rechnet Preise/Totals neu; Counter in `firestore.rules`
> unveränderbar). Der `LAUNCH_READINESS_REPORT.md` ist an dieser Stelle veraltet.

---

## 1. Sicherheit (wichtigster Block)

### KRITISCH
- **C1 – Privilege-Escalation zum globalen CEO/Admin** (`functions/heart/common.js`).
  Der Admin-Zugriff auf das Heart-CRM (Leads, Staff, Business-Accounts) hing an
  **nutzer-editierbaren Feldern**: Anzeigename/Handle normalisiert zu
  „alberthoti", oder E-Mail-Local-Part `alberthoti@` auf **beliebiger Domain**.
  Jeder eingeloggte Nutzer konnte sich so zum Admin machen. → **Auf `claudefix`
  behoben** (nur noch feste UID / Custom Claims / `superadmins`-Doc / verifizierte
  Owner-E-Mail). Wirkt nach Firebase-Functions-Deploy.

### HOCH
- **H1 – Kein App Check / kein Rate-Limiting.** `createRestaurantOrder`
  (`functions/index.js`) erlaubt Gäste unauthentifiziert und ungedrosselt →
  Order-Spam, Flooding der Küchen-/Kellner-Queues, Notification-Spam,
  Kostenmissbrauch bei Skala. Callables haben keine App-Check-Erzwingung.
- **H2 – Fehlende HTTP-Security-Header.** `vercel.json` hatte kein CSP, HSTS,
  X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
  → **Auf `claudefix` gesetzt** (5 Header enforced; CSP zunächst Report-Only).

### MITTEL
- **M1** – `/api/heart/*`-Proxy (`vercel.json`) leitet per Wildcard an **jede**
  Function im Projekt weiter (Defense-in-Depth-Lücke). Allowlist empfohlen.
- **M2** – `allow read: if true` auf vielen Collections (meist gewollt: public
  Menu/Social). Zu bestätigen: `users/{uid}/posts` ist für jeden Eingeloggten
  lesbar (ok für Social-App, nur bewusst entscheiden).
- **M3** – `firestore.indexes.json` passte nicht zu den Queries (`socialFeed`
  und `stories` per `status`); Feed/Stories fielen in Prod still auf
  **unsortiert** zurück. → **Auf `claudefix` behoben**.

### NIEDRIG
- `.gitignore` listete `.env` nicht → **ergänzt**.
- Dead Code in `firestore.rules` (`validOrderCreateForRestaurant`, ~Z.501–664),
  ungenutzt seit `orders create: if false`.
- Default-Lead-Passwort „Alberthoti1992" nur noch in Docs/Git-History →
  betroffene Accounts rotieren.
- Firebase Web-API-Key public (per Design ok); Auth-authorized-domains +
  API-Key-Referrer-Restriktionen in der Firebase-Console setzen.

---

## 2. Betrieb & Zuverlässigkeit (Launch-relevant)

- **Keine Observability.** Kein Sentry/Datadog, keine Analytics, kein RUM. Nur ein
  In-Memory-Ringpuffer (`shared/runtime-error-reporter.js`) **ohne Remote-Sink** –
  Fehler gehen beim Reload verloren, Ops ist blind. **Für Millionen-Skala kritisch.**
- **Kein automatisches Monitoring.** Die Heart-Canary-Workflows
  (`.github/workflows/mnyra-heart-*.yml`) sind `workflow_dispatch`-only (kein cron).
- **Kein Staging/Emulator-Durchlauf.** `firebase.json` hat inzwischen Emulator-
  Config und `tests/rules` + `tests/functions` existieren, aber die Security-/
  Rollen-Flows sind nicht end-to-end gegen echte Daten verifiziert.
- **297 leere `catch {}`-Blöcke** (Top: `feed-view-orchestration-controller.js` 28×,
  `discovery-runtime-controller.js` 20×, `chat-app-runtime-lazy-facade.js` 17×,
  `crm-runtime-controller.js` 16×) → Fehler werden appweit verschluckt. Sinnvoll
  erst **nach** Anbindung eines Error-Sinks systematisch zu verdrahten.

---

## 3. Performance

- **Entry-Bundle zu groß:** `bundled/entry/social-app.js` ≈ **1,08 MB** roh
  (308 KB gzip). Budget (`check:social-bundle`) wird überschritten und ist **nicht**
  als (fehlschlagendes) CI-Gate aktiv. Ursache: der public/QR/Menu-Pfad hängt
  statisch im Entry-Graph. → Code-Split des öffentlichen Pfads nötig.
- **Ladestrategie ist ansonsten gut:** Import-Map, `modulepreload` aus Manifest,
  `preconnect`/`dns-prefetch`, Font-Preload, Lazy-Chunks (chat/crm/marketplace).
- **Assets:** `assets/icon-512.png` = **375 KB** (für ein PWA-Icon zu groß).
- **Vercel-Cache-Header korrekt** (immutable für gehashte Assets).

---

## 4. Architektur & Code-Qualität

- **Lint-Gate war faktisch aus** (`eslint . --quiet`, alle Regeln nur `warn`).
  → **Auf `claudefix` geschärft**: `no-undef` = `error`, Globals ergänzt,
  `--quiet` entfernt. Dabei **4 echte latente `ReferenceError`-Bugs** gefunden
  und gefixt (Marketplace `address`, Profil-Fehlerpfad `route*`, Chat-Persist).
- **Committeter Build-Output** `apps/menyra-social/bundled/` liegt neben seinem
  Quellcode + **dualer Runtime-Loader** (bundled ODER Raw-Fallback auf 237
  Module) → Drift-Gefahr, doppelte Verhaltensfläche.
- **Cache-Busting** hängt an **einem** handgepflegten Versions-String
  (`__MENYRA_SOCIAL_APP_VERSION__`) + zweitem SW mit hardcodiertem
  `menyra-cache-v8` → vergessenes Bumpen = User mit stale PWA-Cache.
- **God-Objects:** `social-app.js` 5.387 Z., `profile-menu-focus-render-controller.js`
  4.688 Z., `feed-view-orchestration-controller.js` 4.040 Z., `functions/index.js`
  3.778 Z., `crm-runtime-controller.js` 3.451 Z. + ~13 `window.__MENYRA_*`-Globals
  als untypisierter Cross-Module-Bus.
- **Repo-Hygiene:** leere Junk-Dateien `a/b/bk/v`, Debug-`console.log`,
  27 Root-Markdown-Reports. → Junk/Debug **auf `claudefix` entfernt**.

---

## 5. SEO & kommerzielle Basis

- **Fehlten komplett:** `robots.txt`, `sitemap.xml`, Favicon, OG/Twitter/canonical/
  description-Tags. → **Auf `claudefix` ergänzt** (Favicon als SVG, dynamisches
  Canonical/og:url pro Route).
- **Rechtlich (DE-Markt): fehlen Impressum, Datenschutz/DSGVO, AGB, Cookie-Consent.**
  Auf Wunsch **bewusst ausgelassen** (Inhalt ist rechtlich verbindlich und muss
  von euch/Anwalt kommen). **Für kommerziellen DE-Launch Pflicht** (Impressums-
  pflicht + DSGVO). Siehe `CLAUDEFIX_CHANGES.md` → „Was DU noch tun musst".
- **i18n vorhanden** (DE/SQ) – gut für den DE-/Albanien-Markt.

---

## 6. Skalierung (Firestore)

- Unbegrenzte `getDocs`-Fallbacks: `feed-visibility-runtime-cluster.js` (liest bei
  Fehler die **komplette** posts-Subcollection), `menu-public-runtime-controller.js`
  (menuItems ohne `limit`).
- CRM/Admin macht **Full-Collection-Scans** (`leads`, `restaurants`, `superadmins`)
  für Counts statt `count()`-Aggregation → teuer/langsam bei Skala.
- Nur wenige Composite-Indexe definiert; neue Query-Shapes können in Prod auf
  „missing index" laufen.

---

## 7. Tests & CI

- `test:unit` grün (134 Tests), `build` grün. E2E (6 Playwright-Specs) laufen
  **nie in CI**. Rules-/Functions-Tests brauchen Emulator.
- CI (`.github/workflows/ci.yml`) triggert nur auf Branch `mnyrasocial` + PRs –
  **Default-Branch nicht abgesichert**. `check:social-bundle` (das rote Budget-Gate)
  ist **nicht** in CI, nur der non-failing `bundle:report`.

---

## Priorisierte Restliste für „launch-ready"
Reihenfolge = größter Hebel zuerst. Details/Status in `CLAUDEFIX_CHANGES.md`.

**Muss vor Groß-Launch (P0):**
1. C1-Fix **deployen** (Firebase Functions). *(Code fertig auf `claudefix`.)*
2. App Check + Rate-Limiting (v.a. `createRestaurantOrder`).
3. Security-Header **deployen**; CSP von Report-Only auf Enforce ziehen, sobald
   Violation-Reports sauber sind. *(Header-Code fertig.)*
4. Observability: Sentry/RUM + Remote-Sink + geplantes Uptime-Monitoring (cron).
5. Impressum + Datenschutz/DSGVO + Cookie-Consent (DE-Pflicht).
6. QR/Menu-Bug (nur 2/27 Produkte, Cart) auf echtem Staging reproduzieren & fixen.

**Hoch (P1):**
7. Bundle splitten + `check:social-bundle` als failing CI-Gate; E2E in CI;
   CI-Trigger auf Default-Branch.
8. Firestore-Indexe **deployen** *(ergänzt)*; unbegrenzte `getDocs` + CRM-Scans
   absichern (`limit`/`count()`).
9. Cache-Busting an Build-Hash koppeln.

**Mittel (P2):**
10. Leere `catch{}` an Error-Sink anbinden (nach 4.).
11. God-Objects entkoppeln; `window.__MENYRA_*`-Bus reduzieren.
12. `bundled/` aus Git nehmen (Build-Output); Dual-Loader-Strategie entscheiden.
