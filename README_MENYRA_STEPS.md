# MENYRA — MINI-STEP PLAN (Dummy zuerst)

Stand: 2025-12-16

**Wichtig:** Jeder Step ist so klein, dass er ohne Tool-Limits geliefert werden kann.  
Pro ZIP: nur die zu ersetzenden Dateien + aktualisierte Readmes + CHANGES.md.

---

## Namensschema
- DUMMY-P1.x = Platform (CEO/Staff)
- DUMMY-P2.x = Owner Admin (Kunde/Restaurant)
- DUMMY-P3.x = Guest (Karte/Bestellen)
- DUMMY-P4.x = Public/Main Pages (Restaurant/Shop)
- LOGIC-L1.x = Firebase/Firestore/Auth/Rules (nach Dummy)

---

# DUMMY-P1 — Platform (CEO + Staff)

## ✅ P1.1 — CEO Dashboard Skeleton
**Ziel:** Layout/Views/Navigation Skeleton.  
**Files:** `platform/dashboard.html`, `platform/menyra.css`, `platform/app.js`  
**Tests:** Views wechseln funktioniert, Stat Cards sichtbar.

## ✅ P1.2 — Customers UI (Liste + Detail Dummy)
**Ziel:** Kundenliste + Detailseite (Dummy-Daten).  
**Files:** `platform/dashboard.html`, `platform/app.js`  
**Tests:** Kunde öffnen, Detail zeigt ID/Typ/Stadt.

## ✅ P1.3 — Staff Admin UI + Staff Login
**Ziel:** eigener Staff-Bereich mit gleichen Designprinzipien, weniger Rechte.  
**Files:** `platform/staff.html`, `platform/staff-app.js`, `platform/staff-login.html`, `platform/staff-login.js`  
**Tests:** Staff login → Dashboard/Leads/Kunden-View sichtbar.

## ✅ P1.4 — Leads CRM UI
**Ziel:** Leads-Liste, Filter, KPIs, Lead Create + Detail Modal.  
**Files:** `platform/dashboard.html`, `platform/app.js`, `platform/staff.html`, `platform/staff-app.js`  
**Tests:** Lead erstellen/bearbeiten, Filter funktionieren.

## ✅ P1.5 — Demos Generator UI
**Ziel:** Demo-Einträge anlegen, Links kopieren, Übersicht.  
**Files:** `platform/dashboard.html`, `platform/app.js`  
**Tests:** Demo anlegen, Detail zeigt Links.

## ✅ P1.6 — Assignments + Persist (localStorage)
**Ziel:** Zuweisung (Lead→Staff, Customer→Staff) + Staff „Meine Kunden“.  
**Files:** `platform/app.js`, `platform/dashboard.html`, `platform/staff.html`, `platform/staff-app.js`  
**Tests:** Assignment setzen, Reload, bleibt; Staff sieht nur zugewiesene Kunden.

## ✅ P1.7 — Staff Create Customer (Draft) + CEO sieht CreatedBy
**Ziel:** Staff kann Kunden als Draft anlegen; CEO sieht Ersteller im Detail.  
**Files:** `platform/staff.html`, `platform/staff-app.js`, `platform/app.js`, `platform/dashboard.html`  
**Tests:** Staff legt Kunden an → CEO listet ihn; Detail zeigt “Erstellt von”.

---

# NEXT: DUMMY-P1.8 — Orders & Kitchen Dummy (in Micro-Steps)

## P1.8a — Orders Dataset + List UI (CEO)
**Ziel:** Orders-Liste/Detail im CEO (Dummy Daten + Status Badge).  
**Max Files:** 2–3  
**Files (geplant):** `platform/dashboard.html`, `platform/app.js`  
**Tests:** Liste zeigt Orders; Detail zeigt Items/Total/Status.

## P1.8b — Kitchen View (Staff/Kellner) UI
**Ziel:** Kitchen Screen (Neu/In Arbeit/Fertig Tabs) — UI only.  
**Max Files:** 2–3  
**Files:** `platform/staff.html`, `platform/staff-app.js`  
**Tests:** Order Status ändern (Dummy), UI aktualisiert.

## P1.8c — Dummy Order Generator
**Ziel:** Button „Test Order erstellen“ (für schnelle Demos).  
**Files:** `platform/app.js` + evtl. `platform/dashboard.html`  
**Tests:** Klick → neue Order erscheint in Listen.

> Danach ist P1.8 “komplett”, ohne Firestore.

---

# DUMMY-P2 — Owner Admin (Restaurantkunde)

## P2.1 — Owner Dashboard Skeleton
**Ziel:** Owner Admin Grundlayout (Navigation + Empty Views).  
**Files:** `owner/admin.html`, `owner/admin.js`, shared css  
**Tests:** Dummy login, Views schalten.

## P2.2 — Menu Builder UI (Categories + Items)
**Ziel:** Owner kann Kategorien/Items verwalten (Dummy).  
**Files:** `owner/admin.html`, `owner/admin.js` (+ optional neue Module)  
**Tests:** Kategorie + Item erstellen, Liste zeigt es.

## P2.3 — Offers UI
**Ziel:** Angebote erstellen und veröffentlichen (Dummy).  
**Tests:** Offer erstellen, aktiv/inaktiv.

---

# DUMMY-P3 — Guest (Karte/Detail/Warenkorb)

## P3.1 — Guest Karte Skeleton + Dummy Data
**Ziel:** Karte zeigt Kategorien/Items (Dummy).  
**Files:** `guest/karte.html`, `guest/karte.js`, shared styles  
**Tests:** Tabs, Suche, Cards.

## P3.2 — Detail + Add-to-Cart Dummy
**Ziel:** Detailseite, Qty, Add to cart.  
**Files:** `guest/detajet.html`, `guest/detajet.js`, `guest/cart.js`  
**Tests:** Add, Badge.

## P3.3 — Checkout Dummy + Order Submit Placeholder
**Ziel:** porosia UI, Order payload preview.  
**Files:** `guest/porosia.html`, `guest/porosia.js`  
**Tests:** totals, note, “send” shows success (dummy).

---

# LOGIC Phase (erst wenn Dummy bis P3 fertig)

## LOGIC-L1 — Auth & Role Gates
**Ziel:** CEO/Staff/Owner echte Firebase Auth Logins + Gate.  
**Files:** `shared/firebase-config.js`, `platform/*login.js`, `owner/*login.js`, Rules  
**Tests:** Rollencheck per uid mapping.

## LOGIC-L2 — Firestore Data Layer (Customers/Leads/Assignments)
**Ziel:** localStorage → Firestore (onSnapshot + queries).  
**Tests:** Multi-device realtime.

## LOGIC-L3 — Orders realtime (Guest → Kitchen/Staff)
**Ziel:** guest schreibt order; staff/kitchen sieht live; status updates.  
**Tests:** order lifecycle.
