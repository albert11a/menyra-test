# README — STEP 005: Alle Main Pages + Owner Admin Bereiche (Platzhalter)

**Stand/Version:** STEP 005 (2025-12-18)  
**Modus:** Platzhalter & Design-Fokus (keine Logik)

## Kontext (kurz)
Du willst, dass MENYRA zuerst komplett als Platzhalter steht, damit wir **Design und Aufbau** perfekt machen.  
Danach machen wir **Dummy**, dann **Logik** – in extrem kleinen Schritten, damit nichts “zu groß” wird.

## Was ist neu in STEP 005?
### Public Main Pages (Homepage Templates) — `apps/public/`
- `cafe.html`
- `restaurant.html`
- `hotel.html` (Premium)
- `motel.html`
- `store.html` (Geschäft)
- `service.html` (Dienstleistung)
- `reservation.html` (Booking Platzhalter)

### Online Shop Templates (5) — `apps/public/`
- `shop-fashion.html`
- `shop-cosmetics.html`
- `shop-tech.html`
- `shop-general.html`
- `shop-universal.html`

### Owner Admin erweitert — `apps/owner/admin.html`
- Kundentyp Auswahl (Buttons)
- Main Page Builder (Logo, Farben, Galerie, Links, Reviews)
- Bereiche je Typ (Restaurant/Hotel/Shop/Service…)
- QR Codes Typen

### Dev Hub erweitert — `index.html`
- Neuer Block: **Public (Main Pages)** mit Links zu allen Templates.

## Absichtlich noch ohne Logik
- Automatische Daten pro Kunde (kommt später)
- Login → Redirect je Kundentyp (kommt später)
- Reservierung/Checkout/QR Generator (kommt später)

## Nächster Step (Design)
STEP 006: Nur **Guest Karte** (Topbar + Menübar Social/Info/Kamarieri) — **ohne Logik**.
