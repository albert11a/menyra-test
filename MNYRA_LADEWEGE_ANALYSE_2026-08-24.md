Status: CURRENT
Branch: claude/mnyra-data-load-analysis-vic542
Stand: 2026-08-24
Art: Analyse. **Keine Code-Aenderung.** Working Tree nach der Analyse unveraendert.
Visuelle Fassung: https://claude.ai/code/artifact/e303b510-2b30-4ddf-a9f1-0842a307ea21

# Mnyra - Daten-, Ladewege- und Ladezeiten-Analyse

Schwerpunkt: **Qyteti (Feed) + Stories**. Zusaetzlich Build/Bundles, Netzwerkschicht,
Datenwege und Bildstabilitaet (Flackern).

---

## 0. Was gemessen wurde und wie

Reproduzierbar, alles lokal gegen den echten Produktions-Build.

```
npm install
npm run build                      # deterministisch: identische Hashes wie im Repo
node scripts/check-mnyra-social-bundle-budget.mjs
npm run arch:cycles
```

Messaufbau:

- Statischer Server gegen `dist/`, der die **Cache-Header aus `vercel.json` nachbildet**
  (`/feed` -> `no-store`, `bundled/chunks/*` -> `immutable`, `bundled/entry/*` -> `no-cache`).
- Chromium (vorinstalliert), Viewport 390x844, DPR 3, Mobile/Touch.
- CPU-Drossel 4x (mittelklassiges Android).
- Netzprofile: Slow 4G (1,6 Mbit/s, 150 ms RTT), Fast 4G (9 Mbit/s, 60 ms RTT), ungedrosselt.
- Alle Fremd-Hosts (Firebase, Fonts, CDN) geblockt -> gemessen wird die **statische
  Startstrecke**, ohne Rauschen durch fremde Latenzen.

Was das **nicht** abdeckt (ehrliche Luecke, siehe Abschnitt 8): echte Firestore-Latenz,
echte Datenmengen, echte Bilder, Vercel-TTFB, iOS/Safari.

---

## 1. Die Kernzahlen

### Kaltstart `/feed` (Qyteti)

| Profil | First Paint | **First Contentful Paint** | Transfer | JS entpackt | Requests |
|---|---:|---:|---:|---:|---:|
| Slow 4G, CPU 4x | 484 ms | **4.108 ms** | 633 kB | 2.240 kB | 39 |
| Fast 4G, CPU 4x | 240 ms | **1.336 ms** | 647 kB | 2.240 kB | 40 |
| Ohne Netzdrossel, CPU 4x | 140 ms | **876 ms** | 647 kB | 2.240 kB | 40 |

### Wiederholte Navigation (gleicher Browser, warmer Cache)

| Lauf | First Paint | FCP | Subresource-Transfer | Dokument |
|---|---:|---:|---:|---:|
| Kalt | 484 ms | 4.048 ms | 610 kB | wird geladen |
| Warm (2. Aufruf) | 112 ms | 580 ms | **0 kB** (31/39 aus Cache) | **wird komplett neu geladen** |
| Warm (3. Aufruf) | 100 ms | 460 ms | **0 kB** | **wird komplett neu geladen** |

**Lesart:** Zwei voneinander unabhaengige Bremsen.

1. **Bytes** - dominiert auf Slow 4G. Von 484 ms bis 4.108 ms passiert nichts ausser
   Warten auf JavaScript. Die Leitung ist von 434 ms bis 3.550 ms durchgehend voll.
2. **Parse/Ausfuehrung** - der Boden bei ~876 ms selbst mit unbegrenzter Bandbreite.
   2,24 MB entpacktes JavaScript muessen bei **jeder** Navigation neu geparst und
   ausgefuehrt werden. Gemessene Long Tasks: 2 Stueck, zusammen 334-389 ms.

Der Punkt, der am meisten weh tut: **`#app` ist beim Start leer**
(`<div id="app" aria-busy="true"></div>`). Es gibt kein statisches Skelett. Also kann
bis zum Ende der JS-Kette *nichts* Inhaltliches erscheinen.

---

## 2. Build & Bundles

### 2.1 Der eigentliche Kaltstart-Preis ist nicht der Entry

Der Entry `entry/social-app.js` ist 524 kB / 140,6 kB gzip. Das ist aber nur ein Teil.
Der **statische (eager) Modulgraph** des App-Entries:

```
26 Chunks   1.980 kB raw   576 kB gzip   480 kB brotli
```

Alle 26 werden bei *jedem* App-Start geladen, **bevor** irgendeine Routen-Entscheidung
faellt. Aufschluesselung (gzip), sortiert:

| Chunk | raw | gzip | Wird auf Qyteti gebraucht? |
|---|---:|---:|---|
| `entry/social-app.js` | 511,8 kB | 137,1 kB | teilweise |
| `vendor-firebase` | 453,9 kB | 135,9 kB | **nein, nicht fuer den ersten Paint** |
| `domain-feed-social-eager` | 375,4 kB | 108,4 kB | teilweise (Feed + Profil + Overlays + Shop in einem) |
| `domain-dashboard` | 188,3 kB | 58,0 kB | **nein** |
| `domain-menu-eager` | 81,2 kB | 23,6 kB | **nein** |
| `domain-auth` | 79,0 kB | 21,7 kB | ja |
| `domain-app-events` | 72,7 kB | 20,1 kB | ja (Shell-Bindings) |
| `domain-analytics` | 49,7 kB | 15,6 kB | **nein** |
| `domain-crm-eager` | 40,2 kB | 12,1 kB | **nein** |
| `domain-business-accounts` | 21,2 kB | 5,6 kB | **nein** |
| `domain-stories` | 16,5 kB | 5,5 kB | ja |
| `domain-push` | 15,8 kB | 4,9 kB | **nein** |
| `domain-notifications` | 12,2 kB | 4,0 kB | **nein** |
| `domain-media-eager` | 10,3 kB | 3,7 kB | **nein** (Upload) |
| `domain-map` | 9,1 kB | 3,2 kB | **nein** |
| `domain-chat-eager` | 8,7 kB | 3,2 kB | **nein** |
| `domain-leads` | 6,8 kB | 2,4 kB | **nein** |
| `domain-public-profile` | 6,0 kB | 2,2 kB | teilweise |
| `domain-orders-eager` | 4,8 kB | 1,5 kB | **nein** |
| `domain-marketplace-eager` | 4,2 kB | 1,5 kB | **nein** |
| `domain-follow` | 3,1 kB | 1,1 kB | ja |
| + 5 Kleinst-Chunks | 8,4 kB | 4,3 kB | - |

Grund: `social-app.js` hat **105 statische `import`-Zeilen** ganz oben, darunter
`createDashboardViewController`, `createAnalyticsViewController`, drei CRM-Runtimes,
`createMarketplaceRuntimeBoundary`, `createFocusRuntimeController`,
`createAdsRuntimeController` und sechs `app-events`-Binder. Die Import-Ketten sind
**flach**: `entry/social-app.js -> chunks/domain-dashboard-*.js`, direkt. Kein Umweg,
keine Lazy-Grenze.

### 2.2 Das Budget-Gate ist blind

`scripts/check-mnyra-social-bundle-budget.mjs` misst nur `entry/social-app.js` gegen
1.052.000 raw / 285.000 gzip und meldet **`ok`** (524.049 / 140.643).

Es sieht die 26 Chunks nicht. Als der Entry per `manualChunks` in `domain-*`-Chunks
aufgeteilt wurde, fiel die gemessene Zahl von 1.120 kB auf 524 kB - **ohne dass ein
einziges Byte weniger geladen wird**. Das Gate belohnt Umverteilung statt Reduktion.

**Beweis** (Experiment, gebaut nach `/tmp`, Repo unberuehrt): Der 384-kB-Mega-Chunk
`domain-feed-social-eager` wurde in `domain-feed-only` (132 kB), `domain-profile-eager`
(147 kB), `domain-overlays-eager` (64 kB) und `domain-shop-eager` (37 kB) zerlegt.
Ergebnis des Eager-Graphen:

```
vorher:   26 Chunks, 1.980,0 kB raw, 575,7 kB gzip
nachher:  29 Chunks, 1.978,2 kB raw, 576,0 kB gzip
```

**Null Ersparnis.** Chunk-Gruppierung kann den Kaltstart grundsaetzlich nicht
verkleinern - nur `import()` an echten Grenzen kann das.

### 2.3 Trotzdem: der Mega-Chunk sollte zerlegt werden - aus einem anderen Grund

`npm run arch:cycles` meldet: **`No circular dependency found`** ueber 429 Dateien.
Der Kommentar in `vite.config.mjs` ("core/feed teilt sich mit den eager Profil-/
Overlay-/Shop-Modulen einen Import-Zyklus") trifft auf Dateiebene **heute nicht mehr zu**.
Das Experiment oben baute sauber durch, **ohne** Rollup-Warnung "Circular chunk".

Der Gewinn liegt beim Wiederbesuch, nicht beim Kaltstart: heute macht eine Ein-Zeilen-
Aenderung in `core/profile/handle-utils.js` den kompletten **384-kB-Chunk fuer jeden
bestehenden Nutzer ungueltig**. Zerlegt waeren es 64 kB.

### 2.4 Firebase: exakt vermessen

Das Vendor-Bundle aufgeteilt (Experiment):

| Teil | raw | gzip | Anteil |
|---|---:|---:|---:|
| `firebase-firestore` | 352,7 kB | **107,1 kB** | 76 % |
| `firebase-auth` | 87,8 kB | 26,5 kB | 19 % |
| `firebase-app` (Kern) | 24,1 kB | 7,9 kB | 5 % |

Firestore ist die groesste Einzelabhaengigkeit auf der Startstrecke - und wird in
`social-app.js:42` **statisch** importiert.

### 2.5 Das HTML-Dokument selbst

`apps/menyra-social/index.html`: **149.803 Bytes** in der Quelle, **170.005 Bytes**
in `dist` (durch das eingebettete Bundle-Manifest). Zusammensetzung:

- ~89 kB Inline-CSS in einem `<style>`-Block (Zeilen 533-2818)
- ~57 kB Inline-JavaScript ueber 8 `<script>`-Bloecke
- + Markup + ~20 kB Inline-Manifest

Dazu extern `styles/tailwind.generated.css` (45,6 kB, 8,4 kB gzip, render-blocking).

Das Inline-Manifest ist eine gute Entscheidung: es spart einen Round Trip, und die
`modulepreload`-Links koennen sofort gesetzt werden. Der Preis ist ein Dokument, das
bei jeder Navigation komplett neu uebertragen wird - siehe 3.1.

---

## 3. Ladewege (Netzwerkschicht)

### 3.1 `Cache-Control: no-store` schaltet den bfcache ab - nachgewiesen

`vercel.json` setzt auf allen App-Routen (`/feed`, `/search`, `/map`, `/profile`,
`/menu`, `/chat`, `/notifications`, `/settings`, `/upload`, `/orders`, `/login`,
`/register`, `/:landingSlug`, ...) `no-cache, no-store, must-revalidate`.

Chrome verweigert fuer solche Dokumente den Back/Forward-Cache. Gemessen ueber CDP
(`Page.backForwardCacheNotUsed`), gleicher Browser, gleiche Navigation:

```
/feed       (no-store)  -> [... , "MainResourceHasCacheControlNoStore", ...]
/robots.txt (no-cache)  -> [... ohne diesen Grund ...]
```

**Folge:** Jedes "Zurueck" aus Profil / Beitrag / Menue in den Feed ist ein
**vollstaendiger Kaltstart** statt einer sofortigen Wiederherstellung. Auf Slow 4G
sind das ~4 s statt ~0 ms. Das ist mit Abstand der groesste Einzelgewinn, der noch
im System liegt - und es ist ein Header, kein Umbau.

Zusaetzlich: das Dokument wird bei **jeder** Navigation komplett uebertragen, nie als
304. Auf Slow 4G ~38 kB gzip + Vercel-TTFB = grob 350-500 ms pro Navigation.

### 3.2 Der Entry-Chunk kostet pro Navigation einen Round Trip

- `vite.config.mjs`: `entryFileNames: "entry/[name].js"` - **kein Content-Hash**.
- `vercel.json`: `bundled/entry/:path*` -> `no-cache, must-revalidate`.
- `apps/menyra-social/sw.js`: `isViteBuildEntryRequest()` matcht `bundled/entry/` und
  leitet auf `networkFirstBuildMetadata()`.

Alles drei zusammen heisst: die 524 kB des Entries gehen bei **jeder** Navigation
zwingend ans Netz. Meist kommt ein 304 zurueck (billig in Bytes), aber die Latenz
(150-400 ms mobil) liegt blockierend vor der App-Ausfuehrung.

Die 25 Chunks daneben sind korrekt behandelt: gehasht, `immutable`, `cacheFirst`.

### 3.3 Service Worker: Navigation ist network-first

`sw.js` beantwortet Navigationen network-first mit Timeout und faellt nur **offline**
auf die gecachte Shell zurueck. Die Shell wird also gespeichert, aber nie benutzt,
solange das Netz erreichbar ist.

Das ist bewusst konservativ (eine veraltete Shell koennte auf geloeschte Chunk-Hashes
zeigen) - aber es kostet bei jeder Navigation die volle Dokument-Latenz. Siehe
Empfehlung E4 fuer den sicheren Mittelweg.

### 3.4 Bilder-Edge (Cloudflare Worker): gut, mit einem teuren Detail

Richtig gemacht:
- `/media/*` -> `public, max-age=31536000, immutable`
- Stories -> `public, max-age=<STORY_TTL_HOURS*3600>` (24 h)
- `caches.default` vor R2
- vorab erzeugte `.thumb.webp` / `.thumb.jpg` statt Cloudflare Image Resizing

Das Detail: `THUMB_VARIANT_MAX_WIDTH = 480`. Fuer **jede** Anfrage mit `w <= 480`
wird dieselbe Thumb-Datei ausgeliefert. `compressImageThumb()` erzeugt sie mit
`maxSize = 480`.

Die App fragt aber drei verschiedene Breiten an (`_shared/image-resolver.js`):

| Preset | `w` | tatsaechlich ausgeliefert |
|---|---:|---|
| `avatar` | 96 | **480 px Thumb** |
| `thumb` | 160 | **480 px Thumb** |
| `small` | 480 | 480 px Thumb (korrekt) |

Also: **jedes Story-Logo, jedes Feed-Logo, jeder Kommentar-Avatar laedt ein 480-px-Bild
fuer eine 28-48-px-Flaeche.** Und weil die URLs verschieden sind (`w=96` vs `w=160` vs
`w=480`), wird dieselbe Datei mehrfach heruntergeladen und mehrfach dekodiert.

Auf einem Qyteti-Bildschirm mit ~10 Story-Kacheln und ~10 Feed-Karten sind das
geschaetzt 200-400 kB unnoetige Bytes - genau auf den Elementen, die am haeufigsten
vorkommen.

### 3.5 Lucide: 357 kB wegen genau einem Icon

`icon()` in `social-app.js` rendert 76 Icons inline als SVG. Fehlt eines im
Inline-Satz, entsteht `<i data-lucide="...">` und das Vendor-Script wird nachgeladen.

**`share-2` fehlt** - und `feed-card-markup-utils.js` rendert es in **jeder
Feed-Karte** (der Teilen-Knopf).

Folge auf Qyteti:
1. `/apps/menyra-social/vendor/lucide.min.js` (357.796 Bytes) wird geladen.
2. `lucide.createIcons()` laeuft **bei jedem vollen Render** ueber das ganze Dokument
   und tauscht `<i>` gegen `<svg>` - sichtbares Icon-Nachploppen.
3. Genau diese Laufzeitspuren vergiften die Markup-Vergleiche, die der Smart-Header
   fuer sein In-Place-Patching braucht (im Code kommentiert).

Fehlend sind insgesamt 15 Icons: `share-2`, `calendar`, `compass`, `ellipsis-vertical`,
`facebook`, `file`, `list-filter`, `message`, `minus`, `music`, `paperclip`, `pause`,
`plus-square`, `save`, `truck`.

### 3.6 Leaflet auf dem Feed

`discovery-runtime-controller.js:scheduleLeafletWarmup()` laedt Leaflet (JS + CSS,
~60 kB) im Idle - auch auf `/feed`, wo keine Karte sichtbar ist. Es gibt einen Guard
(`isBackgroundPreloadDiscouragedCore`), aber der greift nur bei `saveData` /
sehr langsamer Verbindung.

---

## 4. Datenwege: Qyteti (Feed)

### 4.1 Zwei parallele Wahrheiten laden gleichzeitig

Auf `/feed` ist `shouldFetchBootstrap === true` (index.html:3106). Es laufen **beide**
Pfade:

**Pfad A - Bootstrap (HTTP, startet im `<head>`, vor jedem JS-Bundle)**
`GET socialBootstrapFeed` -> liefert in **einem** Request:
`restaurants` (limit 120) + `feedPosts` (limit 20) + `stories` (limit 16).

**Pfad B - Firestore SDK (startet erst, wenn 2,24 MB JS gelaufen sind)**
`loadRestaurants()` + `loadFeedPosts()` + `loadStoriesForFeed()`.

Das ist doppelte Arbeit bei jedem Kaltstart. Und es ist der zentrale Widerspruch:

> **Die Daten sind bei ~500 ms da. Gezeigt werden koennen sie erst bei ~4.100 ms.**
> Qyteti ist nicht daten-limitiert, sondern JavaScript-limitiert.

Dazu: die Bootstrap-Antwort ist `Cache-Control: no-store, max-age=0`
(`functions/index.js:3101`) und wird mit `cache: "no-store"` gefetcht. Fuer Gaeste ist
diese Antwort fuer alle identisch - sie koennte am Edge liegen. Sie laeuft ausserdem
in `us-central1` (Iowa), also ~120-180 ms RTT ab Kosovo/Albanien plus Cold Start.

Es gibt einen localStorage-Bootstrap-Cache (`mnyra.social.bootstrap.v1`, TTL 5 min) -
der funktioniert und ist die richtige Idee.

### 4.2 `restaurants` wird unbegrenzt gelesen

`core/app-shell/session-data-runtime-controller.js:1419`

```js
const snap = await runWithLoadDeadline(
  () => getDocsFn(queryFn(collectionFn(db, "restaurants"))),
  { timeoutMs: 7000, scope: "restaurants.load" }
);
```

`query()` **ohne jede Einschraenkung** - kein `limit`, kein `orderBy`, kein `where`.
Die gesamte `restaurants`-Collection, bei jedem Kaltstart und bei jedem TTL-Ablauf
(60 min).

`FAST_LIMITS.restaurants` (40 bzw. 80) ist in `social-app.js:447` definiert und wird
**nirgends im Code verwendet** - verifiziert per Grep ueber alle Nicht-Bundle-Dateien.

Der Bootstrap-Endpoint macht es richtig: `.limit(120)`.

### 4.3 N+1: bis zu 3 Zusatz-Reads pro Restaurant

`core/common/restaurant-identity-runtime-controller.js:677 enrichRestaurantsWithPublicMeta()`
laeuft ueber **alle** geladenen Restaurants und liest pro Restaurant:

1. `restaurants/{rid}/public/meta`
2. `restaurants/{rid}/public/offers` - falls Travel-Shape
3. `restaurants/{rid}/public/ads` - falls Ads-Shape

Alles in einem `Promise.all` ueber die volle Liste. Bei N Restaurants: **1 + bis zu 3N
Reads**. Bei N = 200 sind das bis zu ~600 parallele `getDoc`. Danach folgt
`applyRestaurants()` -> `refreshRestaurantDependentViews()` -> Render.

Es gibt einen Guard (`shouldReadMeta`) - er greift nur, wenn Name **und** Logo **und**
Stadt **und** Typ **und** Koordinaten schon im Restaurant-Dokument stehen. Sonst wird
gelesen.

### 4.4 Feed-Query selbst: in Ordnung

```js
query(ref, where("status","==","active"), orderBy("createdAt","desc"), limit(20))
```
Fallback: `query(ref, limit(40))`.

Der Index existiert: `COLLECTION socialFeed (status ASC, createdAt DESC)` in
`firestore.indexes.json`. Firestore-Rules fuer `socialFeed`, `restaurants`,
`restaurants/public/*` und die Stories-Collection-Group sind alle `allow read: if true` -
**keine `get()`-Aufrufe in den Regeln**, also kein Regel-Overhead auf dem Lesepfad.
Diese Hypothese ist damit ausgeschlossen.

### 4.5 localStorage-Schreibvorgaenge blockieren den Main Thread

`readCache` / `writeCache` (`social-app.js:4352/4368`) sind synchrones
`JSON.parse` / `JSON.stringify` + localStorage.

Kritisch ist `writeCache(cacheKeys.restaurants, canonicalList)`: das ist die
**unbegrenzte** Restaurantliste **inklusive** der angereicherten `publicOffers`- und
`publicAds`-Arrays. Das laeuft mehrfach pro Start (nach `applyRestaurants`, nach
`reconcileRestaurantMeta`, nach der Idle-Hydration). Der `catch {}` schluckt einen
Quota-Fehler stillschweigend - dann ist der Cache dauerhaft leer und **jeder Besuch
ist kalt**, ohne dass es irgendwo auffaellt.

---

## 5. Datenwege: Stories

### 5.1 Der Fallback ist ein serieller Wasserfall

`core/stories/story-feed-runtime-controller.js:411-429`

```js
try {
  getDocs(query(storiesRef, where("status","==","active"), orderBy("createdAt","desc"), limit(30)))
} catch {
  try {
    getDocs(query(storiesRef, orderBy("createdAt","desc"), limit(30)))     // Versuch 2
  } catch {
    getDocs(query(storiesRef, limit(30)))                                  // Versuch 3
  }
}
```

Jeder fehlgeschlagene Versuch ist ein **vollstaendiger Netzwerk-Round-Trip**, der
scheitern muss, bevor der naechste startet. Drei Versuche = bis zu 3x RTT nacheinander.

Zum Index-Stand:
- Versuch 1 ist gedeckt: `COLLECTION_GROUP stories (status ASC, createdAt DESC)` -
  vorhanden in `firestore.indexes.json`.
- **Versuch 2 kann nicht funktionieren:** `orderBy("createdAt")` auf einer Collection
  Group braucht einen Single-Field-Index mit `COLLECTION_GROUP`-Scope. Der entsteht
  nicht automatisch, und es gibt **kein `fieldOverride` fuer `stories.createdAt`**
  (nur fuer `goOffers.status` und `goStats.dayKey`).
- Versuch 3 liefert 30 **beliebige** Stories ohne Sortierung.

Solange Versuch 1 greift, ist alles gut. Sobald er einmal nicht greift (Index nicht
deployed, Regionswechsel, Rules-Aenderung), landet man ueber zwei fehlschlagende
Round Trips bei **unsortierten** Stories. Das passt zum Bild "Stories sind manchmal
langsam und manchmal seltsam sortiert".

### 5.2 Story-Identitaet: 2 serielle Round Trips pro Kachel

`hydrateRestaurantsByIds()` (`restaurant-identity-runtime-controller.js:760+`) macht
pro fehlendem Restaurant:

1. `await getDoc(restaurants/{rid}/public/meta)`
2. **danach**, falls Name oder Logo fehlen: `await getDoc(restaurants/{rid})`

Das zweite `getDoc` startet erst, wenn das erste zurueck ist. Bei
`storyIdentityHydration` (max 8 bzw. 12) sind das bis zu 12 parallele Ketten a 2 RTT.

**Und das Story-Logo erscheint erst danach.** Das ist genau das sichtbare Symptom:
Kachel steht da, Logo kommt spaeter dazu.

### 5.3 Story-Kacheln selbst: geometrisch stabil

`story-tile-markup-utils.js` setzt feste Masse inline
(`flex:0 0 29%; max-width:120px; height:13rem`). Kein Layout Shift. Das ist gut
gemacht und sollte so bleiben.

---

## 6. Bildflackern - die Mechanik

Das ist kein Zufall und kein Browser-Bug. Es sind vier konkrete Wege.

### Grundmechanik

Die App rendert als **HTML-String und ersetzt `#app`**. Jeder volle Render erzeugt
**neue `<img>`-Elemente**. Der Browser hat die Datei zwar im Cache, muss sie fuer ein
neues Element aber erneut holen und **erneut dekodieren**. Bis das Bild steht, sieht
man, was darunter liegt.

Und darunter liegt Grau. `index.html:2168`:

```css
body.fast-mode img { background: #e2e8f0; }
```

Das Team kennt das - der Code sagt es woertlich (`app-shell-runtime-controller.js:2811`):

> "Ein Neuaufbau setzt trotzdem frische `<img>` ein, und der Browser baut jedes Bild
> neu auf - das sah man als Flackern bei jedem Tippen auf Funksionet/Analitika/Opsionet."

Es gibt bereits vier punktuelle Gegenmassnahmen. Alle wirken, alle haben Luecken:

| Massnahme | Ort | Luecke |
|---|---|---|
| `LOADED_IMAGE_URLS` + `decoding="sync"` | `image-resolver.js` | greift nur, wenn die URL exakt schon geladen war |
| `applyAppHtmlKeepingHeader` | Header | schuetzt **nur** den Smart-Header |
| `reuseFeed` (`#feedView` wiederverwenden) | Feed | an drei Bedingungen geknuepft, siehe unten |
| `reuseMetricRow` | Dashboard | nur Dashboard-Kennzahlen |

### Weg 1 - `reuseFeed` faellt aus, wenn der Render-Modus wechselt

```js
const reuseFeed = preserveMainScroll && state.activeTab === "feed" && !didFeedLocationRenderKeyChange
  ? doc?.getElementById("feedView") : null;
```

`preserveMainScroll` verlangt `prevLastRenderMode === "main"`. Waehrend des Startens
wechselt der Modus (`startup` -> `auth` -> `main`). Bei jedem Wechsel ist `reuseFeed`
null -> **kompletter Neuaufbau aller Feed-Bilder**.

### Weg 2 - `buildFeedLocationRenderKey` ist auf 11 cm genau

```js
const latKey = Number(coords.lat).toFixed(6);   // ~0,11 m Aufloesung
```

Aendert sich der Key, wird `reuseFeed` null. Entwarnung: die Position kommt aus
`getCurrentPosition()` bei einer Nutzeraktion, **nicht** aus `watchPosition()` - also
kein GPS-Zittern.

Aber: nach `applyViewerLocationSelection()` laeuft **asynchron**
`refineViewerLocationCityFromCoords()` und schreibt Label/Stadt nach. Das ist eine
**zweite** Key-Aenderung. Eine Stadtauswahl kostet also **zwei** volle Feed-Neuaufbauten
mit je einem Bildaufblitzen.

### Weg 3 - `patchFeedList` ersetzt ganze Karten bei Identitaets-Nachlauf

`buildFeedRenderSignature()` (`feed-view-orchestration-controller.js:247`) enthaelt:

```js
[ post.id, post.business, post.location, post.content, post.image, post.isLive ]
```

Gut: Likes, Kommentare und Logo sind **nicht** drin - die werden per
`updatePostCountNodesFn` / `updateFeedLogoNodesFn` punktuell gepatcht. Sauber gebaut.

Aber `business` und `location` sind drin. Und genau die kommen aus der Restaurant-
Hydration (4.3 / 5.2), also **nach** dem ersten Paint. Sobald sie eintreffen:

```js
existing.replaceWith(nextNode);   // die ganze Karte, samt Hero-<img>
```

-> Hero-Bild wird zerstoert und neu gebaut -> Grau -> Bild. Bei allen Karten, deren
Restaurant nachgeladen wurde.

### Weg 4 - `srcset` und `stableKey` zeigen auf verschiedene Bilder

```js
const imageUrl     = getOptimizedImageUrlFn(post.image, "medium", { stableKey: `feed-hero:${postId}` });
const heroSmallUrl = getOptimizedImageUrlFn(post.image, "small");
const heroLargeUrl = getOptimizedImageUrlFn(post.image, "large");
heroSrcset = `${heroSmallUrl} 480w, ${imageUrl} 768w, ${heroLargeUrl} 1280w`;
sizes = "(max-width: 640px) 100vw, 600px";
```

Auf einem 390-px-Telefon mit DPR 3 braucht der Browser ~1170 px -> er waehlt
**`heroLargeUrl` (1280w)**. Der `stableKey` haengt aber an `imageUrl` (medium/768).
Der "Last-Good"-Schutz merkt sich also eine URL, die auf dem Geraet nie angezeigt wird.

Zusaetzlich, latent: `LAST_GOOD_IMAGE_TTL_MS = 6000`. Faellt `post.image` nach mehr als
6 Sekunden kurz auf leer, gibt `getOptimizedImageUrl()` `PLACEHOLDER_IMAGE` zurueck -
das Bild kippt sichtbar auf Grau. Schmaler Pfad, aber vorhanden.

### Weg 5 - Lucide tauscht Icons bei jedem Render

Siehe 3.5. `lucide.createIcons()` laeuft bei jedem vollen Render ueber das ganze
Dokument. Icons erscheinen leer und poppen dann.

### Was gut ist und nicht angefasst werden darf

- `feed-card-markup-utils.js`: `style="aspect-ratio:4/5"` auf der Hero-Buehne -> **kein
  Layout Shift**, die Flaeche steht vor dem Bild.
- `heroReady` steuert den grauen Platzhalter gezielt.
- `story-tile-markup-utils.js`: feste Kachelmasse inline.
- Signatur-basiertes Patching statt Neuaufbau, wo es geht.
- `data-img-key` / `data-feed-render-sig` als Identitaetsanker.

Die Architektur fuer Bildstabilitaet ist da. Sie ist nur nicht ueberall angeschlossen.

---

## 7. Empfehlungen - nach Wirkung pro Risiko

Grundsatz: **nichts entfernen, was heute schnell ist.** Jede Massnahme unten ist
additiv oder eine Header-/Konfig-Aenderung. Reihenfolge = empfohlene Reihenfolge.

### E1 - `no-store` auf App-Routen ersetzen  ·  Aufwand: Minuten  ·  Risiko: sehr gering

`vercel.json`: auf den App-Routen `no-store` durch etwas ersetzen, das den bfcache
zulaesst, z. B.:

```
Cache-Control: no-cache, must-revalidate
```

`no-cache` erzwingt weiterhin Revalidierung (die Shell wird nie veraltet ausgeliefert),
erlaubt aber 304 **und** den bfcache.

**Gewinn:** Zurueck-Navigation von ~4 s auf ~0 ms. Plus ~350-500 ms pro Vorwaerts-
Navigation durch 304 statt Vollabruf.
**Beweis:** derselbe CDP-Test wie in 3.1 - `MainResourceHasCacheControlNoStore` muss
verschwinden.
**Achtung:** vorher pruefen, ob eine Route personalisiertes HTML ausliefert. Nach
Sichtung ist das Dokument fuer alle identisch (alle Personalisierung passiert im
Client), aber das gehoert bestaetigt.

### E2 - Entry-Chunk hashen und unveraenderlich machen  ·  Aufwand: klein  ·  Risiko: gering

Drei zusammengehoerige Aenderungen:

1. `vite.config.mjs`: `entryFileNames: "entry/[name]-[hash].js"`
2. `vercel.json`: `bundled/entry/:path*` -> `public, max-age=31536000, immutable`
3. `sw.js`: `isViteBuildEntryRequest()` so anpassen, dass **gehashte** Entries ueber
   `isViteBuildHashedAssetRequest()` -> `cacheFirst` laufen

Das Inline-Manifest im HTML loest den Namen ohnehin auf - der Bootstrap-Code kennt
den Hash bereits.

**Gewinn:** ein blockierender Round Trip weniger pro Navigation (150-400 ms mobil).
**Beweis:** DevTools-Netzwerk, 2. Aufruf: `entry/social-app-*.js` muss "(disk cache)"
zeigen, kein 304.

### E3 - `share-2` und die 14 weiteren Icons inline aufnehmen  ·  Aufwand: klein  ·  Risiko: sehr gering

15 SVG-Pfade in `INLINE_LUCIDE_ICON_NODES` ergaenzen. Dann laedt Qyteti Lucide nicht
mehr, und `createIcons()` findet nichts mehr zu tauschen.

**Gewinn:** 357 kB weniger auf dem Feed, kein Icon-Nachploppen, saubere
Markup-Vergleiche fuer das Header-Patching.
**Beweis:** `document.querySelectorAll("[data-lucide]").length === 0` auf `/feed`.

### E4 - Nicht-Feed-Domains hinter `import()` legen  ·  Aufwand: gross  ·  Risiko: mittel

Der eigentliche Hebel. Statische Importe in `social-app.js` in dynamische verwandeln,
an den Grenzen, die es fachlich ohnehin gibt:

| Domain | gzip auf Slow 4G gemessen | Grenze |
|---|---:|---|
| `domain-dashboard` | 59,8 kB | nur Business-Rolle |
| `domain-menu-eager` | 24,5 kB | nur Menue-Tab / QR |
| `domain-analytics` | 16,2 kB | nur Business-Rolle |
| `domain-crm-eager` | 12,7 kB | nur CEO/Staff |
| `domain-business-accounts` | 6,0 kB | nur Settings |
| `domain-push` | 5,3 kB | nach dem ersten Paint |
| `domain-notifications` | 4,4 kB | nur Notifications-Tab |
| `domain-media-eager` | 4,1 kB | nur Upload |
| `domain-chat-eager` | 3,6 kB | nur Chat-Tab |
| `domain-map` | 3,6 kB | nur Karten-Tab |
| `domain-leads` | 2,7 kB | nur Leads |
| `domain-orders-eager` | 1,9 kB | nur Orders |
| `domain-marketplace-eager` | 1,8 kB | nur Marketplace |
| **Summe** | **146,7 kB** | **22,6 % des Kaltstart-Transfers** |

Bei 1,6 Mbit/s (~205 kB/s) sind das **~715 ms** direkt.

**Reihenfolge:** mit `domain-dashboard` anfangen - groesster Block, sauberste Grenze
(Business-Rolle), niedrigstes Risiko.
**Beweis:** der Eager-Graph-Zaehler aus E7 muss von 26 Chunks / 576 kB gzip runtergehen.

### E5 - Firestore vom ersten Paint entkoppeln  ·  Aufwand: gross  ·  Risiko: mittel-hoch

Der Bootstrap-Endpoint liefert `restaurants` + `feedPosts` + `stories` bereits bei
~500 ms - lange bevor Firestore ueberhaupt geparst ist. Qyteti koennte den ersten
Paint **vollstaendig aus dem Bootstrap-Payload** rendern und Firestore erst danach
laden (fuer Live-Updates, Likes, Schreibvorgaenge).

**Gewinn:** 107 kB gzip weniger Transfer, 353 kB weniger Parse.
Zusammen mit E4: **~250 kB gzip = ~39 % des Kaltstart-Transfers**, ~1,2 s auf Slow 4G
plus ein spuerbarer Teil des 876-ms-CPU-Bodens.
**Risiko:** die groesste Aenderung im Paket. Braucht einen sauberen Zustand fuer
"Daten aus Bootstrap, noch kein Firestore" und eine Nachzieh-Reconciliation. Erst
angehen, wenn E1-E4 stehen und gemessen sind.

### E6 - Bildstabilitaet systematisch schliessen  ·  Aufwand: mittel  ·  Risiko: gering

Nicht mehr punktuell, sondern an vier Stellen:

1. **`business`/`location` aus `buildFeedRenderSignature` nehmen** und wie Likes/Logo
   per gezieltem DOM-Patch nachziehen (`data-feed-business`, `data-feed-location`
   analog zu `data-feed-logo`). Schliesst Weg 3 vollstaendig.
2. **`stableKey` an den Kandidaten haengen, den das Geraet tatsaechlich waehlt** - oder
   das ganze `srcset`-Set unter einem gemeinsamen Key fuehren. Schliesst Weg 4.
3. **`reuseFeed` auch ueber Modus-Wechsel hinweg zulassen**, solange `#feedView`
   existiert und der View-Modus gleich bleibt. Schliesst Weg 1.
4. **`refineViewerLocationCityFromCoords` nicht in den Render-Key schreiben** -
   das Stadt-Label ist reine Anzeige und gehoert per DOM-Patch aktualisiert, nicht
   per Neuaufbau. Schliesst Weg 2.

**Beweis:** Screenshot-Serie 0,0 / 0,5 / 1,0 / 2,0 / 5,0 s auf `/feed` mit echten
Daten. Kein `<img>` darf zwischen zwei Aufnahmen auf `#e2e8f0` zurueckfallen.
Zusaetzlich messbar: `PerformanceObserver` auf `layout-shift` muss 0 bleiben.

### E7 - Das Budget-Gate reparieren  ·  Aufwand: klein  ·  Risiko: keins

`check-mnyra-social-bundle-budget.mjs` soll den **transitiven Eager-Graphen** aus
`manifest.json` messen, nicht nur die Entry-Datei. Sonst wird jede Verbesserung aus
E4/E5 durch die naechste Umverteilung wieder unsichtbar.

Heutiger Ist-Wert als Startbudget: **26 Chunks, 1.980 kB raw, 576 kB gzip**.

### E8 - Datenwege entschaerfen  ·  Aufwand: klein-mittel  ·  Risiko: gering

1. `loadRestaurants()`: `FAST_LIMITS.restaurants` tatsaechlich anwenden
   (`limit(80)` bzw. `limit(40)`). Der Bootstrap macht es mit 120 vor.
2. `enrichRestaurantsWithPublicMeta()`: nur fuer die Restaurants aufrufen, die im
   sichtbaren Feed/in den Stories vorkommen - nicht fuer die ganze Liste.
   Alternativ die drei `public/*`-Dokumente serverseitig in ein Feld des
   Restaurant-Dokuments spiegeln (eine Function beim Schreiben) -> 1 Read statt 3N.
3. `hydrateRestaurantsByIds()`: die beiden `getDoc` **parallel** statt seriell
   (`Promise.all([meta, rest])`) und das Ergebnis danach zusammenfuehren.
   Halbiert die Wartezeit bis das Story-Logo steht.
4. `writeCache(cacheKeys.restaurants, ...)`: die Liste vor dem Schreiben beschneiden
   (`publicOffers`/`publicAds` nicht mitspeichern) und den Quota-Fehler **loggen**
   statt zu schlucken.
5. Stories-Fallback: `fieldOverride` fuer `stories.createdAt` mit
   `COLLECTION_GROUP`-Scope in `firestore.indexes.json` ergaenzen - dann funktioniert
   Versuch 2 wenigstens. Besser: nach zwei Fehlversuchen abbrechen statt unsortierte
   Stories anzuzeigen.
6. `socialBootstrapFeed`: fuer den Gast-Fall `Cache-Control: public, s-maxage=30,
   stale-while-revalidate=300` setzen. Fuer alle Gaeste ist die Antwort identisch.

### E9 - Edge-Thumbs nach Groesse trennen  ·  Aufwand: mittel  ·  Risiko: gering

Eine zweite Variante bei ~128 px erzeugen (`compressImageThumb(file, 128, 0.7)`) und
im Worker `w <= 160` darauf mappen. Avatare und Story-Logos laden dann ~4 kB statt
~30 kB.

**Zusaetzlich pruefen:** ob die transformierten Antworten `Vary: Accept` tragen.
`fm=auto` liefert je nach `Accept`-Header AVIF / WebP / JPEG, und
`cache.put(request, ...)` cached nach URL. Ohne `Vary` kann ein Chrome-Nutzer den
Cache-Eintrag fuer einen aelteren Safari vergiften.

### E10 - Startup-Snapshot reaktivieren (spaeter)  ·  Aufwand: mittel  ·  Risiko: mittel

Es existiert ein vollstaendiger Sofort-Paint-Mechanismus: das zuletzt gerenderte
`#app`-HTML wird in localStorage abgelegt und beim naechsten Start synchron im `<head>`
wieder eingesetzt (`restoreStartupSnapshot()`, `persistStartupSnapshot()`, TTL 15 min).

Er ist **abgeschaltet**: `ENABLE_STARTUP_SNAPSHOT` haengt an
`window.__MENYRA_SOCIAL_ENABLE_STARTUP_SNAPSHOT__ === true`, und dieses Flag wird
**nirgends im Repo gesetzt**. Der Code loescht stattdessen aktiv alte Snapshots.

Wahrscheinlich wurde er wegen genau des Flackerns abgeschaltet, das E6 behebt:
`shouldReuseExistingMountedHtml` verlangt einen **exakten String-Vergleich** des
gesamten App-HTML. Weicht ein Like-Zaehler ab, wird alles per `innerHTML` ersetzt -
ein bildschirmfuellendes Aufblitzen.

**Erst nach E6 wieder einschalten.** Dann ist es der billigste Weg zu FCP < 300 ms
beim Wiederbesuch.

---

## 8. Was diese Analyse nicht belegt

Ehrlich benannt, damit niemand auf unbelegtem Boden baut:

1. **Keine echten Firestore-Latenzen.** Kein Zugriff auf Staging/Produktion. Alle
   Datenweg-Befunde sind aus dem Code abgeleitet, nicht gemessen.
2. **Keine echten Datenmengen.** `seed/data/mnyra-local-seed.json` hat 62 Dokumente -
   synthetisch. Wie gross `restaurants` in Produktion wirklich ist, ist unbekannt, und
   davon haengt die Schwere von 4.2 / 4.3 ab.
3. **Keine echten Bilder.** Alle Bild-Befunde sind aus Code + Worker-Logik abgeleitet.
   Die 200-400 kB in 3.4 sind eine Schaetzung.
4. **Kein Vercel-TTFB.** Der lokale Server antwortet in ~15 ms. Die echte Edge-Latenz
   ab Kosovo/Albanien kommt auf alle Zahlen obendrauf.
5. **Kein iOS/Safari.** Gemessen wurde Chromium. Der bfcache-Befund gilt sicher fuer
   Chrome und Firefox; Safari verhaelt sich bei `no-store` historisch anders.
6. **Der Feed war leer.** Ohne Firebase gab es keine Karten. Die Flacker-Wege in
   Abschnitt 6 sind aus dem Code hergeleitet, nicht am laufenden Feed gefilmt.
7. **Keine Messung mit angemeldetem Nutzer.** Der Business-/CEO-Pfad laedt mehr.

**Empfohlener naechster Messschritt:** einen Staging-Lauf mit echten Daten und der
Screenshot-Serie aus E6, plus ein `PerformanceObserver` auf `layout-shift` und
`longtask`, damit E1-E3 mit harten Vorher/Nachher-Zahlen belegt werden koennen.

---

## 9. Zusammenfassung in einem Satz pro Ebene

| Ebene | Befund |
|---|---|
| **Build** | 26 Chunks / 576 kB gzip laden eager; das Budget-Gate misst nur den Entry und meldet gruen. |
| **Netz** | `no-store` schaltet den bfcache ab; der ungehashte Entry kostet pro Navigation einen Round Trip. |
| **Daten** | Bootstrap und Firestore laden dieselben Daten doppelt; `restaurants` ist unbegrenzt; bis zu 3N Zusatz-Reads. |
| **Stories** | Dreistufiger serieller Fallback; Logos brauchen 2 serielle Round Trips nach dem Paint. |
| **Bilder** | Vollrender erzeugt neue `<img>`; darunter liegt `#e2e8f0`; vier Schutzmechanismen mit vier Luecken. |
| **Kern** | Die Daten sind bei ~500 ms da. Sichtbar werden sie bei ~4.100 ms. Qyteti ist JS-limitiert, nicht daten-limitiert. |
