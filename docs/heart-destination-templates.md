Status: CURRENT
Stand: 2026-07-10

# Heart: Orte & Destinationen (Destination-Templates)

Zentrale Verwaltung von Destination-Templates (Velipoje, Shengjin, Durres, ...)
in Heart. Beim Hotel-Lead wird nur die Destination gewaehlt; Straende, Stadt,
Sehenswuerdigkeiten, Aktivitaeten, Natur usw. kommen fertig aus dem Template.
Entfernungen werden pro Hotel aus den Koordinaten automatisch berechnet.

## Datenmodell (Firestore)

- `heartDestinations/{destinationId}` (CEO-only, Rules: `isCeoActor()`)
  - `name`, `slug`
  - `draft`: `{ name, description, places: [...] }` - Arbeitsstand
  - `published`: gleicher Aufbau - zuletzt veroeffentlichter Stand
  - `publishedVersion`, `publishedAt`, `draftUpdatedAt`, Creator-Meta
- `destinationsPublic/{destinationId}` (public read, CEO write)
  - kompakte Projektion des veroeffentlichten Stands: nur aktive Orte
  - wird von Lead-Editor und spaeter der Hotel-Detailseite gelesen,
    ohne CEO-Session und ohne Entwuerfe preiszugeben

Ort (`places[]`): `id`, `name`, `category`
(`city|beach|sights|activities|nature|food|nearby`), `description`,
`lat`/`lng`, `coverImageUrl`, `gallery[]`, `priority` (0-100), `pinned`,
`season` (`all|summer|winter`), `active`.

## Lead-Verknuepfung (keine Kopie)

Der Lead/das Restaurant speichert nur:

- `destinationId`, `destinationName`
- `destinationOverrides`: `{ hidden: [placeId], pinned: [placeId],
  placePatches: { placeId: { name?, description?, coverImageUrl? } } }`

Template-Aenderungen (Tippfehler, neues Standardfoto) wirken nach dem
Veroeffentlichen automatisch auf alle verbundenen Hotels; Hotel-Abweichungen
bleiben erhalten, weil sie separat als Overrides liegen.

## Sortierung / Entfernung

`resolveLeadDestinationPlacesCore` (pure, getestet) merged Template +
Overrides und sortiert: vom Lead fixierte Orte (in Fixier-Reihenfolge) ->
Template-pinned -> Prioritaet -> Naehe (Haversine aus Hotel-Pin +
Ort-Koordinaten) -> Name. Distanz-/Gehzeit-Labels via
`destination-distance-core.js` (Schaetzung: 80 m/min zu Fuss bis 1,6 km,
sonst 600 m/min Auto).

## Module

- Pure Cores (framework-frei, ohne Firebase, per Node-Tests abgedeckt):
  - `apps/menyra-social/core/destinations/destination-template-core.js`
  - `apps/menyra-social/core/destinations/destination-distance-core.js`
  - `apps/menyra-social/core/destinations/destination-merge-core.js`
- Heart (laedt als eigene ES-Module, kein Anteil an `social-app.js`):
  - `heart-destinations-adapter.js` - Firestore CRUD + Publish + Public-Cache
  - `heart-destinations-render.js` - Liste, Entwurf-Editor, Lead-Fieldset
  - Wiring: `heart-state.js`, `heart-render.js`, `heart-events.js`,
    `heart-route-view-resolver.js` (`/heart/orte`, `?view=destinations`),
    `heart.js`
- Lead-Save: `core/leads/lead-save-utils.js` liest die Hidden-Inputs
  `leadDestinationId/-Name/-Overrides` nur, wenn der Editor sie rendert
  (Heart). Social-CRM-Saves bleiben unveraendert.

## Performance-Leitplanken

- `social-app.js` und alle `bundled/` Chunks sind byte-identisch geblieben
  (Build verifiziert) - die Website laedt nichts Neues.
- Heart laedt die Destination-Module nur innerhalb der Heart-App.
- `destinationsPublic` wird im Lead-Editor lazy geladen (erst beim Oeffnen)
  und 5 Minuten im Speicher gecacht.
- Publish schreibt eine kleine Public-Projektion (nur aktive Orte) statt
  des kompletten Admin-Dokuments.

## Hotel-Detailseite (Design mnyrahotelpreview)

Umgesetzt nach der freigegebenen Vorlage:

- `core/profile/hotel-detail-render-utils.js` (pure, 8 Node-Tests) rendert
  die Sektionen im Preview-Design mit eigenen Inline-SVG-Icons und scoped
  `.mhd-` CSS (`styles/hotel-detail.css`, lazy per `<link>` injiziert):
  Dhoma (Zimmer-Rail), Destination-Kategorie-Rails (Qyteti, Plazha, ...),
  Perfshihet (Amenities), Lokacioni (Map-Karte), Vleresimet (Rating).
- `core/destinations/destination-public-loader.js` laedt
  `destinationsPublic/{id}` mit In-Memory- + localStorage-Cache (6 h TTL,
  Pending-Dedupe). `peek*` erlaubt synchrones Rendern bei Wiederbesuch.
- `renderHotelDetailsView` (in `profile-menu-focus-render-controller.js`)
  rendert sofort synchron; fehlt das Template im Cache, wird ein
  Skeleton gezeigt und per rAF/DOM in den Platzhalter
  (`#mnyraHotelDestinationSections`) nachgefuellt. Distanz + Geh-/Fahrzeit
  pro Ort aus Hotel-Pin + Ort-Koordinaten; Overrides (ausgeblendet,
  fixiert, eigene Fotos/Texte) werden angewandt.

Ladewege: Der neue Code liegt komplett im lazy Profil-Chunk
(`profile-menu-focus-render-controller`, +~16 KB) und laedt nur beim
Oeffnen einer Profilansicht. `social-app.js` bleibt groessengleich
(nur Chunk-Hash-Referenzen aendern sich); Firebase kommt aus dem
gemeinsamen `vendor-firebase`-Chunk, nicht dupliziert.

## Dhomat-Editor, Qyteti-Fallback und Live-Entdecker-Karte

- **Dhomat-Editor** (Hotel-Admin-Ansicht, unter Hotel Details): Zimmer mit
  Name, Preis/Nacht, Personen, Krevate, m², Etikett, Beschreibung, Foto-Upload
  (komprimiert via bestehendem CDN-Upload) und Aktiv-Schalter. Gespeichert als
  `hotelRooms[]` am Restaurant-Dokument (`hotel-rooms-utils.js`, 6 Tests);
  die Detailseite rendert die Dhoma-Rail bevorzugt aus `hotelRooms`
  (Alt-Angebote bleiben Fallback). Bindings laden lazy nur, wenn
  `[data-hotel-rooms-editor]` im DOM steht (`hotel-rooms-editor-bindings.js`).
- **Qyteti-Fallback**: Ohne Destination-Template zeigt die Detailseite eine
  Qyteti-Karte aus der Hotel-Location (Stadt + Adresse + Titelbild), damit die
  Sektion nie leer ist.
- **Live-Entdecker-Karte**: Die Map-Karte der Detailseite ist jetzt die echte
  Karte (Leaflet 1.9.4 + Carto-Voyager-Kacheln wie im Map-Tab, OSM-Fallback),
  Hotel-Pin mittig zentriert, Template-Orte als kategorie-farbige Marker mit
  Tooltip. Initialisiert erst beim Scrollen in den Sichtbereich
  (IntersectionObserver) ueber einen eigenen Lazy-Chunk
  (`hotel-detail-map-runtime`, ~4 KB); ist window.L vom Map-Tab schon da,
  wird es wiederverwendet. Mobil: Ein-Finger-Drag deaktiviert
  (Seiten-Scroll bleibt fluessig), Zwei-Finger-Zoom aktiv.

## Offene Folgearbeiten

- Foto-Upload direkt im Destination-Editor (aktuell: Bild-URLs, z. B. aus
  bestehendem CDN-Upload kopiert).
- Echte Bewertungen/Reviews auf der Hotel-Detailseite (aktuell nur
  Rating-Kachel aus vorhandenen Feldern; Review-Karten der Vorlage folgen,
  sobald eine Review-Quelle steht).
- Optional: Versions-Pinning pro Lead ("nur zukuenftige Leads aktualisieren").
- Firestore-Rules-Tests fuer die zwei neuen Collections.
