Status: CURRENT
Last updated: 2026-04-22

# Mnyra Schritt 2: Route-, Daten- und Zustaendigkeitsmatrix

## Ziel von Schritt 2

Schritt 2 uebersetzt die in Schritt 1 festgelegten Regeln in eine konkrete technische Landkarte. Noch nichts wird umgebaut. Festgezogen wird nur, welche Route fachlich wofuer steht, welche Daten dort sichtbar sein duerfen, welche Quelle dort die verbindliche Wahrheit sein soll und wo heute Mehrfach-Zustaendigkeit oder Drift sitzt.

Zur Einordnung der Aussagen gelten zwei Markierungen:

- `klar nachgewiesen`: im aktuellen Code oder in den aktuellen Vertragsdokumenten direkt belegt
- `noch fachlich zu klaeren`: fuer die Zielarchitektur sinnvoll, aber vor dem Umbau noch ausdruecklich zu fixieren

## Route-Matrix

| Route | Heutiger Status | Gewuenschter fachlicher Status | Sichtbarkeit | Erlaubte Inhalte | Wahrheit ist heute / soll spaeter sein | Hauptzustaendige Datei oder Bereich | Wichtigste Gefahr oder Kollision | Einordnung |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Redirect auf `/feed` | spaeter klarer Website-/Handoff-Einstieg, nicht nur App-Alias | oeffentlich mit Auth-Einstieg | Einstieg und Discovery, keine privaten App-Daten | heute faktisch Feed; spaeter eigener Root-Vertrag | `vercel.json` | Root und Feed sind fachlich gekoppelt | `noch fachlich zu klaeren` |
| `/:slug` | kanonische Business-URL im Social-Shell | kanonische oeffentliche Restaurant-Startseite | oeffentlich | Restaurant-Identitaet, oeffentliche Teaser, erlaubte Counts, Einstieg zu Menue und Posts | heute Hybrid aus Route-Seed, Preview und Live-Daten; spaeter klare Public-Business-Wahrheit | `apps/menyra-social/core/router/public-business-route-utils.js`, `apps/menyra-social/core/auth/initial-route-state.js`, `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`, `apps/menyra-social/core/profile/profile-open-flow-utils.js` | Public-Route und App-Logik greifen ineinander | `klar nachgewiesen` |
| `/:slug/menu` | kanonische oeffentliche Menue-URL, QR landet hier | bleibt kanonische Menue-URL | oeffentlich | oeffentliches Menue, Restaurantkopf, expliziter QR-Kontext | heute mehrere Menuepfade; spaeter `restaurants/{rid}/public/menu` | `public-business-route-utils.js`, `public-profile-direct-entry-controller.js`, `profile-open-flow-utils.js`, `session-data-runtime-controller.js` | mehrere Menuequellen konkurrieren | `klar nachgewiesen` |
| `/:slug/posts` | explizite oeffentliche Posts-URL | bleibt kanonische Posts-URL | oeffentlich | oeffentliche Posts plus Restaurantkopf | heute Route-Seed plus Live-Posts; spaeter `restaurants/{rid}/socialPosts/{postId}` | `public-profile-direct-entry-controller.js`, `profile-open-flow-utils.js`, Runtime-Ensurer im Profilbereich | sichtbarer Surface-State war bereits ueber mehrere Stellen verteilt | `klar nachgewiesen` |
| `/:slug/posts` optional | fachlich relevant und im Routing vorgesehen | oeffentliche Posts-Surface nur dann sichtbar, wenn Route es explizit verlangt | oeffentlich | nur oeffentliche Posts, keine internen App-Zustaende | Kanonische Post-Wahrheit bleibt in `socialPosts`, Feed nur Projektion | gleiche Zustaendigkeit wie oben | Gefahr ist Drift zwischen Feed-Logik und Posts-Surface | `klar nachgewiesen` |
| `/feed` | Gast-erlaubte Feed-Tab, zugleich Root-Ziel | Discovery-/Feed-Einstieg, aber nicht Business-Canonical | oeffentlich mit Auth-Einstieg | oeffentliche Feed-Projektionen | Feed ist Projektion, nicht kanonische Post-Wahrheit | `vercel.json`, `apps/menyra-social/index.html`, Auth-Guards, Bootstrap-Flows | Feed und Root sind fachlich vermischt | `klar nachgewiesen` |
| `/search` | Gast-erlaubte Discovery-Tab | oeffentliche Suche mit Auth-Handoff | oeffentlich mit Auth-Einstieg | oeffentliche Restaurant- und User-Discovery | heute Discovery-Mix; spaeter kanonische Restaurant-Identitaet, Slug und Geo | Search-/Discovery-Bereich in `apps/menyra-social`, Auth-Guards | Suche kann von Slug- und Identity-Wahrheit wegdriften | `klar nachgewiesen` |
| `/map` | Gast-erlaubte Map-Tab | oeffentliche Karten-Discovery mit Auth-Handoff | oeffentlich mit Auth-Einstieg | oeffentliches Geo und Restaurantkarten | heute Preview- und Discovery-Mix; spaeter Geo aus `restaurants/{rid}` | Map-/Discovery-Bereich in `apps/menyra-social`, Auth-Guards | Geo-Fallbacks koennen fachlich falsche Sicht erzeugen | `klar nachgewiesen` |
| `/login` | Auth-Einstieg in dieselbe Social-App | reiner oeffentlicher Auth-Einstieg | oeffentlich mit Auth-Einstieg | nur Auth-UI und Auth-State | keine Produkt-Wahrheit, nur Auth-Mode | `public-business-route-utils.js`, `initial-route-state.js`, `session-tab-guards.js` | darf keine versteckte Produkt-Route werden | `klar nachgewiesen` |
| `/register` | Auth-Einstieg in dieselbe Social-App | reiner oeffentlicher Auth-Einstieg | oeffentlich mit Auth-Einstieg | nur Auth-UI und Auth-State | keine Produkt-Wahrheit, nur Auth-Mode | `public-business-route-utils.js`, `initial-route-state.js`, `session-tab-guards.js` | gleiche Gefahr wie `/login` | `klar nachgewiesen` |
| `/waiter` | separates Waiter-App | rein interne Betriebsflaeche | App-intern | Orders, Tische, Bedienkontext mit Rollenpruefung | `restaurants/{rid}/orders` plus Waiter-Zugriff | `apps/waiter/waiter-app.js` | Zugriffslogik sitzt nicht nur an einer Stelle | `klar nachgewiesen` |
| `/heart` | separates Heart-App mit eigener API | rein interne Ops-/Backoffice-Flaeche | App-intern | interne Betriebs- und Backoffice-Daten | Heart-Backend und Heart-API, nicht Public-Truth | `apps/mnyra-heart/*`, `/api/heart/*` | eigener Zugriffspfad neben Social-App | `noch fachlich zu klaeren` |
| Public/App-Handoff | heute im selben Shell gemischt | explizite Grenze zwischen Public-Routen und App-Tabs | Grenzbereich | Public nur public; App nur session- oder rollenbezogen | heute verteilt; spaeter ein klarer Handoff-Vertrag | `vercel.json`, `public-business-route-utils.js`, `initial-route-state.js`, `public-profile-direct-entry-controller.js`, `profile-open-flow-utils.js` | groesste Drift-Stelle im System | `klar nachgewiesen` |
| Reserved Routes / reservierte Segmente | explizite Sperrliste fuer Slugs vorhanden | muss als Vertrag stabil bleiben | Schutzregel | darf nicht als Restaurant-Slug benutzt werden | die Segmentliste selbst ist die Wahrheit | `public-business-route-utils.js` plus Vercel-Routing | neue Route kann sonst Slug-Raum ueberschreiben | `klar nachgewiesen` |

## Verbindliche Invarianten fuer betroffene Routen

- `/:slug/menu` (inkl. QR-Einstieg): QR aus dem Menu-Editor muss weiterhin auf dieselbe Profilseite fuehren und dort das Menu sofort sichtbar oeffnen. Diese Laufzeitwirkung ist aktuell verbindlich.
- `/login`: aktuelles Verhalten "direkter Weg zu /feed" bleibt als feste Invariante bestehen, bis eine spaetere bewusste Produktentscheidung etwas anderes festlegt.

## Daten-Matrix

| Datenart | Was das ist | Wo sie benutzt wird | Verbindliche Wahrheit | Darf oeffentlich sein | Wichtigste Gefahr heute | Einordnung |
| --- | --- | --- | --- | --- | --- | --- |
| Restaurant-Identitaet | Name, Bild, Kurzinfo, sichtbare Business-Basisdaten | Feed, Search, Map, `/:slug`, Menue, Posts | spaeter kanonisch `restaurants/{rid}`; Preview nur Preview, `public/meta` nur oeffentliche Leseschicht | teilweise ja | Preview, `public/meta`, Cache und kanonische Daten koennen driften | `klar nachgewiesen` |
| Slug / Canonical Path | oeffentliche Business-URL und ihre kanonische Form | `/:slug`, `/:slug/menu`, `/:slug/posts`, Legacy `/b/:slug/*` | ein klarer Slug-Vertrag; genauer Persistenzort noch festzuziehen | ja | Slug-Kollisionen, Alias-Drift, Konflikte mit reservierten Segmenten | `noch fachlich zu klaeren` |
| Oeffentliches Menue | lesbares Menue fuer Web und QR | `/:slug/menu`, QR, Menueansicht im Public-Profil | `restaurants/{rid}/public/menu`; Authoring in `restaurants/{rid}/menuItems` | ja | Public-Menue und Authoring-/Migrationspfade sind vermischt | `klar nachgewiesen` |
| Oeffentliche Posts | lesbare Restaurant-Posts | `/:slug`, `/:slug/posts`, Feed | `restaurants/{rid}/socialPosts/{postId}`; Feed nur Projektion | ja | Feed- oder Bootstrap-Daten koennen wie Wahrheitsdaten behandelt werden | `klar nachgewiesen` |
| Oeffentliche Counts | sichtbare aggregierte Kennzahlen | oeffentliche Profile und Teaser | nur abgeleitet aus kanonischen Quellen; genauer Vertragsort offen | ja, nur aggregiert | veraltete Counts in Snapshots oder Preview-Zustaenden | `noch fachlich zu klaeren` |
| Rollen / Zugriff | Business-, Staff-, Owner-, User-Zugriffe | Auth-Guards, interne Flaechen, Betriebsflaechen | Rollenquellen existieren, finaler Vertragsort ist aber noch nicht sauber festgezogen | nein | Session-Hints, Guards und Live-Daten koennen auseinanderlaufen | `noch fachlich zu klaeren` |
| Waiter-Zugriff | Rollen- und Restaurantbezug fuer Waiter | `/waiter`, Order-Bedienung, Waiter-Benachrichtigungen | Restaurant-Zugriff plus `restaurants/{rid}/orders` | nein | Zugriff wird in mehreren Stellen interpretiert | `noch fachlich zu klaeren` |
| CEO-/Heart-Zugriff | interne Ops- und Backoffice-Berechtigungen | `/heart`, interne Heart-Flaechen | Heart-Backend/Auth; genauer Rollenvertrag noch offen | nein | getrennte Zugriffswelt neben Social-App | `noch fachlich zu klaeren` |
| Orders / Lookup / Spiegel-Daten | Bestellungen, User-Spiegel, Gast-Recovery | Orders, eigener Bestellstatus, Waiter | kanonisch `restaurants/{rid}/orders/{orderId}`; Spiegel in `users/{uid}/orders`; Lookup nur Ableitung | nein, nur im eigenen Kontext | Mirror und Lookup koennen hinterherlaufen | `klar nachgewiesen` |
| Bootstrap-Preview / Direct-Route-Seed | Vorschau- und Kaltstartdaten fuer Public-Routen und Feed | direkter Web-Einstieg, Public-Business-Routen, Feed-Bootstrap | ausdruecklich nicht kanonisch, nur Vorschauschicht | ja, aber nur als Preview | Preview wird leicht mit echter Wahrheit verwechselt | `klar nachgewiesen` |

## Zustaendigkeits-Matrix

| Bereich | Heute hauptsaechlich zustaendig | Wo Doppelzustaendigkeit oder Drift sichtbar ist | Einordnung |
| --- | --- | --- | --- |
| Routing | `vercel.json` fuer aeusseres Routing, `apps/menyra-social/core/router/public-business-route-utils.js` fuer innere Route-Wahrheit | `initial-route-state.js` und `index.html` interpretieren Route zusaetzlich | `klar nachgewiesen` |
| Public-Truth | `functions/index.js` fuer Bootstrap, `public-bootstrap-runtime-controller.js`, `restaurant-identity-runtime-controller.js`, `session-data-runtime-controller.js` | Preview, Cache, `public/meta` und Restaurant-Dokument konkurrieren | `klar nachgewiesen` |
| Auth-/Guard-Logik | `apps/menyra-social/core/auth/initial-route-state.js`, `apps/menyra-social/core/auth/session-tab-guards.js` | Auth-Einstieg, Gast-Guards und Public-Direct-Entry haengen eng zusammen | `klar nachgewiesen` |
| Waiter | `apps/waiter/waiter-app.js` | Zugriff und Order-Sicht haengen zusaetzlich an Backend-Flows und Mirror-Daten | `klar nachgewiesen` |
| Heart | `apps/mnyra-heart/index.html`, `apps/mnyra-heart/heart.js`, `/api/heart/*` | eigener Zugriffspfad neben Social-App; Vertrag noch nicht vollstaendig festgezogen | `noch fachlich zu klaeren` |
| Public/App-Handoff | `public-profile-direct-entry-controller.js`, `profile-open-flow-utils.js`, route-nahe Startup-Flows | Seed, Open-Flow, Ensurer und Renderer beruehren denselben sichtbaren Surface-State | `klar nachgewiesen` |

## Die 5 groessten Konflikte vor dem ersten Umbau

1. `/` ist heute nur ein Alias auf `/feed`. Fuer website-first braucht es aber einen klaren Frontdoor-Vertrag.
   Einordnung: `noch fachlich zu klaeren`
2. System-Routen und Restaurant-Slugs teilen sich denselben URL-Raum.
   Ohne stabile Reserved Segments ist jede neue Route kollisionsgefaehrdet.
   Einordnung: `klar nachgewiesen`
3. Die Zustaendigkeit fuer `/:slug`, `/:slug/menu` und `/:slug/posts` ist ueber Rewrite, Route-Parser, Initial-State, Direct-Entry, Open-Flow und Runtime-Ensurer verteilt.
   Genau diese Verteilung war bereits Ursache fuer Public-Fixes.
   Einordnung: `klar nachgewiesen`
4. Oeffentliche Wahrheit ist heute nicht singulaer.
   Bootstrap-Preview, `public/meta`, Cache, Restaurant-Dokument und projektionierte Feed-Daten greifen ineinander.
   Einordnung: `klar nachgewiesen`
5. Orders und interne Zugriffe haben mehrere Ebenen zugleich.
   Kanonische Restaurant-Orders, User-Mirror, Gast-Lookup, Waiter-Zugriff und Heart-Zugriff duerfen nicht ohne klaren Sichtbarkeitsvertrag verschoben werden.
   Einordnung: Restaurant-Orders `klar nachgewiesen`, genauer Rollenvertrag teils `noch fachlich zu klaeren`

## Sicherster erster kleiner technischer Umbau danach

Am sichersten ist zuerst ein rein technischer Public-Route-Vertrag an einer Stelle. Festgezogen werden sollte die kanonische Zustaendigkeit fuer `/:slug`, `/:slug/menu`, `/:slug/posts` plus Reserved Segments, ausgehend von `apps/menyra-social/core/router/public-business-route-utils.js` und den direkten Konsumenten.

Begruendung:

- kleinster Blast Radius
- keine UI-Aenderung
- keine Routing-Grenzen nach aussen verschieben
- keine Firebase-, Functions- oder Rules-Aenderung
- reduziert direkt die groesste Drift im Public/App-Handoff

## Was ausdruecklich noch nicht gemacht werden soll

- keine UI- oder Design-Aenderung
- kein breiter Public- oder Root-Umbau an `/`
- kein grosser Routing-Refactor
- kein Verschieben der Grenzen zwischen Social, Waiter und Heart auf Verdacht
- keine Firebase-, Functions- oder Rules-Aenderung ohne vorher fixierten Visibility-Vertrag
- kein Tausch von Wahrheitsquellen auf Verdacht
- keine Performance-Arbeit
- keine Smoke-, Playwright- oder E2E-Laeufe
- keine Produktlogik-Aenderung
