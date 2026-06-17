Status: CURRENT
Last updated: 2026-06-17

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
- Schritt 34 ist abgeschlossen: Der Social-App- und Public-Entry-Build-Token
  wurde nach dem Menu-/Fokus-Bundle-Fix hochgezogen.
- Bewertung von Schritt 34: `bestanden`.
- Wichtigster Effekt aus Schritt 34:
  Normale Desktop-Browser mit altem Service-Worker-Cache oder altem Startup-
  Snapshot behandeln den Stand nach Schritt 33 nicht mehr als dieselbe App-
  Version. Handy-Inkognito war bereits sauber, weil dort keine Alt-Caches
  vorhanden waren. Sichtbare UI, Menu-/Fokus-Logik, Routing, Firebase Rules,
  Functions und Produktlogik bleiben unveraendert.
- Schritt 35 ist abgeschlossen: Public-Fokus wird fuer die sichtbare Public-
  Menu-Praesentation als Teil der Menu-Render-Wahrheit koordiniert.
- Bewertung von Schritt 35: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 35:
  Wenn Public-Menu-Items bereits geladen sind, Fokus fuer dieselbe sichtbare
  Public-Surface aber noch `unknown`/`loading` ist, werden die Menu-Items noch
  nicht sichtbar gerendert. Erst wenn Fokus bereit, leer oder Fehler ist,
  erscheint der Menu-Inhalt. Dadurch kann Fokus nicht mehr nachtraeglich oberhalb
  bereits sichtbarer Produkte einspringen. Sichtbare UI, QR, Warenkorb, Routing,
  Firebase Rules, Functions und Datenpfade bleiben unveraendert.
- Schritt 36 ist abgeschlossen: Profil-Beitraege werden in Profilansichten
  vollstaendig geladen und robuster als Foto-/Media-Beitraege normalisiert.
- Bewertung von Schritt 36: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 36:
  Eigene User-/Business-Profile, externe User-Profile und Public-Business-
  Profile schneiden Beitraege nicht mehr bei `FAST_LIMITS.profilePosts` ab.
  Zusaetzlich werden aeltere Media-Felder wie `mediaUrl`, `media[0].url`,
  `imageUrl`, `image`, `photoUrl` und `pictureUrl` fuer Profil-Posts als
  sichtbare Bildquelle akzeptiert; der User-Tab `Medien` blendet Fotos nicht
  mehr durch einen reinen Video-Filter aus. Sichtbare UI, QR, Warenkorb,
  Routing, Firebase Rules, Functions und Produktlogik bleiben unveraendert.
  Auf Nutzerwunsch wurde dieser Schritt auf Branch `refactorapp` umgesetzt.
- Schritt 37 ist abgeschlossen: CEO-/interne MNYRA-Staff-Verwaltung wurde mit
  niedrigem Blast Radius auf die sichere Heart-Route `/admin/staff` gelegt.
- Bewertung von Schritt 37: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 37:
  `/admin/staff` oeffnet Heart `crmStaff`, waehrend bare `/staff`,
  `staff.mnyra.com`, Restaurant-Staff, Waiter, Kitchen, Business-Staff,
  Public Menu, QR, Cart, Orders, Feed, Search, Map, Chat und Firebase-
  Datenpfade unveraendert bleiben.
- Schritt 38 ist abgeschlossen: Public Business Profile und Public Menu sind
  in der Social-Route-Runtime-Registry als eigene Runtime-Slots vorbereitet.
- Bewertung von Schritt 38: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 38:
  `publicBusiness` und `publicMenu` koennen kuenftig einen eigenen leichten
  Public/Profile-Renderer liefern, waehrend der bestehende
  `renderPublicProfileView` als Fallback unveraendert bleibt. Sichtbare UI,
  Routing, Firebase, QR, Public Menu, Warenkorb, Orders, Heart, `/staff`,
  businessAccounts, Waiter/Kitchen und Feed-First-Paint bleiben unveraendert.
  Auf Nutzerwunsch wurde dieser Schritt im laufenden Bundle-/Refactor-Kontext
  auf Branch `refactorapp` umgesetzt.
- Schritt 39 ist abgeschlossen: Profile-Open-Flow und Chat-V1-Fassade wurden
  aus dem Social-Main-Entry in Lazy Boundaries verschoben.
- Bewertung von Schritt 39: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 39:
  Der gebaute `entry/social-app.js` sinkt von 1,270,944 Bytes raw /
  341,603 Bytes gzip auf 1,226,239 Bytes raw / 330,087 Bytes gzip. Das sind
  44,705 Bytes raw und 11,516 Bytes gzip weniger. Die bestehende
  Profile-Open-Flow-Logik und die bestehende Chat-Fassade bleiben Source of
  Truth und werden erst bei Bedarf geladen. Sichtbare UI, Routing, Firebase,
  Feed-First-Paint, Public Menu, Warenkorb, Orders, Heart, `/staff`,
  businessAccounts und Waiter/Kitchen bleiben unveraendert. Auf Nutzerwunsch
  wurde dieser Schritt auf Branch `refactorapp` umgesetzt.
- Schritt 40 ist abgeschlossen: Der Public-Route-Entry-Vertrag wurde
  festgezogen und ein Social-Bundle-Guard wurde eingefuehrt.
- Bewertung von Schritt 40: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 40:
  Der gebuendelte Public Entry laedt die bestehende Social App weiter, wartet
  aber nicht mehr per Top-Level-`await` auf den kompletten `social-app.js`-
  Import. Damit fehlt keine bestehende Funktion, waehrend der Public Entry
  nicht kuenstlich an die Auswertung des grossen App-Imports gebunden ist.
  Zusaetzlich schuetzt `npm run check:social-bundle` den Schritt-39-Stand
  gegen Rueckfall: bereits ausgelagerte Runtime-Module duerfen nicht wieder
  statisch in `social-app.js` landen und die Entry-Gzip-Groesse bleibt
  budgetiert. Sichtbare UI, Routing, Firebase, Public Menu, Warenkorb, Orders,
  QR-/Tisch-Kontext, Heart, `/staff`, businessAccounts und Waiter/Kitchen
  bleiben unveraendert. Auf Nutzerwunsch wurde dieser Schritt auf Branch
  `refactorapp` umgesetzt.
- Schritt 41 ist abgeschlossen: Der bestehende Profile/Menu/Fokus-Renderer
  wurde hinter eine Lazy-Runtime-Boundary gelegt.
- Bewertung von Schritt 41: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 41:
  `profile-menu-focus-render-controller.js` ist nicht mehr statisch im
  Social-Main-Entry, sondern eigener Dynamic Import. Der gebaute
  `entry/social-app.js` sinkt von 1,226,239 Bytes raw / 330,087 Bytes gzip auf
  1,138,184 Bytes raw / 309,464 Bytes gzip. Das sind 88,055 Bytes raw und
  20,623 Bytes gzip weniger. Public Business und Public Menu preladen den
  bestehenden Renderer ueber ihre Runtime-Slots; die Renderer-Source-of-Truth
  bleibt unveraendert. Sichtbare UI, Routing, Firebase, Public Menu,
  Produktdetail, Warenkorb, Orders, QR-/Tisch-Kontext, Heart, `/staff`,
  businessAccounts und Waiter/Kitchen bleiben unveraendert. Auf Nutzerwunsch
  wurde dieser Schritt auf Branch `refactorapp` umgesetzt.
- Schritt 42 ist abgeschlossen: Das Preload-Timing fuer den ausgelagerten
  Profile/Menu/Fokus-Renderer wurde auf Profil-/Menu-Starts gehaertet.
- Bewertung von Schritt 42: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 42:
  Der Step-41-Lazy-Chunk wird bei aktivem oder pending Profile/Menu-Kontext
  direkt nach Aufbau der Profile/Menu-Runtime angefordert. Normale Feed-Starts
  preladen ihn weiterhin nicht. Der gebaute `entry/social-app.js` steigt
  dadurch geringfuegig von 1,138,184 Bytes raw / 309,464 Bytes gzip auf
  1,138,788 Bytes raw / 309,638 Bytes gzip, bleibt aber unter dem
  verschaerften Bundle-Guard. Sichtbare UI, Routing, Firebase, Public Menu,
  Produktdetail, Warenkorb, Orders, QR-/Tisch-Kontext, Heart, `/staff`,
  businessAccounts und Waiter/Kitchen bleiben unveraendert. Auf Nutzerwunsch
  wurde dieser Schritt auf Branch `refactorapp` umgesetzt.
- Schritt 43 ist abgeschlossen: Der Public Profile/Menu Runtime-Guard wurde
  gehaertet, bevor ein weiterer Public/Profile-Split geplant wird.
- Bewertung von Schritt 43: `bestanden`.
- Wichtigster Effekt aus Schritt 43:
  `npm run check:social-bundle` prueft jetzt neben Bundle-Groessen und Dynamic
  Imports auch die konkrete Step-41/42-Verkabelung: der Profile/Menu/Fokus-
  Renderer bleibt hinter der Boundary, der Early-Preload bleibt verdrahtet,
  `publicBusiness` und `publicMenu` nutzen weiter den bestehenden Renderer plus
  Preload, und QR-Menu-Zugriffe bleiben im `publicMenu`-Slot. Zusaetzliche
  Unit-Cases halten Cart, Favorites, QR und Preload-Negativfaelle fest. Es gab
  keine sichtbare UI-, Routing-, Firebase- oder Runtime-Split-Aenderung. Auf
  Nutzerwunsch wurde dieser Schritt auf Branch `refactorapp` umgesetzt.
- Schritt 44 ist dokumentiert: Public Profile/Menu Split-Kandidaten wurden
  reproduzierbar kartiert, ohne Runtime-Verhalten zu aendern.
- Bewertung von Schritt 44: `analysiert, noch nicht umgesetzt`.
- Wichtigster Befund aus Schritt 44:
  Der statische Import-Graph ab `social-app.js` umfasst 175 Module. Die
  getrackten Public/Profile/Menu-Split-Kandidaten im statischen Graph umfassen
  377,211 Bytes Source raw. Der groesste naechste Kandidat ist
  `public-profile-runtime-controller.js` mit 77,819 Bytes Source raw /
  13,333 Bytes Source gzip, aber dieser Bereich ist weiter mit Public Profile,
  Public Menu, Cart, Order und QR-/Tisch-Kontext gekoppelt. Deshalb wurde kein
  weiterer Split umgesetzt. Auf Nutzerwunsch wurde dieser Schritt auf Branch
  `refactorapp` dokumentiert.
- Schritt 45 ist abgeschlossen: Die Social-Engagement-Runtime wurde hinter eine
  Lazy Boundary gelegt.
- Bewertung von Schritt 45: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 45:
  `social-engagement-runtime-controller.js` ist nicht mehr statisch im
  Social-Main-Entry, sondern eigener Dynamic Import. Der gebaute
  `entry/social-app.js` sinkt von 1,138,788 Bytes raw / 309,638 Bytes gzip auf
  1,116,617 Bytes raw / 302,809 Bytes gzip. Das sind 22,171 Bytes raw und
  6,829 Bytes gzip weniger. Likes, Kommentare, Post-Meta und Menu-Item-Meta
  nutzen weiter denselben Controller und werden bei echter Nutzung geladen.
  Sichtbare UI, Routing, Firebase, Public Menu, Produktdetail, Warenkorb,
  Orders, QR-/Tisch-Kontext, Heart, `/staff`, businessAccounts und
  Waiter/Kitchen bleiben unveraendert. Auf Nutzerwunsch wurde dieser Schritt
  auf Branch `refactorapp` umgesetzt.
- Schritt 46 ist abgeschlossen: Die CRM-/Heart-Domain-Runtime wurde hinter
  eine Lazy Boundary gelegt.
- Bewertung von Schritt 46: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 46:
  `crm-domain-runtime-cluster.js` ist nicht mehr statisch im Social-Main-Entry,
  sondern eigener Dynamic Import. Der gebaute `entry/social-app.js` sinkt von
  1,116,617 Bytes raw / 302,809 Bytes gzip auf 1,046,899 Bytes raw /
  283,365 Bytes gzip. Das sind 69,718 Bytes raw und 19,444 Bytes gzip weniger;
  die Unter-300-kB-Gzip-Marke ist damit erreicht. Heart-/CRM-Views nutzen
  weiter denselben CRM-Controller, laden ihn aber erst bei CRM-Render,
  CRM-Aktion oder explizitem CRM-Prefetch. Reine Sync-Fallbacks laden den
  Chunk nicht auf Verdacht. Sichtbare UI, Routing, Firebase, Public Menu,
  Produktdetail, Warenkorb, Orders, QR-/Tisch-Kontext, `/staff`,
  businessAccounts und Waiter/Kitchen bleiben unveraendert. Auf Nutzerwunsch
  wurde dieser Schritt auf Branch `refactorapp` umgesetzt.
- Schritt 47 ist dokumentiert: Firebase-Ladehaertung fuer bestehende UI.
- Bewertung von Schritt 47: `analysiert, noch nicht umgesetzt`.
- Wichtigster Befund aus Schritt 47:
  Der richtige Weg ist fuer diesen Abschnitt kein grosser Storefront-/
  Renderer-Umbau, sondern eine kleine, schrittweise Haertung der bestehenden
  Firebase-Ladewege fuer Public Business Profile, Public Menu, Fokus,
  Beitraege, Feed und Profil-Daten. Der erste technische Kandidat ist Schritt
  48: Public Posts Ladehaertung mit begrenztem erstem Read, In-Flight-Dedupe,
  kontrollierter Nachladung und weiterhin vollstaendiger Sichtbarkeit.
- Schritt 48 ist abgeschlossen: Public Business Posts nutzen im sichtbaren
  Public-Profilpfad einen begrenzten Initial-Page-Read mit getrenntem Cache
  und behalten den Full-Read als vollstaendige Posts-Wahrheit.
- Bewertung von Schritt 48: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 48:
  Der erste sichtbare Public-Posts-Read kann mit Firestore-`limit` laufen und
  parallele sichtbare Initial-Reads werden dedupliziert. Diese Initial-Page
  befuellt nicht den Full-Cache, sodass ein spaeterer normaler Read weiterhin
  alle Posts laden kann. Der Open-Flow nutzt die Initial-Page nur fuer fruehes
  Anwarmen und akzeptiert sie nicht als finale Posts-Wahrheit. Sichtbare UI,
  Routing, QR, Cart, Order, Firebase Rules, Functions und Datenpfade bleiben
  unveraendert.
- Schritt 49 ist abgeschlossen: Menu/Fokus/Produkte bekommen No-Hang-Deadlines
  fuer bestehende Firebase-Ladewege.
- Bewertung von Schritt 49: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 49:
  Public Menu, Fokus/Angebote und Menu-Editor-Produkte duerfen nicht dauerhaft
  in `loading` bleiben, wenn ein Firebase-Read nicht zurueckkommt. Public
  Menu Items, Menu-Editor-Collection-Items, Hybrid-Menu, Public Menu Meta,
  Public Fokus/Angebote und Fokus-Meta haben jetzt kontrollierte Deadlines.
  Bei Timeout wird ein Fehler-/Leerzustand oder vorhandener Fallback-State
  gesetzt, statt endlos `wird geladen...` zu zeigen. Sichtbare UI, Routing,
  QR, Cart, Order, Firebase Rules, Functions und Datenpfade bleiben
  unveraendert. Fehlende Lucide-Icons wurden nur als separates Folgethema
  festgehalten und nicht in diesen Firebase-Ladefix gemischt.
- Schritt 50 ist abgeschlossen: Public Route/Profile Read-Dedupe fuer
  bestehende Public Starts.
- Bewertung von Schritt 50: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 50:
  Der Public-Business-Profilpfad nutzt eine bereits vorhandene
  `__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__`-Aufloesung, um bei gecachten Slugs
  direkt `restaurants/{canonicalRestaurantId}` zu lesen. Dadurch wird ein
  zusaetzlicher `publicRoutes/{slug}`-Read im Profil-Loader vermieden, ohne
  die Profil-Wahrheit selbst aus dem Cache zu uebernehmen. Sichtbare UI,
  Routing, QR, Cart, Order, Firebase Rules, Functions und Datenpfade bleiben
  unveraendert.
- Schritt 51 ist abgeschlossen: Launch-Audit mit Firebase- und Auth-Startup-
  Haertung.
- Bewertung von Schritt 51: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 51:
  Die breite Codepruefung hat keine sicher loeschbaren Social-Runtime-Module
  und keine Order-Schreib-Limits gefunden. Firebase-Default-App-Initialisierung
  wurde defensiver gemacht, doppelte Auth-Avatar-Cache-Schreibvorgaenge im
  Startup wurden entfernt, und die Tests bilden den aktuell deaktivierten
  Chat-V1-Zustand ab. Sichtbare UI, Routing, QR, Cart, Order, Firebase Rules
  und Functions bleiben unveraendert.
- Schritt 52 ist abgeschlossen: Launch-Surface Read- und Deploy-Cleanup.
- Bewertung von Schritt 52: `bestanden mit Rest-Risiko`.
- Wichtigster Effekt aus Schritt 52:
  Die Pruefung wurde ueber Auth, Firebase, Public Profile, Feed/Posts/Stories,
  Upload/Media, Push/Notifications, CRM/Heart, Waiter, Functions, Rules,
  Service Worker und Static-Deploy gezogen. Der externe User-Profil-Post-Read
  nutzt jetzt im normalen Firestore-Pfad `FAST_LIMITS.userPosts`, und lokale
  Demo-/Standalone-HTMLs werden nicht mehr in `dist` kopiert. Sichtbare UI,
  Routing, QR, Cart, Order, Firebase Rules und Functions bleiben unveraendert.
- Schritt 53 ist abgeschlossen: Website-Sprachauswahl ueber das bestehende Globe-Icon
  und sichtbare i18n-Grundlage fuer Albanisch, Deutsch und Serbisch in lateinischer
  Schrift.
- Bewertung von Schritt 53: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 53:
  Das Globe-Icon bleibt im Smart-Header erhalten und klappt beim Klick unterhalb der
  Header-Zeile eine Sprachleiste aus. Die Sprachwahl wird gespeichert, die Oberflaeche
  rendert nach Sprachwechsel neu, und `sq`/`sr` werden als Lazy-Chunks geladen, damit
  das Social-Hauptbundle im Budget bleibt. Routing, QR, Cart, Order, Firebase Rules
  und Functions bleiben unveraendert.
- Schritt 54 ist abgeschlossen: Der Sprachbutton im Smart-Header wurde wieder auf
  den reinen Globe-Icon-Ausloeser zurueckgefuehrt.
- Bewertung von Schritt 54: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 54:
  Der sichtbar gewordene `language.current`-Text wie `Gjuha aktuale` wird im
  Sprachbutton nicht mehr gerendert. Das Globe-Icon bleibt der sichtbare
  Klick-Ausloeser, und derselbe Klick klappt weiter die bestehende Sprachleiste aus.
  Sprachwahl, i18n-Lazy-Chunks, Routing, QR, Cart, Order, Firebase Rules und
  Functions bleiben unveraendert.
- Schritt 55 ist abgeschlossen: Marketplace-Kategorien `Restaurants`, `Travel`
  und `Shopping` wurden als interne Drawer-Bereiche mit Lazy-Renderer ergaenzt.
- Bewertung von Schritt 55: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 55:
  Die drei neuen Drawer-Ziele nutzen die vorhandene Business-/Lead-Wahrheit aus
  `state.restaurants` und `state.bootstrapRestaurantPreview`. Restaurant/Cafe/
  Fastfood-Typen erscheinen unter `Restaurants`, Hotel/Motel-Typen unter
  `Travel` und E-Commerce-/Shop-Typen unter `Shopping`. Der Renderer liegt in
  einem eigenen Lazy-Chunk; es wurden keine neuen Firebase-Listener, keine neuen
  Public-/QR-Routen und keine Cart-/Order-/Rules-/Functions-Aenderungen
  eingefuehrt.
- Schritt 56 ist abgeschlossen: Browser-Zurueck aus geoeffneten Marketplace-
  Business-Profilen fuehrt wieder zur urspruenglichen Marketplace-Kategorie.
- Bewertung von Schritt 56: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 56:
  `restaurants`, `travel` und `shopping` sind jetzt im zentralen App-Route-
  Vertrag als kanonische App-Pfade und reservierte Route-Segmente registriert.
  Dadurch schreibt der bestehende Profil-Open-Flow vor dem Profilaufruf nicht
  mehr `/feed` als Ruecksprung, sondern `/restaurants`, `/travel` oder
  `/shopping`. UI, Profil-Open-Flow, QR, Cart, Order, Firebase Rules und
  Functions bleiben unveraendert.
- Schritt 57 ist abgeschlossen: Marketplace-UI fuer `Restaurants`, `Travel` und
  `Shopping` wurde nach manueller Freigabe bereinigt.
- Bewertung von Schritt 57: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 57:
  Die sichtbaren Labels `Entdecken` und `Beste Auswahl` wurden aus den drei
  Marketplace-Bereichen entfernt. Der Swipe-Track nutzt keine negativen
  Aussenraender mehr, blendet die horizontale Scrollbar mit der vorhandenen
  `hide-scrollbar`-Klasse aus und hat jetzt vierfachen Abstand zu den
  darunterliegenden Karten. Datenquellen, Sortierung, Profil-Open-Flow,
  Browser-Back-Fix, QR, Cart, Order, Firebase Rules und Functions bleiben
  unveraendert.
- Schritt 58 ist abgeschlossen: Die verbliebenen oberen Marketplace-
  Bereichstitel und Subtitles wurden entfernt.
- Bewertung von Schritt 58: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 58:
  `Restaurants`, `Travel` und `Shopping` starten in der View jetzt direkt mit
  den Swipe-Karten bzw. dem Ladezustand; die oberen Textzeilen `Restaurants` /
  `Top Restaurants in deiner Umgebung`, `Travel` / `Hotels und Motels` und
  `Shopping` / `E-Commerce und Online-Shops` werden nicht mehr gerendert.
  Drawer-Labels, Card-Inhalte, Sortierung, Profil-Open-Flow, Browser-Back-Fix,
  QR, Cart, Order, Firebase Rules und Functions bleiben unveraendert.
- Schritt 59 ist abgeschlossen: Der Abstand zwischen Marketplace-Swipe-Karten
  und den darunterliegenden Karten wurde vergroessert.
- Bewertung von Schritt 59: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 59:
  Der Abstand nach dem Swipe-Track in `Restaurants`, `Travel` und `Shopping`
  wurde von `mb-28` auf `mb-40` erhoeht. Datenquellen, Card-Inhalte,
  Sortierung, Profil-Open-Flow, Browser-Back-Fix, QR, Cart, Order, Firebase
  Rules und Functions bleiben unveraendert.
- Schritt 60 ist abgeschlossen: Der Marketplace-Abstand zwischen Swipe-Karten
  und darunterliegenden Karten wurde robust gemacht.
- Bewertung von Schritt 60: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 60:
  Der Abstand nutzt jetzt `style="margin-bottom:10rem;"` statt der nicht in der
  statischen Social-CSS vorhandenen Tailwind-Klasse `mb-40`. Dadurch soll die
  sichtbare Luecke zwischen oberer horizontaler Card-Reihe und darunterliegenden
  Karten in `Restaurants`, `Travel` und `Shopping` tatsaechlich greifen.
  Datenquellen, Card-Inhalte, Sortierung, Profil-Open-Flow, Browser-Back-Fix,
  QR, Cart, Order, Firebase Rules und Functions bleiben unveraendert.
- Schritt 61 ist abgeschlossen: Der sichtbare Marketplace-Abstand zwischen
  Swipe-Karten und darunterliegenden Karten wurde wieder reduziert.
- Bewertung von Schritt 61: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 61:
  Der direkte Abstand wurde um 80% reduziert, von `margin-bottom:10rem` auf
  `margin-bottom:2rem`. Datenquellen, Card-Inhalte, Sortierung,
  Profil-Open-Flow, Browser-Back-Fix, QR, Cart, Order, Firebase Rules und
  Functions bleiben unveraendert.
- Schritt 62 ist abgeschlossen: Travel hat jetzt einen blauen Hotel-Sucheinstieg
  mit `Ofertat`, `Hotels` und `Karte`, Hotel-Profile haben einen leichten
  `Details`-Tab, und Social-Drawer-Einstiege fuer `Leads`, `Staff` und
  `Kunden/Klients` routen direkt nach Heart.
- Bewertung von Schritt 62: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 62:
  Travel filtert Hotel-/Motel-/Hostel-/Resort-/Accommodation-Profile nach
  Reiseziel, nutzt fuer die Travel-Karte die bestehende Map-Runtime mit
  Hotel-Scope und lagert die Travel-Eventbindung in einen lazy Marketplace-
  Helfer aus. Der Social-Entry bleibt unter Budget:
  1,049,973 Bytes raw / 284,996 Bytes gzip. Hotel/Motel-Lead-Typen waren
  bereits vorhanden und wurden nicht doppelt umgebaut. QR, Cart, Order,
  Firebase Rules und Functions bleiben unveraendert.
- Schritt 63 ist abgeschlossen: Heart erkennt lokale private LAN-Hosts fuer die
  API-Base korrekt.
- Bewertung von Schritt 63: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 63:
  `172.20.10.3` wird wie `localhost` als lokale Entwicklung erkannt und nutzt
  fuer Heart direkt die Cloud-Functions-API statt `/api/heart/` am Vite-Server.
  Dadurch sollen lokale 404 auf `heartGetDashboard` und `heartGetIncidents`
  verschwinden. Social-Routing, Vercel-Rewrites, QR, Cart, Order, Firebase
  Rules und Functions bleiben unveraendert.
- Schritt 64 ist abgeschlossen: Lokale Vite-Dev-/Preview-Routen liefern die
  Heart-Pretty-Routes wieder wie gewohnt aus.
- Bewertung von Schritt 64: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 64:
  `/leads`, `/customers` und `/admin/staff` werden lokal intern auf
  `/apps/mnyra-heart/index.html` geroutet, waehrend die Browser-URL erhalten
  bleibt. Heart kann dadurch lokal wie in Production anhand von
  `location.pathname` `crmLeads`, `crmCustomers` und `crmStaff` oeffnen. Bare
  `/staff`, Vercel-Rewrites, Root-Service-Worker, QR, Cart, Order, Firebase
  Rules und Functions bleiben unveraendert.
- Schritt 65 ist abgeschlossen: Der gleiche Heart-Pretty-Route-Vertrag wurde
  im tatsaechlich genutzten lokalen Dev-Server umgesetzt.
- Bewertung von Schritt 65: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 65:
  `npm run dev` nutzt `scripts/local-dev-server.mjs`, nicht den Vite-Dev-Server
  direkt. Dort wurden `/leads` und `/customers` aus `SOCIAL_ROUTES` entfernt
  und `/leads`, `/customers`, `/admin/staff` sowie `/admin/staff/:path*` werden
  vor dem Social-Fallback auf Heart geroutet. `/staff`, `/admin` und andere
  Social-/Waiter-/Kitchen-Pfade bleiben unveraendert.
- Schritt 66 ist abgeschlossen: Travel-Suche und sichtbarer Travel-Abstand
  wurden nach manueller Freigabe klein nachgezogen.
- Bewertung von Schritt 66: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 66:
  Die blaue Travel-Flaeche startet direkt unter dem Smart-Header, die
  Eingabecard hat im blauen Bereich mehr vertikalen Abstand, und die
  Travel-Eingabe bleibt beim Tippen stabil. Ab zwei Zeichen zeigt Travel
  albanische Stadtvorschlaege und passende Hotelvorschlaege aus den vorhandenen
  Travel-Profilen; Hotel-/Reisezielsuche matched jetzt alle vorhandenen
  Travel-Profile vor dem 24er-Anzeigelimit.
  Routing, QR, Cart, Order, Firebase Rules und Functions bleiben unveraendert.
- Schritt 67 ist abgeschlossen: Travel-Vorschlaege bleiben beim Tippen wie im
  Feed stabil offen.
- Bewertung von Schritt 67: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 67:
  Der Travel-Input rendert beim Tippen nicht mehr die gesamte Travel-View neu,
  sondern aktualisiert nur das Vorschlags-Dropdown direkt im DOM. Die Suche
  wird erst bei Enter, Suchbutton oder Vorschlagsauswahl committed. Dadurch
  verschwinden Stadt-/Hotelvorschlaege nicht mehr sofort durch den alten
  Re-Render-/Blur-Pfad. Routing, QR, Cart, Order, Firebase Rules und Functions
  bleiben unveraendert.
- Schritt 68 ist abgeschlossen: Travel-Stadt- und Reiseort-Aliasse fuer
  Albanien wurden sauberer nachgezogen.
- Bewertung von Schritt 68: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 68:
  `Shengjin`/`Shëngjin` sowie weitere albanische Staedte und Reiseorte wie
  `Ksamil`, `Dhermi`, `Velipoje`, `Theth`, `Valbone`, `Golem`, `Orikum`,
  `Borsh` und weitere Varianten werden in Travel-Vorschlaegen und im
  tatsaechlichen Travel-Matching gleich behandelt. Die lockere Normalisierung
  behandelt albanische Sonderzeichen explizit, sodass `ë` wie `e` und `ç` wie
  `c` funktioniert. Sobald eine Eingabe zu Stadt-/Reiseortvorschlaegen passt,
  zeigt das Dropdown keine Hotelvorschlaege darunter; Tippen allein committed
  keinen Travel-Zustand, uebernommen wird erst per Vorschlagsklick, Enter oder
  Suchbutton. Routing, QR, Cart, Order, Firebase Rules und Functions bleiben
  unveraendert.
- Schritt 69 ist abgeschlossen: Die Travel-Reiseziel-Card wurde vertikal
  symmetrischer positioniert und die Headline verkleinert.
- Bewertung von Schritt 69: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 69:
  Die blaue Travel-Suchflaeche nutzt oben jetzt `4.6rem` Abstand, damit die
  Reiseziel-Card zum Smart-Header aehnlicher steht wie unten zum `travelBenko`-
  Bereich. Die Headline `Schreibe dein Reiseziel` wurde von `text-xl` auf
  `text-lg` reduziert. Travel-Suche, Vorschlaege, Filterlogik, Karte, Routing,
  QR, Cart, Order, Firebase Rules und Functions bleiben unveraendert.
- Schritt 70 ist abgeschlossen: Heart-Leads hat jetzt einen Kategorie-Filter
  oberhalb der Suche und eine robustere Suchwert-Synchronisierung.
- Bewertung von Schritt 70: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 70:
  In Heart `Leads` wird oberhalb von `Lead suchen` ein `Kategorie`-Select
  gerendert, der dieselben Lead-Typen wie das Erstellen-Formular nutzt.
  Lead-Listen koennen nach Kategorie gefiltert werden. Die Suche prueft
  normalisierte Such-Tokens und synchronisiert Suchfelder auch auf `change`,
  damit eingefuegte komplette Begriffe/Wortgruppen nicht nur ueber
  Buchstabe-fuer-Buchstabe-Input funktionieren. `social-app.js`, Routing, QR,
  Cart, Order, Firebase Rules und Functions bleiben unveraendert.
- Schritt 71 ist abgeschlossen: Restaurants hat jetzt einen freigegebenen
  Marketplace-Gate-Sucheinstieg nach Feed-/Travel-Muster.
- Bewertung von Schritt 71: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 71:
  Der Tab `Restaurants` startet mit einer Coral-/nicht-blauen Gate-Flaeche,
  animierten Coffee-/Food-/Location-Icons, der Headline `Best coffee and food
  spots in your city.` und einem Feed-aehnlichen City-/Spot-Eingabefeld.
  Tippen zeigt stabile Vorschlaege aus vorhandenen Restaurant-/Cafe-/Food-
  Profilen; gefiltert wird erst per Enter, Suchbutton oder Vorschlagsauswahl.
  Routing, QR, Cart, Order, Travel, Firebase Rules und Functions bleiben
  unveraendert.
- Schritt 72 ist abgeschlossen: Restaurants nutzt jetzt das Feed-Location-
  Gate-Verhalten und dieselbe gespeicherte Location-Wahrheit wie Feed.
- Bewertung von Schritt 72: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 72:
  Wenn `mnyra_social_feed_viewer_location_v1` bereits durch Feed-Stadtwahl oder
  GPS-Standort gesetzt ist, rendert der Tab `Restaurants` direkt ohne Gate.
  Ohne Location erscheint die Coral-Flaeche mit Feed-aehnlichem Text-Slider
  `BEST RESTAURANTS.` / `BEST COFFEES.`, darunter `IN YOUR CITY.`, sowie dem
  Feed-aehnlichen Location-Input und Standortbutton. Der darunterliegende
  `restaurantsBenko`-Bereich bleibt ohne Location bewusst leer. Routing, QR,
  Cart, Order, Travel, Firebase Rules und Functions bleiben unveraendert.
- Schritt 73 ist abgeschlossen: Der leere `restaurantsBenko`-Bereich nutzt
  jetzt dieselbe obere Bento-Geometrie wie das Feed-Gate.
- Bewertung von Schritt 73: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 73:
  `restaurantsBenko` hat jetzt Feed-aehnliche `loc-bento`-Klassen, `2.5rem`
  obere Abrundung, `-2.5rem` Ueberlappung, Layering und Shadow. Dadurch soll
  die leere Benko-Oberkante im Restaurant-Gate sichtbar wie beim Feed-Gate in
  die Coral-Flaeche hineinragen. Restaurant-Location-Logik, Gate-Text,
  Routing, QR, Cart, Order, Travel, Firebase Rules und Functions bleiben
  unveraendert.
- Schritt 74 ist abgeschlossen: Die normalen Restaurant-/Cafe-Karten im
  Restaurants-Tab nutzen die freigegebene Premium-Card mit Titelbild,
  Oeffnungszeiten, drei frei pflegbaren Feature-Chips und Profil/Menu-Buttons.
- Bewertung von Schritt 74: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 74:
  Nur die normalen List-Cards im Restaurants-Tab wurden ersetzt; die oberen
  Swipe-/Best-Cards bleiben unveraendert. `Profil` oeffnet das Restaurant-
  Profil, `Menu` oeffnet direkt den Menu-Tab. Beim Erstellen/Bearbeiten von
  Restaurant-/Cafe-Leads koennen Titelbild, Oeffnungszeiten sowie die drei
  Card-Feature-Texte gepflegt und in Lead/Restaurant-Daten gespeichert werden.
  Routing, QR, Cart, Order, Travel, Firebase Rules und Functions bleiben
  unveraendert.
- Schritt 75 ist abgeschlossen: Die normale Restaurant-/Cafe-List-Card wurde
  visuell enger an die vom Nutzer gelieferte Card-Vorlage angeglichen.
- Bewertung von Schritt 75: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 75:
  Die Card ist jetzt wie in der Vorlage auf `max-w-[340px]` zentriert, zeigt
  die Quick-Actions oben rechts, den Preis-Tag unten rechts im Titelbild und
  nutzt die gleiche runde/kompakte Premium-Geometrie inklusive fester
  Bewertungszeile. Da mehrere Klassen aus der Nutzer-Vorlage in der statischen
  `tailwind.generated.css` fehlen, wurden die kritischen Werte fuer
  Card-Breite, Radius, Profilbildposition, Logo-Groesse und Titelbild-Gradient
  lokal an der Card abgesichert. Die oberen Swipe-/Best-Cards,
  Lead-Speicherung, Profil/Menu-Open-Flow, Routing, QR, Cart, Order, Travel,
  Firebase Rules und Functions bleiben unveraendert.
- Schritt 76 ist abgeschlossen: Die normale untere Restaurant-/Cafe-List-Card
  im Restaurants-Tab nutzt wieder die volle Content-Breite und hat lokale
  Inline-Fallbacks fuer fehlende Card-Icons.
- Bewertung von Schritt 76: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 76:
  Die unteren normalen Restaurant-/Cafe-Cards sind nicht mehr auf `340px`
  zentriert, sondern beginnen links wieder an derselben Containerkante wie die
  obere Swipe-/Best-Card-Zeile. Zusaetzlich rendert der Marketplace-Renderer
  die Card-Icons fuer Teilen, Telefon und Menu lokal inline, falls die
  verzoegerte Lucide-Runtime noch nicht nachgezogen hat. Die oberen
  Swipe-/Best-Cards, Lead-Speicherung, Profil/Menu-Open-Flow, Routing, QR,
  Cart, Order, Travel, Firebase Rules und Functions bleiben unveraendert.
- Schritt 77 ist abgeschlossen: Restaurants nutzt bei gesetzter Feed-Location
  das identische Feed-Location-Eingabefeld im Smart-Header und filtert
  Restaurant-/Cafe-Cards nach dieser Location.
- Bewertung von Schritt 77: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 77:
  Wenn `mnyra_social_feed_viewer_location_v1` gesetzt ist, zeigt `Restaurants`
  oben im Smart-Header dasselbe Location-Feld wie Feed. Aenderungen in diesem
  Feld speichern weiter dieselbe Location-Wahrheit und rendern den Restaurant-
  Tab direkt neu. Die sichtbaren Restaurant-/Cafe-Cards werden nach Stadt-/
  Adressfeldern, Schreibvarianten und vorhandenen Koordinaten gegen die
  gesetzte Location gefiltert. Restaurant-Cards, Gate ohne Location, QR, Cart,
  Order, Travel, Firebase Rules und Functions bleiben unveraendert. Auf
  ausdruecklichen Nutzerwunsch wurde dieser Schritt auf Branch `main`
  umgesetzt.
- Schritt 78 ist abgeschlossen: Der Restaurant-Header zeigt den gesetzten
  Location-Haken korrekt und die Restaurant-/Cafe-Filterung wurde auf echte
  Standortdaten eingegrenzt.
- Bewertung von Schritt 78: `bestanden mit kleinem Rest-Risiko`.
- Wichtigster Effekt aus Schritt 78:
  Das identische Feed-Location-Feld im Restaurant-Header nutzt jetzt den
  bestehenden Feed-DOM-Sync, sodass rechts der Haken erscheint, wenn eine
  Location gesetzt ist. Der Restaurant-/Cafe-Filter matched nicht mehr ueber
  Name, Businessname, Description, Bio oder About, sondern nur noch ueber
  Standortfelder, `locations[]`, Region/District und Koordinaten. Dadurch fuehrt
  `Prishtina` nicht mehr zu denselben allgemeinen Restaurant-/Cafe-Ergebnissen,
  nur weil der Begriff irgendwo ausserhalb der Standortdaten vorkommt. Gate,
  Cards, Feed-Storage-Key, QR, Cart, Order, Travel, Firebase Rules und Functions
  bleiben unveraendert.
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
- Referenz: [docs/mnyra-step34-social-app-cache-version-bump.md](./mnyra-step34-social-app-cache-version-bump.md)
- Referenz: [docs/mnyra-step35-public-menu-focus-lockstep-render.md](./mnyra-step35-public-menu-focus-lockstep-render.md)
- Referenz: [docs/mnyra-step36-profile-posts-full-visibility.md](./mnyra-step36-profile-posts-full-visibility.md)
- Referenz: [docs/mnyra-step37-ceo-staff-heart-route.md](./mnyra-step37-ceo-staff-heart-route.md)
- Referenz: [docs/mnyra-step38-profile-runtime-boundary.md](./mnyra-step38-profile-runtime-boundary.md)
- Referenz: [docs/mnyra-step39-profile-chat-runtime-bundle-cut.md](./mnyra-step39-profile-chat-runtime-bundle-cut.md)
- Referenz: [docs/mnyra-step40-public-route-entry-contract.md](./mnyra-step40-public-route-entry-contract.md)
- Referenz: [docs/mnyra-step41-profile-menu-focus-render-boundary.md](./mnyra-step41-profile-menu-focus-render-boundary.md)
- Referenz: [docs/mnyra-step42-profile-menu-focus-preload-timing.md](./mnyra-step42-profile-menu-focus-preload-timing.md)
- Referenz: [docs/mnyra-step43-public-profile-menu-runtime-guard.md](./mnyra-step43-public-profile-menu-runtime-guard.md)
- Referenz: [docs/mnyra-step44-public-profile-split-candidate-map.md](./mnyra-step44-public-profile-split-candidate-map.md)
- Referenz: [docs/mnyra-step45-social-engagement-runtime-boundary.md](./mnyra-step45-social-engagement-runtime-boundary.md)
- Referenz: [docs/mnyra-step46-crm-domain-runtime-boundary.md](./mnyra-step46-crm-domain-runtime-boundary.md)
- Referenz: [docs/mnyra-step47-firebase-loading-hardening-plan.md](./mnyra-step47-firebase-loading-hardening-plan.md)
- Referenz: [docs/mnyra-step48-public-posts-loading-hardening.md](./mnyra-step48-public-posts-loading-hardening.md)
- Referenz: [docs/mnyra-step49-menu-focus-no-hang-hardening.md](./mnyra-step49-menu-focus-no-hang-hardening.md)
- Referenz: [docs/mnyra-step50-route-profile-read-dedupe.md](./mnyra-step50-route-profile-read-dedupe.md)
- Referenz: [docs/mnyra-step51-launch-audit-firebase-auth-hardening.md](./mnyra-step51-launch-audit-firebase-auth-hardening.md)
- Referenz: [docs/mnyra-step52-launch-surface-read-and-deploy-cleanup.md](./mnyra-step52-launch-surface-read-and-deploy-cleanup.md)
- Referenz: [docs/mnyra-step53-website-language-selector-i18n.md](./mnyra-step53-website-language-selector-i18n.md)
- Referenz: [docs/mnyra-step54-language-toggle-icon-restoration.md](./mnyra-step54-language-toggle-icon-restoration.md)
- Referenz: [docs/mnyra-step55-marketplace-drawer-categories.md](./mnyra-step55-marketplace-drawer-categories.md)
- Referenz: [docs/mnyra-step56-marketplace-browser-back-route-fix.md](./mnyra-step56-marketplace-browser-back-route-fix.md)
- Referenz: [docs/mnyra-step57-marketplace-ui-spacing-cleanup.md](./mnyra-step57-marketplace-ui-spacing-cleanup.md)
- Referenz: [docs/mnyra-step58-marketplace-header-text-removal.md](./mnyra-step58-marketplace-header-text-removal.md)
- Referenz: [docs/mnyra-step59-marketplace-card-gap-increase.md](./mnyra-step59-marketplace-card-gap-increase.md)
- Referenz: [docs/mnyra-step60-marketplace-card-gap-inline-fix.md](./mnyra-step60-marketplace-card-gap-inline-fix.md)
- Referenz: [docs/mnyra-step61-marketplace-card-gap-reduction.md](./mnyra-step61-marketplace-card-gap-reduction.md)
- Referenz: [docs/mnyra-step62-travel-hotels-heart-routes.md](./mnyra-step62-travel-hotels-heart-routes.md)
- Referenz: [docs/mnyra-step63-heart-local-lan-api-base.md](./mnyra-step63-heart-local-lan-api-base.md)
- Referenz: [docs/mnyra-step64-local-heart-pretty-routes.md](./mnyra-step64-local-heart-pretty-routes.md)
- Referenz: [docs/mnyra-step65-local-dev-server-heart-routes.md](./mnyra-step65-local-dev-server-heart-routes.md)
- Referenz: [docs/mnyra-step66-travel-search-spacing-fix.md](./mnyra-step66-travel-search-spacing-fix.md)
- Referenz: [docs/mnyra-step67-travel-suggestions-feed-behavior.md](./mnyra-step67-travel-suggestions-feed-behavior.md)
- Referenz: [docs/mnyra-step68-travel-albania-city-aliases.md](./mnyra-step68-travel-albania-city-aliases.md)
- Referenz: [docs/mnyra-step69-travel-search-card-spacing.md](./mnyra-step69-travel-search-card-spacing.md)
- Referenz: [docs/mnyra-step70-heart-leads-category-filter-search.md](./mnyra-step70-heart-leads-category-filter-search.md)
- Referenz: [docs/mnyra-step71-restaurants-gate-search.md](./mnyra-step71-restaurants-gate-search.md)
- Referenz: [docs/mnyra-step72-restaurants-feed-location-gate.md](./mnyra-step72-restaurants-feed-location-gate.md)
- Referenz: [docs/mnyra-step73-restaurants-benko-feed-radius.md](./mnyra-step73-restaurants-benko-feed-radius.md)
- Referenz: [docs/mnyra-step74-restaurants-card-lead-details.md](./mnyra-step74-restaurants-card-lead-details.md)
- Referenz: [docs/mnyra-step75-restaurants-card-ui-parity.md](./mnyra-step75-restaurants-card-ui-parity.md)
- Referenz: [docs/mnyra-step76-restaurants-card-width-icons.md](./mnyra-step76-restaurants-card-width-icons.md)
- Referenz: [docs/mnyra-step77-restaurants-header-location-filter.md](./mnyra-step77-restaurants-header-location-filter.md)
- Referenz: [docs/mnyra-step78-restaurants-header-location-filter-fix.md](./mnyra-step78-restaurants-header-location-filter-fix.md)
- Referenz: [docs/mnyra-step79-restaurants-location-complete-filter.md](./mnyra-step79-restaurants-location-complete-filter.md)

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

- Es wird nur auf Branch `refactorapp` gearbeitet.
- `finale-mnyra` und `finale-mnyra-clean` bleiben Referenz-Branches.
- Keine direkte Arbeit auf `main`.
- Nach jedem Schritt:
  klare Doku, klarer Commit, Commit-Hash melden, geaenderte Dateien melden, kurze manuelle Testliste liefern.
- Keine stillen Zusatz-Aenderungen ausserhalb des vereinbarten Schritts.

## Naechster Schritt

Nach Schritt 79 sind die naechsten sinnvollen separaten Folgeschritte:

- Separater Hotel-Owner-Tool-Schritt fuer Zimmer, Fotos, Ausstattung,
  Strandentfernung und Hotel-spezifische Details, die spaeter im Profil und in
  Travel-Cards erscheinen.
- Separater Performance-/Pagination-Schritt fuer sehr grosse Business-Profile,
  falls Vollstaendigkeits- und Pagination-Vertrag fachlich freigegeben wird.
- Separater kleiner Icon-Runtime-Schritt fuer weitere fehlende Lucide-Icons in
  Modals, Drawer und Menu-Bereichen.
- Separater i18n-Nachzug fuer Admin-/CRM-/interne Spezialtexte, falls diese
  sichtbar Teil des Launch-Scopes werden.
- Separater Marketplace-/Travel-Feinschliff nur nach manueller Sichtpruefung und
  eigener Freigabe fuer UI, Sortierung oder weitere Lead-Typ-Zuordnungen.

Dabei gilt weiter:

- Keine weitere UI-/Design-Aenderung ohne ausdrueckliche Freigabe.
- Keine Route-, QR-, Cart-, Order-, Firebase-Rules- oder Functions-Aenderung.
- Kein Storefront-/Renderer-Umbau.
- Keine Icon-/UI-Aenderung ohne eigenen Schritt.
- Route/Profile-Dedupe darf QR nicht veraendern.

Die manuelle Gegenpruefung des frischen Schritt-79-Stands bleibt weiterhin
sinnvoll, besonders nach einem Neustart des lokalen Dev-Servers: Restaurants-
Gate ohne Feed-Location inklusive Feed-aehnlich gerundeter Benko-Oberkante,
Restaurants ohne Gate nach Feed-Stadtwahl oder GPS-Standort inklusive
identischem Feed-Location-Feld im Smart-Header, sichtbarem Haken und streng
nach Standortdaten gefilterten Restaurant-/Cafe-Cards inklusive aller
passenden Treffer der gesetzten Stadt, normale
Restaurant-/Cafe-List-Cards mit gleicher linker Content-Kante wie die obere
Swipe-Zeile, sichtbaren Teilen-/Telefon-/Menu-Icons, Titelbild/
Oeffnungszeiten/Feature-Chips und Profil/Menu-Buttons inklusive der Nutzer-
Card-Geometrie, Lead-Erstellung/-Bearbeitung fuer Restaurant/Cafe mit
Titelbild und Card-Details, Heart lokal
unter privater LAN-IP mit `/leads`, `/customers` und `/admin/staff`, inklusive
Heart-Leads-Kategorie-Filter und eingefuegter Suchbegriffe, Travel-Hotels,
Travel-Karte, Hotel-Details-Profil, Heart/CRM aus dem Social-Drawer sowie die
bisherigen
Public-Profile/Menu/QR/Cart/Order-Flows.

Ein Ziel um 100 kB gzip ist mit sicheren Boundary-Schnitten allein nicht
realistisch. Dafuer braucht es spaeter einen echten leichten Public-Renderer
und eine sauber verifizierte Trennung von Public Profile/Menu/Cart/Order/QR.
Dieser groessere Schritt darf erst nach manueller Stabilitaetspruefung und
einem eigenen Vertrag geplant werden.

## Guardrails fuer die naechsten Schritte

- keine Produktaenderungen
- keine Logikaenderungen
- keine Routing-, Firebase-, Functions- oder Rules-Aenderungen ausserhalb des klar definierten Route-Vertrags
- keine UI- oder Design-Aenderungen
- keine Scope-Erweiterung
