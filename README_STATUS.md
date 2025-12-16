# README_STATUS — MENYRA (aktueller Stand)

**Datum:** 2025-12-16  
**Zielphase:** TEIL 1 — Dummy komplett (UI-only)  
**Letzter Mini-Step:** **DUMMY-P1.2 ✅** (Kundenliste + Kundendetail UI)  
**Nächster Mini-Step:** **DUMMY-P1.3** (Mitarbeiter/Staff-Admin Screens)

---

## 1) Was ist MENYRA (Kurz)
MENYRA ist eine Plattform für **Gastro (Restaurant/Café/Club)**, **Fastfood/Pickup**, **Hotels/Motels**, **E-Commerce Shops** und **Dienstleistungen**.

- **Guest**: QR-Menu, Bestellen (später Logik), Like/Comment (nur mit Account), Presence („Wer ist gerade hier“) blurred ohne Account
- **Public/Main Page**: teilbar wie Website (Öffnungszeiten, Reviews, Offers, Kontakt)
- **Owner Admin**: Kunde verwaltet seinen Betrieb (Menu/Shop/Hotel-Setup)
- **Staff Panels**: Kellner, Küche, Housekeeping (je nach Modul)
- **Platform (CEO + Staff Admin)**: Kunden/Leads/Stats/Ads/Moderation

**Wichtig:** Wir bauen zuerst **nur Dummy/Platzhalter-UI**, damit alles sichtbar ist. Danach kommt die Logik in Mini-Schritten.

---

## 2) Was ist im Dummy bereits drin (funktioniert als UI)
### Plattform (CEO Admin) — `platform/`
- Login (Dummy: irgendeine Email/Pass reicht)
- Dashboard (Schnellaktionen, Stat-Cards, Activity Tabelle – alles Platzhalter)
- Kundenliste (Dummy)
- Kundendetail (Dummy) — Formular, Module-Toggles, Links/QR-Preview, Multi-Location, Accounts, Notizen
- Accounts (Platzhalter-Liste)
- Module (Platzhalter-Liste)
- Ads Review / Moderation / Analytics / Settings (Platzhalter-Screens)

### Guest / Public / Social (Dummy-Frontends)
- Guest Seiten (Karte/Fastfood/Shop/Room) als Platzhalter
- Public Main Page als Platzhalter
- Social Index (Explore/Feed/Profile etc.) als Platzhalter

### PWA Basis
- `manifest.json`, `sw.js`, `offline.html` (Dummy/PWA Grundgerüst)

---

## 3) Was war neu in DUMMY-P1.2
### Platform → Kunden
- Kundenliste wurde **erweitert**:
  - mehr Kundentypen (Gastro, Pickup, Hotel, Motel, Shop, Dienstleistung)
  - „Öffnen“ führt zur neuen **Kundendetail-Ansicht**
- Neue View: **Kundendetails**
  - Onboarding-Formular (Name, Typ, Stadt, Kontakt, Beschreibung)
  - RestaurantId/Slug Bereich inkl. **„ID Migration“ (später)** als Platzhalter
  - Links & QR Bereiche (Main/QR/Room/Shop) + „QR Export“ Buttons (später)
  - Sprachen-Toggles (Liste deiner Zielsprachen)
  - Multi-Location Tabelle (Filialen)
  - Accounts/Rollen (Owner/Staff/Küche/Housekeeping) Platzhalter
  - Content & Design Buttons (Menu Builder, Page Builder, Shop Builder, Guest Karte Builder – kommen in P2/P3)
  - Interne Notizen (CEO/Staff)

### CSS (klein, aber wichtig)
- `shared/unified.css` hat kleine Helper-Klassen bekommen (Toggle-Chips + KV-Listen), damit Detailseiten sauber aussehen.

---

## 4) Was uns im Dummy noch fehlt (große Checkliste)
Wir arbeiten **Mini-Step für Mini-Step**. Kein großer Sprung, damit es stabil bleibt.

### DUMMY-P1 (Platform Basis)
- **P1.3** Mitarbeiter/Staff Admin Screens (Liste/Detail/Zuweisung/Provision/Stats)
- **P1.4** Leads CRM Screens (Liste/Pipeline/Detail/Convert)
- **P1.5** Demo Generator Screens (Templates + Share Links)
- **P1.6** Assignments (Lead/Kunde zu Staff)

### DUMMY-P2 (Content Suite)
- Menu Builder + Item Editor + Extras/Allergene + Preview + Media Library

### DUMMY-P3 (Themes + Baukasten)
- Theme Gallery + Builder + Blocks + Preview (Mobile/Tablet/Desktop) + Guest Karte Builder

### DUMMY-P4 (Ads)
- Facebook-like Campaign Builder, Targeting, Budget, Preview Slots, Analytics, Approval

### DUMMY-P5 (Social)
- Explore (Kunden-Verzeichnis), Feed, Profile, Post Create, Chat, Presence („wer ist hier“) blurred ohne Account, History

### DUMMY-P6 (Küche/Stationen)
- Kitchen Panel + Bar Panel + Station/Extras Views

### DUMMY-P7/P8
- Hotel/Motel/Service/Ecom Feinschliff + PWA App Experience UI-only

---

## 5) Wie du prüfst, ob alles richtig läuft (Checkliste)
### Lokal (VS Code)
1. Öffne `index.html` mit Live Server  
2. Klick auf:
   - Platform Admin → Login → Dashboard → Kunden → Kundendetails
   - Guest/Public/Social Links im Hub

### Vercel
- Nach Push auf GitHub:
  - Vercel Projekt → Deployments → Latest Deployment öffnen
  - Wenn 404: prüfen ob `index.html` im Root liegt und Vercel „Other“/Static nutzt

---

## 6) Regel für unsere Zusammenarbeit (damit keine Limits passieren)
- Pro Chat: **genau 1 Mini-Step**
- Ich liefere:
  - komplette Dateien
  - README_STATUS Update
  - zusätzlich ein „Step-Readme“ (was geändert wurde & was als nächstes kommt)

