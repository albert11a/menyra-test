Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 14: Web-Direct-Menu Surface Stability Fix

## Schrittziel

Den normalen Web-Direct-Menu-Pfad auf `/:slug/menu` beruhigen, damit Slug-/Lookup-Kontext und kanonische `restaurantId` nicht zwei sichtbare Menu-Ladephasen fuer denselben Screen erzeugen.

## Scope

Geaendert wurden nur die fuer diesen Schritt freigegebenen Produktbereiche plus diese Dokumentation:

- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step14-web-direct-menu-surface-stability-fix.md`

## Umsetzung

### A. Kanonischer Menu-Surface-Zielkontext im Render

`renderProfileMenuView(...)` nutzt fuer den sichtbaren Menu-Surface jetzt einen Zielkontext aus:

- `canonicalRestaurantId`
- Route-Payload-Canonical
- Route-Snapshot-Restaurant-ID
- fallback `restaurantId`

Dadurch vergleichen Menu-Truth, Menu-Items, Focus-State und Web-Direct-Entry nicht mehr unnoetig mit verschiedenen Slug-/ID-Varianten.

### B. Menu-/Focus-Ensures auf Surface-Key dedupliziert

Das Ensure-Cluster dedupliziert Menu und Fokus jetzt mit einem sichtbaren Menu-Surface-Key statt nur mit dem direkt angefragten Key.

Im normalen Web-Direct-Menu-Pfad werden Slug, Public-Slug, Handle, Route-Payload-ID und kanonische `restaurantId` als derselbe sichtbare Zielkontext behandelt, solange sie zum aktuellen sichtbaren Menu-Screen gehoeren.

Damit soll ein laufender Menu-Ensure nicht direkt durch denselben Screen mit kanonischer ID neu gestartet werden.

### C. Fokus beruhigt, solange Menu Haupt-Surface laedt

Auf dem normalen Web-Direct-Menu-Pfad wird der Fokus-Ladeplatzhalter nicht mehr vor dem Menu als eigener sichtbarer Loading-Block gerendert, solange das Menu selbst noch laedt. Der automatische Fokus-Ensure aus dem Carousel wartet in diesem Fall ebenfalls, bis die Public-Menu-Truth stabil ist.

Fokus bleibt erhalten und kann nach stabiler Menu-Truth weiter geladen/angezeigt werden. Es wurde keine Focus-UI umgebaut, nur der unruhige First-Loading-Fall im normalen Web-Direct-Menu-Pfad beruhigt.

### D. Sichtbarer Menu-Load erkennt kanonische ID

`session-data-runtime-controller.js` erkennt den sichtbaren Public-Menu-Surface jetzt auch dann als denselben Screen, wenn der Loader bereits mit kanonischer `restaurantId` laeuft, waehrend Route/Entry noch Slug-/Lookup-Informationen tragen.

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Keine QR-Logik-Aenderung.
- Keine QR-URL-Aenderung.
- Kein Tisch-/Bestellkontext geaendert.
- `/login` unveraendert.
- Root `/` unveraendert.
- Keine Functions-/Rules-/Firebase-Aenderung.
- Keine anderen Domains.
- Kein Smoke-Test, kein Playwright.

## Manuelle Testliste

1. Hard Refresh auf `/:slug/menu`: Produkte erscheinen; die sichtbare doppelte `Menu wird geladen`-Phase ist verschwunden oder deutlich reduziert.
2. Auf `/:slug/menu` bleiben: kein Request-/Listener-Sturm.
3. Im Profil auf den Menu-Tab klicken: Menu bleibt klickbar und Produkte erscheinen.
4. Von `/:slug/posts` oder `/:slug` ins Menu wechseln: Menu laedt stabil.
5. Echten QR-Link oeffnen: QR landet weiter im Profil mit offenem Menu, Tisch-/Warenkorb-Kontext bleibt korrekt.
6. QR-Menu 30-60 Sekunden beobachten: kein Request-/Listener-Sturm.

## Bewertung

`bestanden mit kleinem Rest-Risiko`
