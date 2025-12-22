# MENYRA – System 1 Skeleton (Restaurant/Café)

## Wichtig (Start)
Öffne das Projekt mit **Live Server** (oder einem beliebigen lokalen Webserver).
**Nicht** via file:// öffnen, sonst funktionieren ES-Module Imports nicht.

## Was ist drin (genau wie du wolltest)
✅ **Struktur**: 1 System für Restaurants/Cafés + 1 CEO Platform + 1 Staff Platform (weitere Systeme kommen danach)  
✅ **Firebase ist drinnen**: `/shared/firebase-config.js` (deine Config)  
✅ **CEO sieht alle Kunden** (`restaurants`)  
✅ **Staff sieht nur eigene Kunden** (`createdBy == uid`)  
✅ Beim Kunden erstellen:
- `restaurants` doc
- `restaurants/{id}/public/meta`
- `restaurants/{id}/tables/{1..N}` (automatisch anhand "Anzahl Tische")
✅ **QR & Links**: Im CEO/Staff Dashboard wird automatisch ein QR-Link (Tisch 1) angezeigt + QR-Render (lib + fallback).

## Öffnen
- Hub: `/index.html`
- CEO: `/apps/menyra-ceo/dashboard.html`
- Staff: `/apps/menyra-staff/dashboard.html`

## Nächste Schritte (Design machen wir erst, wie du willst)
- Firestore Rules + Rollen/Logins (ceo/staff/owner/waiter/kitchen)
- Owner Admin: Rollen hinzufügen (owner/kellner/küche/manager) in `restaurants/{id}/staff`
- Guest Karte/Porosia: echte Orders + Kitchen/Waiter Views
- Social/Story: 24h Stories + Highlights + Main zeigt Highlights
- Bunny Upload-Gateway (damit keine Keys im Browser sind)
