# README_UPDATE — DUMMY-P1.2 (Kundenliste + Kundendetails)

## Ziel dieses Schrittes
Du wolltest, dass wir im CEO Admin **Kunden wirklich praxisorientiert** verwalten können:
- beim Kunden vor Ort Daten eingeben (Onboarding)
- danach: automatisch Main Page + QR + Module (später Logik)
- alles im Dummy bereits sichtbar, klickbar und verständlich

Dieser Schritt baut dafür die **UI-Struktur**, ohne irgendeine echte Datenbank-Logik.

---

## Was wurde geändert (Datei für Datei)

### 1) `platform/dashboard.html`
**A) Kundenliste (`data-view="customers"`)**
- bessere Erklärung + Filter-Platzhalter (Suche/Typ)
- Kundenliste als Tabelle mit:
  - Typ, Status, Module, Links (Main/QR/Shop/Room)
  - Button **„Öffnen“** → führt zur Detailseite (Dummy)

**B) Neue Kundendetail-Ansicht (`data-view="customer_detail"`)**
- Back Button → zurück zur Kundenliste
- Speichern/Vorschau Buttons (noch ohne Logik)
- Bereiche:
  - Auswahl (Dummy) + Modul-Toggles
  - Links & QR (sichtbar, später erzeugen/export)
  - Basisdaten (Onboarding-Form)
  - RestaurantId/Slug + „ID Migration“ (später)
  - Öffnungszeiten
  - Sprachen (deine Zielsprachen als Toggle-Liste)
  - Multi-Location (Filialen)
  - Accounts & Rollen (Owner/Staff/Küche/Housekeeping)
  - Content & Design Buttons (P2/P3)
  - Interne Notizen

---

### 2) `shared/unified.css`
Neue kleine Helper-Styles (damit es professionell aussieht, ohne alles umzubauen):
- Toggle-Chips (`.m-toggle-row`, `.m-toggle`)
- Key/Value Liste (`.m-kv`, `.m-kv-row`)

---

## Wie du es testest (2 Minuten)
1) Öffne `index.html`
2) Platform Admin → Login → im Menü „Kunden“
3) Klick „Öffnen“ → du bist in „Kundendetails“
4) Klick „← Zur Kundenliste“ → zurück

Wenn das klappt, ist P1.2 korrekt eingebaut.

---

## Was kommt als nächstes (DUMMY-P1.3)
**Mitarbeiter/Staff Admin Screens** (nur UI):
- Staff Liste (Name, Provision, Region, Status)
- Staff Detail (Zuweisung: Leads/Kunden)
- Staff-only Sicht (nur eigene Kunden/Leads/Stats)
- CEO Sicht: alle Mitarbeiter + totals + „zuweisen“

Wichtig: noch keine echte Auth/Firestore-Logik – nur Dummy Screens + Buttons, damit wir es später sauber verkabeln können.

