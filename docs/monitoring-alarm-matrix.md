# Monitoring And Alarm Matrix

Stand: 2026-03-23

Dieses Dokument setzt `Ticket 06` um. Es definiert die Alarm-Matrix fuer kritische Produktionspfade, das Incident-Modell fuer Heart und die spaetere Anbindung an echte Cloud-Alarme.

## Ziel

- kritische Fehler nicht nur loggen, sondern als betrieblichen Alarm behandeln
- Heart-Incidents, Function-Logs und Smoke-/Synthetic-Runs in ein gemeinsames Modell bringen
- klar festlegen, was spaeter in GCP/Vercel/Billing live alarmieren muss

## Alarm-Grundsaetze

1. Nicht jeder Fehler ist ein Alarm.
2. Alarme gelten nur fuer produktionskritische Pfade oder fuer klare Kosten-/Verfuegbarkeitsrisiken.
3. Ein Alarm braucht immer:
   - eine technische Quelle
   - einen Schwellenwert oder ein hartes Fehlerkriterium
   - eine Severity
   - eine erste Reaktion
4. Heart ist hier das Incident-Backlog und die Sichtflaeche, nicht die eigentliche Cloud-Alert-Engine.

## Severity-Modell

| Severity | Bedeutung | Reaktionsziel |
| --- | --- | --- |
| `critical` | akuter Produktionsschaden oder harter Ausfall eines Kernflows | sofort pruefen, innerhalb von 5-15 Minuten |
| `warning` | degradierter Zustand, erhoehte Fehlerrate oder Vorstufe zu Schaden | same day pruefen |
| `info` | beobachtbar, aber nicht sofort stoerend | bei naechstem Betriebsblock einplanen |

Heart-Incidents sollen dazu diese Felder nutzen:

- `source`
- `module`
- `severity`
- `title`
- `message`
- `status`
- `environment`
- `build`
- `actor`
- `artifactLinks`
- `meta`

## Alarm-Matrix

| Alarm | Quelle | Detektion | Schwellwert / Trigger | Severity | Heart source/module | Erste Reaktion |
| --- | --- | --- | --- | --- | --- | --- |
| Order save fail | Client-Checkout, serverseitiger Order-Endpunkt spaeter, Firestore-Write-Fehler | Runtime-Reporter, Function-Error-Logs, Heart synthetic pack | jeder verifizierte Speicherausfall im Checkout oder > 2 Fehler in 5 Min fuer dasselbe Restaurant | `critical` | `runtime` / `orders` | Checkout pruefen, betroffene Restaurants und letzte Deploys checken |
| Waiter notify fail | `notifyWaiterOnRestaurantOrderCreate` | strukturierte Function-Logs, Error Reporting, Heart incident | jeder Trigger-Fehler oder jede nicht zugestellte Notification nach erfolgreicher Order | `critical` | `function` / `waiter-notify` | Trigger-Logs pruefen, betroffene Order-IDs sichern, Wiederholung vorbereiten |
| Login spike | Login-UI, Auth-Fehler, HTTP/Auth-Pfade | Fehlerzaehler im Frontend, Auth-/Function-Logs, Host-/Route-Monitoring | Fehlerrate > 5 Prozent ueber 10 Minuten oder plötzlicher Peak pro Host | `critical` | `runtime` / `auth` | Regression, Abuse oder Provider-Stoerung pruefen |
| Function 5xx spike | HTTP-Functions und callable Functions | Cloud Error Reporting, Logs-based Metrics, Heart incident bei kritischen Pfaden | 5xx-Rate ueber Baseline oder wiederholte Fehler in einem Kernflow | `critical` | `function` / `http` | betroffene Function, Build, Region und letzte Aenderungen pruefen |
| Firestore read spike | Firestore Usage, Billing, ggf. App-Messung | Billing-Dashboard, Usage-Metriken, spaetere Flow-Messung | starker Sprung ueber erwartete Baseline pro Stunde/Tag | `warning` | `cost` / `firestore-reads` | Route/Host/Feature eingrenzen, Listener und Query-Pfade pruefen |
| Firestore write spike | Firestore Usage, Billing, Write-Flow-Messung | Billing-Dashboard, strukturierte Flow-Metriken | ploetzlicher Write-Anstieg oder Drift bei Orders, Likes, Notifications | `warning` | `cost` / `firestore-writes` | Ursache pro Flow eingrenzen, Hotspot- oder Retry-Schleifen pruefen |
| Push delivery fail | `sendWebPushOnNotificationCreate` | Function-Logs, Cleanup-Fehler, Heart incident | wiederholte Dispatch-Fehler in engem Zeitfenster | `warning` | `function` / `push` | Provider-/Token-Problem abgrenzen |
| Media ticket fail | `issueMediaActionTicket` | strukturierte Function-Logs, Uploader-Reporter | Ausfaelle ueber Baseline oder kompletter Ticket-Ausfall | `warning` | `function` / `media-ticket` | Upload-Blockade pruefen, TTL/Auth-Pfad kontrollieren |
| Smoke run failed | Heart smoke workflow | Heart Run Report -> Heart Incident | jeder fehlgeschlagene Smoke-Lauf auf `main` | `warning` | `smoke` / `heart-smoke` | Regression eingrenzen, Deploy-Freigabe stoppen |
| Synthetic run failed | Heart synthetic workflow | Heart Run Report -> Heart Incident | jeder fehlgeschlagene Synthetic-Lauf fuer Release oder harte Probe | `critical` | `synthetic` / `heart-synthetic` | Release stoppen, Failure-Artefakte und Timeline pruefen |
| Runtime error spike per host | Social/Waiter Runtime Reporter | `window.__MNYRA_RUNTIME_ERROR_STORE__`, spaetere Weiterleitung, Host-Auswertung | auffaelliger Anstieg fuer einen Host oder Kundenbereich | `warning` | `runtime` / `client` | betroffene Route, Host, Persona und Browser eingrenzen |

## Heart-Incident-Modell

Heart hat bereits:

- Runs
- Reports
- Incidents
- Modulansicht
- GitHub-/Smoke-/Synthetic-Kontext

Das Incident-Modell soll daher so genutzt werden:

1. Smoke-/Synthetic-Fehler erzeugen direkt Heart-Incidents.
2. Kritische Runtime- oder Function-Fehler erzeugen spaeter ebenfalls Heart-Incidents oder werden in Heart gespiegelt.
3. Jeder Incident soll mindestens enthalten:
   - `source`: `runtime`, `function`, `smoke`, `synthetic`, `cost`
   - `module`: z. B. `orders`, `waiter-notify`, `auth`, `push`, `media-ticket`
   - `severity`: `critical`, `warning`, `info`
   - `status`: `open`, spaeter `resolved`
   - `environment`: `production`, `staging`
   - `build`: Commit-SHA oder Release
   - `meta`: `restaurantId`, `orderId`, `host`, `route`, `requestId`, `userId` soweit vorhanden

## Was in Ticket 08 live geschaltet werden muss

Diese Matrix ist bewusst repo-seitig formuliert. Fuer echte Produktion fehlen noch die Live-Alarme:

1. GCP Logs-based Metrics fuer:
   - `waiter.order.notification`
   - `push.notification.dispatch`
   - `media.ticket`
   - spaeter serverseitiger `orders.checkout`
2. Cloud Error Reporting fuer Functions
3. Billing-/Usage-Alerts fuer Firestore Reads/Writes
4. Vercel-/Host-Auswertung fuer Host-, Route- und Referrer-Spitzen
5. Optional Heart-Webhooks oder Incident-Spiegelung fuer kritische Cloud-Alerts

## Verbindung zu Tests, Lasttests und Monitoring

### Tests

- Smoke-Tests pruefen, ob die Kernpfade ueberhaupt noch funktionieren.
- Synthetic-Tests pruefen Ende-zu-Ende-Flows ueber Social, Waiter und Heart.
- Rules-Tests pruefen, ob Security-/Rollenpfade nicht versehentlich Alarme durch kaputte Rechte erzeugen.

### Lasttests

- Lasttests validieren nicht nur Performance, sondern auch die Alarm-Schwellen.
- Beispiel: 50 parallele Orders duerfen keine `waiter-notify`-Incidents und keine unkontrollierten Write-Spikes ausloesen.
- Beispiel: 100 parallele Menu-Aufrufe duerfen keine ungeplanten Firestore-Read-Spitzen erzeugen.

### Monitoring

- Monitoring misst den Dauerzustand.
- Smoke/Synthetic pruefen gezielt.
- Lasttests pruefen Grenzbereiche.
- Alle drei zusammen bilden erst die echte Betriebsreife.

## Naechste direkte Folgeschritte

1. `Ticket 08`: GCP/Vercel/Billing-Alarme gegen diese Matrix live schalten.
2. `Ticket 10`: Backup-Strategie und Restore-Pfade betriebsfaehig dokumentieren.
3. `Ticket 14`: serverseitige Order-Idempotenz schaffen, damit `Order save fail` sauber messbar und wiederholbar wird.
