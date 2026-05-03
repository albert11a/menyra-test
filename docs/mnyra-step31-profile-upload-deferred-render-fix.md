Status: CURRENT
Last updated: 2026-05-03

# Schritt 31: Profil-Upload-Actions trotz deferred Media-Runtime

## Ziel

Die Buttons im eigenen Profil fuer `+ Status` und `+ Neuen Beitrag` sollen wieder normal den Upload-Screen oeffnen.

## Ausgangslage

Nach der Deferred-Umstellung der Media-/Upload-Runtime konnte der erste Wechsel auf den Upload-Tab kaputtgehen:

- `data-nav="upload"` setzte `activeTab: "upload"`.
- Der Shell-Renderer rief direkt `renderUploadView()` auf.
- Der neue Deferred-Upload-Controller hatte aber nur `uploadCompressedImage()` und `handleUploadPost()`, nicht `renderUploadView()`.

Dadurch konnten Profil-Buttons und andere Upload-Einstiege scheinbar ohne Wirkung bleiben oder den Upload-Screen nicht korrekt rendern.

## Geaendert

- Die Upload-View-Renderlogik wurde in `media-upload-view-render-utils.js` ausgelagert.
- Der volle Media-Upload-Controller nutzt dieselbe Renderhilfe weiter.
- Der Deferred-Upload-Controller in `social-app.js` kann jetzt synchron `renderUploadView()` liefern.
- Der schwere Media-/Upload-Controller wird weiterhin erst bei echter Upload-Aktion geladen.

## Geaenderte Dateien

- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/media/media-upload-runtime-controller.js`
- `apps/menyra-social/core/media/media-upload-view-render-utils.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step31-profile-upload-deferred-render-fix.md`

## Bewusst nicht geaendert

- Keine sichtbaren UI-/Design-Aenderungen.
- Keine Profil-Button-Labels, Farben, Layouts oder Spacings geaendert.
- Keine Upload-/Post-/Story-Produktregeln geaendert.
- Keine Routing-, Firebase-, Rules- oder Functions-Aenderungen.
- Keine Public-/App-Grenze weiter verschoben.

## Validierung

- `node --check apps/menyra-social/social-app.js`
- `node --check apps/menyra-social/core/media/media-upload-runtime-controller.js`
- `node --check apps/menyra-social/core/media/media-upload-view-render-utils.js`
- Upload-Render-Mockcheck fuer Feed- und Story-Upload-Shell
- `git diff --check`

Keine Playwright-/Smoke-Tests durch Codex.

## Manuell testen

- `/profile` oeffnen und `+ Status` klicken.
- `/profile` im Posts-Bereich oeffnen und `+ Neuen Beitrag` klicken.
- Im Upload-Screen Datei-Auswahl oeffnen.
- Einen Bild-Post bis zur Vorschau pruefen.
- Nach Upload-Screen per Zurueck-Button wieder in den Feed wechseln.
- Feed-Composer `Neuer Feed Post` kurz pruefen.

## Bewertung

Bestanden mit kleinem Rest-Risiko.

Der direkte Defect ist behoben, ohne die sichtbare Oberflaeche umzubauen. Rest-Risiko bleibt, weil der echte Upload mit Datei/Netzwerk/Auth manuell in der App geprueft werden muss.
