# MENYRA System 1 – Aktueller Stand (2025-12-24)

System 1 deckt Restaurants/Cafés ab: QR-Guest, Bestellungen, Admins (CEO/Staff/Owner), Stories. Dieses README beschreibt, was funktioniert, welche Logik aktiv ist und was kürzlich geändert wurde.

## Apps & Rollen
- **CEO Platform** (`apps/menyra-ceo/`): sieht alle Kunden, volle Admin-Funktion.
- **Staff Platform** (`apps/menyra-staff/`): sieht nur eigene Kunden, volle Admin-Funktion für diese.
- **Owner Admin** (`apps/menyra-restaurants/owner/`): nur für einen Kunden (per `?r=<id>`), Menüs/Offers/Stories pflegen.
- **Guest** (`apps/menyra-restaurants/guest/`): Karte/Detajet/Porosia/Story, liest nur `public/*`.
- **Waiter/Kitchen**: Platzhalter (UI da, Logik TODO).

## Boot & Access (CEO/Staff/Owner)
- Body startet mit `m-boot m-app-hidden`; UI bleibt unsichtbar bis Auth + Access OK.
- Overlay zeigt Status; verschwindet nach erstem erfolgreichen Laden.
- Access-Checks:
  - CEO: `superadmins/{uid}` muss existieren.
  - Staff: `staffAdmins/{uid}` oder `superadmins/{uid}`.
  - Owner: `restaurants/{rid}/staff/{uid}` Rolle `owner|admin|manager`.
- Erst danach: Daten laden, dann UI einblenden (kein Drawer-/Login-Flash mehr).

## Admin Dashboard (CEO/Staff)
- Keine statischen Charts, nur schnelle Zahlen/Listen. Light refresh alle ~50s, plus Live wo nötig.
- **Aktive Kunden & Einnahmen**
  - Zählt nur `status=="active"`.
  - Jahresbetrag: yearly price oder monthly*12; zeigt Jahr/Monat/Tag (Intl EUR).
  - LIVE-Badge wenn frische Daten; Count-Up Animation bei Änderungen.
  - Updated-Label unten links.
- **Demo Kunden**: Trial/Demo/Test Zählung, LIVE-Badge, updated-Label unten.
- **Leads**: Gesamt & Offen; LIVE-Badge, updated-Label.
- **Nächster Zahltag**: sortiert nach `nextBillingAt` (fallback: zeigt einige Kunden mit „kein Datum“), Expand-Button, Safe-Area Padding.
- **Aktive Storys**: Summiert aktive Storys per Restaurant via `countActiveStories`, Liste zeigt Kunde + Story-Anzahl, Expand-Button.
- **Live Stats (Swipe)**: Zwei Slides (Live Users, Orders today). LIVE-Badge, keine Dots/Auto-Slide. Listener auf `system/liveStats` (onSnapshot); Fallback: Orders heute via `restaurants/{rid}/orders` (max 4 Kunden, seit 00:00).
- **Checks**: Liest `systemLogs` (letzte 20), listet bis 5 Errors mit App + „vor X min“. Zeigt „Keine Errors heute“ wenn leer.
- Alle Cards: einheitliche Abstände, `updated` unten links, Live-Badges stabil sichtbar.

## Admin Kernlogik (platform-admin-core.js)
- Datenquellen:
  - Restaurants: `restaurants` (CEO alle, Staff scoped).
  - Leads: `/leads` (CEO alles, Staff scoped via `assignedStaffId|createdByStaffId`).
  - Storys: `restaurants/{rid}/stories` (countActiveStories).
  - System Logs: `systemLogs` (Errors heute).
  - Live Stats: `system/liveStats` (optional), Orders Fallback.
- Caching: LocalStorage Cache für Restaurants/Leads (TTL ~2min), regelmäßige Refreshes (~50s).
- Updated-Timer: labels refresht alle 10s; Live-Badge läuft ~20s nach Update.
- Menü/Offers/Stories/QR/Lead-Modal Logik wie bisher; Owner-Mode geprüft.

## Guest (Karte/Detajet/Porosia/Story)
- Liest primär `public/meta`, `public/menu`, `public/offers` (Single-Doc-Reads, günstig).
- Orders schreiben nach `restaurants/{rid}/orders`.
- Stories: aktive Storys mit Bunny Stream Embeds (TTL, Cleanup via Owner).

## Performance-Regeln
- Live Listener nur: Swipe-Stats (system doc) und aktive Story Counts (per countActiveStories). Rest Poll/Cache.
- Public Docs werden beim Admin-Login gesichert (`ensurePublicDocs`), damit Guest schnell bleibt.

## Bekannte offene Punkte / TODO
- Waiter/Kitchen Logik (Orders Live, Status Updates) fehlt.
- Auth/Roles für Owner/Waiter/Kitchen nur Basis; Production-Härtung/Rules nötig.
- Guest Orders/Story weitere Hardening/Edge-Cases.

## Start (lokal)
1) Static Server / Live Server starten im Repo.
2) `/index.html` öffnen zum Testen/Verlinken.

## Änderungsnotizen (letzte Iteration)
- Neues Boot-Overlay + Zugriffsgate (kein Drawer-/Login-Flash).
- Dashboard neu gestaltet (Cards, Live-Badges, Updated-Badges unten, einheitlicher Grid, kleinere Typo).
- Zahltag-Fallback wenn kein nextBillingAt; Story-Liste zeigt Story-Counts je Kunde.
- Live Stats reduziert (2 Slides, keine Dots), Checks zeigen Fehlerliste statt Counter.
- Quick-Select/Offers-Button aus „Aktive Kunden“ entfernt.
- Live-Badge stabilisiert (sichtbar, softer Animation).

