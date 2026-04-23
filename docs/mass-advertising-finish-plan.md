# Mass Advertising Finish Plan

Stand: 2026-03-23

Ziel dieses Dokuments:

- den aktuellen Repo-Stand gegen Betriebsreife fuer Massenwerbung bewerten
- die A-Z-Liste in eine harte Priorisierung fuer dieses Projekt uebersetzen
- festhalten, was schon tragfaehig ist und was vor 50.000 Kunden nicht offen bleiben darf

Bewertungsbasis in diesem Repo:

- `README.md`
- `vercel.json`
- `firestore.rules`
- `shared/firebase-config.js`
- `functions/index.js`
- `functions/heart/*`
- `apps/menyra-social/*`
- `apps/waiter/*`
- `tests/mnyra-heart-runner/*`
- bestehende Audits unter `docs/`

Wichtiger Hinweis:

- Dieses Dokument bewertet den sichtbaren Repo-Stand.
- Externe Cloud-Konfigurationen, Alarme, Dashboards oder Backup-Jobs, die nur im Google-/Vercel-UI existieren, sind hier nicht belegbar.
- Wo etwas nicht im Repo sichtbar ist, wird es als "nicht belegt" behandelt.

## Fortschrittsupdate seit der Erstbewertung

- Die Erstbewertung dieses Dokuments war die Ausgangsbasis fuer den Betriebsreife-Plan.
- Seitdem sind die Tickets `01-07` im Repo umgesetzt worden.
- Bereits verbessert: Lead-Standardpasswort entfernt, Legacy-Media-Endpoints standardmaessig gesperrt bzw. zusaetzlich authentifiziert, kritische Write-Flows inventarisiert, strukturierte Function-Logs eingefuehrt, zentraler Runtime-Fehleradapter fuer Social und Waiter angelegt, Alarm-Matrix fuer Heart/Functions/Runtime festgezogen, Monitoring-/Logging-Runbook als Betreiberablauf dokumentiert.
- Weiter offen und fuer Massenwerbung weiterhin blockierend: Cloud-Alarme, Restore/Backups, Missbrauchsschutz, serverseitige Order-Idempotenz, Lasttests, Kosten- und Performance-Budgets.

## Harte Gesamteinschaetzung

Die Produktbasis ist stark genug, um weiter auszubauen. Die Betriebsreife fuer Massenwerbung ist es noch nicht.

Kurzurteil:

- Produktbasis: gut
- Architektur-Basis: brauchbar
- Betriebsreife: noch nicht ausreichend
- Release-Sicherheit: mittel
- Security-Niveau: gemischt
- Monitoring und Messbarkeit: zu schwach
- Skalierungsreife: unklar, weil Zahlen, Alarme und Lasttests fehlen

Der groesste Hebel ist nicht ein neues Feature, sondern Betriebsdisziplin:

- messen statt raten
- kritische Pfade absichern
- Wiederherstellung dokumentieren
- öffentliche Angriffs- und Kostenpfade haerten

## Was bereits gut ist

1. Firestore-Rules sind ernsthaft gebaut.

- `firestore.rules` endet mit Default-Deny.
- Rollen-, Restaurant-, Staff- und Order-Zugriffe sind bereits differenziert modelliert.

2. Die Plattformgrenzen sind schon erkennbar.

- `vercel.json` trennt Social, Waiter und Heart sauber ueber Routen und Hosts.
- Heart laeuft als eigene CEO-Flaeche, Waiter als eigene App, Social als Hauptkern.

3. Caching hat bereits eine brauchbare Basis.

- `vercel.json` liefert Assets unter `/apps/menyra-social/assets`, `/apps/menyra-social/styles` und `/apps/waiter/assets` immutable aus.
- `apps/menyra-social/sw.js` nutzt fuer App-Code und Assets kontrollierte Cache-Strategien.
- `shared/firebase-config.js` aktiviert `persistentLocalCache(...)` und Multi-Tab-Cache.
- `functions/index.js` liefert `socialBootstrapFeed` mit kurzer CDN-Cache-Zeit.

4. Es gibt schon echte Frontend-Regressionstests.

- `tests/mnyra-heart-runner/` ist ein echter Playwright-Runner mit Rollen-Packs.
- `.github/workflows/mnyra-heart-smoke.yml` und `.github/workflows/mnyra-heart-synthetic.yml` fuehren Heart-Packs ueber GitHub Actions aus.
- Heart meldet Status, Reports und Incidents zurueck in Firebase Functions.

5. Kritische Commerce-Seiteneffekte sind teilweise entkoppelt.

- Bestellungen werden in Firestore gespeichert.
- `notifyWaiterOnRestaurantOrderCreate` benachrichtigt Waiter/Owner als Firestore-Trigger nachgelagert.
- Das ist robuster als eine rein synchrone Browser-Kette.

6. Die App hat bereits Startup- und Lazy-Loading-Arbeit bekommen.

- `apps/menyra-social/core/app-shell/*` entlastet den Startpfad.
- `public bootstrap`, `requestIdleCallback`, lokaler Cache und lazy CRM-Renderer sind schon angelegt.

## Kritische Befunde

1. Produktives Monitoring ist trotz erster Repo-Haertung noch nicht ausreichend sichtbar.

- Social und Waiter haben jetzt einen zentralen Runtime-Fehleradapter, aber noch keine belegte produktive Weiterleitung in ein echtes Alerting-/Incident-System.
- Functions haben jetzt erste strukturierte Logs, aber keine im Repo belegte Cloud-Alarmkette fuer Orders, Login-Fehlerrate, Function-500er oder Kostenanstiege.
- `functions/heart/providers.js` zeigt einen `Sentry Adapter` weiterhin nur als Platzhalter.

2. Backup und Restore sind nicht belegt.

- Es gibt keinen sichtbaren taeglichen Export-Job.
- Es gibt keinen dokumentierten Restore-Runbook fuer Restaurants, Menues, Orders oder User-Beziehungen.
- Es gibt keinen belegten Test-Restore-Pfad.

3. Rate Limits, App Check und Missbrauchsschutz sind nicht belegt.

- Im Repo ist kein App-Check-, CAPTCHA- oder Rate-Limit-Pfad sichtbar.
- Fuer Login, Upload-Tickets, öffentliche HTTP-Functions und bestellnahe Pfade ist das vor Massenwerbung zu schwach.

4. Legacy-HTTP-Endpoints sind verbessert, aber noch nicht final bereinigt.

- `functions/index.js` exportiert `getStreamUploadSignature`, `getStreamUploadSignatureHttp` und `uploadStoryImage`.
- Diese Pfade sind jetzt standardmaessig deaktivierbar und zusaetzlich mit Auth-/Restaurant-Berechtigung gehaertet.
- Der Rest-Risiko-Punkt bleibt: clientseitige Alt-Abhaengigkeiten muessen weiter auditiert und die Legacy-Pfade spaeter ganz entfernt oder sauber operationalisiert werden.

5. Das hartcodierte Lead-Standardpasswort ist im aktuellen Repo-Stand entfernt.

- Neue Lead-/CRM-Pfade erzeugen kein stilles Default-Login mehr.
- Offene Folgearbeit bleibt nur dort, wo historische Daten oder bereits angelegte Accounts ausserhalb des sichtbaren Repo-Stands geprueft werden muessen.

6. Idempotenz ist bei Kernschreibpfaden unzureichend.

- `apps/menyra-social/core/orders/orders-runtime-controller.js` erzeugt bei Checkout eine neue Order-ID per `doc(collection(...))`.
- Es gibt keinen serverseitigen `requestId`-/Replay-Schutz fuer denselben Checkout.
- Doppelklick-Schutz im UI hilft, ersetzt aber keine serverseitige Idempotenz.

7. Hotspot-Risiken sind real.

- Likes/Kommentare schreiben direkt auf gemeinsame Counter-Felder wie `likesCount` und `commentsCount`.
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js` incrementiert diese Counter auf Post-, Feed-, Menu- und Kommentar-Dokumenten.
- `firestore.rules` erlaubt Counter-Only-Updates fuer diese Felder.
- Das ist funktional okay, aber bei starkem Traffic ein Hotspot- und Drift-Risiko.

8. Functions sind teilweise gehaertet, aber operativ noch nicht fertig.

- Der Hauptbestand in `functions/index.js` ist Gen1-Stil (`functions.https.onRequest`, Firestore Trigger).
- Sichtbare `runWith(...)`-Konfiguration gibt es praktisch nur fuer `email-domain-migration.js`.
- Strukturierte Logs und erste Korrelation-Kontexte sind jetzt in kritischen Pfaden vorhanden.
- Timeouts, breitere Fehlerklassifikation, Missbrauchsschutz und konsequente Haertung aller Hauptpfade fehlen weiterhin.

9. Zahlen fuer Kosten und Last fehlen.

- Kein sichtbares Read-/Write-Budget pro Hauptflow.
- Keine sichtbare Messung fuer Listener pro Session.
- Keine belegten Lasttests fuer Menu, Order, Like, Comment, Chat oder Waiter.

10. Die Wartbarkeit ist besser als frueher, aber noch kein entspannter Zustand.

- `apps/menyra-social/social-app.js` hat noch immer 3754 Zeilen.
- `apps/menyra-social/core/crm/crm-runtime-controller.js` hat 2434 Zeilen.
- `apps/menyra-social/core/app-shell/controller-deps-factory.js` hat 2087 Zeilen.
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js` hat 1596 Zeilen.
- `apps/menyra-social/core/chat/chat-runtime-controller.js` hat 1512 Zeilen.

## A-Z Bewertung fuer dieses Repo

`A Alarmierung`: rot

- Keine im Repo belegte Cloud-Monitoring-Alarmkette fuer Orders, Login-Fehlerrate, Function-500er oder Kostenanstiege.

`B Backups und Wiederherstellung`: rot

- Kein sichtbarer Export-Job, kein Restore-Runbook, kein Test-Restore.

`C Caching`: gelb-gruen

- Gute Basis durch `vercel.json`, `sw.js`, Firestore local cache und `socialBootstrapFeed`.
- Aber die Cache-Matrix pro Seite ist nicht zentral dokumentiert.

`D Datenmodell`: gelb

- Das Modell ist fuer Produktentwicklung brauchbar.
- Fuer Lastverteilung bleiben Counter-Dokumente, wiederholte Listen-Queries und einige heiße Social-Dokumente riskant.

`E Error Handling`: gelb

- Nutzer bekommen an vielen Stellen eine Meldung.
- Technische Fehler landen aber oft nur in der Console statt in produktiver Fehlererfassung.

`F Functions haerten`: gelb

- Bestehende Functions funktionieren, aber Logging, Timeouts, Idempotenz und Legacy-Endpoint-Haertung fehlen.

`G Grenzen zwischen Bereichen`: gelb-gruen

- Social, Waiter und Heart sind klar genug getrennt.
- Shared-Verantwortung und "was darf nie doppelt wachsen" ist noch nicht als Betriebsdokument fixiert.

`H Hotspots vermeiden`: gelb-rot

- Counter-Updates auf gemeinsamen Doks sind sichtbar.
- Ohne Lasttest bleibt das Risiko fuer virale Objekte und starke Restaurants offen.

`I Idempotenz`: rot

- Besonders Orders brauchen serverseitige Replay-Sicherheit.
- Im Repo ist das fuer Kernpfade nicht ausreichend sichtbar.

`J Jobs fuer Hintergrundarbeit`: rot

- Außer Triggern und Heart/GitHub-Runnern ist kein klarer Hintergrundjob-Bestand sichtbar.
- Exporte, Aufraeumen, Aggregation und periodische Aufgaben fehlen.

`K Kostenkontrolle`: rot

- Keine belegten Budgets oder Messwerte fuer Reads, Writes, Listener und Functions pro Flow.

`L Load Testing`: rot

- Heart ist Regression/Smoke, nicht Lasttest.
- Kein k6/Artillery/Locust/autocannon-Pfad sichtbar.

`M Monitoring`: rot

- Heart bietet Run-/Incident-Sichtbarkeit.
- Produktives Route-, Host-, Client-Fehler- und Performance-Monitoring ist im Repo nicht belegt.

`N Nicht alles live`: gelb-gruen

- Gast-Menu und mehrere Public-Pfade nutzen bereits Fetch statt Dauer-Live.
- Waiter/Orders und Chat bleiben sinnvoll live.

`O Observability pro Kunde`: rot

- Keine belegte Restaurant-spezifische Diagnose fuer Reads, Latenzen, Fehlerraten und Hosts.

`P Performance-Budgets`: rot

- Keine definierten SLOs/SLIs oder Budgets fuer Zeit, JS-Groesse oder DB-Kosten.

`Q Queues / Entkopplung`: gelb

- Order -> Waiter Notification ist trigger-basiert entkoppelt.
- Darueber hinaus fehlen sichtbare Queues fuer weitere Nebenwirkungen.

`R Rate Limits`: rot

- Kein belegter Missbrauchsschutz fuer öffentliche HTTP-Endpoints, Uploads und Logins.

`S Security`: gelb

- Starke Rules-Basis.
- Gleichzeitig harte Produktionsluecken durch Default-Passwort und alte offene Media-Endpoints.

`T Testing`: gelb

- Heart/Playwright ist eine starke Basis fuer Smoke und Rollenfluesse.
- Rules-Tests, Lasttests und echte CI-Gates fuer jede Produktionsaenderung fehlen.

`U Update-Sicherheit`: gelb

- Versionierte Assets und ein Rollback-Beispiel in `docs/social-only-finalization-plan.md` sind positiv.
- Ein allgemeiner Release-/Rollback-/Flag-Prozess ist noch nicht abgeschlossen.

`V Versionierung und Deploy-Disziplin`: gelb

- Asset-Versionierung ist da.
- Interne Release-Notizen, feste Deploy-Reihenfolge und Risiko-Rollout sind nicht durchgaengig dokumentiert.

`W Wartbarkeit`: gelb

- Refactor-Fortschritt ist real.
- Mehrere zentrale Koordinatoren sind noch zu groß fuer entspanntes schnelles Aendern.

`X Redundanz bei kritischen Flows`: gelb

- Einige Flows haben Trigger, lokale UI-Safeguards und Heart-Pruefungen.
- Eine durchgehende Wiederholungs- und Rekonstruktionsstrategie fehlt.

`Y Your numbers`: rot

- Die benoetigten Zielzahlen sind im Repo nicht festgelegt.

`Z Zentrale Betriebs-Checkliste`: rot

- Kein finales gruenes Go-Live-Checklist-Dokument fuer Massenwerbung sichtbar.

## Nicht verhandelbar vor Massenwerbung

Diese Punkte muessen vor groesserem bezahltem Traffic auf gruen stehen:

1. Hartcodiertes Lead-Standardpasswort entfernen.
2. Legacy-Media-Endpoints schliessen oder voll authentifizieren.
3. Monitoring, Error Reporting und Alarmierung fuer kritische Flows aktivieren.
4. Backup-Job und Restore-Runbook dokumentieren und testweise ausfuehren.
5. Rate Limits / Abuse-Schutz fuer öffentliche Endpoints aktivieren.
6. Order-Flow serverseitig idempotent machen.
7. Read-/Write-/Listener-Zahlen pro Hauptflow messen.
8. Lasttests fuer Menu, Order und Waiter fahren.
9. Hotspot-Audit fuer Social-Counter und Order-Dokumente machen.
10. Release-/Rollback-Prozess mit klarer Checkliste festziehen.

## Priorisierte Reihenfolge 1-30

### Phase 0 - Sofort blockierende Risiken

1. `LEAD_SOCIAL_DEFAULT_PASSWORD` komplett entfernen und durch Invite-/Reset-Flow ersetzen.
2. `getStreamUploadSignature`, `getStreamUploadSignatureHttp` und `uploadStoryImage` absichern oder abschalten.
3. Fuer alle kritischen Functions strukturierte Logs mit `requestId`, `restaurantId`, `userId`, `flow` und `status` einfuehren.
4. Alarmset definieren: Order save fail, waiter notify fail, Function 5xx, Login spike, Firestore spend/read spike.
5. Frontend-Fehlererfassung fuer Social und Waiter einfuehren.
6. Cloud Error Reporting / Logging sauber fuer Functions verdrahten.
7. Rate Limits oder App Check fuer öffentliche HTTP-Functions und Upload-Tickets einbauen.
8. Login-Missbrauchsschutz fuer Social und Waiter definieren.
9. Backup-Ziel, Frequenz, Aufbewahrung und Verantwortliche festlegen.
10. Restore-Runbook fuer Restaurants, Menu, Orders, User-Relationen schreiben.

### Phase 1 - Kritische Betriebsreife

11. Test-Restore in isolierter Umgebung durchspielen und dokumentieren.
12. Order-Checkout mit serverseitiger `requestId`/Idempotency-Key-Logik absichern.
13. Statuswechsel bei Orders und weitere kritische Writes idempotent machen.
14. Notification-Schreibpfade auf doppelte Requests und Wiederholungen pruefen.
15. Live-vs-cache-vs-on-demand-Matrix fuer Feed, Menu, Profile, Orders, Waiter, CRM und Discovery schreiben.
16. Pro Hauptseite echte Read-/Write-/Listener-Zahlen messen und dokumentieren.
17. Heart-Summary und Incidents um echte produktive Betriebsmetriken ergaenzen oder an externes Monitoring anbinden.
18. Performance-Budgets fuer Startseite, Menu, Order bestaetigen.
19. Release-Checklist mit Smoke-Test-Gate, Rollback und Feature-Flag-Regeln festziehen.
20. Firestore Rules Tests mit Emulator aufbauen fuer Guest, Owner, Staff, Waiter, CEO.

### Phase 2 - Skalierung und Kostenkontrolle

21. Lasttests fuer 100 gleichzeitige Menu-Aufrufe definieren und fahren.
22. Lasttests fuer 50 gleichzeitige Orders und Waiter-Statuswechsel fahren.
23. Like-/Comment-/Counter-Hotspots unter Last messen.
24. Counter-Strategie fuer virale Objekte ueberpruefen: sharden, materialisieren oder serverseitig aggregieren, falls noetig.
25. Discovery-, CRM-, Chat- und Order-Queries auf Kosten, Indizes und Ramp-up-Risiken pruefen.
26. Externe Runtime-CDNs im Produktionspfad reduzieren: `lucide@latest`, Tailwind-CDN, Leaflet von `unpkg`.
27. Nichtkritische Folgearbeiten in Jobs oder entkoppelte Hintergrundpfade schieben.
28. Pro Restaurant/Kunde Diagnosebasis schaffen: Fehler, Latenz, Host, Ordervolumen, auffaellige Writes.
29. Die groessten Koordinator-Dateien weiter zerlegen, damit riskante Fixes schneller und sicherer werden.
30. Eine zentrale Go-Live-Checkliste anlegen, die vor Massenwerbung komplett gruen sein muss.

## Konkrete Repo-Belege fuer die wichtigsten Aussagen

`Sicherheits- und Berechtigungsbasis`

- `firestore.rules` hat Default-Deny und differenzierte Rollen-/Restaurant-Regeln.
- Gleichzeitig erlaubt die Rules-Datei Counter-Only-Updates fuer Social-Counter.

`Caching und Startup`

- `vercel.json` setzt no-cache auf App-Shells und immutable auf statische Assets.
- `shared/firebase-config.js` aktiviert Firestore `persistentLocalCache(...)`.
- `apps/menyra-social/sw.js` nutzt `staleWhileRevalidate` und `networkFirst`.
- `functions/index.js` setzt fuer `socialBootstrapFeed` einen kurzen Cache-Header.
- `apps/menyra-social/social-app.js` definiert lokale Cache-TTLs fuer Feed, Posts, Restaurants, Stories, Staff und CRM-Seiten.

`Monitoring-Luecken`

- `apps/menyra-social/social-app.js` meldet kritische Runtime-Probleme nur ueber `console.warn`.
- `apps/waiter/waiter-app.js` nutzt fuer Login und Orders lokal `console.error`.
- `functions/heart/providers.js` fuehrt einen Sentry-Adapter als `not_configured` / Platzhalter.

`Idempotenz- und Hotspot-Risiko`

- `apps/menyra-social/core/orders/orders-runtime-controller.js` schreibt Orders mit neuer Auto-ID.
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js` incrementiert `likesCount` / `commentsCount` auf mehreren gemeinsamen Doks.
- `functions/index.js` nutzt bei Waiter-Notifications immerhin stabile Notification-IDs pro `orderId`.

`Tests`

- `tests/mnyra-heart-runner/package.json` definiert Smoke-, Business-, Staff-, User-, Guest-, Mutation- und Full-Platform-Packs.
- `.github/workflows/mnyra-heart-smoke.yml` und `.github/workflows/mnyra-heart-synthetic.yml` fuehren diese Packs aus.
- Rules-Tests und Lasttests sind im Repo nicht sichtbar.

`Bereichsgrenzen`

- `vercel.json` trennt `/social`, `/waiter` und `/heart`.
- `apps/mnyra-heart/README.md` beschreibt Heart klar als CEO-only Control Center.

## Definition of Done fuer "bereit fuer Massenwerbung"

Vor einem groesseren Werbeschub sollte folgendes gruene Pflichtset stehen:

- kritische Alarme laufen produktiv und wurden testweise ausgeloest
- Frontend- und Function-Fehler sind zentral sichtbar
- Restore-Runbook existiert und ein Test-Restore wurde erfolgreich gefahren
- öffentliche Legacy-Endpoints sind geschlossen oder korrekt gesichert
- Login und öffentliche HTTP-Functions haben Missbrauchsschutz
- Order-Flow ist serverseitig idempotent
- Read-/Write-/Listener-Zahlen fuer Hauptflows sind bekannt
- mindestens ein dokumentierter Loadtest fuer Menu, Order und Waiter ist bestanden
- Rules-Tests und Heart-Smokes sind Teil des Release-Gates
- Rollback-Prozess ist dokumentiert und schnell ausfuehrbar
- pro Restaurant/Kunde ist Fehler- und Lastdiagnose moeglich

## Klare Endaussage

Dieses Repo ist nicht "zu klein", sondern operativ noch zu offen.

Die Basis reicht, um auf Betriebsreife hochzuziehen. Aber Massenwerbung ohne die Punkte oben waere kein kontrolliertes Wachstum, sondern ein Blindflug.

Der groesste echte Engpass ist nicht der sichtbare Feature-Code, sondern:

- fehlende Messung
- fehlende Alarmierung
- fehlende Wiederherstellung
- fehlende Rate-Limits und Idempotenz auf kritischen Pfaden

Wenn diese Schicht steht, ist die Plattform wesentlich naeher an belastbarem Wachstum als es jeder weitere Oberflaechen-Fix allein bringen wuerde.
