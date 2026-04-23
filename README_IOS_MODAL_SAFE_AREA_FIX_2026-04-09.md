# iOS Modal Safe-Area Fix (2026-04-09)

## Ziel
Modal-Safe-Area oben/unten soll auf iOS Safari (inkl. iOS 26+) die Modal-Farbe (hier: weiss) nutzen und nicht die App-Background-Farbe.

## Problem (warum es kaputt war)
- `theme-color` alleine war auf iOS Safari nicht stabil genug.
- Je nach Safari-Toolbar/Chrome-Status wurde weiterhin eine falsche Hintergrundfarbe gezeigt.
- Caching/Service Worker konnte alte Stände sichtbar halten.

## Was jetzt umgesetzt wurde
- Zentrale Modal-Chrome-Farbe wird weiter aus dem aktiven Top-Modal bestimmt.
- Zusätzlich wurden harte Safari-Chrome-Tint-Layer eingefuehrt:
  - `#safariChromeTintTop`
  - `#safariChromeTintBottom`
  Diese Layer werden nur bei offenem Modal angezeigt und auf `--active-modal-surface` gesetzt.
- CSS-Fallback mit `:has(#overlayRoot .modal-overlay)` aktiv:
  - erzwingt Modal-Hintergrund fuer `html/body`
  - versteckt `#app`, sobald ein Modal im DOM ist
- SW-Debug-Bypass:
  - URL-Parameter `sw-off=1` deaktiviert den Social Service Worker und leert `mnyra-social-cache-*`.
- Build-Token wurde erhoeht, damit Clients den neuen Stand ziehen.

## Betroffene Dateien
- `apps/menyra-social/core/overlays/overlay-root-ui-utils.js`
- `apps/menyra-social/index.html`
- `apps/menyra-social/pwa.js`
- plus bereits vorher gesetzte Modal-Surface-Attribute in den Modal-Renderern.

## Soll-Verhalten
- Bei offenem Modal ist die obere Safe-Area auf iOS weiss (`#ffffff`) bzw. exakt die Modal-Farbe.
- Ohne Modal bleibt App-Chrome `#f8fafc`.

## Schnelltest
1. URL mit SW-Bypass oeffnen:
   - `.../apps/menyra-social/index.html?sw-off=1&debug-build=1&cb=core14`
2. Prüfen:
   - Build-Badge sichtbar (unten rechts).
   - Modal oeffnen/schliessen mehrfach.
   - Obere Safe-Area bleibt modal-konsistent (weiss).

## Wenn es spaeter wieder kaputt geht (Sofort-Playbook)
1. Erst Cache/SW ausschliessen:
   - Mit `sw-off=1` testen.
2. Build-Token in `index.html` erhoehen:
   - `APP_BUILD_TOKEN`
   - `social-app.js?v=...`
   - `pwa.js?v=...`
3. Prüfen, ob diese Elemente existieren und bei offenem Modal `display:block` haben:
   - `#safariChromeTintTop`
   - `#safariChromeTintBottom`
4. Prüfen, ob `--active-modal-surface` gesetzt ist und nicht auf App-Background faellt.
5. Prüfen, ob ein anderes Script `theme-color` oder `modal-open` wieder ueberschreibt.

## Notfall-Restore auf diesen Fix-Stand
- Diese drei Kern-Dateien aus dem Fix-Commit wiederherstellen:
  - `apps/menyra-social/core/overlays/overlay-root-ui-utils.js`
  - `apps/menyra-social/index.html`
  - `apps/menyra-social/pwa.js`

