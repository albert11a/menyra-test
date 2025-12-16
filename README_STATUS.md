# MENYRA – Fortschritt / Status

## Stand: Schritt 2.1 (Dummy UI – Admin/Staff)

✅ Ziel von Schritt 2.1: **Admin-Welten sauber trennen**, Logins **sauber getrennt**, Navigation **korrekt nach menyra.css**, Sprache als **Dropdown**, Background **einheitlich**.

### Was ist fertig in Schritt 2.1
- Startseite: `index.html` mit Links zu allen Bereichen (inkl. Public + Guest-Coming-Soon)
- **Logins getrennt & clean** (keine Sidebar/Topbar im Login)
  - `platform/login.html`, `owner/login.html`, `ecommerce/login.html`, `hotel/login.html`, `services/login.html`, `staff/login.html`
- **Sprache als Dropdown** (vorbereitet, Inhalte noch DE-only im Dummy)
- **Mobile Menü** (Burger + Drawer) in den Admin Dashboards
- **Platform Admin** (Dummy Dashboard)
  - Kunden / Accounts / Module / Ads-Freigabe / Moderation / Analytics / Settings
- **Gastro Owner Admin** (Dummy Dashboard)
  - Speisekarte, Orders (Tisch/Pickup), Offers/Happy Hour, Loyalty, Referrals, Queue, Ads, Social, Filialen
- **E-Commerce Admin** (Dummy Dashboard)
  - Produkte, Orders, Rabatte, Loyalty, Referrals, Ads, Social
- **Hotel/Motel Admin** (Dummy Dashboard)
  - Zimmer/QR, Requests/Tickets, Housekeeping, Spa, Privacy Mode als Platzhalter
- **Services Admin** (Dummy Dashboard)
  - Leistungen, Anfragen, Öffnungszeiten, Reviews/Maps, Ads
- **Staff Panels**
  - `staff/dashboard.html` + 3 Panels (Gastro Orders, Fastfood Pickup, Housekeeping)
- **Public Page (Demo)**
  - `public/main.html` (Google Reviews Widget Platzhalter)
- **Guest Folder**
  - `guest/coming-soon.html` + `guest/README.md` (Step 3 kommt)

### Was fehlt als nächstes (Schritt 3)
- Guest-Bereich richtig bauen (Karte/Shop/Room-QR) mit deiner `guest.css`
- Ads-Slots im Guest Scroll (Card Design)
- Social Snippets im Guest („wer ist gerade hier“, Likes/Kommentare)
- Danach erst: echte Firebase Logik (Auth, Firestore, Rules, Cost-Optimierung)

