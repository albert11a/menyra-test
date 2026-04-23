# Monitoring And Logging Runbook

Stand: 2026-03-23

Dieses Dokument setzt `Ticket 07` um. Es beschreibt den Betreiberablauf fuer Logging, Error Reporting, Heart-Incidents, Smoke-/Synthetic-Runs und die spaetere Live-Alarmierung.

Es baut auf:

- `docs/monitoring-alarm-matrix.md`
- `docs/critical-write-flow-inventory.md`
- `functions/logging.js`
- `shared/runtime-error-reporter.js`

## Ziel

- bei kritischen Vorfaellen nicht improvisieren
- eine feste Reihenfolge fuer Triage, Eskalation und Freigabe haben
- Heart, Functions, Runtime-Fehler und Cloud-Monitoring in einen gemeinsamen Betriebsablauf bringen

## Fuehrende Signale

1. Heart-Runs und Heart-Incidents
2. strukturierte Function-Logs
3. Cloud Error Reporting und spaetere logs-based Metrics
4. Runtime-Fehler aus Social und Waiter
5. Billing-/Usage-Signale fuer Firestore Reads/Writes

Regel:

- Wenn Heart und Cloud-Signale widersprechen, ist zuerst der produktive Kernflow fuehrend.
- Ein gruener Smoke-Run hebt keinen echten Produktionsfehler auf.
- Ein einzelner Clientfehler ist noch kein Incident, eine reproduzierbare Cluster-Stoerung schon.

## Pflichtfelder fuer die Analyse

Jeder kritische Vorfall soll moeglichst diese Informationen zusammenziehen:

- `build` oder Commit-SHA
- `environment`
- `host`
- `route`
- `restaurantId`
- `orderId`
- `requestId`
- `userId`
- Zeitpunkt des ersten Fehlers
- Zeitpunkt des letzten erfolgreichen Laufs vor dem Fehler

## Triage-Ablauf

### 1. Eingang bestaetigen

- Alarmquelle notieren: Heart, Function-Log, Runtime, Billing, Smoke, Synthetic
- Severity pruefen: `critical`, `warning`, `info`
- Betroffenen Kernflow benennen: `orders`, `waiter-notify`, `auth`, `push`, `media-ticket`, `client`

### 2. Schaden eingrenzen

- Ist ein Kernflow fuer echte Nutzer kaputt oder nur degradiert?
- Ist nur ein Host / Restaurant / Kunde betroffen oder die ganze Plattform?
- Ist die Stoerung laufend oder schon vorbei?
- Gibt es eine direkte Auswirkung auf Orders, Login, Uploads oder Waiter-Signale?

### 3. Letzte Aenderung pruefen

- letzte Commits auf `main`
- letzter Deploy
- letzter gruener Smoke-Run
- letzter gruener Synthetic-Run

### 4. Artefakte sichern

- relevante Heart-Incidents
- Failure-Details aus Heart-Reports
- strukturierte Function-Logs
- betroffene Dokument-IDs oder Order-IDs
- Screenshots, JSON-Reports oder Run-Artefakte

### 5. Entscheidung treffen

- `critical`: Rollback, Hotfix oder Traffic-Stopp pruefen
- `warning`: weiter beobachten, begrenzen, gezielt fixen
- `info`: dokumentieren und in naechsten Betriebsblock ziehen

## Standard-Reaktion pro Alarmtyp

### Order save fail

- sofort `critical`
- letzte betroffene Order-ID, Restaurant-ID, Host und Build sichern
- prüfen, ob nur Save fehlschlägt oder ob Dubletten entstehen
- wenn reproduzierbar: Checkout-Freigabe stoppen und Deploy-/Rollback entscheiden

### Waiter notify fail

- Order-Speicherung gegen Waiter-Notification abgleichen
- prüfen, ob Bestellungen da sind, aber kein Signal angekommen ist
- Funktion-Logs fuer `waiter.order.notification` prüfen
- wenn Kernrestaurant betroffen ist: als `critical` behandeln

### Login spike

- Host und Route prüfen
- unterscheiden zwischen Regression, Abuse und Provider-Problemen
- wenn mehrere Hosts gleichzeitig kippen: globale Stoerung annehmen
- wenn nur ein Host kippt: tenant- oder domain-spezifisch eingrenzen

### Function 5xx spike

- betroffene Function, Region, Build und Zeitfenster festhalten
- prüfen, ob dieselbe Ursache mehrere Flows trifft
- bei HTTP-Kernpfad sofort Smoke/Synthetic gegen die betroffenen Flows gegenprüfen

### Firestore read/write spike

- betroffene Stunde / Route / Flow eingrenzen
- Live-Listener, Query-Schleifen, Retry-Schleifen oder Spam vermuten
- keine vorschnelle Entwarnung, nur weil keine Userbeschwerde vorliegt

### Smoke run failed

- Deploy-Freigabe anhalten
- Failure-Details und Artefakte prüfen
- wenn der Fehler einen Kernflow trifft, nicht auf gut Glueck weiter deployen

### Synthetic run failed

- als Release-Blocker behandeln
- Heart-Artefakte, Timeline und Failure-Details sichern
- nur mit klarer Fehlerursache oder Rollback weiterarbeiten

## Eskalationslogik

| Lage | Aktion |
| --- | --- |
| `critical` Kernflow-Ausfall | keine weitere riskante Ausrollung, Hotfix oder Rollback vorbereiten |
| `warning` mit steigendem Trend | Betreiber beobachten lassen, Folgealarm vorbereiten, Ticket hochziehen |
| `info` ohne Nutzerwirkung | dokumentieren und in naechste planbare Welle ziehen |
| Smoke rot, Produktion gruen | Smoke-Problematik isolieren, aber noch kein Produktionsincident |
| Smoke gruen, Produktion rot | Produktionsincident bleibt fuehrend, nicht vom Testgruen blenden lassen |

## Deploy-Gate

Vor jedem riskanten Deploy:

1. letzter Smoke-Run gruen
2. keine offenen `critical` Heart-Incidents
3. keine laufende Function-5xx-Spitze
4. kein ungeklärter Firestore-Read/Write-Spike
5. fuer Order-/Waiter-relevante Aenderungen: betroffene Flows gezielt pruefen

Nach jedem riskanten Deploy:

1. Heart-Smoke laufen lassen
2. erste 15-30 Minuten Function-Logs beobachten
3. Runtime-Fehlersignale und Host-Verteilung beobachten
4. bei Order-/Waiter-/Login-Aenderungen aktiv die Alarm-Matrix gegenpruefen

## Quellen pro Bereich

### Heart

- Fuehrend fuer Smoke, Synthetic, Incidents, Reports und Failure-Artefakte
- Besonders wichtig bei Release-Entscheidungen

### Functions

- Fuehrend fuer serverseitige Fehler, Trigger-Ausfaelle und HTTP-Fehler
- Strukturierte Log-Felder aus `functions/logging.js` sind der Primärpfad fuer Triage

### Runtime

- Fuehrend fuer echte Client-Probleme, die serverseitig nicht sichtbar sind
- `shared/runtime-error-reporter.js` ist aktuell die Sammelstelle
- spaeter an Heart oder ein dediziertes Error-Ziel anbinden

### Billing und Usage

- Fuehrend fuer Kosten- und Lastanomalien
- relevant fuer Read-/Write-Spikes auch dann, wenn User noch nichts melden

## Verknuepfung mit Tests und Lasttests

### Tests

- Smoke ist das schnelle Deploy-Gate.
- Synthetic prueft breite Ende-zu-Ende-Flows.
- Rules-Tests vermeiden Fehlalarme durch kaputte Rechte.

### Lasttests

- Lasttests dienen nicht nur Geschwindigkeit, sondern pruefen auch Alarm-Schwellen.
- Jeder Lasttestlauf soll danach mit Heart, Function-Logs und Billing-/Usage-Signalen abgeglichen werden.
- Ein Lasttest gilt nur dann als sauber, wenn keine unerwarteten `critical` oder `warning`-Signale entstehen.

## Was in Ticket 08 live umzusetzen ist

1. logs-based Metrics in GCP aus den strukturierten Function-Logs bauen
2. Error Reporting aktiv als Betreiberquelle nutzen
3. Billing-/Firestore-Usage-Alerts scharf schalten
4. Vercel-/Host-Diagnose verbindlich in den Ablauf aufnehmen
5. optional Heart-Incident-Spiegelung fuer kritische Cloud-Alerts anbinden

## Naechste direkte Folgeschritte

1. `Ticket 08`: Cloud-Alarme und Dashboards gegen dieses Runbook live schalten.
2. `Ticket 10`: Backup-Strategie festlegen.
3. `Ticket 11`: Restore-Runbook schreiben.
4. `Ticket 12`: Secret-, Env- und Infra-Matrix vervollstaendigen.
