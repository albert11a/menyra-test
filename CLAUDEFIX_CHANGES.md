# MNYRA – Umgesetzte Änderungen auf `claudefix`

Stand: 2026-07-03. Diese Änderungen sind **sicher und einzeln reversibel** und
berühren **nicht** die Live-Production, bis du den Branch deployst/mergst.
Verifikation nach jedem Schritt: `npm run test:unit` (134/134 grün),
`npm run build` (grün), `npm run lint` (0 errors), `npm run arch:check` (0 Violations).

## Was gemacht wurde

### Sicherheit
- **Kritischer Admin-Bug (C1) behoben** – `functions/heart/common.js`.
  Admin-Zugriff nur noch über vertrauenswürdige Signale: feste Owner-UID,
  serverseitige Custom Claims (`ceo`/`superadmin`/`roles`), `superadmins/{uid}`
  (rules-schreibgeschützt), exakte **verifizierte** Owner-E-Mail. Anzeigename/
  Handle/Cross-Domain-E-Mail zählen nicht mehr. Getestet: Angreifer mit Name
  „Albert Hoti" bzw. `alberthoti@evil.com` bekommt **keinen** Zugriff, echter
  Owner behält Zugriff. *(Wirkt erst nach Firebase-Functions-Deploy.)*
- **HTTP-Security-Header** – `vercel.json`: HSTS, X-Content-Type-Options,
  X-Frame-Options (SAMEORIGIN), Referrer-Policy, Permissions-Policy **enforced**;
  CSP zunächst als **Report-Only** (blockiert nichts, liefert Violation-Telemetrie
  zum späteren scharf schalten).
- **Firestore-Indexe** – `firestore.indexes.json`: `socialFeed(status,createdAt)`
  und `stories(status,createdAt)` ergänzt, passend zu `queryActiveFeed`/
  `queryActiveStories`. *(Wirkt erst nach `firebase deploy --only firestore:indexes`.)*
- `.gitignore`: `.env`-Familie ergänzt.

### Code-Qualität / echte Bugfixes
- **Lint-Gate geschärft** – `no-undef` = `error` (echtes Gate für Tippfehler/
  undefined refs), fehlende Browser-/Worker-/CommonJS-Globals ergänzt, `--quiet`
  entfernt. `no-unused-vars` bleibt bewusst `warn` (290 Alt-Fälle, kein Bruchrisiko).
- **4 echte latente `ReferenceError`-Crashes gefixt** (vom neuen Gate gefunden):
  - `marketplace-view-render-utils.js`: `address` undefiniert → `record.address || ""`.
  - `profile-open-flow-utils.js`: `routeSnapshotRestaurantId` /
    `routeBootstrapCanonicalRestaurantId` wurden im `catch`-Recovery-Block
    außerhalb ihrer Deklaration referenziert (Crash im Fehlerpfad) → bereinigt.
  - `chat-app-runtime-lazy-facade.js`: bare `persistCurrentChatMessagePatch` im
    Fallback → über vorhandenen `callRealAsync`-Delegationsmechanismus geroutet.

### SEO
- `robots.txt`, `sitemap.xml`, `favicon.svg` (Root, werden nach `dist/` kopiert).
- OG/Twitter/`description`/**dynamisches** `canonical`+`og:url` in beiden
  `index.html`-Heads; `apple-touch-icon`.

### Hygiene
- Leere Junk-Dateien `a`, `b`, `bk`, `v` entfernt.
- Debug-`console.log("Warenkorb geklickt"/"Kellner gerufen")` entfernt.

---

## Was DU noch tun musst (kann ich nicht allein / braucht Deploy oder Konten)

1. **Deployen**, damit die Backend-/Config-Fixes greifen:
   - `firebase deploy --only functions` (C1-Fix)
   - `firebase deploy --only firestore:indexes` (Feed/Stories-Sortierung)
   - `claudefix` nach Prod mergen/deployen (Header, SEO, Frontend-Fixes)
2. **App Check + Rate-Limiting** aktivieren (Firebase-Console-Keys nötig),
   v.a. auf `createRestaurantOrder`.
3. **CSP scharf schalten:** Report-Only-Violations sichten, dann auf
   `Content-Security-Policy` (enforce) umstellen.
4. **Observability:** Sentry (oder Äquivalent) einrichten – braucht dein Konto/DSN.
5. **Rechtsseiten:** Impressum + Datenschutz + AGB + Cookie-Consent (bewusst
   ausgelassen; Inhalt ist rechtlich verbindlich). **DE-Pflicht vor Launch.**
6. **QR/Menu-Bug** (2/27 Produkte, Cart) auf echtem Staging reproduzieren.
7. **Bundle-Split** des public/QR-Pfads (Entry ~1,08 MB über Budget) und
   `check:social-bundle` als CI-Gate; E2E in CI; CI auf Default-Branch triggern.
8. **Firebase-Console:** Auth-authorized-domains + API-Key-Referrer-Restriktionen;
   Default-Lead-Passwort-Accounts rotieren.

## Bewusst NICHT angefasst (zu risikoreich für einen sicheren Durchlauf)
- 297 leere `catch{}` massenhaft verdrahten – sinnvoll erst mit Error-Sink (Pkt. 4).
- God-Object-Refactors, `window.__MENYRA_*`-Bus, `bundled/` aus Git nehmen.
- Frontend-Alias-Gating (reine UI; Server erzwingt jetzt korrekt).
- Rechtsseiten-Inhalte.

## Bekannter roter, aber vorbestehender Check
- `npm run check:social-bundle` → weiter rot (Entry über Budget). **Nicht** durch
  diese Änderungen verursacht; Fix = Bundle-Split (Pkt. 7).
