# Feed Location Gate: City -> Map Flow

## Ziel
- Wenn im Feed-Gate eine Stadt gesetzt wird (`Vendos qytetin tënd...`), wird diese Position als Viewer-Location gespeichert.
- Beim Wechsel zur Kartenansicht startet die Map auf dieser gespeicherten Position.
- Smart-Header und Shell-Vertrag bleiben unverändert, kein Standalone-Screen.

## Persistenz
- Storage-Key: `mnyra_social_feed_viewer_location_v1`
- Gespeicherte Form:
  - `lat`
  - `lng`
  - `label`
  - `city`
  - `source`
  - `savedAt`

## Gate-Flow (Feed)
1. Feed rendert zuerst Gate, wenn keine Viewer-Coords vorhanden sind.
2. Nutzer kann:
   - Stadt aus Vorschlägen wählen (lokal + remote)
   - Standortfreigabe nutzen
3. Bei erfolgreicher Auswahl wird gespeichert:
   - Session
   - LocalStorage (`mnyra_social_feed_viewer_location_v1`)
   - Verified Map Location Bridge
4. Danach wechselt Feed normal in den eigentlichen Feed-Zustand.

## Suggestion-Verhalten (Input + Bento)
- Suggestions öffnen direkt unter dem Input (`feed-location-suggestions--open`).
- Der Vorschlagscontainer erweitert sich mit Transition (`max-height`, `opacity`, `margin-top`).
- Dadurch wird der nachfolgende Bento-Bereich natürlich nach unten geschoben (kein Overlay-Stacking).

## Kartenkopplung (neu)
- Die Discovery-Map nutzt beim Initialisieren zuerst die gespeicherte Verified-Location, falls vorhanden.
- Fallback-Reihenfolge:
1. CEO-Override (wenn aktiv)
2. Verified Location aus Feed-Gate
3. Browser-Geolocation
4. Bei Geolocation-Fehler: erneut Verified Location, sonst Notice

## Header/Shell Vertrag
- Gate läuft als normaler `feedView`-Mode (`data-feed-view-mode="location"`), nicht als eigene App-Shell.
- Kein globales `html/body` Styling aus dem Prototyp.
- Kein eigener Root-Render.
- Smart-Header bleibt im Gate sichtbar/stabil (kein schnelles Hide/Show-Flackern).

## Relevante Dateien
- `apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js`
- `apps/menyra-social/core/app-shell/controller-deps-factory.js`
- `apps/menyra-social/core/app-shell/app-controller-bridge.js`
- `apps/menyra-social/core/crm/crm-runtime-controller.js`

## Manuelle Checks
1. App starten ohne gespeicherte Viewer-Location -> Gate erscheint vor Feed.
2. Stadt im Gate wählen -> Feed öffnet.
3. Zu Map wechseln -> Karte zentriert auf gewählte Stadt.
4. Schnell hoch/runter scrollen im Gate -> Header bleibt stabil.
5. Input fokussieren (`Vendos qytetin...`) -> kein Header-Versatz durch Keyboard.
6. Location reset durchführen -> Gate erscheint wieder.
