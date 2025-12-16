# Update: DUMMY-P1.3.1 — Staff Admin Content-Centering

## Problem
Im Staff Admin war der Inhalt (Dashboard-Karten/Text) **links gebunden**, während im CEO Admin der Content **zentriert** in einer „Shell“ sitzt. Das wirkte inkonsistent.

## Fix (UI-only)
- In `platform/staff.html` wurde der Hauptinhalt in die gleiche **`m-shell`**-Breite gepackt wie im CEO Admin.
- Ergebnis: gleiche Content-Breite/zentrierte Darstellung in Staff & CEO.

## Was du tun musst
- ZIP entpacken
- Datei überschreiben:
  - `platform/staff.html`
- Optional (für Doku): `README_STATUS.md` und dieses Update-README mitkopieren
