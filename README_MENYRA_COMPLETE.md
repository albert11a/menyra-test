# MENYRA — COMPLETE SPEZIFIKATION (0–1000) | Dummy zuerst, Logik danach

> **Für Albert (CEO)** – Dieses Dokument ist eure „Wahrheit“. Wenn etwas fehlt, ergänzen wir es hier zuerst, bevor wir Logik bauen.

## 0) Ziel
Wir bauen MENYRA in dieser Reihenfolge:
1) **Dummy komplett** (alles sichtbar/klickbar, Platzhalter)
2) **Logik** (Auth/Firestore/Rules/Realtime/Caching) in kleinen Mini-Schritten
3) **Icons**
4) **Design/CSS Feinschliff** + **PWA App-Erlebnis** (Desktop/Tablet/Mobile perfekt)

## 1) Grundregeln
- **Bestellen/Requests ohne Account** möglich.
- **Account Pflicht** für: Like, Kommentar, Post, Save, Follow, Chat, Live, Gifts, Reservierung.
- Social ist **global** (ein Account überall).
- **„Wer ist grad hier?“** in der Guest-Karte:
  - ohne Account: **blurred**
  - mit Account: sichtbar + Check-in optional
- **Ads cross-tenant**: Kunden dürfen überall werben.
- Payment später (Placeholder), Standard: Bar/Personal.
- Mehrsprachig: sq/de/en/sr/bs/hr/cs/fr/it/es/da/tr.
- Skalierung: **200 Kunden**, **50.000+ Besucher/Tag** → Guest muss extrem performant sein.

## 2) Welten/Apps (komplette Liste)
A) Platform **CEO Admin**
B) Platform **Staff Admin** (Mitarbeiter)
C) Owner Admin **Gastro** (Restaurant/Café/Bar/Club)
D) Owner Admin **Fastfood/Pickup**
E) **E‑Commerce Admin**
F) **Hotel Admin**
G) **Motel Admin** (Privacy Mode)
H) **Services Admin**
I) **Staff Panels**: Kellner, Küche, Bar optional, Pickup, Housekeeping
J) **Guest**: Gastro Karte, Pickup, Room Requests, Shop
K) **Public Main Page** (pro Kunde)
L) **Social App** (global)

## 3) Platform — CEO Admin (du)
### 3.1 Dashboard (alles)
- Tenants: aktiv/setup/pausiert
- Traffic/Orders/Requests (Placeholder)
- Social Stats (Placeholder)
- Ads Stats (Placeholder)
- Leads Pipeline (Placeholder)
- System Logs/Health (Placeholder)
- Schnellaktionen: Neuer Kunde, Lead, Demo, Builder, Ads Review, Moderation

### 3.2 Kunden (Tenants)
- Tenant erstellen (Typ wählen)
- Tenant bearbeiten (Profil, Öffnungszeiten, Module Toggles, Status)
- Multi-Location (Filialen) UI + QR Sets
- Links: Public, Guest, Shop, Rooms

### 3.3 Leads CRM
- Pipeline: new/contacted/demoSent/meeting/won/lost
- Lead Detail: Notes, Next Action (Datum/Uhrzeit), Files placeholder
- Filter: CEO/Staff getrennt + pro Mitarbeiter
- Convert: Lead → Tenant

### 3.4 Demos (Sales)
- Demo erstellen (Typ wählen)
- Demo Links sofort teilbar (WhatsApp/Copy)
- Convert Demo → echter Kunde

### 3.5 Mitarbeiter (Staff Admin)
- Staff Admin erstellen
- Zuweisung: Leads/Kunden
- Staff Stats + Provision Placeholder

### 3.6 Content Suite (CEO Superpower)
#### 3.6.1 Menü/Produkte bauen + **Live Preview**
- Kategorien/Items
- Station: kitchen/bar/both
- Extras/Allergene/Notizen
- Bilder/Video
- **Preview**: Card / Detail / Cart / Order Summary

#### 3.6.2 Theme + Baukasten (wie Shopify) — **Main Page + Shop + Guest Karte**
- Theme Gallery + Apply
- Builder (Blocks hinzufügen, löschen, umsortieren)
- Block Settings
- Preview Mode: Mobile/Tablet/Desktop
- Draft/Publish
- Templates pro Branche

Block-Beispiele:
- HERO, INFO, HOURS, CONTACT (Call/WhatsApp), MAP (placeholder), REVIEWS (placeholder),
  GALLERY, OFFERS, MENU PREVIEW, CATEGORY TABS, PRODUCT GRID, AD SLOT,
  SOCIAL UGC, PRESENCE (blurred ohne account), RESERVATION (placeholder), FAQ, FOOTER

#### 3.6.3 Media Library
- Assets pro Tenant (Menu, Offers, Posts, Rooms, Ads Creatives)
- Upload UI (CEO/Staff/Kunde)

## 4) Owner Admins (Kunden)
### 4.1 Gastro Owner Admin
- Profil, Menü, Offers/Events, Orders, Staff/Küche
- Ads Manager + Preview + Analytics UI
- Social/UGC + Moderation
- Loyalty/Referral/Queue UI

### 4.2 Fastfood Owner Admin
- Pickup Orders + Ausgabe-Nummern
- Menü + Stationen
- Ads/Loyalty/Referral

### 4.3 Shop Admin
- Produkte/Varianten/Lager, Orders, Coupons
- Ads + Preview
- Social/UGC

### 4.4 Hotel/Motel Admin
- Rooms + QR
- Requests/Tickets + Housekeeping Panel
- Motel Privacy Mode

### 4.5 Services Admin
- Leistungen + Anfragen
- Ads + Preview

## 5) Staff Panels
- Kellner: Orders live + Status
- Küche: nur kitchen/both Items
- Bar optional: nur bar/both Items
- Pickup: ready/served
- Housekeeping: requests live

## 6) Guest
- Gastro Karte: bestellen ohne Account
- Likes/Kommentare nur mit Account
- Presence „Wer ist hier?“ blurred ohne Account
- Fastfood Pickup
- Hotel Room Requests
- Shop Layout
- Ads Slots (Sponsored Cards)
- Receipt → Review Flow (placeholder)

## 7) Social (global)
- Explore: Tenants browsen (Restaurants/Hotels/Shops/Services)
- Feed: Posts (image/video), Likes/Comments
- Follow/Following
- Save/Collections
- History: zuletzt besucht + orders
- Post erstellen + Tenant tag + optional item tag
- Chat, Live (placeholder), Gifts (placeholder)
- Moderation: report/block

## 8) Ads (Facebook-like)
- Placements: Feed/Explore/GuestMenu/Offers/Shop
- Campaign Builder: Ziel → Creative → Placements → Targeting → Budget placeholder
- **Preview** pro Placement
- Analytics Screens
- Approval Queue (optional)

## 9) Performance/Skalierung
- Guest cache-first, später 1–3 Reads pro Besuch
- Realtime nur staff/kitchen/requests
- Bilder: responsive sizes + lazy + feste Höhen

Ende.
