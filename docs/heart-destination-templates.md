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

## Offene Folgearbeiten

- Foto-Upload direkt im Destination-Editor (aktuell: Bild-URLs, z. B. aus
  bestehendem CDN-Upload kopiert).
- Hotel-Detailseite (Design-Vorlage `mnyrahotelpreview.html`) an
  `destinationsPublic` + Overrides anbinden, sobald das Design freigegeben
  ist - als lazy Public-Chunk, nicht im Entry.
- Optional: Versions-Pinning pro Lead ("nur zukuenftige Leads aktualisieren").
- Firestore-Rules-Tests fuer die zwei neuen Collections.
