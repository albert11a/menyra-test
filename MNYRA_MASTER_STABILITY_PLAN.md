# MNYRA Master Stability Plan

## Zweck

Diese Datei ist der eine fuehrende Masterplan fuer den naechsten Stabilitaets- und Skalierungsblock.

Sie soll drei Dinge gleichzeitig loesen:

1. alle offenen Restbugs und offenen Risiko-Bereiche in einer Datei sammeln
2. den weiteren Weg in klaren, harten Schritten festlegen
3. verhindern, dass wieder zu viele verstreute Plan- und Notizdateien parallel benutzt werden

## Fuehrende Dokumente ab jetzt

Ab jetzt sollen nur diese zwei Dateien fuer die taegliche Steuerung fuehrend sein:

1. `MNYRA_MASTER_EXECUTION_LOG.md`
2. `MNYRA_MASTER_STABILITY_PLAN.md`

Andere Dateien bleiben nur Referenz:

- `MNYRACASH_FINALE_SENIOR.md`
- `STABILIZATION_NOTES_STEP1_7.md`
- `FINAL_LAUNCH_TEST_MATRIX.md`
- `docs/*`

## Nicht verhandelbare Regeln fuer die weitere Arbeit

1. Keine Fachlogik blind neu bauen.
2. Keine CEO-/Lead-/Customer-/Staff-Logik verschieben, bevor Parity bewiesen ist.
3. Keine "wird schon passen"-Refactors.
4. Jeder Schritt hat:
   - Ziel
   - Scope
   - was nicht veraendert werden darf
   - Done-Kriterien
   - Messkriterien
5. Ein Schritt ist erst fertig, wenn:
   - Code stimmt
   - der passende Test gruen ist
   - kein stiller Seiteneffekt entstanden ist

---

## A. Aktuelle Realitaet

### Was bereits stark verbessert wurde

- Social state drift in zentralen Like-/Kommentar-/Modal-Pfaden wurde reduziert.
- Menue-/Detail-/Bildpfade wurden sichtbar stabiler gemacht.
- Checkout, Upload, Chat und CRM haben heute engere Pending-/Retry-/Repeat-Guards als frueher.
- Search-/Notification-/Deep-Link-Ziele sind konsistenter.
- Session-/Reload-/Scope-Pfade wurden sauberer gemacht.

### Was weiterhin nicht als "fertig und sorgenfrei" gelten darf

- voller Launch-Sign-off ist noch nicht ausgefuehrt
- serverseitige End-to-End-Idempotenz ist nicht durchgaengig belegt
- Monitoring/Alerting ist im Repo gut vorbereitet, aber nicht als komplett live bewiesen
- Lasttests fehlen
- Rules-Tests fehlen
- Cold-start-/Slow-4G-Startgewicht ist noch zu schwer
- globale Render- und Reconcile-Kopplung ist noch groesser als bei sehr reifen Plattformen

---

## B. Open Bug and Risk Inventory

Diese Liste trennt bewusst:

- echte sichtbare Bugs
- offene Korrektheitsrisiken
- offene Performance-/Scale-Risiken
- offene Betriebsluecken

### B-01 - Follower / Following counts sind nicht zentral reconciled
- Typ: `sichtbarer Bug / correctness risk`
- Prioritaet: `hoch`
- Warum offen:
  - `apps/menyra-social/core/chat/chat-runtime-controller.js` mutiert Follow-Counts lokal fuer einzelne sichtbare Profile und schreibt remote Counter hoch.
  - `apps/menyra-social/core/follow/follow-runtime-controller.js` verwaltet Follow-Identitaet, aber nicht eine zentrale Count-Single-Source.
  - `apps/menyra-social/core/profile/public-profile-runtime-controller.js` und Self-/Business-Profile lesen Counts aus Docs oder Fallbacks.
- Konkretes Risiko:
  - Count auf aktiver Profiloberflaeche korrekt, andere Flaechen spaeter/stale
  - Unlike/Unfollow oder Follow-Request-Accept kann nicht ueberall sofort denselben Endzustand zeigen
- Muss spaeter verifiziert oder behoben werden:
  - Self profile
  - public profile
  - business profile
  - modal profile
  - discovery/search cards

### B-02 - Social/Menu counters haben weiter Multi-Source-Charakter
- Typ: `correctness risk / scale risk`
- Prioritaet: `hoch`
- Warum offen:
  - `apps/menyra-social/core/profile/social-engagement-runtime-controller.js` und Support-Controller arbeiten weiter mit lokaler Mutation plus Remote-Reconcile.
  - `apps/menyra-social/core/profile/social-engagement-support-runtime-controller.js:264-271` bildet Menu-Counts ueber `Math.max(rawCount, listLength)`.
- Konkretes Risiko:
  - hoehere alte lokale Werte koennen laenger stehen bleiben
  - Decrement-/Delete-/Unlike-Pfade sind architektonisch fragiler als Increment-Pfade
  - unter Last bleibt Hotspot-/Drift-Risiko

### B-03 - Push-Befund bei falscher Account-Zuordnung ist offen
- Typ: `sichtbarer Bug / security-adjacent bug`
- Prioritaet: `hoch`
- Quelle:
  - bereits dokumentiert in `STABILIZATION_NOTES_STEP1_7.md`
- Beobachtung:
  - Beim Liken eines Business-Status/Post wurde auf dem aktiven PWA-Geraet eine Push-Benachrichtigung gesehen, obwohl nicht mit diesem Business-Account eingeloggt.
- Wahrscheinliche Ursachenklasse:
  - Device token scope
  - owner/session mismatch
  - push target resolution

### B-04 - Chat bubble overflow fuer lange ungebrochene Inhalte ist offen
- Typ: `sichtbarer UI-Bug`
- Prioritaet: `mittel`
- Quelle:
  - `STABILIZATION_NOTES_STEP1_7.md`
- Risiko:
  - horizontales Ausbrechen
  - seitlicher Layout-Shift im Chat

### B-05 - Voller degraded-network-Nachweis fehlt noch
- Typ: `verification gap`
- Prioritaet: `hoch`
- Warum offen:
  - Step 15 ist nur partiell umgesetzt
  - die breite Poor-Network-/Low-End-Pruefung aller Kernflows ist nicht real abgeschlossen

### B-06 - Finaler Launch-Sign-off fehlt
- Typ: `verification gap`
- Prioritaet: `hoch`
- Warum offen:
  - `FINAL_LAUNCH_TEST_MATRIX.md` existiert, ist aber noch nicht komplett real ausgefuellt

### B-07 - Globaler Main-Renderpfad bleibt ein echter Ruhe-/Wartbarkeits-Risikofaktor
- Typ: `performance / maintainability risk`
- Prioritaet: `hoch`
- Evidenz:
  - `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js` nutzt weiter im changed-Fall `appEl.innerHTML = nextHtml`
- Risiko:
  - unnötige DOM-Rebuilds
  - Fokus-/Scroll-/Bildremount-Risiken
  - hoher Regressionseinfluss bei kleinen Aenderungen

### B-08 - Frontend Cold Start ist fuer Slow 4G noch zu schwer
- Typ: `performance risk`
- Prioritaet: `hoch`
- Evidenz:
  - grosses `social-app.js`
  - viele Imports
  - mehrere externe Runtime-Abhaengigkeiten in `apps/menyra-social/index.html`
- Risiko:
  - erster Besuch fuehlt sich deutlich schwerer an als warm cache
  - externe CDN-/Font-/Firebase-Abhaengigkeiten vergroessern Startunsicherheit

### B-09 - Runtime-Fehler sind gesammelt, aber nicht voll zentral betrieben
- Typ: `operational gap`
- Prioritaet: `hoch`
- Evidenz:
  - `shared/runtime-error-reporter.js` sammelt lokal in `window.__MNYRA_RUNTIME_ERROR_STORE__`
  - aber kein sauber belegter produktiver Incident-/Alert-Zielpfad fuer alle Runtime-Fehler
- Risiko:
  - echte Clientprobleme werden zu spaet sichtbar

### B-10 - Sentry / zentrales Error-Ziel ist nicht konfiguriert
- Typ: `operational gap`
- Prioritaet: `mittel`
- Evidenz:
  - `functions/heart/providers.js` fuehrt `sentry-adapter` als `not_configured`

### B-11 - Cloud-Alarme sind als Fachmodell da, aber nicht als live bewiesen
- Typ: `operational gap`
- Prioritaet: `hoch`
- Evidenz:
  - `docs/monitoring-logging-runbook.md`
  - `docs/monitoring-alarm-matrix.md`
  - beide beschreiben Sollzustand, nicht voll bewiesenen Istzustand

### B-12 - Rules-Tests fehlen sichtbar
- Typ: `security / regression gap`
- Prioritaet: `hoch`
- Risiko:
  - gute Firestore-Regeln koennen spaeter still gebrochen werden

### B-13 - App Check / Rate Limits / Missbrauchsschutz fehlen sichtbar
- Typ: `security / cost risk`
- Prioritaet: `hoch`
- Risiko:
  - oeffentliche HTTP-/Upload-/Auth-nahe Pfade bleiben zu offen fuer Missbrauch oder Kostendruck

### B-14 - Lasttests fehlen
- Typ: `scale gap`
- Prioritaet: `hoch`
- Risiko:
  - keine echte Beweisbasis fuer 100 Kunden / hoehere Besuchermengen

### B-15 - Heart-/Playwright-Tests existieren, sind aber noch kein harter alltaeglicher Release-Gate
- Typ: `release-discipline gap`
- Prioritaet: `mittel`
- Evidenz:
  - Workflows existieren
  - aber die taegliche Release-Disziplin muss verankert werden

### B-16 - Kritische Write-Flows brauchen weiter serverseitige Wahrheitsabsicherung
- Typ: `correctness / scale risk`
- Prioritaet: `hoch`
- Evidenz:
  - `docs/critical-write-flow-inventory.md`
  - kritische serverseitige Idempotenz bleibt fuer Kernpfade ein Restthema
- Wichtig:
  - mehrere Client-Pfade wurden bereits verbessert
  - der serverseitige Endzustand ist aber noch nicht ueberall hart abgesichert

---

## C. Zielbild fuer "10/10-Gefuehl"

Nicht mathematisch perfekt, sondern praktisch so stabil, dass man sagen kann:

- Kernflows funktionieren reproduzierbar
- UI fuehlt sich ruhig und klar an
- Slow 4G ist akzeptabel
- Fehler werden sofort sichtbar
- Releases brechen nicht blind alles
- Last und Kosten sind steuerbar
- du musst nicht jeden Tag Feuerwehr spielen

Damit dieser Zustand erreichbar ist, gilt:

- kein blindes Neu-Schreiben
- keine Logikverschiebung ohne Parity
- jedes Paket endet mit einem harten Gate

---

## D. Der Masterplan

### PHASE 1 - Truth and Coverage

#### STEP 1 - Vertraege fuer alle Kernflows festschreiben
- Ziel:
  - fuer jede Kernflaeche klar definieren, was fachlich immer stimmen muss
- Bereiche:
  - Feed
  - Post modal
  - Likes / comments
  - profile
  - menu / menu detail
  - cart / checkout
  - upload / story / feed post
  - chat
  - notifications
  - leads / customers / staff / CEO scope
- Nicht veraendern:
  - keine UI-Neugestaltung
  - keine Fachlogik verschieben
- Done:
  - pro Kernflow klare Invarianten
  - klare "darf nie passieren"-Liste

#### STEP 2 - Die Testwelt isolieren
- Ziel:
  - keine echten Kundendaten oder echten Oberflaechen durch Tests verunreinigen
- Done:
  - CEO / business / staff / user / guest test personas
  - eigene Test-Restaurants / Test-Menues / Test-Posts / Test-CRM-Daten
  - klarer Cleanup-Pfad

#### STEP 3 - E2E-Vertragstests auf den echten Kernflows komplettieren
- Ziel:
  - nicht nur smoke, sondern vertragssichere Kernflow-Pruefung
- Fokus:
  - bestehende Heart-/Playwright-Basis nutzen, nicht ersetzen
- Done:
  - jeder Kernflow hat mindestens einen echten Gruen-/Rot-Check
  - Tests pruefen fachlichen Erfolg, nicht nur sichtbare Seite

#### STEP 4 - Firestore-Rules-Tests aufbauen
- Ziel:
  - Rollen und Rechte nicht nur "sehen gut aus", sondern beweisen
- Done:
  - Guest / user / business / staff / CEO deny/allow Tests

### PHASE 2 - Correctness Hardening

#### STEP 5 - Follower / Following count architecture bereinigen
- Ziel:
  - Follower-/Following-Counts ueber alle Flaechen sauber und gleich
- Muss explizit abdecken:
  - self profile
  - public profile
  - profile modal
  - business profile
  - search/discovery result cards
  - follow request accept path
- Done:
  - Like/Follow-Identitaet und Count-Identitaet sind getrennt, aber sauber reconciled
  - kein stale count bis modal/reload als stiller Normalfall

#### STEP 6 - Restliche Counter- und Reconcile-Hotspots sauber machen
- Ziel:
  - Post-/Menu-/Comment-Counter nicht mehr als fragile Multi-Source-Kette behandeln
- Muss abdecken:
  - unlike
  - delete/comment removal
  - menu counts
  - post counts
  - reply/comment transitions
- Done:
  - keine offensichtlichen Double-Count-/High-watermark-Pfade mehr

#### STEP 7 - Kritische Writes serverseitig final absichern
- Ziel:
  - keine doppelten Bestellungen, keine doppelten kritischen Seiteneffekte, keine halben Zustande
- Fokus:
  - orders
  - waiter notification side effects
  - critical CRM transitions
  - uploads where final publish matters
- Done:
  - serverseitige Replay-Sicherheit fuer Hauptpfade

#### STEP 8 - Push target / session / device token correctness
- Ziel:
  - Push geht immer nur an den fachlich richtigen Zielkontext
- Muss abdecken:
  - falsche PWA-Benachrichtigung
  - account switch
  - stale tokens
  - owner/business mismatch
- Done:
  - Push-Befund aus den offenen Beobachtungen ist sauber geklaert oder behoben

### PHASE 3 - UX and Performance Hardening

#### STEP 9 - Globalen Main-Renderpfad verkleinern
- Ziel:
  - weniger Full-DOM-Rebuilds
- Fokus:
  - feed
  - menu/business profile
  - post modal
  - chat thread
  - crm lists
- Done:
  - zentrale heavy surfaces aktualisieren lokal statt global

#### STEP 10 - Cold Start / Slow 4G Programm
- Ziel:
  - erster Besuch wird deutlich leichter
- Muss abdecken:
  - Bundling / splitting
  - externe Runtime-Abhaengigkeiten reduzieren
  - Fonts/CDN-Pfade beruhigen
  - schwere Admin-/Map-/CRM-Pfade spaeter laden
- Done:
  - messbare Verbesserung auf kaltem Mobile-Start

#### STEP 11 - Bild-/Medienpfad final industrialisieren
- Ziel:
  - ruhige Bilder auf allen Flaechen ohne neue Qualitaetsfehler
- Done:
  - keine grauen Repaints im Normalverhalten
  - klarer Fallback
  - stabile Variantregeln

#### STEP 12 - Chat layout and interaction cleanup
- Ziel:
  - Chat nicht nur logisch, sondern auch visuell robust
- Muss abdecken:
  - Bubble overflow
  - lange ungebrochene Texte
  - attachment/compose stability
- Done:
  - kein horizontaler Break, keine verwirrenden Composer-Zustaende

### PHASE 4 - Observability and Cost Control

#### STEP 13 - Runtime-Fehler zentralisieren
- Ziel:
  - Fehler nicht nur lokal puffern, sondern produktiv einsammeln
- Done:
  - Runtime-Fehler gehen in einen echten Incident-/Monitoring-Pfad

#### STEP 14 - Cloud-Alarme und Heart-Spiegelung live schalten
- Ziel:
  - bei Order-/Push-/Waiter-/Auth-/Client-Ausfall nicht blind sein
- Done:
  - Alarm-Matrix ist nicht nur Dokument, sondern live aktiv

#### STEP 15 - Read-/Write-/Listener-Budgets pro Flow festziehen
- Ziel:
  - minimale Kosten, maximale Vorhersagbarkeit
- Muss abdecken:
  - feed
  - search
  - menu
  - detail
  - likes/comments
  - notifications
  - chat
- Done:
  - jeder wichtige Flow hat Budget und Messung

#### STEP 16 - App Check / Rate Limits / Abuse Schutz
- Ziel:
  - Missbrauch, Bots und unkontrollierte Kosten begrenzen
- Done:
  - App Check sauber eingefuehrt
  - Rate Limits / Abuse-Schutz fuer relevante Pfade aktiv

### PHASE 5 - Release Discipline and Scale Proof

#### STEP 17 - Heart/Playwright als echte Release-Gates verankern
- Ziel:
  - keine riskanten Aenderungen mehr ohne gruenen Kernbeweis
- Done:
  - Smoke/Synthetic/contract tests sind verbindlicher Teil des Release-Prozesses

#### STEP 18 - Die Final Launch Matrix wirklich komplett ausfuehren
- Ziel:
  - Step 16 des alten Plans real abschliessen
- Done:
  - `FINAL_LAUNCH_TEST_MATRIX.md` ist real ausgefuellt und gruen oder mit klaren roten Restpunkten

#### STEP 19 - Echte Lasttests fahren
- Ziel:
  - 100 Kunden / groeßere Besuchermengen nicht schaetzen, sondern messen
- Fokus:
  - feed
  - menu
  - checkout
  - waiter notify
  - push
  - chat
  - likes/comments hotspots
- Done:
  - echte Zahlen fuer Latenz, Fehlerquote, Write-/Read-Spitzen, Kostenwirkung

#### STEP 20 - 30-Tage-Betriebsbeweis
- Ziel:
  - ruhiger Betrieb, nicht nur guter Testtag
- Done:
  - keine wiederkehrenden kritischen Ueberraschungen
  - Monitoring und Release-Prozess tragen den Alltag

---

## E. Harte Guardrails fuer spaetere Umbauten

### E-01 - CRM / CEO / Leads / Customers / Staff

Diese Logik darf spaeter in Heart oder an einen anderen Ort verschoben werden.
Aber nur in dieser Reihenfolge:

1. aktuelles Verhalten dokumentieren
2. E2E-Vertragstests dafuer gruen haben
3. neue Einbettung parallel bauen
4. alte und neue Einbettung gegen dieselben Tests laufen lassen
5. erst nach 1:1-Parity umschalten

### E-02 - Kein Big-Bang-Rewrite von `social-app.js`

- nur gezielte Entlastung
- nur mit Regression-Gates
- kein "alles neu und dann wird es schon sauber"

### E-03 - Keine kosmetischen Performance-Aktionen ohne Messung

- kein Caching nur nach Gefuehl
- keine "Optimierung", wenn Kosten, LCP, INP, CLS oder Nutzerfluss nicht gemessen werden

---

## F. Reihenfolge, wenn man jetzt wirklich fertig werden will

Wenn das Ziel nicht "ein bisschen besser", sondern "ruhig lauffaehig fuer echtes Wachstum" ist, dann ist die Reihenfolge:

1. Step 1-4
2. Step 5-8
3. Step 9-12
4. Step 13-16
5. Step 17-20

Das ist absichtlich so gebaut:

- zuerst Wahrheit und Beweise
- dann Korrektheit
- dann Geschwindigkeit
- dann Monitoring/Kosten
- dann Release- und Scale-Beweis

---

## G. Wann man ehrlich sagen kann: "Jetzt passt es"

Erst wenn alle folgenden Aussagen gleichzeitig wahr sind:

1. Die Kernflows sind real automatisiert und manuell gruengeprueft.
2. Follower-/Like-/Comment-/Menu-/Order-Counts driften nicht mehr sichtbar.
3. Das Launch-Matrix-Sign-off ist real ausgefuellt.
4. Runtime-/Function-/Cost-Alarme sind live.
5. Rules-Tests sind gruen.
6. App Check / Abuse-Schutz sind aktiv.
7. Kalter Mobile-Start ist messbar leichter.
8. Lasttests fuer die wichtigsten Flows sind bestanden.
9. 30 Tage Betriebsbeweis zeigen keinen kritischen Serienfehler.

Erst dann ist die Aussage realistisch:

- "Wir koennen Kunden sauber onboarden."
- "Wir muessen nicht dauernd Technik-Feuer loeschen."
- "Wir konzentrieren uns primär auf Kundenwachstum."

---

## H. Praktisches Schlussurteil

Der aktuelle Stand ist nicht schlecht.
Aber er ist noch kein Endzustand.

Der Weg zum stabilen "10/10-Gefuehl" ist moeglich, wenn:

- keine Fachlogik blind umgebaut wird
- offene Restbugs ehrlich behandelt werden
- Beweise vor Umbau kommen
- Monitoring und Lastbeweis als Pflicht betrachtet werden

Diese Datei ist ab jetzt die eine fuehrende Roadmap dafuer.
