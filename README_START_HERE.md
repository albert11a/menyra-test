# MENYRA — START HERE (Dummy → später nur Logik)

Stand: 2025-12-16  
Prinzip: **Zuerst Dummy-UI 100% fertig**, dann **Firebase-Logik 1:1** “hineinstecken”.

---

## 1) Projekt starten (Dummy)
1. Repo/Ordner öffnen
2. Mit einem lokalen Server starten (kein `file://`):
   - VS Code → Extension **Live Server** → „Go Live“
   - oder `python -m http.server 5500`
3. Öffnen:
   - Platform/CEO: `platform/login.html` (Dummy-Login) oder direkt `platform/dashboard.html`
   - Staff: `platform/staff-login.html`
   - Owner Admin (später): `owner/login.html`
   - Guest (später): `guest/karte.html`

> Dummy bedeutet: **keine echten Accounts**, keine Firestore Reads/Writes.  
> Daten (Leads/Kunden/Assignments) liegen **nur im localStorage** (bis Logic-Phase).

---

## 2) Wie Updates funktionieren (wichtig!)
Jeder Step kommt als **ZIP mit NUR den Dateien**, die du ersetzen musst.

✅ Vorgehen:
1. ZIP entpacken
2. Dateien 1:1 in dein Projekt kopieren und **ersetzen**
3. Seite neu laden (Hard Refresh: Ctrl+F5)

---

## 3) Regel: Kleine Steps (damit es nicht “limit” wird)
Wir arbeiten pro Step maximal:
- **1 Feature**
- **max. 4–6 Dateien**
- **max. 1–2 Views**
- keine “Nebenbaustellen”

Wenn ein Feature groß ist, wird es in **P1.x.a / P1.x.b** Micro-Steps geteilt.

---

## 4) Was ist “fertig” in einem Step?
Ein Step gilt als fertig, wenn:
- UI ist klickbar
- Dummy-Daten sind sichtbar (localStorage oder Hardcoded)
- Navigation ist korrekt
- “Accept Tests” im README des Steps bestehen

---

## 5) Quelle der Wahrheit
Diese 2 Dateien sind **Source of Truth**:
- `README_MENYRA_COMPLETE.md` (Gesamtspezifikation)
- `README_MENYRA_STEPS.md` (Mini-Step Plan)

Status/Stand:
- `README_STATUS.md`

KI Prompt Template:
- `README_AI_PROMPT.md`
