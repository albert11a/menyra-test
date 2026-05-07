Status: CURRENT
Last updated: 2026-05-07

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
  im Kernpfad wurden reduziert; insbesondere wird ein unaufgeloester Slug nicht mehr
  vorschnell als kanonische ID festgeschrieben.
- Schritt 13 ist dokumentiert: Public-Web-Profilpfad nach Schritt 12 auf weitere
  Vereinfachung analysiert, inklusive konkreter Ladefolge auf `/:slug/menu`
  (`Fokus wird geladen`, `Menu wird geladen`, erneutes `Menu wird geladen`).
- Bewertung von Schritt 13: `analysiert, noch nicht umgesetzt`.
- Wichtigster Befund aus Schritt 13:
  der Web-Profilpfad ist nicht mehr primaer durch den alten Canonical-Handoff
  blockiert, sondern durch einen zu schweren First-Pass und eine gesplittete
  Menu-/Fokus-Surface-Logik; auf `/:slug/menu` kann der Wechsel von Slug/Lookup
  auf kanonische `restaurantId` zusammen mit getrennten Menu-/Focus-Ensures eine
  zweite sichtbare Menu-Loading-Phase ausloesen.
- Schritt 14 ist abgeschlossen: Der normale Web-Direct-Menu-Pfad auf `/:slug/menu`
  nutzt fuer Render-/Ensure-/Menu-Load-Entscheidungen einen kanonischen
  Menu-Surface-Zielkontext und beruhigt Fokus-Loading waehrend Menu der
  Haupt-Surface ist.
- Bewertung von Schritt 14: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 14:
  Slug-/Lookup-Kontext und kanonische `restaurantId` werden im normalen
  Web-Direct-Menu-Pfad als derselbe sichtbare Menu-Screen behandelt; dadurch
  sollen zwei sichtbare `Menu wird geladen`-Phasen fuer denselben Refresh
  verschwinden oder deutlich reduziert werden. QR-Logik, QR-URLs und
  Tisch-/Bestellkontext bleiben unveraendert.
- Schritt 15 ist abgeschlossen: Der gesamte oeffentliche Web-Profilpfad
  `/:slug`, `/:slug/posts`, `/:slug/menu` wurde als zusammenhaengender
  Route->Open-Flow->Ensure->Surface-Pfad erneut voll analysiert und im Kern
  vereinfacht.
- Bewertung von Schritt 15: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 15:
  der normale Web-Direct-Entry-Pfad vermeidet jetzt zusaetzliche schwere
  Re-Resolve-Schritte im Menu-First-Fall, und Posts/Menu/Fokus-Ensures sowie
  Menu-Loader erkennen Slug-/Lookup-/kanonische IDs konsistent als denselben
  sichtbaren Surface-Kontext. Dadurch sollen doppelte sichtbare Ladephasen,
  unnoetige Reentry-Loads und der schwere Refresh-Eindruck weiter reduziert
  werden; QR bleibt unveraendert.
- Schritt 16 ist abgeschlossen: Der Public-Route-Vertrag fuer Business-Web-
  Profile wurde auf Runtime-/Startup-Ebene gehaertet, damit genau ein
  oeffentlicher Profilpfad mit stabilen Surface-URLs laeuft.
- Bewertung von Schritt 16: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 16:
  bei Business-Pfaden wird der Startup-URL-Kontext auf kanonischen Path plus
  kanonische Query reduziert (keine konkurrierenden `r`/`top`/Alias-Parameter),
  Initial-Route-Truth priorisiert den Path vor widerspruechlichen Query-IDs.
- Schritt 17 ist abgeschlossen: Der Business-Public-Web-Profilpfad wurde fuer
  URL-/Surface-Sync weiter vereinfacht und gegen stale Async-TopTab-Rewrites
  gehaertet.
- Bewertung von Schritt 17: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 17:
  aktive Business-URLs sind jetzt `/:slug` (Profil/Posts) und `/:slug/menu`;
  `/:slug/posts` bleibt Kompatibilitaets-Alias und normalisiert sofort auf
  `/:slug`. Zusaetzlich kann ein alter asynchroner Open-Flow den vom Nutzer
  bereits gewechselten TopTab nicht mehr einfach zurueck auf den initialen
  Request-Tab druecken. Dadurch bleibt Tab<->URL-Sync stabiler; QR bleibt
  unveraendert.
- Schritt 18 ist abgeschlossen: Public-/QR-/Profile-/Menu-/Posts-Orchestrierung
  wurde auf eine konsistente Route-/Kontext-Weitergabe und stabilere
  History-Rekonstruktion gehaertet.
- Bewertung von Schritt 18: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 18:
  QR-Kontext (`src=qr`, `table`) bleibt jetzt auch auf `/:slug` (Posts/Profile)
  erhalten, wird nicht mehr implizit auf `/:slug/menu` umgeschrieben und wird
  bei Tabwechsel/Refresh/Back-Forward konsistenter rekonstruiert. Parallel
  wurde der Business-Route-Popstate-Pfad aktiviert, ein push/replace-
  History-Modus fuer Surface-Wechsel eingefuehrt und die kanonische
  `restaurantId`-Aufloesung fuer Public-Posts/Profile per Route->Doc-Cache
  stabilisiert, um doppelte Resolve-/Load-Pfade zu reduzieren.
- Schritt 19 ist abgeschlossen: QR-Cold-Open-Restinstabilitaeten wurden mit
  niedrigem Blast Radius gegen `main` verifiziert und gehaertet.
- Bewertung von Schritt 19: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 19:
  ein zentraler Regression-Punkt (Slug/Canonical-Alias als "settled" Menu/Fokus-
  Wahrheit) wurde entfernt, sodass ein fruehes `knownEmpty` auf falscher
  Restaurant-ID den nachfolgenden Ensure-Pfad nicht mehr blockieren kann.
  Zusaetzlich wurde QR-Session-Erkennung fuer canonical IDs gehaertet und
  unnoetige Reconcile-/Replay-Last reduziert.
- Schritt 20 ist abgeschlossen: QR-Caltstart/Refresh wurde auf
  `menu-first` zurueckgefuehrt und fuer kalte Scans beschleunigt.
- Bewertung von Schritt 20: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 20:
  QR-Kontext erzwingt jetzt wieder konsistent `menu` als Surface-Wahrheit
  (Initial-Route + URL-Kanonisierung + Route-Sync), sodass Refresh im
  QR-Kontext nicht auf `posts/profile` zurueckfaellt. Zusaetzlich wurde die
  Slug->Restaurant-Aufloesung im Public-Profilpfad parallelisiert und der
  QR-Menu-Backoff fuer schnellere First-Content-Reaktion reduziert.
- Schritt 21 ist abgeschlossen: verbleibende Public-Web-/QR-Owner-,
  Bootstrap- und Loader-Konflikte wurden im bestehenden Client-Pfad gehaertet.
- Bewertung von Schritt 21: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 21:
  spaete Bootstrap-Route-Seeds duerfen eine bereits settled Web-Direct-
  Public-Surface nicht mehr ueberschreiben; QR nutzt wieder denselben
  Canonical-/Ensure-Dedupe-Pfad wie normaler Web-Direct; Public Guest Startup
  blockiert weder QR-Bootstrap noch den spaeteren Ensure-Fallback; der
  frische sichtbare Menu-Pfad darf route-keyed Bootstrap-/Persisted-/Memory-
  Seeds wieder sinnvoll nutzen, und Posts werden im Menu-First-Pfad frueher
  aufgewarmt.
- Schritt 22 ist abgeschlossen: Das eigene Business-Profil-Menu darf seinen
  Public-Menu-Stand gezielt nachladen, wenn der eigene Profil-Menu-Tab sichtbar
  ist.
- Bewertung von Schritt 22: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 22:
  `source: "collection"` aus dem Authoring-/Editor-Pfad blockiert den Public-
  Menu-Load fuer die sichtbare Profil-Menu-Ansicht nicht mehr. Dadurch bleibt
  das eigene Business-Profil-Menu nicht dauerhaft bei `Menu wird geladen...`,
  nur weil noch keine passende `source: "public"`-Menu-Wahrheit im State liegt.
  Auf Nutzerwunsch wurde dieser Schritt auf Branch `bauloginstart` umgesetzt.
- Schritt 23 ist abgeschlossen: Der Wechsel von einem oeffentlichen Business-
  Profil zurueck ins eigene Business-Profil-Menu wurde gegen stale Public-
  Route-/WebDirect-IDs gehaertet.
- Bewertung von Schritt 23: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 23:
  Das eigene Business-Profil-Menu sammelt fuer seinen Public-Menu-Nachladepfad
  nur noch eigene Restaurant-IDs und keinen alten Public-Kontext aus
  `profileView`, RoutePayload oder `__webDirectEntry`. Dadurch kann ein bereits
  geladenes fremdes Public-Menu den eigenen Menu-Load nicht mehr ueberspringen;
  der bisher noetige Refresh nach dem Profilwechsel sollte entfallen.
- Schritt 24 ist abgeschlossen: Public Profile/Menu/Fokus rendert Menu und
  Fokus jetzt als koordinierte sichtbare Surface-Entscheidung.
- Bewertung von Schritt 24: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 24:
  Das sichtbare Public-Menu wartet nicht mehr auf einen separaten spaeten Fokus-
  Render, sondern entscheidet pro aktuellem Restaurant-Ziel gemeinsam:
  entweder Menu mit gueltigem Fokus oder Menu ohne Fokus. Fokus-Eintraege werden
  gegen das geladene Public-Menu validiert; ungueltige/fehlende/fehlgeschlagene
  Fokusdaten blockieren das Menu nicht dauerhaft. Spaete Menu-/Fokus-Antworten
  duerfen den sichtbaren State nur noch mutieren, wenn sie weiter zum aktuellen
  Profile/Menu-Ziel passen.
- Schritt 25 ist abgeschlossen: Public Website Startup-Diaet fuer den
  oeffentlichen Smartphone-Web-Start wurde mit niedrigem Blast Radius umgesetzt.
- Bewertung von Schritt 25: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 25:
  oeffentliche Website-Starts markieren ihren Public-Startup-Kontext frueh,
  nutzen fuer Firestore einen Memory-Cache statt persistentem Multi-Tab-Cache,
  entschaerfen den Body-Observer, decken fehlende Icons inline ab und schieben
  Lucide-Fallback, PWA/Service-Worker-Registration sowie Runtime-Diagnostics
  weiter nach hinten. Sichtbare Oberflaeche, QR, Warenkorb, Routing und
  Produktlogik bleiben unveraendert. Auf Nutzerwunsch wurde dieser Schritt auf
  Branch `fixmai` umgesetzt.
- Schritt 26 ist abgeschlossen: Entdecker-Karten-Profilwechsel duerfen keinen
  alten Public-/Web-Direct-/Menu-Kontext mehr in ein anderes Business-Profil
  tragen.
- Bewertung von Schritt 26: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 26:
  ein ueber die Entdecker-Karte geoeffnetes Business-Profil nutzt seinen
  eigenen Canonical-/Menu-/Fokus-Zielkontext. Alte RoutePayload-,
  `__webDirectEntry`-, Menu- und Fokusdaten werden beim Wechsel auf ein anderes
  Business nicht mehr als passend akzeptiert. Sichtbare Oberflaeche, QR,
  Warenkorb, Routing-Design und Produktlogik bleiben unveraendert.
- Schritt 27 ist abgeschlossen: Public-Fokus/Angebote blockieren den sichtbaren
  Menu-Screen nicht mehr, wenn das eigentliche Public-Menu bereits bereit ist.
- Bewertung von Schritt 27: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 27:
  Nach Entdecker-Karten-Profilwechseln soll `Menu wird geladen` nicht mehr
  weiter sichtbar bleiben, nur weil Fokus-/Angebotsdaten noch ausstehen. Das
  Menu rendert sobald Menu-Items bereit sind; Fokus bleibt optional und kann
  nachgelagert erscheinen. Design, QR, Warenkorb und Produktlogik bleiben
  unveraendert.
- Schritt 28 ist abgeschlossen: Upload-/Bildkompression- und Orders-Runtime
  werden aus dem normalen Public-Gast-Startup herausgenommen und erst bei
  echter Nutzung dynamisch geladen.
- Bewertung von Schritt 28: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 28:
  Public-Website-Starts muessen Media-Upload, Bildkompression und Orders nicht
  mehr direkt beim Start laden/initialisieren. Checkout, Orders-Tab und Upload
  laden die benoetigten Controller bei Nutzung nach. Sichtbare Oberflaeche, QR,
  Warenkorb, Tischkontext, Routing-Design und Produktlogik bleiben unveraendert.
- Schritt 29 ist abgeschlossen: Public-Website-Starts haben jetzt eine eigene
  HTML-/Boot-Entry-Grenze.
- Bewertung von Schritt 29: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 29:
  `index.html` erkennt Public-Website-Starts synchron und laedt dafuer den
  kleinen `social-public-entry.js`, waehrend Nicht-Public-App-Pfade weiter
  direkt `social-app.js` laden. Aggressive `social-app.js`-/Firebase-
  Modulepreloads laufen nur noch fuer App-Starts. Der Public-Entry importiert
  die bestehende App noch nach, damit die sichtbare Produktoberflaeche stabil
  bleibt; ein echter leichter Public-Renderer bleibt ein Folgeschritt.
- Schritt 31 ist abgeschlossen: Profil-Upload-Actions funktionieren trotz
  deferred Media-/Upload-Runtime wieder.
- Bewertung von Schritt 31: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 31:
  `+ Status`, `+ Neuen Beitrag` und Upload-Einstiege koennen die Upload-Ansicht
  wieder direkt rendern, obwohl der schwere Media-/Upload-Controller weiterhin
  erst bei echter Upload-Aktion dynamisch geladen wird. Sichtbare UI, Labels,
  Upload-Regeln, Routing, QR und Produktlogik bleiben unveraendert.
- Schritt 32 ist abgeschlossen: Public-Menu-Fokus wird beim sichtbaren Public-
  Menu-Load frueher als deduplizierter Prefetch parallel zum Menu-Read
  angewaermt.
- Bewertung von Schritt 32: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 32:
  Focus liest weiterhin dieselbe Firebase-Wahrheit
  `restaurants/{restaurantId}/public/offers` plus `public/meta`, startet im
  sichtbaren Public-Menu-Pfad aber nicht mehr erst nach abgeschlossenem Menu-
  Load. Der sichtbare Focus-State wird weiterhin erst committet, wenn die
  passende Public-Menu-Surface bestaetigt ist. Sichtbare UI, QR, Warenkorb,
  Routing, Rules, Functions und Produktlogik bleiben unveraendert.
- Schritt 33 ist abgeschlossen: Public-Route-Bootstrap-Menu-/Fokus-Snapshot
  wird im Client nicht mehr verworfen und ein fehlgeschlagener Menu-Prefetch
  kann nicht mehr als endloses `Menu wird geladen` im sichtbaren State bleiben.
- Bewertung von Schritt 33: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 33:
  Wenn der Direct-Public-Bootstrap Menu-/Fokus-Items bereits mitliefert, werden
  diese jetzt als erste sichtbare Public-Wahrheit genutzt. Dadurch koennen
  Header, Menu und Fokus im besten Fall aus demselben Bootstrap-Snapshot
  erscheinen. Ohne Bootstrap/Cache bleiben Menu und Fokus echte Public-Reads,
  fallen aber bei Fehlern in einen Error-/Empty-State statt dauerhaft zu laden.
  Sichtbare UI, QR, Warenkorb, Routing, Firebase Rules, Functions und
  Produktlogik bleiben unveraendert.
- Historischer Hinweis:
  Der fruehere fehlgeschlagene Versuch `4805fcf` bleibt als Archiv-Kontext bestehen;
  der jetzige Schritt 12 auf `junivitefinal` ersetzt diesen Stand.
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
- Referenz: [docs/mnyra-step13-public-profile-simplification-analysis.md](./mnyra-step13-public-profile-simplification-analysis.md)
- Referenz: [docs/mnyra-step14-web-direct-menu-surface-stability-fix.md](./mnyra-step14-web-direct-menu-surface-stability-fix.md)
- Referenz: [docs/mnyra-step15-public-web-profile-speed-reliability-overhaul.md](./mnyra-step15-public-web-profile-speed-reliability-overhaul.md)
- Referenz: [docs/mnyra-step16-public-route-contract-hardening.md](./mnyra-step16-public-route-contract-hardening.md)
- Referenz: [docs/mnyra-public-profile-orchestration-fix.md](./mnyra-public-profile-orchestration-fix.md)
- Referenz: [docs/mnyra-step19-public-qr-cold-open-reliability-hardening.md](./mnyra-step19-public-qr-cold-open-reliability-hardening.md)
- Referenz: [docs/mnyra-step20-qr-menu-main-refresh-hardening.md](./mnyra-step20-qr-menu-main-refresh-hardening.md)
- Referenz: [docs/mnyra-step21-public-web-qr-owner-loader-hardening.md](./mnyra-step21-public-web-qr-owner-loader-hardening.md)
- Referenz: [docs/mnyra-step22-own-business-profile-menu-load-fix.md](./mnyra-step22-own-business-profile-menu-load-fix.md)
- Referenz: [docs/mnyra-step23-own-profile-menu-stale-public-id-fix.md](./mnyra-step23-own-profile-menu-stale-public-id-fix.md)
- Referenz: [docs/mnyra-step24-public-menu-focus-coordinated-render-state.md](./mnyra-step24-public-menu-focus-coordinated-render-state.md)
- Referenz: [docs/mnyra-step25-public-website-startup-diet.md](./mnyra-step25-public-website-startup-diet.md)
- Referenz: [docs/mnyra-step26-discovery-map-profile-data-isolation.md](./mnyra-step26-discovery-map-profile-data-isolation.md)
- Referenz: [docs/mnyra-step27-public-menu-focus-nonblocking-load.md](./mnyra-step27-public-menu-focus-nonblocking-load.md)
- Referenz: [docs/mnyra-step28-public-startup-defer-upload-orders.md](./mnyra-step28-public-startup-defer-upload-orders.md)
- Referenz: [docs/mnyra-step29-public-web-entry-boundary.md](./mnyra-step29-public-web-entry-boundary.md)
- Referenz: [docs/mnyra-step31-profile-upload-deferred-render-fix.md](./mnyra-step31-profile-upload-deferred-render-fix.md)
- Referenz: [docs/mnyra-step32-public-focus-prefetch-alignment.md](./mnyra-step32-public-focus-prefetch-alignment.md)
- Referenz: [docs/mnyra-step33-public-bootstrap-menu-focus-seed.md](./mnyra-step33-public-bootstrap-menu-focus-seed.md)

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

- Es wird nur auf Branch `junivitefinal` gearbeitet.
- `finale-mnyra` und `finale-mnyra-clean` bleiben Referenz-Branches.
- Keine direkte Arbeit auf `main`.
- Nach jedem Schritt:
  klare Doku, klarer Commit, Commit-Hash melden, geaenderte Dateien melden, kurze manuelle Testliste liefern.
- Keine stillen Zusatz-Aenderungen ausserhalb des vereinbarten Schritts.

## Naechster Schritt

Nach Schritt 33 ist der naechste sinnvolle separate Folgeschritt:
Public-Menu inklusive Fokus auf echtem Smartphone manuell mit frischem Bundle
und geleertem Service-Worker-/Browser-Cache pruefen.
Erst wenn Menu, Fokus, Produktmodal, Warenkorb, QR-/Tisch-Kontext,
Entdecker-Karten-Profilwechsel und Upload-Einstiege stabil bleiben, kann der
neue Public-Entry schrittweise mit einem echten leichten Public-Renderer fuer
`/:slug/menu` gefuellt werden.

## Guardrails fuer die naechsten Schritte

- keine Produktaenderungen
- keine Logikaenderungen
- keine Routing-, Firebase-, Functions- oder Rules-Aenderungen ausserhalb des klar definierten Route-Vertrags
- keine UI- oder Design-Aenderungen
- keine Scope-Erweiterung
