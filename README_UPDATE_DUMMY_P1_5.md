# MENYRA — README_UPDATE_DUMMY_P1_5

Stand: **DUMMY-P1.5** (Demo Generator UI – Dummy)

Datum: 2025-12-16

## Was ist neu in diesem Step?

### 1) CEO / Platform Admin: View „Demos“ ist jetzt **richtig nutzbar** (Dummy)
- **Demos Liste** mit Filter (Typ/Status), Suche, Sort
- **KPIs** (Gesamt / Aktiv / Entwurf / Klicks – Dummy)
- **Neue Demo erstellen** (Modal)
- **Demo Detail** (Modal):
  - Links werden automatisch generiert (Main Page / QR Menü / Shop/Room je nach Typ / Admin Logins)
  - Buttons: Öffnen / Kopieren / Alle Links kopieren
  - Dummy-Aktionen: Duplizieren, Archivieren, Demo→Kunde (noch ohne echte Logik)

### 2) Keine echte Logik / keine Firebase
Alles läuft weiterhin **nur mit Dummy-Daten** (Front-End).  
In P2 beginnen wir erst, Firestore/Auth und echte Daten anzuschließen.

## Welche Dateien wurden geändert?
- `platform/dashboard.html` (Demo View + 2 Modals ergänzt)
- `platform/app.js` (Dummy-Daten + Render/Events für Demos)
- `README_STATUS.md` (Fortschritt & Next Step aktualisiert)
- `README_UPDATE_DUMMY_P1_5.md` (diese Datei)

## Installation / Merge (wichtig!)
Du kannst den Inhalt dieser ZIP **einfach in dein Projekt kopieren**:

1) ZIP entpacken
2) In deinem Projektordner die entpackten Ordner/Dateien **drüberkopieren**  
   (Windows fragt evtl. „Dateien ersetzen?“ → **Ja**)

💡 Alternative (wenn du sauber arbeiten willst):  
Die alten Dateien **löschen** und dann die neuen reinziehen – ist auch ok, solange du die Ordnerstruktur beibehältst.

## Was du jetzt testen sollst
1) Öffne CEO Platform Admin:
   - `/platform/login.html` → irgendeine Email + Passwort (Dummy)
   - geh zu `/platform/dashboard.html`
2) Sidebar → **Demos**
   - Demo öffnen → Links checken (Öffnen & Kopieren)
   - **+ Neue Demo** → speichern → Demo erscheint oben
   - „Alle Links kopieren“ testen
3) Andere Views kurz anklicken: Kunden / Leads / Staff
   - nur prüfen, dass nichts kaputt ist

## Nächster Mini-Step (P1.6)
Assignments UI:
- Lead → Staff zuweisen (CEO)
- Kunde → Staff zuweisen (CEO)
- Staff sieht „Meine Kunden“ (Dummy Filter)

