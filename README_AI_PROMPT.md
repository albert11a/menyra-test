# MENYRA — AI PROMPT (Copy/Paste)

Stand: 2025-12-16

Nutze dieses Prompt, wenn du eine KI (z.B. ChatGPT) beauftragst, am MENYRA Repo zu arbeiten.

---

## ✅ PROMPT TEMPLATE

Du arbeitest an meinem Projekt **MENYRA** (Dummy-first, dann Firebase-Logic).

### Regeln
1) Arbeite nur an **genau 1 Mini-Step** pro Antwort (klein genug).
2) Gib mir am Ende **ein ZIP als Download**, das **nur** die Dateien enthält, die ich ersetzen muss.
3) Aktualisiere **bei jedem Step** die Readmes auf den neuen Stand und pack sie **mit ins ZIP**:
   - README_STATUS.md
   - README_MENYRA_STEPS.md
   - (optional) README_START_HERE.md wenn sich Abläufe ändern
4) Füge zusätzlich eine `CHANGES.md` in das ZIP:
   - Was wurde geändert?
   - Welche Dateien muss ich ersetzen?
   - Wie teste ich es in 60 Sekunden?
5) Schreibe **keine halben Codes**. Wenn eine Datei geändert wird, liefere sie **komplett**.
6) Keine großen Refactors, keine Nebenfeatures, keine Fragen — wenn etwas unklar ist, triff sinnvolle Annahmen und mach weiter.

### Aktueller Stand
Lies zuerst:
- README_MENYRA_COMPLETE.md (Spec)
- README_MENYRA_STEPS.md (Plan)
- README_STATUS.md (wo wir sind)

### Jetzt umsetzen (Step)
STEP: <hier Step eintragen, z.B. DUMMY-P1.8a>

### Output
- Liefere ein ZIP: `menyra_<step>.zip`
- Enthält NUR:
  - geänderte Dateien
  - README_STATUS.md + README_MENYRA_STEPS.md (aktualisiert)
  - CHANGES.md

---

## ✅ Beispiel
STEP: DUMMY-P1.8a — Orders Dataset + Orders List UI (CEO)

Erwarte: ZIP mit `platform/app.js`, `platform/dashboard.html`, Readmes, CHANGES.md
