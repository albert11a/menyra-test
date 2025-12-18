# README — STEP 001: Platzhalter-UI (ohne Funktionen)

## Ziel
- Alle Seiten existieren und zeigen **Layout/Design**
- Keine Logik, kein Firebase, keine echten Daten
- Sehr schnell ladbar (nur HTML + CSS)

## Was wurde gemacht?
1) `shared/styles.css` wurde 1:1 aus deiner Datei übernommen.
2) Guest-Platzhalter:
   - `apps/guest/karte.html` (Karte + Offers + Status Cards + Drinks + Food)
   - `apps/guest/detajet.html` (Detail-Layout inkl. Slider-Block)
   - `apps/guest/porosia.html` (Bestellübersicht)
   - `apps/guest/hotel.html` (Hotel Portal: Info/Requests/DND/Restaurant)
   - `apps/guest/ticket.html` (Fastfood Ticket/Nummer)
3) Social-Platzhalter:
   - `apps/social/login.html`, `entdecken.html`, `feed.html`, `profile.html`, `profile-edit.html`, `history.html`
4) Owner/Staff/Platform-Platzhalter:
   - `apps/owner/login.html`, `admin.html`
   - `apps/staff/login.html`, `kamarieri.html`
   - `apps/platform/login.html`, `dashboard.html`
5) Root `index.html` ist der Dev-Hub (Links zu allen Seiten).

## Nächster Mini-Step (empfohlen)
STEP 002: Wir nehmen **nur** `apps/guest/karte.html` und bauen oben deine neue Topbar + Menübar (social/info/kamarieri) als reines Layout.
