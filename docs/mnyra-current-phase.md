Status: CURRENT
Last updated: 2026-04-23

# Mnyra Current Phase

## Stand

- Schritt 1 ist abgeschlossen.
- Schritt 2 ist jetzt dokumentiert.
- Schritt 3 ist abgeschlossen: Public-Route-Vertragskern zentralisiert.
- Bewertung von Schritt 3: `bestanden mit kleinem Rest-Risiko`.
- Schritt 4 ist abgeschlossen: Public-Core-Routen First-Render-Stabilitaet fuer `/:slug`, `/:slug/menu`, `/:slug/posts` gehaertet.
- Bewertung von Schritt 4: `bestanden mit kleinem Rest-Risiko`.
- Stabiler Ruecksetzungsstand vor dem problematischen Cold-Load-/Request-Sturm-Bereich: `80dbbb7` auf `finale-mnyra`.
- Problematische Aenderungen sind zurueckgenommen:
  `37af8ae` (cold-load bootstrap suppression) via `bb29d7f` plus Doku-Ruecknahme `2f4f695`,
  `97ea709` via `8b1459a`,
  `2923be8` via `80dbbb7`.
- Der Request-/Listener-Sturm im Menu ist im aktuellen Ruecksetzungsstand verschwunden.
- Der vorherige Cold-Load-Ansatz aus Schritt-5 (`Public-Web-Direct-Bootstrap-Unterdrueckungen`) wird in dieser Form nicht weiterverwendet.
- Offenes Restthema: Bei Refresh/Cold-Start kommen Posts/Menu haeufig spaeter als der Header.
- Schritt 7 ist abgeschlossen: Public-Guest-Ensure-/Fetch-Reentry fuer Posts/Menu/Fokus wurde mit kleinem Blast Radius stabilisiert.
- Bewertung von Schritt 7: `bestanden mit kleinem Rest-Risiko`.
- Schritt 8 ist dokumentiert: Public Cold-Start-/Refresh-Request-Analyse fuer `/:slug`, `/:slug/posts`, `/:slug/menu`.
- Bewertung von Schritt 8: `analysiert, noch nicht umgesetzt`.
- Wichtigster Befund aus Schritt 8:
  schwerer Refresh-Pfad entsteht vor allem durch fehlenden kanonischen Restaurant-ID-Handoff plus Doppelarbeit zwischen Direct-Route-Bootstrap und Client-Live-Load.
- Schritt 9 ist dokumentiert: frische Mainline-Analyse fuer den sichtbaren Cold-Start-Gap zwischen Header und Posts/Menu auf `/:slug`, `/:slug/posts`, `/:slug/menu`.
- Bewertung von Schritt 9: `analysiert, noch nicht umgesetzt`.
- Wichtigster Befund aus Schritt 9:
  der Header wird bewusst frueh ueber Route-/Preview-/Fallback-Identitaet als `ready` gewertet,
  waehrend Posts/Menu weiter an spaeteren Ensure-/Resolver-Pfaden haengen;
  die wahrscheinlichste Hauptursache bleibt der fehlende saubere Handoff der kanonischen `restaurantId`.
- Fehlgeschlagener Versuch nach Schritt 9:
  `4805fcf` (canonicalRestaurantId-Hint-Fix) wurde wieder zurueckgenommen.
- Grund fuer die Ruecknahme:
  `/:slug/menu` zeigt nach Refresh keine Produkte.
- Aktueller Stand:
  Wir sind wieder auf dem letzten stabilen Stand vor diesem fehlgeschlagenen Fix.
- Referenz: [docs/mnyra-step2-route-data-matrix.md](./mnyra-step2-route-data-matrix.md)
- Referenz: [docs/mnyra-step4-public-core-routes-first-render-stability.md](./mnyra-step4-public-core-routes-first-render-stability.md)
- Referenz: [docs/mnyra-step5-isolation-public-bootstrap-rollback.md](./mnyra-step5-isolation-public-bootstrap-rollback.md)
- Referenz: [docs/mnyra-step6-public-profile-delayed-content-analysis.md](./mnyra-step6-public-profile-delayed-content-analysis.md)
- Referenz: [docs/mnyra-step7-public-guest-ensure-loop-stability-fix.md](./mnyra-step7-public-guest-ensure-loop-stability-fix.md)
- Referenz: [docs/mnyra-step8-public-cold-start-request-analysis.md](./mnyra-step8-public-cold-start-request-analysis.md)
- Referenz: [docs/mnyra-step9-mainline-public-delayed-content-analysis.md](./mnyra-step9-mainline-public-delayed-content-analysis.md)

## Harte Invariante (verbindlich)

- QR-Verhalten muss exakt erhalten bleiben:
  QR wird im Menu-Editor erstellt, beim Scan landet man auf derselben Profilseite, und im Profil ist das Menu sofort offen mit gleicher Warenkorb-Logik.
- Bestehende echte, bereits vom Menu-Editor generierte QR-Links muessen kompatibel bleiben und duerfen durch spaetere URL-/Routing-/Route-Vertragsaenderungen nicht kaputtgehen.

## Aktuelles Verhalten, fachlich noch zu klaeren

- `/login -> /feed` ist aktuell bestehendes Verhalten.
- Schritt 3 hat dieses Verhalten nicht versehentlich geaendert.
- Fachlich ist weiterhin offen, ob `/login` spaeter direkt auf eine eigene Login-Seite/-Oberflaeche fuehren soll.
- Deshalb wird `/login -> /feed` aktuell nicht als harte Endregel festgeschrieben.

## Workflow ab jetzt (verbindlich)

- Es wird nur auf Branch `finale-mnyra-mainline` gearbeitet.
- `finale-mnyra` und `finale-mnyra-clean` bleiben Referenz-Branches.
- Keine direkte Arbeit auf `main`.
- Nach jedem Schritt:
  klare Doku, klarer Commit, Commit-Hash melden, geaenderte Dateien melden, kurze manuelle Testliste liefern.
- Keine stillen Zusatz-Aenderungen ausserhalb des vereinbarten Schritts.

## Naechster Schritt

Wenn das Restproblem weiter adressiert wird, dann als kleinster Minischritt:
kanonische `restaurantId` aus Direct-Route-Bootstrap/Open-Flow als `canonicalRestaurantId`
sauber in die Public-Ensure-Pfade weiterreichen;
kein Bootstrap-Umbau, kein Routing-Umbau, kein breiter Performance-Refactor.

Der fehlgeschlagene Versuch `4805fcf` gilt dabei nicht als stabiler Ausgangspunkt.

## Guardrails fuer die naechsten Schritte

- keine Produktaenderungen
- keine Logikaenderungen
- keine Routing-, Firebase-, Functions- oder Rules-Aenderungen ausserhalb des klar definierten Route-Vertrags
- keine UI- oder Design-Aenderungen
- keine Scope-Erweiterung
