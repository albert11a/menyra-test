Status: CURRENT
Last updated: 2026-05-30

# Schritt 51 - Launch-Audit, Firebase- und Auth-Startup-Haertung

## Ziel

Breite technische Abschlusspruefung vor Launch-Start mit Fokus auf:

- doppelte oder ungenutzte Codepfade,
- Firebase-Initialisierung,
- sichtbare Launch-Limits fuer Orders, Posts, Menu, Feed und CRM,
- sichere kleine Korrekturen ohne UI-/Design-Aenderung.

## Befund

- Exact-Duplicate-Pruefung fand nur zwei identische Legacy-Redirect-HTML-Dateien:
  `apps/menyra-social/profile/index.html` und `apps/menyra-social/profile/external/index.html`.
  Beide sind Routing-Kompatibilitaetsseiten und wurden nicht entfernt.
- Statische Import-Graph-Pruefung fand keine sicher loeschbaren Social-Runtime-Module.
  Mehrere scheinbar ungenutzte Dateien sind dynamisch per String, Heart, Service Worker,
  Vercel-Route oder Functions-Einstieg angebunden.
- Firebase wird zentral ueber `shared/firebase-config.js` geladen. Die Datei wird mit
  unterschiedlichen URL-Varianten genutzt; Firestore/Auth hatten bereits Fallbacks.
  Der Default-App-Pfad ist jetzt zusaetzlich defensiv gegen doppelte Initialisierung
  gehaertet.
- Orders werden nicht durch die UI-Limits blockiert. Order-Erstellung schreibt direkt nach
  `restaurants/{restaurantId}/orders/{orderId}`; Mirrors fuer User/Guest Lookup laufen ueber
  Cloud Functions. Die sichtbaren Listen sind begrenzt (`60` Social Orders, `120` Waiter).
- Public Menu ist nicht hart auf 120 Items begrenzt. Das 120er-Limit betrifft Favoriten.
- Public Posts laden erst eine kleine Initial Page und reconciliieren danach vollstaendig.
  Das ist korrekt fuer Vollstaendigkeit, bleibt aber ein spaeterer Performance-Hotspot,
  wenn ein einzelnes Geschaeft sehr viele Posts hat.
- Chat V1 ist aktuell hart deaktiviert. Die betroffenen Auth/Shell-Tests wurden auf diesen
  aktuellen Zustand angepasst.

## Geaendert

- `shared/firebase-config.js`
  - Default Firebase App wird wiederverwendet, wenn sie bereits fuer dasselbe Projekt/App-ID
    initialisiert wurde.
- `apps/menyra-social/core/auth/auth-startup-state-utils.js`
  - Persistierte Auth-Profil-Hints schreiben den Avatar-Cache nicht mehr doppelt waehrend
    desselben Startup-Pfads.
- `tests/auth-shell-chrome-sync.test.mjs`
  - Erwartungen auf den aktuellen Chat-V1-Kill-Switch angepasst.
- Social-Bundle wurde neu gebaut.

## Bewusst Nicht Geaendert

- Keine UI-, Layout-, Farb-, Typografie- oder UX-Aenderung.
- Keine Firestore Rules oder Functions-Aenderung.
- Keine Order-, QR-, Cart-, Menu- oder Routing-Produktlogik-Aenderung.
- Keine Entfernung der kompatibilitaetsrelevanten Redirect-Dateien.
- Keine aggressiven Performance-Refactors an Public Posts oder CRM-Pagination.

## Bewertung

`bestanden mit Rest-Risiko`

Der Code ist fuer den ersten Launch technisch stabiler, aber der Social-Entry-Bundle liegt
weiter extrem nah am gzip-Budget. Fuer groessere neue Features braucht es vorher wieder
Bundle-Entlastung oder ein eigenes Budget-/Split-Thema.

## Verifikation

- `node --check shared/firebase-config.js`
- `node --check apps/menyra-social/core/auth/auth-startup-state-utils.js`
- `node --test tests/auth-shell-chrome-sync.test.mjs tests/auth-startup-profile-hints.test.mjs`
- `node --test tests/*.test.mjs`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`

## Manuelle Testliste

- Oeffentliche Business-Seite `/:slug` und `/:slug/menu` oeffnen.
- Als Gast eine Shop/Menu-Bestellung absenden und im Waiter pruefen, ob sie live erscheint.
- Als angemeldeter Business-/Staff-Nutzer Orders-Tab und Waiter-Ansicht pruefen.
- Login/Logout ausfuehren und Header-/Drawer-Badges beobachten.
- Heart/CRM-Routen `/leads`, `/customers`, `/admin/staff` kurz oeffnen.
