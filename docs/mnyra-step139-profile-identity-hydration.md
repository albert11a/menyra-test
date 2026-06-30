Status: CURRENT
Last updated: 2026-06-30

# Schritt 139 - Profile Identity Hydration

## Schritt

Auf Nutzerwunsch wurde der in der Profil-Ladeanalyse beschriebene Kernfehler
bei unvollstaendigen Business-Profilkarten nach Refresh/Cold-Start mit kleinem
Blast Radius behoben.

Dieser Schritt konzentriert sich nur auf Business-Identity-Daten fuer die
sichtbare Profilkarte. Der Menu-/Fokus-Wasserfall, Posts-Warmup und der
leere Lazy-Renderer-Fallback aus der Analyse bleiben bewusst eigene spaetere
Schritte.

## Geaendert

- `apps/menyra-social/core/profile/profile-visible-patch-utils.js` wurde als
  kleiner gemeinsamer Patch-Helper fuer sichtbare Business-Profilfelder
  ergaenzt.
- Der Public-Web-Direct-Seed uebernimmt vorhandene Route-/Preview-Felder fuer
  Cover, Social, Telefon, Adresse, Ort, Bio und Counts, statt nur Name,
  Handle, Avatar und Location zu setzen.
- Der Read-once-Profil-Dokumentpfad patched dieselben Business-Card-Felder in
  die bereits sichtbare Profilansicht.
- Die Profil-Render-Signature enthaelt jetzt Cover-, Social-, Telefon-,
  Adress- und Ortsfelder sowie `coverImages`, damit spaetere Identity-Updates
  nicht mehr durch den Short-Circuit wegoptimiert werden.
- Die sichtbare Business-Identity-Hydration bricht nicht mehr dauerhaft nur
  wegen `avatar + identityTruthState: "ready"` ab. Stattdessen wird das echte
  Business-Dokument pro sichtbarer Restaurant-ID einmal nachgeholt und danach
  dedupliziert.
- Im Review-Gate wurde `identityDocHydrated` als profil-eigener Marker
  ergaenzt: neue Web-Direct-Seeds starten mit `false`, echte Doc-Patches setzen
  `true`, und die Render-Signature beruecksichtigt den Marker sowie
  `telephone` und `contactPhone`.
- `apps/menyra-social/index.html` setzt den App-Build-Token auf
  `2026-07-01-profile-identity-hydration-gate-01`.
- Das Menyra-Social-Bundle wurde neu gebaut; dadurch wurde
  `apps/menyra-social/bundled/entry/social-app.js` aktualisiert.

## Bewusst Nicht Geaendert

- Keine UI-, Layout-, Farb-, Typografie- oder Design-Aenderung.
- Kein Eingriff in Menu-/Fokus-Rendering, `waitingForFocus`, Posts-Warmup,
  Lazy-Renderer-Skeleton oder Public-Renderer-Splitting.
- Keine Aenderung an QR, Cart, Checkout, Orders, Routing-Vertrag,
  Firebase Rules, Functions oder Firestore-Pfaden.
- Keine Produktlogik- oder Datenmigration.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex; der Nutzer testet
  manuell.

## Technische Pruefung

- `node --check apps/menyra-social/core/profile/profile-visible-patch-utils.js`:
  bestanden.
- `node --check apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`:
  bestanden.
- `node --check apps/menyra-social/core/profile/public-profile-runtime-controller.js`:
  bestanden.
- `node --check apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`:
  bestanden.
- `npm run build:menyra-social:bundle`: bestanden.
- `npm run check:social-bundle`: nicht bestanden, weil der bestehende
  `entry/social-app.js` weiter ueber dem gesetzten Budget liegt
  (`1.121.821` raw / `304.408` gzip Bytes gegen `1.052.000` raw /
  `285.000` gzip Bytes).

## Manuell Testen

1. App hart neu laden, bei Bedarf mit `?sw-reset=1`.
2. Mit `?debug-build=1` pruefen, dass
   `2026-07-01-profile-identity-hydration-gate-01` aktiv ist.
3. Ein Business-Profil direkt ueber seine Public-URL oeffnen und refreshen.
4. Direkt nach dem Refresh pruefen, dass die obere Business-Profilkarte Cover,
   Profilbild, Bio, Ort/Adresse, Telefon sowie Instagram/TikTok-Links nicht
   dauerhaft verliert, wenn diese Daten im Business-Dokument vorhanden sind.
5. Danach zwischen `Beitraege`, `Info` und `Menu` wechseln und pruefen, dass
   die Profilkarte nicht durch alte Teil-Identity-Daten zurueckfaellt.
6. Ein zweites Business-Profil oeffnen und zurueck wechseln; alte Social-,
   Cover- oder Adressdaten duerfen nicht in das andere Profil uebernommen
   werden.
7. QR-Scan/QR-URL kurz gegenpruefen: Profil oeffnet weiter auf derselben
   Profilseite mit offenem Menu und unveraenderter Warenkorb-Logik.

## Bewertung

Bestanden mit kleinem Rest-Risiko. Der Schritt repariert den wahrscheinlichsten
Root-Cause fuer unvollstaendige Profilkarten nach Refresh, laesst aber die
separaten Analysepunkte Menu/Fokus-Wasserfall, Posts-Orchestrierung und
Lazy-Renderer-Fallback bewusst offen.
