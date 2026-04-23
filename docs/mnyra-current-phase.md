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
- Schritt 10 ist abgeschlossen: Public-Gast-Profilpfad nutzt fuer `/:slug`, `/:slug/posts`, `/:slug/menu`
  keinen dauerhaften Profil-Realtime-Listener mehr, sondern einen stabilen einmaligen Profil-Read pro Kontext.
- Bewertung von Schritt 10: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 10:
  weniger Realtime-Dauerlast im Public-Gast-Pfad bei Refresh/Cold-Start;
  bestehende Profil-/Posts-/Menu-Surface-Logik bleibt unveraendert.
- Schritt 11 ist dokumentiert: Core-Architektur fuer den gesamten oeffentlichen Profilpfad
  `/:slug`, `/:slug/posts`, `/:slug/menu` inklusive QR -> Profil mit offenem Menu.
- Bewertung von Schritt 11: `analysiert, noch nicht umgesetzt`.
- Wichtigster Befund aus Schritt 11:
  der Pfad hat bereits route-first Seed plus read-once Guest-Profilread,
  aber noch keinen erstklassigen, durchgaengigen Handoff der kanonischen `restaurantId`;
  die Hauptkomplexitaet sitzt jetzt in mehrfacher Route-/Slug-/Resolver-Arbeit zwischen
  `index.html`, Bootstrap, Open-Flow, Ensure-Cluster und Surface-Loadern.
- Schritt 12 ist abgeschlossen: Public-Profile-Core fuer `/:slug`, `/:slug/posts`, `/:slug/menu`
  inklusive QR -> dieselbe Profilwelt mit offenem Menu wurde auf kanonische
  `restaurantId` als sichtbare Runtime-Wahrheit umgestellt.
- Bewertung von Schritt 12: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 12:
  `canonicalRestaurantId` wird jetzt durchgaengig vom Route-/Direct-Entry-Seed
  ueber Loading/Resolved-State bis in Posts/Menu/Fokus-Ensure getragen;
  Public-Guest-Reads bleiben read-once und unnoetige zweite/dritte Resolve-Ketten
  im Kernpfad wurden reduziert.
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
- Referenz: [docs/mnyra-step10-mainline-public-guest-read-path-stability-fix.md](./mnyra-step10-mainline-public-guest-read-path-stability-fix.md)
- Referenz: [docs/mnyra-step11-public-profile-core-architecture.md](./mnyra-step11-public-profile-core-architecture.md)
- Referenz: [docs/mnyra-step12-public-profile-core-implementation.md](./mnyra-step12-public-profile-core-implementation.md)

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

Nach Schritt 12 ist der erste technische Kernumbau abgeschlossen.

Naechster moeglicher Folgeschritt (noch offen, separater Schritt):
Direct-Public-Bootstrap im oeffentlichen Profilkern auf Main-Surface ausrichten
(Profil/Posts-default vs Menu-first), ohne UI-Aenderung, ohne Routing-Umbau
und ohne Scope-Erweiterung in andere Domains.

## Guardrails fuer die naechsten Schritte

- keine Produktaenderungen
- keine Logikaenderungen
- keine Routing-, Firebase-, Functions- oder Rules-Aenderungen ausserhalb des klar definierten Route-Vertrags
- keine UI- oder Design-Aenderungen
- keine Scope-Erweiterung
