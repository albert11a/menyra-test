# MENYRA — README_STATUS (aktueller Stand)

Stand: DUMMY-TEIL 1 (Platform Admin) — **P1.4 abgeschlossen**

## ✅ Was ist bereits drin (Dummy, ohne Firestore)
### Platform CEO Admin
- Dashboard (Stat-Cards + Schnellaktionen) ✅
- Kunden: Liste + Detail (Dummy) ✅
- Mitarbeiter: Staff Admin Verwaltung (Dummy) ✅
- Leads CRM: **Liste + Filter + Pipeline Chips + KPIs + Create/Detail Modals** ✅
- Demos: Platzhalter View ✅

### Platform Staff Admin (Mitarbeiter)
- Getrennte Staff-Login-Seite (`/platform/staff-login.html`) ✅
- Staff Dashboard im gleichen Layout wie CEO ✅
- Meine Kunden (Placeholder) ✅
- **Meine Leads**: Liste + Filter + Chips + KPIs + Create/Detail Modals ✅
- Dummy: Staff-ID wird aus der Login-Email abgeleitet → jeder Staff sieht „seine“ Leads ✅

## 🧪 Was du testen sollst (Checkliste)
1) CEO: `/platform/login.html` → Dummy Login → `/platform/dashboard.html`
   - View „Leads“ öffnen
   - Filter/Chips klicken → Tabelle reagiert
   - „+ Neuer Lead“ → Modal → speichern → Lead erscheint oben
   - Lead „Detail“ → Status ändern → speichern

2) Staff: `/platform/staff-login.html`
   - Email+Pass eingeben → weiter
   - View „Meine Leads“
   - „+ Neuer Lead“ → speichern
   - Detail öffnen → Status ändern → speichern

## ➜ Nächster Mini-Step
**DUMMY-P1.5: Demo Generator UI (richtig ausbauen)**
- Demo erstellen (Typ wählen)
- Automatische Demo Links anzeigen (Main Page / Guest Karte / Shop / Room)
- Button „Demo → Kunde konvertieren“ (Dummy)

Danach:
- **DUMMY-P1.6: Assignments UI** (Lead/Kunde zu Staff zuweisen – UI + Modals)
