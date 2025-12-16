# README_UPDATE_DUMMY_P1_3 — Was wurde in diesem Schritt gemacht?

**Datum:** 2025-12-16  
**Mini-Step:** **DUMMY-P1.3 ✅**  
**Ziel:** Mitarbeiter (Staff Admin) als Dummy-UI fertig machen + getrennte Staff-Login-Seite, damit CEO und Mitarbeiter sauber getrennt sind.

---

## 1) Was ist neu (kurz)
### A) Platform CEO Dashboard (`/platform/dashboard.html`)
- **View „Mitarbeiter“** ist jetzt **richtig ausgebaut**:
  - Staff-Liste (Dummy) mit Suche/Status-Filter
  - **Öffnen** → Staff-Detail Modal
  - **Zuordnen** → Assign Modal (Dummy)
  - **Neuer Mitarbeiter** → Create Modal (Dummy)

### B) Neues: Platform Staff Admin (getrennt)
- **Neue Login-Seite:** `/platform/staff-login.html`
- **Neues Staff Dashboard:** `/platform/staff.html`
  - Staff sieht **nur** „Meine Kunden“ & „Meine Leads“ (Dummy)
  - Später wird das über `assignedStaffId` / `createdByStaffId` logisch gefiltert

### C) Dummy-Interaktionen (`/platform/app.js`)
- Staff Tabelle wird **aus Dummy-Daten gerendert** (statt Hardcode im HTML).
- Create/Detail/Assign Modals öffnen & schließen (Dummy).
- In der Kundenliste: **„Öffnen“** speichert den ausgewählten Kunden (Dummy) und zeigt ihn im Kundendetail oben an.

---

## 2) Wie du es testen kannst (in 2 Minuten)
### Lokal
1) Projektordner öffnen (VS Code)
2) Live Server starten (oder Vercel Preview)
3) Öffne: `/index.html`

### Links (wichtig)
- CEO Login: `/platform/login.html` → danach `/platform/dashboard.html`
- Staff Login: `/platform/staff-login.html` → danach `/platform/staff.html`

### Im CEO Dashboard testen
1) Links „Mitarbeiter“
2) **Öffnen** → Detail Modal
3) **Zuordnen** → Assign Modal
4) **+ Neuer Mitarbeiter** → Create Modal

---

## 3) Was ist bewusst noch Dummy (kommt später als Logik)
- Auth ist noch „egal was eingeben“.
- Staff-Accounts werden nicht wirklich erstellt (später Firebase Auth + Firestore `platformStaff/{uid}`).
- Zuweisungen (Leads/Kunden) speichern noch nicht (später Firestore).
- Provisionen nur UI (später Berechnung anhand Paket/Umsatz).

---

## 4) Nächster Schritt
➡️ **DUMMY-P1.4 — Leads CRM Screens**
- Leads Liste + Filter (New/Meeting/Won/Lost)
- Lead Detail (Notizen, nächste Aktion, Demo Link)
- „Convert to Customer“ UI (Lead → Kunde, assignedStaffId setzen)

