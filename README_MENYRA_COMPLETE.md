# MENYRA — COMPLETE SPEC (Source of Truth)

Stand: 2025-12-16

Dieses Dokument beschreibt **was** MENYRA am Ende kann.  
Die Umsetzung erfolgt **Dummy-first** (UI), danach LOGIC (Firebase).

---

## 1) Rollen & Apps

### 1.1 CEO / Superadmin (Platform Admin)
- sieht alle Kunden (restaurants/shops)
- sieht alle Staff-Accounts
- CRM Leads (create/assign/convert)
- Billing/Plans/Status
- Systemübersicht (Logs, KPIs)

### 1.2 Staff Admin (Mitarbeiter)
- erstellt Leads
- kann Kunden als Draft anlegen (In Umsetzung)
- sieht nur seine Kunden/Leads (created/assigned)
- Übergabe an CEO (Approve/Activate)

### 1.3 Owner Admin (Restaurant/Shop Kunde)
- verwaltet Menu/Items/Preise/Extras
- verwaltet Offers
- (später) Mitarbeiter/Kellner verwalten
- sieht Orders (Restaurant) / Sales (Shop)

### 1.4 Kamarieri / Kitchen
- sieht Orders live
- kann Status ändern: neu → in arbeit → fertig → serviert

### 1.5 Guest (Gastro)
- scannt QR
- sieht Karte
- legt in Warenkorb
- bestellt
- optional: likes/comments (später Social)

### 1.6 Public Main Page
- Restaurant-Website (Öffnungszeiten, Kontakt, Galerie)
- Shop Landing Page (Produkte, Kategorien)

---

## 2) Kern-Flows

### 2.1 Lead → Kunde
1) Staff erstellt Lead
2) Staff oder CEO weist Lead zu
3) CEO wandelt Lead in Kunde um (Restaurant/Shop)
4) Staff bleibt assigned (Betreuung)

### 2.2 Staff erstellt Kunde (Draft)
- Staff kann direkt ein Restaurant/Shop als Draft anlegen
- CEO prüft & aktiviert (Billing/Plan)

### 2.3 Orders
- Guest sendet Order unter restaurantId/tableId
- Kitchen/Staff sieht live
- Status-Lifecycle

---

## 3) Datenmodell (Firestore später)

### 3.1 restaurants/{restaurantId}
Minimum:
- name, type (cafe/restaurant/hotel/shop/…)
- city, address, phone
- status (In Umsetzung/Aktiv/Test/…)
- createdAt
- createdByStaffId
- assignedStaffId
- billing: plan, price, startAt, renewalAt (nur CEO edit)

### 3.2 leads/{leadId}
- name, phone, city, source, note
- status (new/contacted/won/lost)
- createdAt
- createdByStaffId
- assignedStaffId

### 3.3 restaurants/{restaurantId}/orders/{orderId}
- tableId
- items [{id,name,qty,price}]
- total
- status (new/in_progress/done/served)
- createdAt
- lastUpdateAt

---

## 4) Dummy→Logic Mapping
Alles was im Dummy als localStorage existiert, wird später:
- **1:1 in Firestore Docs**
- gelesen via `onSnapshot`
- gefiltert via Queries
- abgesichert via Security Rules

---

## 5) Nicht-Ziele (für Dummy Phase)
- Keine echten Zahlungen
- Kein echtes Media Upload
- Keine komplexen Social Features  
Diese kommen erst in LOGIC + spätere Phasen.
