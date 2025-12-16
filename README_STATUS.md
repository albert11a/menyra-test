# MENYRA — STATUS

Stand: 2025-12-16

## Phase: DUMMY (UI zuerst)

### DUMMY-P1 — Platform Admin (CEO + Staff)
✅ **P1.1** CEO Dashboard Skeleton  
✅ **P1.2** Customers UI (Liste + Detail Dummy)  
✅ **P1.3** Staff Admin UI + Staff Login (eigener Bereich)  
✅ **P1.4** Leads CRM UI (Liste/Filter/Chips/KPIs + Create/Detail Modals)  
✅ **P1.5** Demos Generator UI (Liste + Create + Detail mit Links/Kopieren)  
✅ **P1.6** Assignments + Persist (localStorage)  
- Lead → Staff zuweisen (persistiert)  
- Customer → Staff zuweisen (persistiert)  
- Staff „Meine Kunden“ filtert nach Assignment  

✅ **P1.7** Staff kann Kunden erstellen (Draft / „In Umsetzung“) + CEO sieht „Erstellt von“
   - HOTFIX: Staff „Neuer Kunde“-Modal nutzt jetzt `.m-modal-overlay` (sichtbar/zentriert) + `bootDashboard()` ist safe-gekapselt.  
- Staff legt Kunden an → erscheint im CEO sofort  
- Customer Detail zeigt: „Erstellt von“ + „Zuständig“ (Assignment)

➡️ **NEXT: P1.8 — Orders & Kitchen Dummy (UI-only, später Firestore 1:1)**

---

## Regel für zukünftige ZIPs
Jedes ZIP enthält:
1) nur geänderte Dateien  
2) **immer** die aktualisierten Readmes (mindestens STATUS + STEPS)  
3) eine `CHANGES.md` im ZIP (kurz: was/wo/warum)
