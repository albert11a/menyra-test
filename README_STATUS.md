# MENYRA — README_STATUS (aktueller Stand)

Stand: DUMMY-TEIL 1 (Platform Admin) — **P1.6 abgeschlossen**

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
- Meine Kunden: zeigt nur zugewiesene Kunden (Dummy) ✅
- **Meine Leads**: Liste + Filter + Chips + KPIs + Create/Detail Modals ✅
- Dummy: Staff-ID wird aus der Login-Email abgeleitet → Staff sieht „seine“ Leads (shared store) ✅

## 🧪 Was du testen sollst (Checkliste)
1) CEO: `/platform/login.html` → Dummy Login → `/platform/dashboard.html`
   - View „Demos“ öffnen → Demo öffnen → Links kopieren → Neue Demo anlegen
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
**DUMMY-P1.6: Assignments UI (Lead/Kunde zu Staff zuweisen – UI + Modals)**
- Leads: Zuweisung an Staff im Detail (Dropdown + speichern) → Dummy
- Kunden: Zuweisung an Staff (in Kunden-Detail) → Dummy
- Filter „Meine Kunden“ im Staff Admin → Dummy

Danach:
- **DUMMY-P1.7: Kitchen Screen Dummy** (Bestellungen sehen – UI)
