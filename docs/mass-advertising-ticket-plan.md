# Mass Advertising Ticket Plan

Stand: 2026-03-23

Dieses Dokument uebersetzt `docs/mass-advertising-finish-plan.md` in eine konkrete Ticketliste 01-30.

Ziel:

- klare Reihenfolge
- klare Ownership
- realistische Aufwandsschaetzung
- sichtbar machen, was ich direkt im Repo uebernehmen kann und wo du echte Infra-/Cloud-Zugriffe brauchst

## Aktueller Umsetzungsstand

- `01-05` sind im Repo umgesetzt.
- Stand der Umsetzung: Commit `91f99cd` auf `main`.
- Bereits geliefert: Lead-Standardpasswort entfernt, Legacy-Media-Endpoints gehaertet, kritische Write-Flow-Inventarisierung, strukturierte Function-Logs, Frontend-Runtime-Fehleradapter fuer Social und Waiter.
- Noch offen: `06-30`
- Naechster sinnvoller Block: `06`, `07`, `10`, `11`, `12`

## Vorbemerkung zu "machbar" und "Credits"

Ja, das ist bei euch machbar.

Aber:

- nicht als ein einzelner Monster-Patch
- nicht komplett nur im Repo
- nicht ohne echte Cloud-/Secrets-/Billing-/Monitoring-Zugriffe

Ich kann den groessten Teil der Repo-Arbeit direkt fuer dich umsetzen.
Ich kann aber nicht allein in deinem Namen produktive GCP-, Vercel- oder Billing-Konfigurationen fertigschalten, wenn dafuer echte Rechte, Secrets oder Live-Freigaben noetig sind.

## Ownership-Legende

`Codex`

- ich kann das im Repo direkt bauen, pruefen und dokumentieren

`Joint`

- ich kann Code, Doku, Skripte und exakte Schrittfolgen vorbereiten
- du musst Secrets, Cloud-Rechte, Billing- oder Live-Freigaben liefern

`User/Infra`

- das ist hauptsaechlich Cloud-/Projekt-Konfiguration ausserhalb des Repo
- ich kann dir dafuer Runbooks und exakte Befehle vorbereiten

## Aufwand-Legende

Aufwand wird hier als Arbeits-Sessions geschaetzt, nicht als falsche exakte Credit-Zahl.

Eine Session bedeutet:

- ein substanzieller Arbeitsblock mit Analyse, Aenderung, Verifikation und Nachschleife

Baender:

- `XS` = 0.25 bis 0.5 Sessions
- `S` = 0.5 bis 1 Session
- `M` = 1 bis 2 Sessions
- `L` = 2 bis 4 Sessions
- `XL` = 4 bis 7 Sessions

Wichtiger Credit-Hinweis:

- Ich sehe deinen Tarif und dein Credit-Modell hier nicht.
- Deshalb gebe ich dir eine belastbare Arbeitsmengen-Schaetzung und eine Umrechnungsformel statt erfundener Fantasiezahlen.

Umrechnungsformel:

- `geschaetzte Credits = geschaetzte Sessions x dein durchschnittlicher Credit-Verbrauch pro starker Codex-Session`

Beispiel:

- wenn dein Durchschnitt `1 Credit` pro starker Session ist:
  - Baseline-Programm: ca. `18 bis 30 Credits`
  - Vollprogramm: ca. `45 bis 75 Credits`
- wenn dein Durchschnitt `2 Credits` pro starker Session ist:
  - Baseline-Programm: ca. `36 bis 60 Credits`
  - Vollprogramm: ca. `90 bis 150 Credits`

Diese Werte sind nur eine Umrechnungshilfe.
Nicht enthalten:

- GCP-Kosten
- Vercel-Kosten
- Firestore-/Functions-/Storage-/Monitoring-Kosten

## Empfohlene Programmvarianten

### Variante A: Werbe-sicherer Baseline-Block

Tickets:

- `01-12`

Ziel:

- groesste Produktionsrisiken schliessen
- keine offene Sicherheitsluecke
- minimale Monitoring-/Restore-/Release-Basis schaffen

Geschaetzter Aufwand:

- `18 bis 30 Sessions`

### Variante B: Volles Betriebsreife-Programm

Tickets:

- `01-30`

Ziel:

- belastbare Plattform fuer groessere Kampagnen
- Sicherheit, Stabilitaet, Messbarkeit, Last und Rollback sauber zusammenziehen

Geschaetzter Aufwand:

- `45 bis 75 Sessions`

## Ticketliste 01-30

### Wave 0 - Sofort blockierende Risiken

#### Ticket 01 - Lead-Standardpasswort entfernen

- Status: `erledigt` am `2026-03-23`
- Outcome: `LEAD_SOCIAL_DEFAULT_PASSWORD` ist komplett aus Produktivpfaden entfernt.
- Scope: `apps/menyra-social/social-app.js`, `core/crm/*`, `core/leads/*`, `_shared/crm-lazy-renderers.js`
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: keine

#### Ticket 02 - Legacy-Media-Endpoints schliessen oder absichern

- Status: `erledigt` am `2026-03-23`
- Outcome: `getStreamUploadSignature`, `getStreamUploadSignatureHttp` und `uploadStoryImage` sind entweder deaktiviert oder sauber abgesichert.
- Scope: `functions/index.js`, beteiligte Client-Pfade
- Owner: `Codex`
- Aufwand: `M-L`
- Abhaengigkeiten: Ticket `12`

#### Ticket 03 - Kritische Schreibpfade inventarisieren

- Status: `erledigt` am `2026-03-23`
- Outcome: komplette Liste aller kritischen Write-Flows mit Pfad, Risiko, Idempotenz-Status und Alarmbedarf.
- Scope: Doku unter `docs/`
- Owner: `Codex`
- Aufwand: `S`
- Abhaengigkeiten: keine

#### Ticket 04 - Strukturierte Function-Logs einfuehren

- Status: `erledigt` am `2026-03-23`
- Outcome: wichtige Functions loggen einheitlich `flow`, `requestId`, `restaurantId`, `userId`, `status`, `errorCode`.
- Scope: `functions/index.js`, `functions/heart/*`, ggf. gemeinsame Helper
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `03`

#### Ticket 05 - Frontend-Fehleradapter fuer Social und Waiter

- Status: `erledigt` am `2026-03-23`
- Outcome: Social und Waiter haben einen zentralen Runtime-Fehleradapter statt verteilter `console.error`-Only-Behandlung.
- Scope: `apps/menyra-social/*`, `apps/waiter/*`
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `03`

#### Ticket 06 - Alarm-Matrix und Incident-Modell festziehen

- Outcome: definierte Alarmtypen fuer Order save fail, waiter notify fail, login spike, Function 5xx, Kosten-/Read-Spike.
- Scope: Doku plus Heart-Incident-Modell falls genutzt
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `03`, Ticket `04`

#### Ticket 07 - Monitoring- und Logging-Runbook schreiben

- Outcome: klares Runbook fuer Logging, Error Reporting, Alarme und Eskalation.
- Scope: `docs/`
- Owner: `Codex`
- Aufwand: `S`
- Abhaengigkeiten: Ticket `06`

#### Ticket 08 - Cloud-Alarme und Dashboards anlegen

- Outcome: produktive Alarme und Dashboards in GCP/Vercel/Billing sind aktiv.
- Scope: Cloud-Konfiguration ausserhalb Repo, optional Skripte/Runbook im Repo
- Owner: `Joint`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `06`, Ticket `07`

#### Ticket 09 - Login- und Endpoint-Missbrauchsschutz

- Outcome: Schutzkonzept fuer Login, Upload-Tickets und oeffentliche HTTP-Functions ist umgesetzt.
- Scope: `functions/*`, ggf. Client, ggf. externer Edge-/Proxy-Pfad
- Owner: `Joint`
- Aufwand: `M-L`
- Abhaengigkeiten: Ticket `02`, Ticket `12`

#### Ticket 10 - Backup-Strategie dokumentieren

- Outcome: entschieden ist, was wie oft exportiert wird und wie lange es aufbewahrt wird.
- Scope: `docs/`
- Owner: `Codex`
- Aufwand: `S`
- Abhaengigkeiten: keine

#### Ticket 11 - Restore-Runbook schreiben

- Outcome: dokumentierter Restore-Ablauf fuer Restaurants, Menu, Orders, Nutzerbeziehungen.
- Scope: `docs/`
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `10`

#### Ticket 12 - Secret-, Env- und Infra-Matrix

- Outcome: saubere Uebersicht aller benoetigten Secrets, Service-Accounts, Env-Variablen und Verantwortlichkeiten.
- Scope: `docs/`
- Owner: `Codex`
- Aufwand: `S`
- Abhaengigkeiten: keine

### Wave 1 - Kritische Betriebsreife

#### Ticket 13 - Order-Idempotenzmodell entwerfen

- Outcome: klarer Entwurf fuer `clientRequestId` oder `idempotencyKey` plus Lebenszyklus.
- Scope: `docs/` und vorbereitende Codeaenderung
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `03`

#### Ticket 14 - Order-Checkout serverseitig idempotent machen

- Outcome: derselbe Checkout kann nicht mehrfach Schaden anrichten.
- Scope: wahrscheinlich neuer serverseitiger Endpoint plus Client-Anpassung
- Owner: `Codex`
- Aufwand: `L-XL`
- Abhaengigkeiten: Ticket `13`

#### Ticket 15 - Waiter-Notification-Dedupe auditieren

- Outcome: `notifyWaiterOnRestaurantOrderCreate` und Folgepfade sind auf Dubletten und Wiederholungen geprueft.
- Scope: `functions/index.js`, Order-/Notification-Pfade
- Owner: `Codex`
- Aufwand: `S-M`
- Abhaengigkeiten: Ticket `14`

#### Ticket 16 - Notification-Schreibpfade idempotent machen

- Outcome: Notification-Writes und Statuswechsel sind doppelsicher.
- Scope: `apps/menyra-social/core/notifications/*`, `functions/index.js`
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `03`

#### Ticket 17 - Statuswechsel und Nebenwirkungen haerten

- Outcome: kritische Statuswechsel koennen wiederholt aufgerufen werden, ohne inkonsistent zu werden.
- Scope: Orders, Waiter, ggf. CRM/Staff
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `03`, Ticket `14`

#### Ticket 18 - Media-Ticket-Pfad haerten

- Outcome: nur autorisierte Flows bekommen gueltige Media-Tickets, mit klaren TTLs und Audit-Logs.
- Scope: `functions/index.js`, `shared/bunny-edge.js`, Upload-Clientpfade
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `02`, Ticket `04`

#### Ticket 19 - Firestore-Rules-Tests aufbauen

- Outcome: Emulator-basierte Regeln-Tests fuer Guest, Owner, Staff, Waiter, CEO.
- Scope: neues Test-Setup unter `tests/`
- Owner: `Codex`
- Aufwand: `M-L`
- Abhaengigkeiten: keine

#### Ticket 20 - Kritische Smoke-Gates erweitern

- Outcome: Heart-/Playwright-Suites decken die wichtigsten Betriebsrisiken besser ab.
- Scope: `tests/mnyra-heart-runner/*`, `.github/workflows/*`
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `14`, Ticket `16`, Ticket `17`

### Wave 2 - Zahlen statt Gefuehl

#### Ticket 21 - Feed-Messung fuer Reads/Writes/Listener

- Outcome: belastbare Zahlen fuer Feed-Start, Wiederbesuch und Listener.
- Scope: Instrumentierung + Doku
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `04`

#### Ticket 22 - Menu- und Order-Messung

- Outcome: belastbare Zahlen fuer Gast-Menu, Checkout und Business-Menu.
- Scope: Social Menu/Order-Pfade
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `14`, Ticket `21`

#### Ticket 23 - Waiter-Messung

- Outcome: Zahlen fuer Orders live, Statuswechsel und gleichzeitige Sessions.
- Scope: `apps/waiter/*`, ggf. Functions/Docs
- Owner: `Codex`
- Aufwand: `S-M`
- Abhaengigkeiten: Ticket `21`

#### Ticket 24 - Performance-Budgets und SLOs definieren

- Outcome: klare Grenzwerte fuer Startseite, Menu, Order, JS-Groesse und Fehlerquote.
- Scope: `docs/`
- Owner: `Codex`
- Aufwand: `S`
- Abhaengigkeiten: Ticket `21`, Ticket `22`, Ticket `23`

#### Ticket 25 - Kostenkontroll-Modell festlegen

- Outcome: Firestore-/Functions-/Storage-Kostenmodell fuer Hauptflows ist dokumentiert.
- Scope: `docs/`, optional Billing-Dashboard-Schritte
- Owner: `Joint`
- Aufwand: `S-M`
- Abhaengigkeiten: Ticket `21`, Ticket `22`, Ticket `23`

### Wave 3 - Last und Skalierung

#### Ticket 26 - Load-Test-Harness aufbauen

- Outcome: technischer Rahmen fuer Menu-, Order- und Waiter-Lasttests ist vorhanden.
- Scope: neues Lasttest-Setup unter `tests/` oder `scripts/`
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `14`

#### Ticket 27 - Konkrete Lastszenarien fahren

- Outcome: erste belastbare Lastmessungen fuer `100 Menu`, `50 Orders`, parallele Waiter-Sessions.
- Scope: Testumgebung plus Lasttest-Runbook
- Owner: `Joint`
- Aufwand: `L`
- Abhaengigkeiten: Ticket `26`

#### Ticket 28 - Hotspot-Audit und Counter-Strategie

- Outcome: Entscheidung, ob Social-/Menu-Counter so bleiben koennen oder serverseitig/sharded angepasst werden muessen.
- Scope: Social, Menu, Feed, Firestore-Modell
- Owner: `Codex`
- Aufwand: `M-L`
- Abhaengigkeiten: Ticket `27`

### Wave 4 - Release- und Betriebssicherheit

#### Ticket 29 - Release-, Rollback- und Feature-Flag-Prozess

- Outcome: feste Deploy-Reihenfolge, Rollback-Ablauf, Smoke-Gate und Risiko-Freigabeprozess.
- Scope: `docs/`, ggf. Workflows
- Owner: `Codex`
- Aufwand: `M`
- Abhaengigkeiten: Ticket `20`, Ticket `24`

#### Ticket 30 - Finale Go-Live-Checkliste und Dry Run

- Outcome: zentrale Gruenliste fuer Massenwerbung plus einmaliger kompletter Dry Run.
- Scope: `docs/`, Test-/Release-Routine
- Owner: `Joint`
- Aufwand: `S`
- Abhaengigkeiten: Ticket `08`, Ticket `11`, Ticket `19`, Ticket `20`, Ticket `24`, Ticket `27`, Ticket `29`

## Was ich fast komplett fuer dich uebernehmen kann

Diese Tickets kann ich weitgehend direkt im Repo fuehren:

- `01`
- `02`
- `03`
- `04`
- `05`
- `06`
- `07`
- `10`
- `11`
- `12`
- `13`
- `14`
- `15`
- `16`
- `17`
- `18`
- `19`
- `20`
- `21`
- `22`
- `23`
- `24`
- `26`
- `28`
- `29`

## Wo du aktiv gebraucht wirst

Diese Tickets brauchen echte Mitarbeit, Rechte oder Freigaben von dir:

- `08` Cloud-Alarme und Dashboards live schalten
- `09` Missbrauchsschutz auf echter Infra abstimmen
- `25` echte Billing-/Kostenmodelle gegen Live-Daten spiegeln
- `27` Lasttests in geeigneter Umgebung freigeben
- `30` finalen Dry Run und Marketing-Go-Live freigeben

Zusatz:

- fuer manche Teile aus `02`, `14`, `18` brauche ich von dir eventuell Secrets, Projektrechte oder klare Produktentscheidungen

## Empfohlene Reihenfolge fuer dich

Wenn du mit mir jetzt sofort loslegen willst, dann ist die beste Reihenfolge:

1. `01` Lead-Standardpasswort entfernen
2. `02` Legacy-Media-Endpoints haerten
3. `03` Kritische Schreibpfade inventarisieren
4. `04` Strukturierte Function-Logs
5. `10` Backup-Strategie
6. `11` Restore-Runbook
7. `13` Order-Idempotenzmodell
8. `14` Order-Checkout idempotent
9. `19` Firestore-Rules-Tests
10. `20` Smoke-Gates erweitern

Das ist der beste erste Block, weil er:

- echte Risiken schliesst
- nicht zu stark auf externe Cloud-UI blockiert
- die groessten "vor Werbung unnoetig gefaehrlich"-Punkte zuerst erledigt

## Grobe Gesamtabschaetzung

### Baseline-Programm `01-12`

- Repo-Arbeit: `14 bis 22 Sessions`
- Infra-/Freigabe-Arbeit: `4 bis 8 Sessions`
- Gesamt: `18 bis 30 Sessions`

### Harter Sicherheits- und Betriebsblock `01-20`

- Repo-Arbeit: `24 bis 38 Sessions`
- Infra-/Freigabe-Arbeit: `6 bis 10 Sessions`
- Gesamt: `30 bis 48 Sessions`

### Vollprogramm `01-30`

- Repo-Arbeit: `34 bis 56 Sessions`
- Infra-/Freigabe-Arbeit: `11 bis 19 Sessions`
- Gesamt: `45 bis 75 Sessions`

## Klare Empfehlung

Wenn du wirtschaftlich sauber vorgehen willst, dann nicht sofort `01-30`.

Empfohlen:

- zuerst `01-10`
- dann `11-20`
- danach neu bewerten, ob `21-30` vor der grossen Werberunde noch noetig sind oder parallel laufen koennen

Das spart typischerweise Credits, weil:

- fruehe Sicherheits- und Strukturarbeit spaetere Fix-Runden reduziert
- wir nicht blind Monitoring- oder Load-Arbeit fuer noch ungeklaerte Kernpfade machen
- du nach `01-20` schon wesentlich sicherer entscheiden kannst, wie aggressiv du wachsen willst

## Wenn ich das komplett fuer dich fuehren soll

Dann ist die sinnvollste Arbeitsweise:

1. Wir nehmen `01-10` als ersten Delivery-Block.
2. Ich arbeite Ticket fuer Ticket im Repo, mit Tests und Doku.
3. Wo Infra noetig ist, bereite ich dir exakte Schritte, Skripte und Checklisten vor.
4. Nach `01-10` machen wir eine kurze Neubewertung von Aufwand, Credits und Rest-Risiko.

Das ist deutlich effizienter als ein einziges riesiges "mach alles".
